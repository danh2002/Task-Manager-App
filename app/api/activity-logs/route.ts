import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import * as Yup from "yup";


const activityLogValidationSchema = Yup.object().shape({
  action: Yup.string()
    .min(1, "Action is required")
    .max(50, "Action must not exceed 50 characters")
    .required("Action is required"),
  description: Yup.string().max(500, "Description must not exceed 500 characters"),
  taskId: Yup.string().required("Task ID is required"),
  oldValue: Yup.string(),
  newValue: Yup.string(),
});

// GET - Get activity logs for a task
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

    const activityLogs = await prisma.activityLog.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 activities
    });

    return successResponse(activityLogs);
  } catch (error) {
    console.error("ERROR GETTING ACTIVITY LOGS:", error);
    return errorResponse("Error getting activity logs", 500);
  }
}

// POST - Create a new activity log
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
      validatedData = await activityLogValidationSchema.validate(body, {
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

    // Create activity log
    const activityLog = await prisma.activityLog.create({
      data: {
        action: validatedData.action,
        description: validatedData.description,
        taskId: validatedData.taskId,
        userId,
        oldValue: validatedData.oldValue,
        newValue: validatedData.newValue,
      },
    });

    return successResponse(activityLog, 201);
  } catch (error) {
    console.error("ERROR CREATING ACTIVITY LOG:", error);
    return errorResponse("Error creating activity log", 500);
  }
}
