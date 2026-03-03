import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    // Test database connection
    let dbStatus = "unknown";
    let dbError = null;
    
    try {
      // Try a simple query
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (e: any) {
      dbStatus = "error";
      dbError = e.message;
    }

    // Check if we can count boards
    let boardCount = null;
    try {
      boardCount = await prisma.board.count();
    } catch (e: any) {
      boardCount = `Error: ${e.message}`;
    }

    return successResponse({
      status: "ok",
      timestamp: new Date().toISOString(),
      auth: {
        userId: userId || null,
        authenticated: !!userId,
      },
      database: {
        status: dbStatus,
        error: dbError,
        boardCount: boardCount,
      },
    });
  } catch (error: any) {
    console.error("[Health Check] Error:", error);
    return errorResponse(`Health check failed: ${error.message}`, 500);
  }
}
