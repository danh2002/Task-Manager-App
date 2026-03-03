"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useGlobalState } from "@/app/context/globalProvider";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { comment } from "@/app/utils/Icons";

interface CommentsSectionProps {
  taskId: string;
  isOpen: boolean;
  onToggle: () => void;
}

const SectionContainer = styled.div`
  margin-top: 0.5rem;
  border-top: 1px solid ${(props: any) => props.theme.borderColor || "#e9ecef"};
  padding-top: 0.75rem;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colorGrey1 || "#6c757d"};
  padding: 0.25rem 0;
  transition: color 0.2s;

  &:hover {
    color: ${(props: any) => props.theme.colorPrimary || "#3b82f6"};
  }

  i {
    font-size: 1rem;
  }
`;

const CommentCount = styled.span`
  background-color: ${(props: any) => props.theme.colorPrimary || "#3b82f6"};
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
`;

const CommentsContent = styled.div`
  margin-top: 0.75rem;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CommentsSection: React.FC<CommentsSectionProps> = ({
  taskId,
  isOpen,
  onToggle,
}) => {
  const { theme } = useGlobalState();
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/comments?taskId=${taskId}`);
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, isOpen]);

  // Fetch comments when section opens
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (commentId: string) => {
    try {
      const res = await axios.delete(`/api/comments?id=${commentId}`);
      if (res.data.success) {
        toast.success("Comment deleted");
        fetchComments(); // Refresh list
      } else {
        toast.error(res.data.error || "Failed to delete comment");
      }
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error(error.response?.data?.error || "Failed to delete comment");
    }
  };

  return (
    <SectionContainer theme={theme}>
      <ToggleButton theme={theme} onClick={onToggle}>
        {comment}
        <span>Comments</span>
        <CommentCount theme={theme}>{comments.length}</CommentCount>
      </ToggleButton>

      {isOpen && (
        <CommentsContent>
          <CommentForm taskId={taskId} onCommentAdded={fetchComments} />
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "1rem" }}>
              Loading comments...
            </div>
          ) : (
            <CommentList
              comments={comments}
              currentUserId={user?.id || ""}
              onDelete={handleDelete}
            />
          )}
        </CommentsContent>
      )}
    </SectionContainer>
  );
};

export default CommentsSection;
