"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const isChunkLoadError =
    error.message?.includes("Loading chunk") ||
    error.message?.includes("ChunkLoadError");

  const handleReload = () => {
    // Force a full page reload to get fresh chunks
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isChunkLoadError ? "Page Out of Date" : "Something went wrong"}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isChunkLoadError
            ? "The application has been updated. Please reload to get the latest version."
            : error.message || "An unexpected error occurred."}
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#219150] transition-colors font-medium"
          >
            Reload Page
          </button>
          
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
