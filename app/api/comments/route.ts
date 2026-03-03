import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import * as Yup from "yup";

const commentValidationSchema = Yup.object().shape({
  content: Yup.string()
    .min(1, "Comment content is required")
    .max(1000, "Comment must not exceed 1000 characters")
    .required("Comment content is required"),
  taskId: Yup.string().required("Task ID is required"),
});

// GET - Get all comments for a task
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return errorResponse("Task ID is required", 400);
    }

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      return errorResponse("Task not found or unauthorized", 404);
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(comments);
  } catch (error) {
    console.error("ERROR GETTING COMMENTS:", error);
    return errorResponse("Error getting comments", 500);
  }
}

// POST - Create a new comment
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();

    // Validate input
    let validatedData;
    try {
      validatedData = await commentValidationSchema.validate(body, {
        abortEarly: false,
      });
    } catch (validationError: any) {
      const messages = validationError.errors.join(", ");
      return errorResponse(messages, 400);
    }

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: validatedData.taskId, userId },
    });

    if (!task) {
      return errorResponse("Task not found or unauthorized", 404);
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        taskId: validatedData.taskId,
        userId,
      },
    });

    return successResponse(comment, 201);
  } catch (error) {
    console.error("ERROR CREATING COMMENT:", error);
    return errorResponse("Error creating comment", 500);
  }
}

// DELETE - Delete a comment
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return errorResponse("Comment ID is required", 400);
    }

    // Check ownership
    const existingComment = await prisma.comment.findFirst({
      where: { id, userId },
    });

    if (!existingComment) {
      return errorResponse("Comment not found or unauthorized", 404);
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id },
    });

    return successResponse({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING COMMENT:", error);
    return errorResponse("Error deleting comment", 500);
  }
}
