import * as Yup from "yup";

export const taskValidationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .required("Title is required"),
  description: Yup.string()
    .max(500, "Description must not exceed 500 characters")
    .required("Description is required"),
  date: Yup.string()
    .required("Date is required")
    .test("valid-date", "Please enter a valid date", function (value) {
      if (!value) return false;
      return !isNaN(new Date(value).getTime());
    }),
  dueDate: Yup.date()
    .nullable()
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Due date cannot be in the past"),
  reminder: Yup.date()
    .nullable()
    .test("reminder-after-now", "Reminder must be in the future", function (value) {
      if (!value) return true;
      return new Date(value) > new Date();
    })
    .test("reminder-before-due", "Reminder must be before due date", function (value) {
      if (!value) return true;
      const dueDate = this.parent.dueDate;
      if (!dueDate) return true;
      return new Date(value) <= new Date(dueDate);
    }),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"], "Priority must be low, medium, or high"),
  checklist: Yup.array()
    .of(
      Yup.object().shape({
        text: Yup.string().trim().required("Checklist item text is required"),
        done: Yup.boolean().required(),
      })
    )
    .default([]),
  labelIds: Yup.array().of(Yup.string()).default([]),
  assigneeIds: Yup.array().of(Yup.string()).default([]),

  isImportant: Yup.boolean(),
  isCompleted: Yup.boolean(),
});



// Define explicit type for form values (not using InferType to avoid optional fields from .default())
export interface TaskFormValues {
  title: string;
  description: string;
  date: string;
  priority: "low" | "medium" | "high";
  isImportant: boolean;
  isCompleted: boolean;
  boardId?: string;
  columnId?: string;
  position?: number;
  dueDate?: Date | string | null;
  reminder?: Date | string | null;
  reminderSent?: boolean;
  labelIds?: string[];
  checklist?: Array<{ text: string; done: boolean }>;
  assigneeIds?: string[];
}
