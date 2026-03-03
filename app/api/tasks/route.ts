import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import prisma from "@/app/lib/prisma";
import { taskValidationSchema } from "@/app/lib/validations/taskSchema";
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

const parseChecklist = (checklist: any): Array<{ text: string; done: boolean }> => {
  if (Array.isArray(checklist)) return normalizeChecklist(checklist);
  if (typeof checklist === "string") {
    try {
      return normalizeChecklist(JSON.parse(checklist));
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeLabelIds = (value: any): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((id) => String(id)).filter((id) => id.length > 0);
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

export async function POST(req: NextRequest) {
  console.log("=== POST /api/tasks called ===");

  try {
    const { userId } = getAuth(req);
    console.log("UserId from auth:", userId);

    if (!userId) {
      console.log("No userId found, returning 401");
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    console.log("📥 Request body:", JSON.stringify(body, null, 2));

    // Validate incoming data
    let validatedData;
    try {
      validatedData = await taskValidationSchema.validate(body, {
        abortEarly: false,
      });
      console.log("✅ Validation passed:", JSON.stringify(validatedData, null, 2));
    } catch (validationError: any) {
      console.log("❌ Validation failed:", validationError.errors);
      const messages = validationError.errors.join(", ");
      return errorResponse(messages, 400);
    }

    // CRITICAL DEBUG: Check priority after validation
    console.log("🔍 CRITICAL - validatedData.priority:", validatedData.priority);
    console.log("🔍 CRITICAL - body.priority:", body.priority);
    console.log("🔍 Are they equal?", validatedData.priority === body.priority);

    // STRICT CHECK: Ensure priority is valid
    const priorityValue = validatedData.priority;
    console.log("🟡 Priority value before create:", priorityValue, "| Type:", typeof priorityValue);
    
    // Check if priority is valid
    const isValidPriority = priorityValue && ["low", "medium", "high"].includes(priorityValue);
    console.log("🟡 Is valid priority?", isValidPriority);

    const finalPriority = isValidPriority ? priorityValue : "medium";
    console.log("🟡 Final priority to save:", finalPriority);

    // Get boardId and columnId from body
    const boardId = body.boardId;
    const columnId = body.columnId;
    const labelIds = normalizeLabelIds(body.labelIds);
    const assigneeIds = normalizeAssigneeIds(body.assigneeIds);

    // Build create data
    const taskCreateData: any = {
      title: validatedData.title,
      description: validatedData.description,
      checklist: JSON.stringify(normalizeChecklist(body.checklist)),
      assigneeIds: JSON.stringify(assigneeIds),
      date: validatedData.date,
      isCompleted: validatedData.isCompleted || false,
      isImportant: validatedData.isImportant || false,
      priority: finalPriority,
      userId,
    };

    // Add dueDate if provided - convert to ISO DateTime format
    if (body.dueDate) {
      // If it's just a date (YYYY-MM-DD), add time to make it ISO format
      const dueDateStr = body.dueDate as string;
      if (dueDateStr.length === 10) {
        // Date only format YYYY-MM-DD, add time
        taskCreateData.dueDate = new Date(`${dueDateStr}T00:00:00.000Z`);
      } else {
        // Already has time, ensure it's a valid Date
        taskCreateData.dueDate = new Date(dueDateStr);
      }
    }

    // Add reminder if provided - convert to ISO DateTime format
    if (body.reminder) {
      const reminderStr = body.reminder as string;
      if (reminderStr.length === 16) {
        // Format YYYY-MM-DDTHH:mm, add seconds
        taskCreateData.reminder = new Date(`${reminderStr}:00.000Z`);
      } else {
        taskCreateData.reminder = new Date(reminderStr);
      }
    }


    // Add boardId if provided
    if (boardId) {
      taskCreateData.boardId = boardId;
    }

    // Add columnId if provided
    if (columnId) {
      taskCreateData.columnId = columnId;
    }

    if (labelIds.length > 0) {
      const validLabels = await prisma.label.findMany({
        where: {
          id: { in: labelIds },
          userId,
          ...(boardId ? { boardId } : {}),
        },
        select: { id: true },
      });
      taskCreateData.labels = { connect: validLabels.map((label) => ({ id: label.id })) };
    }


    const task = await prisma.task.create({
      data: taskCreateData,
    });

    console.log("✅ Task created:", JSON.stringify(task, null, 2));

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "created",
        description: `Task "${task.title}" was created`,
        userId,
        taskId: task.id,
      },
    });

    return successResponse(task, 201);
  } catch (e: any) {
    console.error("=== ERROR CREATING TASK ===");
    console.error("Error name:", e.name);
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    return errorResponse(`Error creating task: ${e.message || "Unknown error"}`, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    
    // Search and filter parameters
    const search = searchParams.get("search") || "";
    const isCompleted = searchParams.get("isCompleted");
    const isImportant = searchParams.get("isImportant");
    const boardId = searchParams.get("boardId");
    const labelId = searchParams.get("labelId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = { userId };

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filter by completion status
    if (isCompleted !== null && isCompleted !== undefined) {
      where.isCompleted = isCompleted === "true";
    }

    // Filter by importance
    if (isImportant !== null && isImportant !== undefined) {
      where.isImportant = isImportant === "true";
    }

    // Filter by board
    if (boardId) {
      where.boardId = boardId;
    }

    // Filter by column
    const columnId = searchParams.get("columnId");
    if (columnId) {
      where.columnId = columnId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = dateFrom;
      }
      if (dateTo) {
        where.date.lte = dateTo;
      }
    }

    // Filter by label
    if (labelId) {
      where.labels = {
        some: {
          id: labelId,
        },
      };
    }

    // Get total count for pagination
    const total = await prisma.task.count({ where });

    // Get tasks with relations
    const tasks = await prisma.task.findMany({
      where,
      include: {
        labels: true,
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          take: 3, // Limit comments in list view
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // DEBUG: Log first task to verify dueDate and reminder are present
    if (tasks.length > 0) {
      console.log("[API GET /tasks] First task fields:", {
        id: tasks[0].id,
        title: tasks[0].title,
        dueDate: tasks[0].dueDate,
        reminder: tasks[0].reminder,
        dueDateType: typeof tasks[0].dueDate,
        reminderType: typeof tasks[0].reminder,
      });
    }

    return successResponse({

      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("ERROR GETTING TASKS: ", e);
    return errorResponse("Error getting tasks", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    console.log("🟡 PUT /api/tasks - Request body:", body);
    
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return errorResponse("Task not found or unauthorized", 404);
    }

    console.log("🟡 Existing task:", existingTask);
    console.log("🟡 Update data:", updateData);

    // Validate update data if provided
    if (Object.keys(updateData).length > 0) {
      try {
        // Ensure priority is valid if provided
        if (updateData.priority && !["low", "medium", "high"].includes(updateData.priority)) {
          return errorResponse("Priority must be low, medium, or high", 400);
        }
        
        await taskValidationSchema.validate(
          {
            ...existingTask,
            ...updateData,
            checklist:
              updateData.checklist !== undefined
                ? normalizeChecklist(updateData.checklist)
                : parseChecklist(existingTask.checklist),
          },
          { abortEarly: false }
        );
      } catch (validationError: any) {
        const messages = validationError.errors.join(", ");
        return errorResponse(messages, 400);
      }
    }

    // Build update data with explicit priority handling
    const dataToUpdate: any = { ...updateData };
    if (updateData.checklist !== undefined) {
      dataToUpdate.checklist = JSON.stringify(normalizeChecklist(updateData.checklist));
    }

    if (updateData.assigneeIds !== undefined) {
      dataToUpdate.assigneeIds = JSON.stringify(normalizeAssigneeIds(updateData.assigneeIds));
    }

    if (updateData.labelIds !== undefined) {
      const labelIds = normalizeLabelIds(updateData.labelIds);
      const effectiveBoardId = updateData.boardId || existingTask.boardId;
      const validLabels = await prisma.label.findMany({
        where: {
          id: { in: labelIds },
          userId,
          ...(effectiveBoardId ? { boardId: effectiveBoardId } : {}),
        },
        select: { id: true },
      });
      dataToUpdate.labels = { set: validLabels.map((label) => ({ id: label.id })) };
      delete dataToUpdate.labelIds;
    }

    if (updateData.dueDate !== undefined) {
      if (!updateData.dueDate) {
        dataToUpdate.dueDate = null;
      } else {
        const dueDateStr = String(updateData.dueDate);
        dataToUpdate.dueDate = dueDateStr.length === 10 ? new Date(`${dueDateStr}T00:00:00.000Z`) : new Date(dueDateStr);
      }
    }

    if (updateData.reminder !== undefined) {
      if (!updateData.reminder) {
        dataToUpdate.reminder = null;
      } else {
        const reminderStr = String(updateData.reminder);
        dataToUpdate.reminder = reminderStr.length === 16 ? new Date(`${reminderStr}:00.000Z`) : new Date(reminderStr);
      }
    }
    
    // Ensure priority is explicitly set if provided
    if (updateData.priority !== undefined) {
      dataToUpdate.priority = updateData.priority;
    }

    console.log("🟡 Data to update in Prisma:", dataToUpdate);

    const task = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    console.log("✅ Task updated:", task);

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "updated",
        description: `Task "${task.title}" was updated`,
        userId,
        taskId: task.id,
      },
    });

    return successResponse(task);
  } catch (e) {
    console.error("❌ ERROR UPDATING TASK: ", e);
    const message = (e as any)?.message || "Unknown error";
    if (message.includes("checklist") || message.includes("Unknown arg") || message.includes("no such column")) {
      return errorResponse(
        "Checklist schema is not synced. Run: npx prisma migrate dev -n add_task_checklist && npx prisma generate",
        500
      );
    }
    return errorResponse(`Error updating task: ${message}`, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return errorResponse("Task not found or unauthorized", 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return successResponse({ message: "Task deleted successfully" });
  } catch (e) {
    console.error("ERROR DELETING TASK: ", e);
    return errorResponse("Error deleting task", 500);
  }
}
