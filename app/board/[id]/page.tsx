"use client";

import { useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import BoardView from "@/app/components/Board/BoardView";
import { useParams } from "next/navigation";

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.id as string;
  const { setCurrentBoard } = useGlobalState();

  useEffect(() => {
    // Clear current board when leaving the page
    return () => {
      setCurrentBoard(null);
    };
  }, []);

  if (!boardId) {
    return <div>Board not found</div>;
  }

  return <BoardView boardId={boardId} />;
}
