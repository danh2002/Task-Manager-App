"use client";

import { useEffect } from "react";

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Handle chunk loading errors
    const handleChunkLoadError = (event: Event) => {
      const error = event as ErrorEvent;
      if (
        error.message?.includes("Loading chunk") ||
        error.message?.includes("ChunkLoadError")
      ) {
        console.warn("Chunk load error detected, reloading page...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkLoadError);

    return () => {
      window.removeEventListener("error", handleChunkLoadError);
    };
  }, []);

  return null;
}
