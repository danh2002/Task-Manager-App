"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "styled-components";
import toast from "react-hot-toast";
import axios from "axios";
import { useGlobalState } from "@/app/context/globalProvider";
import Button from "../Button/Button";
import { taskValidationSchema, type TaskFormValues } from "@/app/lib/validations/taskSchema";

// Styled Components - defined first
const FormContainer = styled.div`
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${(props: any) => props.theme.colorGrey0 || "#212529"};
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme.borderColor2 || "#d1d5db"};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: ${(props: any) => props.theme.colorBg3 || "white"};
  color: ${(props: any) => props.theme.colorGrey0 || "#212529"};
  cursor: pointer;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ErrorField = styled(ErrorMessage as any)`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const CheckboxGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  color: ${(props: any) => props.theme.colorGrey1 || "#495057"};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
`;

interface EditTaskFormProps {
  task: {
    id: string;
    title: string;
    description: string;
    date: string;
    isImportant: boolean;
    isCompleted: boolean;
    priority?: string;
    dueDate?: string;
    reminder?: string;
    columnId?: string;
  };
}





const EditTaskForm: React.FC<EditTaskFormProps> = ({ task }) => {
  const { theme, allTasks, closeModal, currentBoard } = useGlobalState();
  const columns = currentBoard?.columns || [];


  // DEBUG: Log task object to verify priority
  console.log("[EditTaskForm] Task received:", {
    id: task.id,
    title: task.title,
    priority: task.priority,
    priorityType: typeof task.priority
  });

  const initialValues: TaskFormValues = {
    title: task.title,
    description: task.description,
    date: task.date,
    priority: (task.priority as "low" | "medium" | "high") || "medium",
    isImportant: task.isImportant,
    isCompleted: task.isCompleted,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    reminder: task.reminder ? new Date(task.reminder).toISOString().slice(0, 16) : "",
    columnId: task.columnId || "",
  };




  const handleSubmit = async (
    values: TaskFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      console.log("🟡 Updating task with values:", values);
      console.log("🟡 Task ID:", task.id);

      const updatePayload = {
        id: task.id,
        title: values.title,
        description: values.description,
        date: values.date,
        priority: values.priority,
        isImportant: values.isImportant,
        isCompleted: values.isCompleted,
        dueDate: values.dueDate,
        reminder: values.reminder,
        columnId: values.columnId,
      };



      console.log("🟡 Payload to send:", updatePayload);

      const res = await axios.put("/api/tasks", updatePayload);
      console.log("✅ Update Response:", res.data);

      if (res.data.success) {
        await allTasks();
        closeModal();
        toast.success("Task updated successfully");
      } else if (res.data.error) {
        toast.error(res.data.error);
      }
    } catch (error: any) {
      console.error("❌ Full error object:", error);
      console.error("❌ Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to update task";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <Formik
        initialValues={initialValues}
        validationSchema={taskValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>

            <FormGroup>
              <Label theme={theme} htmlFor="title">Title</Label>
              <Field
                as="input"
                id="title"
                name="title"
                type="text"
                placeholder="Enter task title"
                style={{
                  padding: "0.75rem",
                  border: `1px solid ${theme?.borderColor2 || "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  backgroundColor: theme?.colorBg3 || "white",
                  color: theme?.colorGrey0 || "#212529",
                }}
              />
              <ErrorField name="title" component="div" />
            </FormGroup>

            <FormGroup>
              <Label theme={theme} htmlFor="description">Description</Label>
              <Field
                as="textarea"
                id="description"
                name="description"
                placeholder="Enter task description"
                style={{
                  padding: "0.75rem",
                  border: `1px solid ${theme?.borderColor2 || "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  backgroundColor: theme?.colorBg3 || "white",
                  color: theme?.colorGrey0 || "#212529",
                  resize: "vertical",
                }}
              />
              <ErrorField name="description" component="div" />
            </FormGroup>

            <FormGroup>
              <Label theme={theme} htmlFor="date">Date</Label>
              <Field
                as="input"
                id="date"
                name="date"
                type="date"
                style={{
                  padding: "0.75rem",
                  border: `1px solid ${theme?.borderColor2 || "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  backgroundColor: theme?.colorBg3 || "white",
                  color: theme?.colorGrey0 || "#212529",
                }}
              />
              <ErrorField name="date" component="div" />
            </FormGroup>

            <FormGroup>
              <Label theme={theme} htmlFor="dueDate">Due Date (Deadline)</Label>
              <Field
                as="input"
                id="dueDate"
                name="dueDate"
                type="date"
                style={{
                  padding: "0.75rem",
                  border: `1px solid ${theme?.borderColor2 || "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  backgroundColor: theme?.colorBg3 || "white",
                  color: theme?.colorGrey0 || "#212529",
                }}
              />
              <ErrorField name="dueDate" component="div" />
            </FormGroup>

            <FormGroup>
              <Label theme={theme} htmlFor="reminder">Reminder</Label>
              <Field
                as="input"
                id="reminder"
                name="reminder"
                type="datetime-local"
                style={{
                  padding: "0.75rem",
                  border: `1px solid ${theme?.borderColor2 || "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  backgroundColor: theme?.colorBg3 || "white",
                  color: theme?.colorGrey0 || "#212529",
                }}
              />
              <ErrorField name="reminder" component="div" />
            </FormGroup>

            {/* Column Selection */}
            {columns && columns.length > 0 && (
              <FormGroup>
                <Label theme={theme} htmlFor="columnId">Column</Label>
                <Select
                  id="columnId"
                  name="columnId"
                  value={values.columnId || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue("columnId", e.target.value);
                  }}
                  theme={theme}
                >
                  <option value="">No Column</option>
                  {columns.map((col: any) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            )}

            <FormGroup>
              <Label theme={theme} htmlFor="priority">Priority</Label>


              <Select
                id="priority"
                name="priority"
                value={values.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  console.log("🎯 Edit Priority onChange:", e.target.value);
                  setFieldValue("priority", e.target.value);
                }}
                theme={theme}
              >
                <option value="low" style={{ color: "#6c757d" }}>🟢 Low</option>
                <option value="medium" style={{ color: "#ffc107" }}>🟡 Medium</option>
                <option value="high" style={{ color: "#dc3545" }}>🔴 High</option>
              </Select>
              <ErrorField name="priority" component="div" />
            </FormGroup>


            <CheckboxGroup>
              <CheckboxLabel theme={theme} htmlFor="isImportant">
                <Field
                  id="isImportant"
                  name="isImportant"
                  type="checkbox"
                />
                Mark as important
              </CheckboxLabel>
            </CheckboxGroup>

            <ButtonGroup>
              <Button
                type="button"
                name="Cancel"
                click={closeModal}
                padding="0.75rem 2rem"
                borderRad="0.5rem"
                fw="600"
                background="#6b7280"
              />
              <Button
                type="submit"
                name={isSubmitting ? "Updating..." : "Update Task"}
                padding="0.75rem 2rem"
                borderRad="0.5rem"
                fw="600"
              />
            </ButtonGroup>
          </Form>
        )}
      </Formik>
    </FormContainer>
  );
};

export default EditTaskForm;
