import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export const successResponse = <T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({ success: true, data, status }, { status });
};

export const errorResponse = (
  error: string,
  status: number = 400
): NextResponse<ApiResponse> => {
  return NextResponse.json({ success: false, error, status }, { status });
};
