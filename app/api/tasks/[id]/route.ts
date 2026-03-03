import prisma from "@/app/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/app/lib/api-response";

const normalizeChecklist = (checklist: any): Array<{ text: string; done: boolean }> => {
  if (!Array.isArray(checklist)) return [];
  return checklist
    .map((item: any) => ({
      text: String(item?.text || "").trim(),
      done: Boolean(item?.done),
    }))
    .filter((item) => item.text.length > 0);
};

const normalizeAssigneeIds = (value: any): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((id) => String(id))
    .filter((id) => id.length > 0)
    .reduce((acc: string[], id: string) => {
      if (!acc.includes(id)) acc.push(id);
      return acc;
    }, []);
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    const { id } = await params;

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { title, description, date, priority, isImportant, isCompleted, boardId, columnId, checklist, assigneeIds } = body;

    // Verify task belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return errorResponse("Task not found or unauthorized", 404);
    }

    // Validate boardId - keep existing if not provided or invalid
    let validBoardId = existingTask.boardId;
    if (boardId && boardId !== "") {
      const board = await prisma.board.findUnique({ where: { id: boardId } });
      if (board && board.userId === userId) {
        validBoardId = boardId;
      }
    }

    // Validate columnId - must belong to the board and user
    let validColumnId = existingTask.columnId;
    if (columnId && columnId !== "") {
      const column = await prisma.column.findUnique({ 
        where: { id: columnId },
        include: { board: true }
      });
      if (column && column.userId === userId && column.boardId === validBoardId) {
        validColumnId = columnId;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        date,
        priority,
        isImportant,
        isCompleted,
        checklist: checklist !== undefined ? JSON.stringify(normalizeChecklist(checklist)) : existingTask.checklist,
        assigneeIds: assigneeIds !== undefined ? JSON.stringify(normalizeAssigneeIds(assigneeIds)) : existingTask.assigneeIds,
        boardId: validBoardId,
        columnId: validColumnId,
      },
    });

    return successResponse(updatedTask);
  } catch (error) {
    console.error("ERROR UPDATING TASK: ", error);
    return errorResponse("Error updating task", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    const { id } = await params;

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify task belongs to user
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== userId) {
      return errorResponse("Task not found or unauthorized", 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return successResponse({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING TASK: ", error);
    return errorResponse("Error deleting task", 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    const { id } = await params;

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== userId) {
      return errorResponse("Task not found", 404);
    }

    return successResponse(task);
  } catch (error) {
    console.error("ERROR GETTING TASK: ", error);
    return errorResponse("Error fetching task", 500);
  }
}
