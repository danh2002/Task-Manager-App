"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import { MEMBER_BY_ID } from "@/app/utils/assignees";

interface Props {
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  isImportant: boolean;
  priority?: string;
  id: string;
  dueDate?: string;
  reminder?: string;
  columnId?: string;
  checklist?: Array<{ text: string; done: boolean }> | string;
  labels?: Array<{ id: string; name: string; color: string }>;
  assigneeIds?: string[] | string;
  onTaskUpdate?: () => void;
  onTaskDeleted?: (taskId: string) => void;
}

const TaskItem = ({
  id,
  title,
  description,
  date,
  isCompleted,
  isImportant,
  priority,
  dueDate,
  reminder,
  columnId,
  checklist,
  labels,
  assigneeIds,
}: Props): JSX.Element => {
  const { setEditingTask } = useGlobalState();
  const [localIsCompleted, setLocalIsCompleted] = useState(isCompleted);
  useEffect(() => setLocalIsCompleted(isCompleted), [isCompleted]);

  const normalizedPriority = normalizePriority(priority);
  const tag = getTag(normalizedPriority);
  const taskLabels = labels || [];
  const parsedChecklist = useMemo(() => parseChecklist(checklist), [checklist]);
  const parsedAssigneeIds = useMemo(() => parseAssigneeIds(assigneeIds), [assigneeIds]);
  const assignees = useMemo(
    () =>
      parsedAssigneeIds.map((id) => {
        const member = MEMBER_BY_ID[id];
        if (member) return member;
        return { id, name: id };
      }),
    [parsedAssigneeIds]
  );
  const displayedAssignees = assignees.slice(0, 2);
  const remainingAssignees = Math.max(assignees.length - displayedAssignees.length, 0);
  const doneCount = useMemo(() => parsedChecklist.filter((item) => item.done).length, [parsedChecklist]);
  const totalCount = parsedChecklist.length;
  const progressText = `${doneCount}/${totalCount}`;

  const handleOpenEdit = () => {
    setEditingTask({
      id,
      title,
      description,
      date,
      isImportant,
      isCompleted: localIsCompleted,
      priority: normalizedPriority,
      dueDate,
      reminder,
      columnId,
      checklist: parsedChecklist,
      labels: labels || [],
      labelIds: (labels || []).map((label) => label.id),
      assigneeIds,
    });
  };

  return (
    <TaskCard $isCompleted={localIsCompleted} $priority={normalizedPriority} onClick={handleOpenEdit}>
      <TagBadgeRow>
        {taskLabels.length > 0 ? (
          taskLabels.map((label) => (
            <TagBadge key={label.id} $bg={hexToRgba(label.color, 0.16)} $color={label.color}>
              {label.name.toUpperCase()}
            </TagBadge>
          ))
        ) : (
          <TagBadge $bg={tag.bg} $color={tag.color}>
            {tag.label}
          </TagBadge>
        )}
      </TagBadgeRow>

      <TaskTitle $isCompleted={localIsCompleted}>{title}</TaskTitle>
      {description && <TaskDescription>{description}</TaskDescription>}

      <BottomRow>
        <MetaGroup>
          {normalizedPriority === "low" ? (
            <LowPriorityWrap>
              <LowPriorityIcon viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12.2 4.2A7.8 7.8 0 1 0 17.8 17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M17.7 17.1L13.8 16.7L15.7 20.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12.6 9.2H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12.6 12.2H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12.6 15.2H18.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </LowPriorityIcon>
              <span>Low</span>
            </LowPriorityWrap>
          ) : (
            <PriorityText $priority={normalizedPriority}>! {capitalize(normalizedPriority)}</PriorityText>
          )}
          <ProgressText>
            <i className="fa-solid fa-check-double"></i> {progressText}
          </ProgressText>
        </MetaGroup>
        <AvatarGroup>
          {displayedAssignees.map((member) =>
            member.avatar ? (
              <Avatar key={member.id} src={member.avatar} alt={member.name} title={member.name} />
            ) : (
              <AvatarFallback key={member.id} title={member.name}>
                {member.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            )
          )}
          {remainingAssignees > 0 && <AvatarMore title={`+${remainingAssignees} assignee`}>+{remainingAssignees}</AvatarMore>}
        </AvatarGroup>
      </BottomRow>
    </TaskCard>
  );
};

const normalizePriority = (p: any): "low" | "medium" | "high" => {
  if (!p) return "medium";
  const val = String(p).toLowerCase();
  if (val === "low" || val === "medium" || val === "high") return val;
  return "medium";
};

const parseChecklist = (value: any): Array<{ text: string; done: boolean }> => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => ({ text: String(item?.text || "").trim(), done: Boolean(item?.done) }))
      .filter((item) => item.text.length > 0);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item: any) => ({ text: String(item?.text || "").trim(), done: Boolean(item?.done) }))
        .filter((item: { text: string }) => item.text.length > 0);
    } catch {
      return [];
    }
  }
  return [];
};

