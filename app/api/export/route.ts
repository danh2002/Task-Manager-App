import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET - Export all data for a user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Get all boards with their columns and tasks
    const boards = await prisma.board.findMany({
      where: { userId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: {
              orderBy: { position: "asc" },
              include: {
                labels: true,
                comments: true,
              },
            },
          },
        },
        labels: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all tasks (standalone tasks not in boards)
    const standaloneTasks = await prisma.task.findMany({
      where: { userId, boardId: null },
      include: {
        labels: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const exportData = {
      boards,
      standaloneTasks,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    return successResponse(exportData);
  } catch (error) {
    console.error("ERROR EXPORTING DATA:", error);
    return errorResponse("Error exporting data", 500);
  }
}

// POST - Import data
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { boards, standaloneTasks } = body;

    if (!boards && !standaloneTasks) {
      return errorResponse("No data to import", 400);
    }

    const results = {
      boardsCreated: 0,
      columnsCreated: 0,
      tasksCreated: 0,
      labelsCreated: 0,
      commentsCreated: 0,
      errors: [] as string[],
    };

    // Import boards with their data
    if (boards && Array.isArray(boards)) {
      for (const boardData of boards) {
        try {
          // Create board
          const board = await prisma.board.create({
            data: {
              name: boardData.name,
              description: boardData.description,
              color: boardData.color || "#7263F3",
              userId,
            },
          });
          results.boardsCreated++;

          // Create labels for this board
          if (boardData.labels && Array.isArray(boardData.labels)) {
            for (const labelData of boardData.labels) {
              try {
                await prisma.label.create({
                  data: {
                    name: labelData.name,
                    color: labelData.color,
                    boardId: board.id,
                    userId,
                  },
                });
                results.labelsCreated++;
              } catch (labelError) {
                results.errors.push(`Failed to create label: ${labelData.name}`);
              }
            }
          }

          // Create columns
          if (boardData.columns && Array.isArray(boardData.columns)) {
            for (const columnData of boardData.columns) {
              try {
                const column = await prisma.column.create({
                  data: {
                    name: columnData.name,
                    color: columnData.color,
                    position: columnData.position,
                    boardId: board.id,
                    userId,
                  },
                });
                results.columnsCreated++;

                // Create tasks in this column
                if (columnData.tasks && Array.isArray(columnData.tasks)) {
                  for (const taskData of columnData.tasks) {
                    try {
                      const task = await prisma.task.create({
                        data: {
                          title: taskData.title,
                          description: taskData.description,
                          date: taskData.date,
                          isCompleted: taskData.isCompleted,
                          isImportant: taskData.isImportant,
                          priority: taskData.priority || "medium",
                          position: taskData.position,
                          columnId: column.id,
                          boardId: board.id,
                          userId,
                        },
                      });
                      results.tasksCreated++;

                      // Create comments for this task
                      if (taskData.comments && Array.isArray(taskData.comments)) {
                        for (const commentData of taskData.comments) {
                          try {
                            await prisma.comment.create({
                              data: {
                                content: commentData.content,
                                taskId: task.id,
                                userId,
                              },
                            });
                            results.commentsCreated++;
                          } catch (commentError) {
                            results.errors.push(`Failed to create comment for task: ${taskData.title}`);
                          }
                        }
                      }
                    } catch (taskError) {
                      results.errors.push(`Failed to create task: ${taskData.title}`);
                    }
                  }
                }
              } catch (columnError) {
                results.errors.push(`Failed to create column: ${columnData.name}`);
              }
            }
          }
        } catch (boardError) {
          results.errors.push(`Failed to create board: ${boardData.name}`);
        }
      }
    }

    // Import standalone tasks
    if (standaloneTasks && Array.isArray(standaloneTasks)) {
      for (const taskData of standaloneTasks) {
        try {
          await prisma.task.create({
            data: {
              title: taskData.title,
              description: taskData.description,
              date: taskData.date,
              isCompleted: taskData.isCompleted,
              isImportant: taskData.isImportant,
              priority: taskData.priority || "medium",
              position: taskData.position,
              userId,
            },
          });
          results.tasksCreated++;
        } catch (taskError) {
          results.errors.push(`Failed to create standalone task: ${taskData.title}`);
        }
      }
    }

    return successResponse(results, 201);
  } catch (error) {
    console.error("ERROR IMPORTING DATA:", error);
    return errorResponse("Error importing data", 500);
  }
}
