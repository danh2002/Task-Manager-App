import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET - Get a single board with columns and tasks
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);

    const { id } = params;

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const board = await prisma.board.findFirst({
      where: { id, userId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: {
              orderBy: { position: "asc" },
              include: {
                labels: true,
                _count: {
                  select: { comments: true },
                },
              },
            },
          },
        },
        labels: true,
      },
    });

    // DEBUG: Log first task to check if dueDate and reminder are present
    if (board && board.columns.length > 0 && board.columns[0].tasks.length > 0) {
      const firstTask = board.columns[0].tasks[0];
      console.log("[API Board GET] First task from board query:", {
        id: firstTask.id,
        title: firstTask.title,
        dueDate: (firstTask as any).dueDate,
        reminder: (firstTask as any).reminder,
      });
    }


    if (!board) {
      return errorResponse("Board not found", 404);
    }

    return successResponse(board);
  } catch (error) {
    console.error("ERROR GETTING BOARD:", error);
    return errorResponse("Error getting board", 500);
  }
}

// DELETE - Delete a board
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);

    const { id } = params;

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Check ownership
    const existingBoard = await prisma.board.findUnique({
      where: { id },
    });

    if (!existingBoard || existingBoard.userId !== userId) {
      return errorResponse("Board not found or unauthorized", 404);
    }

    // Delete board (cascade will delete columns and tasks)
    await prisma.board.delete({
      where: { id },
    });

    return successResponse({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING BOARD:", error);
    return errorResponse("Error deleting board", 500);
  }
}
