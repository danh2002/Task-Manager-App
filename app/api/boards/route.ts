import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { boardValidationSchema } from "@/app/lib/validations/boardSchema";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET - Get all boards for current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const boards = await prisma.board.findMany({
      where: { userId },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(boards);
  } catch (error) {
    console.error("ERROR GETTING BOARDS:", error);
    return errorResponse("Error getting boards", 500);
  }
}

// POST - Create a new board
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log("[POST /api/boards] userId:", userId);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    console.log("[POST /api/boards] body:", body);

    // Validate input
    let validatedData;
    try {
      validatedData = await boardValidationSchema.validate(body, {
        abortEarly: false,
      });
      console.log("[POST /api/boards] validatedData:", validatedData);
    } catch (validationError: any) {
      console.error("[POST /api/boards] Validation error:", validationError.errors);
      const messages = validationError.errors.join(", ");
      return errorResponse(messages, 400);
    }

    // Create board with default columns
    console.log("[POST /api/boards] Creating board with data:", {
      name: validatedData.name,
      description: validatedData.description,
      color: validatedData.color || "#7263F3",
      userId,
    });

    const board = await prisma.board.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color || "#7263F3",
        userId,
        // Create default columns
        columns: {
          create: [
            { name: "To Do", position: 0, color: "#6c7983", userId },
            { name: "In Progress", position: 1, color: "#3b82f6", userId },
            { name: "Done", position: 2, color: "#27AE60", userId },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
      },
    });

    console.log("[POST /api/boards] Board created successfully:", board.id);
    return successResponse(board, 201);
  } catch (error: any) {
    console.error("[POST /api/boards] ERROR CREATING BOARD:", error);
    console.error("[POST /api/boards] Error message:", error.message);
    console.error("[POST /api/boards] Error code:", error.code);
    console.error("[POST /api/boards] Error meta:", error.meta);
    return errorResponse(`Error creating board: ${error.message || "Unknown error"}`, 500);
  }
}


// PUT - Update a board
export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { id, name, description, color } = body;

    if (!id) {
      return errorResponse("Board ID is required", 400);
    }

    // Check ownership
    const existingBoard = await prisma.board.findUnique({
      where: { id },
    });

    if (!existingBoard || existingBoard.userId !== userId) {
      return errorResponse("Board not found or unauthorized", 404);
    }

    // Update board
    const board = await prisma.board.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
      },
    });

    return successResponse(board);
  } catch (error) {
    console.error("ERROR UPDATING BOARD:", error);
    return errorResponse("Error updating board", 500);
  }
}
