"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import SortableTask from "../TaskItem/SortableTask";
import ColumnForm from "../Forms/ColumnForm";
import CreateTaskForm from "../Forms/CreateTaskForm";
import Modal from "../Modals/Modal";
import SearchFilter from "../Search/SearchFilter";
import axios from "axios";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface BoardViewProps {
  boardId: string;
}

const hexToRgba = (hex?: string, alpha: number = 0.14) => {
  const value = (hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(140, 161, 188, ${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getColumnColor = (column: Column) => {
  if (column.color) return column.color;
  const name = column.name.toLowerCase();
  if (name.includes("done")) return "#16a34a";
  if (name.includes("progress")) return "#2563eb";
  if (name.includes("to do") || name.includes("todo")) return "#6b7280";
  return "#4d6486";
};

const BoardView: React.FC<BoardViewProps> = ({ boardId }) => {
  const { currentBoard, getBoard, deleteColumn, openModal, modal, closeModal, editingTask } =
    useGlobalState();
  const [columnTasks, setColumnTasks] = useState<Record<string, any[]>>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [activeDragTask, setActiveDragTask] = useState<any>(null);
  const [showDeleteColumnConfirm, setShowDeleteColumnConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<{ id: string; name: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 20, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (boardId) getBoard(boardId);
  }, [boardId]);

  useEffect(() => {
    if (!currentBoard?.columns) return;
    currentBoard.columns.forEach(async (column: Column) => {
      try {
        const res = await axios.get(`/api/tasks?columnId=${column.id}`);
        if (res.data.success) {
          setColumnTasks((prev) => ({ ...prev, [column.id]: res.data.data.tasks || [] }));
        }
      } catch (error) {
        console.error(error);
      }
    });
  }, [currentBoard?.columns]);

  const isDoneColumn = (columnName: string): boolean => {
    const names = ["done", "completed", "finished", "complete"];
    return names.includes(columnName.toLowerCase());
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowTaskModal(true);
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    setSelectedColumnId(null);
    getBoard(boardId);
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    setColumnTasks((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((columnId) => {
        next[columnId] = next[columnId].filter((task) => task.id !== deletedTaskId);
      });
      return next;
    });
  };

  const handleDragStart = (event: any) => {
    const taskId = event.active.id as string;
    for (const tasks of Object.values(columnTasks)) {
      const task = tasks.find((item) => item.id === taskId);
      if (task) {
        setActiveDragTask(task);
        return;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let sourceColumnId: string | null = null;
    let targetColumnId: string | null = null;
    let activeTask: any = null;

    for (const [colId, tasks] of Object.entries(columnTasks)) {
      const task = tasks.find((item) => item.id === activeId);
      if (task) {
        sourceColumnId = colId;
        activeTask = task;
        break;
      }
    }

    const overIsColumn = currentBoard?.columns.some((col: Column) => col.id === overId);
    if (overIsColumn) {
      targetColumnId = overId;
    } else {
      for (const [colId, tasks] of Object.entries(columnTasks)) {
        if (tasks.some((item) => item.id === overId)) {
          targetColumnId = colId;
          break;
        }
      }
    }

    if (!sourceColumnId || !targetColumnId || !activeTask) return;

    if (sourceColumnId === targetColumnId) {
      const tasks = columnTasks[sourceColumnId];
      const oldIndex = tasks.findIndex((item) => item.id === activeId);
      const newIndex = tasks.findIndex((item) => item.id === overId);
      if (oldIndex !== newIndex && newIndex !== -1) {
        setColumnTasks((prev) => ({ ...prev, [sourceColumnId!]: arrayMove(tasks, oldIndex, newIndex) }));
      }
      return;
    }

    const targetColumn = currentBoard?.columns.find((col: Column) => col.id === targetColumnId);
    const sourceColumn = currentBoard?.columns.find((col: Column) => col.id === sourceColumnId);

    const shouldComplete = isDoneColumn(targetColumn?.name || "");
    const shouldUncomplete = isDoneColumn(sourceColumn?.name || "") && !isDoneColumn(targetColumn?.name || "");
    const newIsCompleted = shouldComplete ? true : shouldUncomplete ? false : activeTask.isCompleted;

    setColumnTasks((prev) => {
      const sourceTasks = prev[sourceColumnId!].filter((item) => item.id !== activeId);
      const targetTasks = [...(prev[targetColumnId!] || [])];
      const overIndex = targetTasks.findIndex((item) => item.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : targetTasks.length;
      targetTasks.splice(insertAt, 0, { ...activeTask, columnId: targetColumnId, isCompleted: newIsCompleted });
      return { ...prev, [sourceColumnId!]: sourceTasks, [targetColumnId!]: targetTasks };
    });

    try {
      const res = await axios.put(`/api/tasks/${activeId}`, {
        columnId: targetColumnId,
        isCompleted: newIsCompleted,
      });
      if (!res.data.success) throw new Error("Move failed");
      toast.success("Task moved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to move task");
      getBoard(boardId);
    }
  };

  const handleDeleteColumnClick = (columnId: string, columnName: string) => {
    setColumnToDelete({ id: columnId, name: columnName });
    setShowDeleteColumnConfirm(true);
  };

  const handleConfirmDeleteColumn = async () => {
    if (!columnToDelete) return;
    await deleteColumn(columnToDelete.id, boardId);
    setShowDeleteColumnConfirm(false);
    setColumnToDelete(null);
  };

  if (!currentBoard) {
    return <Container>Loading board...</Container>;
  }

  return (
    <Container>
      {modal && !editingTask && (
        <Modal content={<ColumnForm boardId={boardId} onSuccess={() => getBoard(boardId)} />} />
      )}

      {showTaskModal && !editingTask && (
        <Modal
          content={
            <CreateTaskForm
              boardId={boardId}
              columnId={selectedColumnId || undefined}
              onSuccess={handleTaskCreated}
              onCancel={() => setShowTaskModal(false)}
            />
          }
        />
      )}

      {editingTask && (
        <Modal
          content={
            <CreateTaskForm
              boardId={boardId}
              editingTask={editingTask}
              onSuccess={() => {
                closeModal();
                getBoard(boardId);
              }}
            />
          }
        />
      )}

      <BoardHeading>
        <div>
          <Title>{currentBoard.name}</Title>
          <Subtitle>{currentBoard.description || "Manage your tasks and releases."}</Subtitle>
        </div>
        <HeadingActions>
          <SecondaryButton onClick={openModal}>
            <i className="fa-regular fa-square-plus"></i>
            New Column
          </SecondaryButton>
          <PrimaryButton onClick={() => currentBoard.columns?.[0] && handleAddTask(currentBoard.columns[0].id)}>
            <i className="fa-solid fa-plus"></i>
            New Task
          </PrimaryButton>
        </HeadingActions>
      </BoardHeading>

      <SearchFilter boardId={boardId} onTagsChanged={() => getBoard(boardId)} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Columns>
          {currentBoard.columns
            ?.sort((a: Column, b: Column) => a.position - b.position)
            .map((column: Column) => (
              <DroppableColumn key={column.id} columnId={column.id}>
                <ColumnTitleRow>
                  <ColumnTitle>{column.name}</ColumnTitle>
                  <Count $color={getColumnColor(column)}>{columnTasks[column.id]?.length || 0}</Count>
                  <DotsButton onClick={() => handleDeleteColumnClick(column.id, column.name)} title="Delete column">
                    <i className="fa-solid fa-ellipsis"></i>
                  </DotsButton>
                </ColumnTitleRow>

                <SortableContext
                  items={columnTasks[column.id]?.map((task) => task.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <TaskStack>
                    {columnTasks[column.id]?.map((task: any) => (
                      <SortableTask
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        date={task.date}
                        isCompleted={task.isCompleted}
                        isImportant={task.isImportant}
                        priority={task.priority}
                        dueDate={task.dueDate}
                        reminder={task.reminder}
                        checklist={task.checklist}
                        labels={task.labels}
                        assigneeIds={task.assigneeIds}
                        columnId={column.id}
                        onTaskDeleted={handleTaskDeleted}
                      />
                    ))}
                  </TaskStack>
                </SortableContext>

                <AddTaskButton onClick={() => handleAddTask(column.id)}>
                  <i className="fa-solid fa-plus"></i>
                  Add Task
                </AddTaskButton>
              </DroppableColumn>
            ))}
        </Columns>

        <DragOverlay>{activeDragTask ? <OverlayCard>{activeDragTask.title}</OverlayCard> : null}</DragOverlay>
      </DndContext>

      {showDeleteColumnConfirm && (
        <DeleteConfirmOverlay onClick={() => setShowDeleteColumnConfirm(false)}>
          <DeleteConfirmModal onClick={(e) => e.stopPropagation()}>
            <h3>Delete column</h3>
            <p>This action will remove all tasks in:</p>
            <strong>{columnToDelete?.name}</strong>
            <DeleteActions>
              <CancelButton onClick={() => setShowDeleteColumnConfirm(false)}>Cancel</CancelButton>
              <DangerButton onClick={handleConfirmDeleteColumn}>Delete</DangerButton>
            </DeleteActions>
          </DeleteConfirmModal>
        </DeleteConfirmOverlay>
      )}
    </Container>
  );
};

const DroppableColumn: React.FC<{ columnId: string; children: React.ReactNode }> = ({ columnId, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId, data: { type: "column", columnId } });
  return (
    <ColumnShell ref={setNodeRef} $isOver={isOver}>
      {children}
    </ColumnShell>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 6px 8px 16px;
`;

const BoardHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 41px;
  color: #1d2940;
  font-weight: 800;
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  color: #6f84a3;
  font-size: 15px;
`;

const HeadingActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SecondaryButton = styled.button`
  height: 38px;
  border-radius: 12px;
  border: 1px solid #d8e2f0;
  background: #fff;
  color: #304763;
  font-size: 14px;
  font-weight: 700;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrimaryButton = styled.button`
  height: 40px;
  border-radius: 12px;
  background: #2b7fff;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 12px rgba(43, 127, 255, 0.25);
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 16px;
  align-items: start;
`;

const ColumnShell = styled.div<{ $isOver?: boolean }>`
  background: transparent;
  border-radius: 14px;
  transform: ${(props) => (props.$isOver ? "scale(1.01)" : "scale(1)")};
`;

const ColumnTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: #1f2d45;
`;

const Count = styled.span<{ $color: string }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  background: ${(props) => hexToRgba(props.$color)};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const DotsButton = styled.button`
  margin-left: auto;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: #8ca1bc;
`;

const TaskStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;
`;

const AddTaskButton = styled.button`
  width: 100%;
  margin-top: 10px;
  height: 44px;
  border-radius: 12px;
  border: 1px dashed #bccfe8;
  color: #667f9f;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
`;

const OverlayCard = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d5e0f0;
  background: #fff;
  color: #2d4361;
`;

const DeleteConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 23, 33, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const DeleteConfirmModal = styled.div`
  width: min(420px, 90vw);
  border-radius: 14px;
  padding: 18px;
  background: #fff;

  h3 {
    margin: 0 0 10px;
    color: #1d2b43;
    font-size: 18px;
  }

  p {
    margin: 0 0 6px;
    color: #607797;
  }

  strong {
    display: block;
    margin-bottom: 16px;
    color: #23344f;
  }
`;

const DeleteActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled.button`
  height: 34px;
  border-radius: 9px;
  border: 1px solid #c8d8ec;
  padding: 0 14px;
  color: #4a6388;
`;

const DangerButton = styled.button`
  height: 34px;
  border-radius: 9px;
  padding: 0 14px;
  background: #ef4444;
  color: #fff;
`;

export default BoardView;
