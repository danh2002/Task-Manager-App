"use client";

import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import toast from "react-hot-toast";
import { useGlobalState } from "@/app/context/globalProvider";

interface CommentFormProps {
  taskId: string;
  onCommentAdded: () => void;
}

const FormContainer = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TextArea = styled.textarea<{ theme: any }>`
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.borderColor || "#d1d5db"};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: ${(props) => props.theme.colorBg || "#fff"};
  color: ${(props) => props.theme.colorGrey0 || "#212529"};
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: ${(props) => props.theme.colorGrey2 || "#6c757d"};
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button<{ theme: any; disabled?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  background-color: ${(props) => props.theme.colorPrimary || "#3b82f6"};
  color: white;
  border: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colorPrimaryDark || "#2563eb"};
  }
`;

const CommentForm: React.FC<CommentFormProps> = ({ taskId, onCommentAdded }) => {
  const { theme } = useGlobalState();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Submitting comment:", content);

    // Validation
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    if (content.length > 1000) {
      setError("Comment must not exceed 1000 characters");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await axios.post("/api/comments", {
        content: content.trim(),
        taskId: taskId,
      });

      console.log("✅ Comment added:", res.data);

      if (res.data.success) {
        toast.success("Comment added successfully");
        setContent("");
        onCommentAdded();
      } else {
        toast.error(res.data.error || "Failed to add comment");
      }
    } catch (error: any) {
      console.error("❌ Error adding comment:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to add comment";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <TextArea
            theme={theme}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            disabled={isSubmitting}
          />
          {error && <ErrorText>{error}</ErrorText>}
          
          <ButtonGroup>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                fontWeight: 500,
                backgroundColor: theme.colorPrimary || "#3b82f6",
                color: "white",
                border: "none",
                cursor: (!content.trim() || isSubmitting) ? "not-allowed" : "pointer",
                opacity: (!content.trim() || isSubmitting) ? 0.6 : 1,
              }}
              onClick={() => console.log("🖱️ Button clicked! Content:", content)}
            >
              {isSubmitting ? "Adding..." : "Add Comment"}
            </button>
          </ButtonGroup>


        </FormGroup>
      </form>
    </FormContainer>
  );
};

export default CommentForm;
