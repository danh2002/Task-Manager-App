"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "styled-components";
import TaskItem from "./TaskItem";

interface SortableTaskProps {
  id: string;
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  isImportant: boolean;
  priority?: string;
  dueDate?: string;
  reminder?: string;
  columnId: string;
  checklist?: Array<{ text: string; done: boolean }> | string;
  labels?: Array<{ id: string; name: string; color: string }>;
  assigneeIds?: string[] | string;
  onTaskUpdate?: () => void;
  onTaskDeleted?: (taskId: string) => void;
}



const SortableTask: React.FC<SortableTaskProps> = (props) => {
  const {
    id,
    title,
    description,
    date,
    isCompleted,
    isImportant,
    priority,
    onTaskUpdate,
    onTaskDeleted,
  } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableTaskStyled 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners}
      $isDragging={isDragging}
    >
      <TaskContent>
          <TaskItem
            id={id}
            title={title}
            description={description}
            date={date}
            isCompleted={isCompleted}
            isImportant={isImportant}
            priority={priority}
            dueDate={props.dueDate}
            reminder={props.reminder}
            columnId={props.columnId}
            checklist={props.checklist}
            labels={props.labels}
            assigneeIds={props.assigneeIds}
            onTaskUpdate={onTaskUpdate}
            onTaskDeleted={onTaskDeleted}
          />





      </TaskContent>
    </SortableTaskStyled>
  );



};

const SortableTaskStyled = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  position: relative;
  cursor: ${(props) => props.$isDragging ? "grabbing" : "default"};
  opacity: ${(props) => props.$isDragging ? 0.8 : 1};
  transform: ${(props) => props.$isDragging ? "scale(1.02)" : "scale(1)"};
  box-shadow: ${(props) => props.$isDragging ? "0 8px 20px rgba(0, 0, 0, 0.3)" : "none"};
  z-index: ${(props) => props.$isDragging ? 1000 : 1};
  transition: box-shadow 0.2s, transform 0.2s, opacity 0.2s;

  &:hover {
    ${(props) => !props.$isDragging && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `}
  }
`;






const TaskContent = styled.div`
  flex: 1;
  min-width: 0;
`;


export default SortableTask;