const parseAssigneeIds = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((id) => String(id))
      .filter((id) => id.length > 0)
      .reduce((acc: string[], id: string) => {
        if (!acc.includes(id)) acc.push(id);
        return acc;
      }, []);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((id: any) => String(id))
        .filter((id: string) => id.length > 0)
        .reduce((acc: string[], id: string) => {
          if (!acc.includes(id)) acc.push(id);
          return acc;
        }, []);
    } catch {
      return [];
    }
  }
  return [];
};

const hexToRgba = (hex: string, alpha: number) => {
  const value = (hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(43, 127, 255, ${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const getTag = (p: "low" | "medium" | "high") => {
  if (p === "high") return { label: "DEVELOPMENT", bg: "#d7f3e6", color: "#049669" };
  if (p === "low") return { label: "MARKETING", bg: "#f3ecff", color: "#7c55d4" };
  return { label: "DESIGN", bg: "#deebff", color: "#2b7fff" };
};

const priorityColor = (p: "low" | "medium" | "high") => {
  if (p === "high") return "#ef4444";
  if (p === "low") return "#10b981";
  return "#f59e0b";
};

const TaskCard = styled.div<{ $isCompleted?: boolean; $priority: "low" | "medium" | "high" }>`
  background: #ffffff;
  border: 1px solid #d3deee;
  border-left: 5px solid transparent;
  border-radius: 16px;
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(16, 36, 69, 0.08);
  opacity: ${(props) => (props.$isCompleted ? 0.75 : 1)};
  cursor: pointer;
  transition: border-left-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-left-color: #2b7fff;
    box-shadow: 0 4px 14px rgba(16, 36, 69, 0.12);
  }
`;

const TagBadge = styled.span<{ $bg: string; $color: string }>`
  width: fit-content;
  background: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  border-radius: 7px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2px;
`;

const TagBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TaskTitle = styled.h3<{ $isCompleted?: boolean }>`
  margin: 2px 0 0;
  font-size: 16px;
  line-height: 1.28;
  font-weight: 800;
  color: #1f2d44;
  text-decoration: ${(props) => (props.$isCompleted ? "line-through" : "none")};
`;

const TaskDescription = styled.p`
  margin: 0;
  color: #4f6686;
  font-size: 13px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`;

const MetaGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const PriorityText = styled.span<{ $priority: "low" | "medium" | "high" }>`
  font-size: 18px;
  font-weight: 800;
  color: ${(props) => priorityColor(props.$priority)};
`;

const LowPriorityWrap = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 18px;
    color: #10b981;
  }
`;

const LowPriorityIcon = styled.svg`
  width: 22px;
  height: 22px;
  color: #10b981;
  flex: 0 0 22px;
`;

const ProgressText = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: #8798b3;
  display: flex;
  align-items: center;
  gap: 5px;

  i {
    font-size: 12px;
  }
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

const Avatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`;

const AvatarFallback = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eef3fb;
  color: #62789b;
  border: 2px solid #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`;

const AvatarMore = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e7eefb;
  color: #4a6287;
  border: 2px solid #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  margin-left: -8px;
`;

export default TaskItem;
