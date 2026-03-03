"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "styled-components";
import toast from "react-hot-toast";
import axios from "axios";
import { useGlobalState } from "@/app/context/globalProvider";
import { taskValidationSchema, type TaskFormValues } from "@/app/lib/validations/taskSchema";
import { TEAM_MEMBERS } from "@/app/utils/assignees";

interface CreateTaskFormProps {
  boardId?: string;
  columnId?: string;
  editingTask?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface LabelItem {
  id: string;
  name: string;
  color: string;
}

const formatDateForInput = (dateValue: any): string => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const formatDateTimeForInput = (dateValue: any): string => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
};

const todayString = () => new Date().toISOString().split("T")[0];

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

const parseLabelIds = (editingTask: any): string[] => {
  if (!editingTask) return [];
  if (Array.isArray(editingTask.labelIds)) {
    return editingTask.labelIds.map((id: any) => String(id)).filter((id: string) => id.length > 0);
  }
  if (Array.isArray(editingTask.labels)) {
    return editingTask.labels.map((label: any) => String(label.id)).filter((id: string) => id.length > 0);
  }
  return [];
};

const parseAssigneeIds = (editingTask: any): string[] => {
  if (!editingTask) return [];
  const value = editingTask.assigneeIds;
  if (Array.isArray(value)) return value.map((id: any) => String(id)).filter((id: string) => id.length > 0);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id: any) => String(id)).filter((id: string) => id.length > 0);
    } catch {
      return [];
    }
  }
  return [];
};

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  boardId: propBoardId,
  columnId: propColumnId,
  editingTask,
  onSuccess,
  onCancel,
}) => {
  const { allTasks, closeModal, currentBoard } = useGlobalState();
  const boardId = propBoardId || currentBoard?.id;
  const columns = currentBoard?.columns || [];
  const isEditMode = !!editingTask;
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const activeBoardId = useMemo(() => boardId || editingTask?.boardId || "", [boardId, editingTask?.boardId]);

  const initialValues: TaskFormValues = {
    title: editingTask?.title || "",
    description: editingTask?.description || "",
    date: editingTask?.date || todayString(),
    priority: editingTask?.priority || "medium",
    isImportant: editingTask?.isImportant || false,
    isCompleted: editingTask?.isCompleted || false,
    boardId: boardId || editingTask?.boardId || "",
    columnId: propColumnId || editingTask?.columnId || "",
    dueDate: formatDateForInput(editingTask?.dueDate),
    reminder: formatDateTimeForInput(editingTask?.reminder),
    checklist: parseChecklist(editingTask?.checklist),
    labelIds: parseLabelIds(editingTask),
    assigneeIds: parseAssigneeIds(editingTask),
  };

  useEffect(() => {
    if (!activeBoardId) {
      setLabels([]);
      return;
    }

    const fetchLabels = async () => {
      try {
        const res = await axios.get(`/api/labels?boardId=${activeBoardId}`);
        if (res.data.success) {
          setLabels(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };

    fetchLabels();
  }, [activeBoardId]);


  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    closeModal();
  };

  const handleSubmit = async (
    values: TaskFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const taskData = { ...values, boardId: values.boardId || boardId };
      let res;

      if (isEditMode && editingTask?.id) {
        res = await axios.put("/api/tasks", { ...taskData, id: editingTask.id });
        if (res.data.success) toast.success("Task updated successfully");
      } else {
        res = await axios.post("/api/tasks", taskData);
        if (res.data.success) toast.success("Task created successfully");
      }

      if (res?.data?.success) {
        await allTasks();
        closeModal();
        onSuccess?.();
      } else if (res?.data?.error) {
        toast.error(res.data.error);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to save task";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <Header>
        <TitleWrap>
          <IconCircle>
            <i className="fa-solid fa-list-check"></i>
          </IconCircle>
          <div>
            <Title>{isEditMode ? "Edit Task" : "Create New Task"}</Title>
            <Subtitle>
              {isEditMode ? "Update task information for this board." : "Fill in the details to add a new task to the project board."}
            </Subtitle>
          </div>
        </TitleWrap>
        <CloseButton type="button" onClick={handleCancel}>
          <i className="fa-solid fa-xmark"></i>
        </CloseButton>
      </Header>

      <Formik initialValues={initialValues} enableReinitialize validationSchema={taskValidationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, values, setFieldValue, handleBlur }) => (
          <StyledForm>
            <Body>
              <Field name="date" type="hidden" />

              <FieldGroup>
                <Label htmlFor="title">
                  Task Title <Required>*</Required>
                </Label>
                <TextInput id="title" name="title" type="text" placeholder="e.g. Redesign User Profile" />
                <ErrorText>
                  <ErrorMessage name="title" />
                </ErrorText>
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="description">Description</Label>
                <EditorShell>
                  <EditorToolbar>
                    <ToolbarButton type="button">
                      <i className="fa-solid fa-bold"></i>
                    </ToolbarButton>
                    <ToolbarButton type="button">
                      <i className="fa-solid fa-italic"></i>
                    </ToolbarButton>
                    <ToolbarButton type="button">
                      <i className="fa-solid fa-list"></i>
                    </ToolbarButton>
                    <ToolbarButton type="button">
                      <i className="fa-solid fa-link"></i>
                    </ToolbarButton>
                    <ToolbarButton type="button">
                      <i className="fa-regular fa-image"></i>
                    </ToolbarButton>
                  </EditorToolbar>
                  <TextArea
                    id="description"
                    name="description"
                    placeholder="Provide more context about this task..."
                    rows={4}
                    value={values.description}
                    onChange={(e) => setFieldValue("description", e.target.value)}
                    onBlur={handleBlur}
                  />
                </EditorShell>
                <ErrorText>
                  <ErrorMessage name="description" />
                </ErrorText>
              </FieldGroup>

              <FieldGroup>
                <Label>Checklist</Label>
                <ChecklistWrap>
                  {((values.checklist || []) as Array<{ text: string; done: boolean }>).map((item, index) => (
                    <ChecklistItem key={`checklist-${index}`}>
                      <ChecklistCheckbox
                        type="checkbox"
                        checked={Boolean(item.done)}
                        onChange={(e) => {
                          const next = [...((values.checklist || []) as Array<{ text: string; done: boolean }>)];
                          next[index] = { ...next[index], done: e.target.checked };
                          setFieldValue("checklist", next);
                        }}
                      />
                      <ChecklistInput
                        type="text"
                        value={item.text}
                        placeholder={`Checklist item ${index + 1}`}
                        onChange={(e) => {
                          const next = [...((values.checklist || []) as Array<{ text: string; done: boolean }>)];
                          next[index] = { ...next[index], text: e.target.value };
                          setFieldValue("checklist", next);
                        }}
                      />
                      <RemoveChecklistButton
                        type="button"
                        onClick={() => {
                          const next = [...((values.checklist || []) as Array<{ text: string; done: boolean }>)];
                          next.splice(index, 1);
                          setFieldValue("checklist", next);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </RemoveChecklistButton>
                    </ChecklistItem>
                  ))}
                  <AddChecklistButton
                    type="button"
                    onClick={() => {
                      const next = [...((values.checklist || []) as Array<{ text: string; done: boolean }>), { text: "", done: false }];
                      setFieldValue("checklist", next);
                    }}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Add checklist item
                  </AddChecklistButton>
                </ChecklistWrap>
              </FieldGroup>

              <FieldGroup>
                <Label>Tags</Label>
                <TagsPanel>
                  <TagsList>
                    {labels.map((label) => {
                      const selected = ((values.labelIds || []) as string[]).includes(label.id);
                      return (
                        <TagRow key={label.id}>
                          <TagToggleButton
                            type="button"
                            $selected={selected}
                            $color={label.color}
                            onClick={() => {
                              const current = (values.labelIds || []) as string[];
                              const next = selected ? current.filter((id) => id !== label.id) : [...current, label.id];
                              setFieldValue("labelIds", next);
                            }}
                          >
                            {label.name}
                          </TagToggleButton>
                        </TagRow>
                      );
                    })}
                  </TagsList>
                </TagsPanel>
              </FieldGroup>

              <Grid>
                <FieldGroup>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    id="priority"
                    name="priority"
                    value={values.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFieldValue("priority", e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                  <ErrorText>
                    <ErrorMessage name="priority" />
                  </ErrorText>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="columnId">Column</Label>
                  <Select
                    id="columnId"
                    name="columnId"
                    value={values.columnId || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFieldValue("columnId", e.target.value)}
                  >
                    <option value="">No Column</option>
                    {columns.map((col: any) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <TextInput id="dueDate" name="dueDate" type="date" />
                  <ErrorText>
                    <ErrorMessage name="dueDate" />
                  </ErrorText>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="reminder">Reminder</Label>
                  <TextInput id="reminder" name="reminder" type="datetime-local" />
                  <ErrorText>
                    <ErrorMessage name="reminder" />
                  </ErrorText>
                </FieldGroup>

                <FieldGroup>
                  <Label>Assign To</Label>
                  <AssignList>
                    {TEAM_MEMBERS.map((member) => {
                      const selected = ((values.assigneeIds || []) as string[]).includes(member.id);
                      return (
                        <AssignChip
                          key={member.id}
                          type="button"
                          $selected={selected}
                          onClick={() => {
                            const current = (values.assigneeIds || []) as string[];
                            const next = selected ? current.filter((id) => id !== member.id) : [...current, member.id];
                            setFieldValue("assigneeIds", next);
                          }}
                          title={member.name}
                        >
                          {member.avatar ? (
                            <AssignAvatar src={member.avatar} alt={member.name} />
                          ) : (
                            <AssignInitial>{member.name.slice(0, 1).toUpperCase()}</AssignInitial>
                          )}
                          <span>{member.name}</span>
                        </AssignChip>
                      );
                    })}
                  </AssignList>
                </FieldGroup>
              </Grid>

              <CheckboxWrap>
                <Field id="isImportant" name="isImportant" type="checkbox" />
                <label htmlFor="isImportant">Mark this task as important</label>
              </CheckboxWrap>
            </Body>

            <Footer>
              <CancelButton type="button" onClick={handleCancel}>
                Cancel
              </CancelButton>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Task" : "Create Task"}
              </SubmitButton>
            </Footer>
          </StyledForm>
        )}
      </Formik>
    </Shell>
  );
};

const Shell = styled.div`
  background: #ffffff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 32px;
  border-bottom: 1px solid #e6edf7;
`;

const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const IconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #e7f1ff;
  color: #2b7fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 38px;
  line-height: 1;
  font-weight: 800;
  color: #17243a;
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: #7f91ab;
`;

const CloseButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: transparent;
  color: #8fa2bd;
  border: 1px solid transparent;

  &:hover {
    background: #f4f7fc;
    border-color: #d5e1f0;
  }
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  padding: 24px 32px 16px;
`;

const FieldGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: inline-block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #2c3a52;
`;

const Required = styled.span`
  color: #ef4444;
`;

const TextInput = styled(Field)`
  width: 100%;
  height: 46px;
  border: 1px solid #d4deeb;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  color: #2d3b53;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #2b7fff;
    box-shadow: 0 0 0 3px rgba(43, 127, 255, 0.12);
  }
`;

const EditorShell = styled.div`
  border: 1px solid #d4deeb;
  border-radius: 12px;
  overflow: hidden;
`;

const EditorToolbar = styled.div`
  height: 42px;
  border-bottom: 1px solid #dfe7f2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  background: #f8fbff;
`;

const ToolbarButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #6c82a3;

  &:hover {
    background: #e9f1fc;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  border: 0;
  resize: vertical;
  min-height: 112px;
  padding: 12px 14px;
  font-size: 15px;
  color: #2d3b53;

  &:focus {
    outline: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  width: 100%;
  height: 46px;
  border: 1px solid #d4deeb;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  color: #2d3b53;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #2b7fff;
    box-shadow: 0 0 0 3px rgba(43, 127, 255, 0.12);
  }
`;

const CheckboxWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  margin-bottom: 6px;
  color: #516883;
  font-size: 14px;
`;

const ErrorText = styled.div`
  min-height: 16px;
  margin-top: 4px;
  font-size: 12px;
  color: #dc2626;
`;

const ChecklistWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChecklistItem = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr 34px;
  gap: 8px;
  align-items: center;
`;

const ChecklistCheckbox = styled.input`
  width: 16px;
  height: 16px;
`;

const ChecklistInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #d4deeb;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  color: #2d3b53;

  &:focus {
    outline: none;
    border-color: #2b7fff;
    box-shadow: 0 0 0 3px rgba(43, 127, 255, 0.1);
  }
`;

const RemoveChecklistButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #f3d2d2;
  color: #ef4444;
  background: #fff5f5;
`;

const AddChecklistButton = styled.button`
  width: fit-content;
  height: 34px;
  border-radius: 10px;
  border: 1px dashed #bfd0e8;
  color: #4c668d;
  background: #f8fbff;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TagsPanel = styled.div`
  border: 1px solid #dbe5f2;
  border-radius: 12px;
  padding: 10px;
  background: #fbfdff;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const TagRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const TagToggleButton = styled.button<{ $selected: boolean; $color: string }>`
  height: 30px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid ${(props) => props.$color};
  background: ${(props) => (props.$selected ? props.$color : "#ffffff")};
  color: ${(props) => (props.$selected ? "#ffffff" : props.$color)};
`;

const AssignList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AssignChip = styled.button<{ $selected: boolean }>`
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${(props) => (props.$selected ? "#2b7fff" : "#d4deeb")};
  background: ${(props) => (props.$selected ? "#e9f2ff" : "#ffffff")};
  color: #2d3b53;
  padding: 0 10px 0 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
`;

const AssignAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const AssignInitial = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #edf2f9;
  color: #5d7090;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
`;

const Footer = styled.div`
  border-top: 1px solid #e6edf7;
  padding: 16px 32px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled.button`
  height: 40px;
  border-radius: 11px;
  padding: 0 18px;
  font-weight: 700;
  color: #546c8b;
  border: 1px solid #d6e1ef;
  background: #ffffff;
`;

const SubmitButton = styled.button`
  height: 40px;
  border-radius: 12px;
  padding: 0 22px;
  font-weight: 700;
  color: #ffffff;
  background: #2b7fff;
  box-shadow: 0 8px 18px rgba(43, 127, 255, 0.28);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export default CreateTaskForm;
