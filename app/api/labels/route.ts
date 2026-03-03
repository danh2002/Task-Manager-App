import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { labelValidationSchema } from "@/app/lib/validations/labelSchema";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET - Get all labels for a board
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const boardId = url.searchParams.get("boardId");

    if (!boardId) {
      return errorResponse("Board ID is required", 400);
    }

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId },
    });

    if (!board) {
      return errorResponse("Board not found or unauthorized", 404);
    }

    const labels = await prisma.label.findMany({
      where: { boardId },
      orderBy: { name: "asc" },
    });

    return successResponse(labels);
  } catch (error) {
    console.error("ERROR GETTING LABELS:", error);
    return errorResponse("Error getting labels", 500);
  }
}

// POST - Create a new label
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
      validatedData = await labelValidationSchema.validate(body, {
        abortEarly: false,
      });
    } catch (validationError: any) {
      const messages = validationError.errors.join(", ");
      return errorResponse(messages, 400);
    }

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: validatedData.boardId, userId },
    });

    if (!board) {
      return errorResponse("Board not found or unauthorized", 404);
    }

    // Create label
    const label = await prisma.label.create({
      data: {
        name: validatedData.name,
        color: validatedData.color || "#6c7983",
        boardId: validatedData.boardId,
        userId,
      },
    });

    return successResponse(label, 201);
  } catch (error) {
    console.error("ERROR CREATING LABEL:", error);
    return errorResponse("Error creating label", 500);
  }
}

// PUT - Update a label
export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { id, name, color } = body;

    if (!id) {
      return errorResponse("Label ID is required", 400);
    }

    // Check ownership
    const existingLabel = await prisma.label.findFirst({
      where: { id, userId },
    });

    if (!existingLabel) {
      return errorResponse("Label not found or unauthorized", 404);
    }

    // Update label
    const label = await prisma.label.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    });

    return successResponse(label);
  } catch (error) {
    console.error("ERROR UPDATING LABEL:", error);
    return errorResponse("Error updating label", 500);
  }
}

// DELETE - Delete a label
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return errorResponse("Label ID is required", 400);
    }

    // Check ownership
    const existingLabel = await prisma.label.findFirst({
      where: { id, userId },
    });

    if (!existingLabel) {
      return errorResponse("Label not found or unauthorized", 404);
    }

    // Delete label
    await prisma.label.delete({
      where: { id },
    });

    return successResponse({ message: "Label deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING LABEL:", error);
    return errorResponse("Error deleting label", 500);
  }
}
