import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET - Get all columns for a board
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

    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
      include: {
        tasks: {
          orderBy: { position: "asc" },
          include: {
            labels: true,
          },
        },
      },
    });

    return successResponse(columns);
  } catch (error) {
    console.error("ERROR GETTING COLUMNS:", error);
    return errorResponse("Error getting columns", 500);
  }
}

// POST - Create a new column
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { name, color, boardId, position } = body;

    if (!name || !boardId) {
      return errorResponse("Name and boardId are required", 400);
    }

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId },
    });

    if (!board) {
      return errorResponse("Board not found or unauthorized", 404);
    }

    // Get the highest position if not provided
    let columnPosition = position;
    if (columnPosition === undefined) {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { position: "desc" },
      });
      columnPosition = lastColumn ? lastColumn.position + 1 : 0;
    }

    // Create column
    const column = await prisma.column.create({
      data: {
        name,
        color: color || "#6c7983",
        position: columnPosition,
        boardId,
        userId,
      },
    });

    return successResponse(column, 201);
  } catch (error) {
    console.error("ERROR CREATING COLUMN:", error);
    return errorResponse("Error creating column", 500);
  }
}

// PUT - Update a column
export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { id, name, color, position } = body;

    if (!id) {
      return errorResponse("Column ID is required", 400);
    }

    // Check ownership
    const existingColumn = await prisma.column.findFirst({
      where: { id, userId },
    });

    if (!existingColumn) {
      return errorResponse("Column not found or unauthorized", 404);
    }

    // Update column
    const column = await prisma.column.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(position !== undefined && { position }),
      },
    });

    return successResponse(column);
  } catch (error) {
    console.error("ERROR UPDATING COLUMN:", error);
    return errorResponse("Error updating column", 500);
  }
}

// DELETE - Delete a column
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return errorResponse("Column ID is required", 400);
    }

    // Check ownership
    const existingColumn = await prisma.column.findFirst({
      where: { id, userId },
    });

    if (!existingColumn) {
      return errorResponse("Column not found or unauthorized", 404);
    }

    // Delete column (tasks will be cascade deleted or reassigned based on schema)
    await prisma.column.delete({
      where: { id },
    });

    return successResponse({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING COLUMN:", error);
    return errorResponse("Error deleting column", 500);
  }
}
