import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET - Get upcoming reminders for the user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get tasks with reminders in the next 5 minutes that haven't been notified yet
    const tasksWithReminders = await prisma.task.findMany({
      where: {
        userId,
        reminder: {
          gte: now,
          lte: fiveMinutesFromNow,
        },
        reminderSent: false,
      },
      include: {
        board: {
          select: {
            name: true,
          },
        },
        column: {
          select: {
            name: true,
          },
        },
      },
    });

    return successResponse(tasksWithReminders);
  } catch (error) {
    console.error("ERROR GETTING REMINDERS:", error);
    return errorResponse("Error getting reminders", 500);
  }
}

// POST - Mark reminder as sent
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { taskId } = body;

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

    // Mark reminder as sent
    await prisma.task.update({
      where: { id: taskId },
      data: { reminderSent: true },
    });

    return successResponse({ message: "Reminder marked as sent" });
  } catch (error) {
    console.error("ERROR MARKING REMINDER:", error);
    return errorResponse("Error marking reminder", 500);
  }
}
