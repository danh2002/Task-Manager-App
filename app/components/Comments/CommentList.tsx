"use client";

import React from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import { trash } from "@/app/utils/Icons";

// Simple time ago formatter (replaces date-fns)
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};


interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
}

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onDelete: (id: string) => void;
}

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props: any) => props.theme.borderColor2 || "#f1f1f1"};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props: any) => props.theme.colorGrey3 || "#888"};
    border-radius: 2px;
  }
`;

const CommentItem = styled.div`
  padding: 0.75rem;
  background-color: ${(props: any) => props.theme.borderColor2 || "#f8f9fa"};
  border-radius: 0.5rem;
  border: 1px solid ${(props: any) => props.theme.borderColor || "#e9ecef"};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CommentTime = styled.span`
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colorGrey2 || "#6c757d"};
`;

const CommentContent = styled.p`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colorGrey0 || "#212529"};
  line-height: 1.5;
  margin: 0;
  word-wrap: break-word;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${(props: any) => props.theme.colorDanger || "#dc3545"};
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  i {
    font-size: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${(props: any) => props.theme.colorGrey2 || "#6c757d"};
  font-size: 0.875rem;
`;

const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUserId,
  onDelete,
}) => {
  const { theme } = useGlobalState();

  if (comments.length === 0) {
    return (
      <EmptyState theme={theme}>
        No comments yet. Be the first to comment!
      </EmptyState>
    );
  }

  return (
    <ListContainer theme={theme}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} theme={theme}>
          <CommentHeader>
            <CommentTime theme={theme}>
              {formatTimeAgo(comment.createdAt)}
            </CommentTime>

            {comment.userId === currentUserId && (
              <DeleteButton
                theme={theme}
                onClick={() => onDelete(comment.id)}
                title="Delete comment"
              >
                {trash}
              </DeleteButton>
            )}
          </CommentHeader>
          <CommentContent theme={theme}>{comment.content}</CommentContent>
        </CommentItem>
      ))}
    </ListContainer>
  );
};

export default CommentList;
