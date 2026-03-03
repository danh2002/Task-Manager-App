import * as Yup from "yup";

export const boardValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Board name is required")
    .max(50, "Board name must not exceed 50 characters")
    .required("Board name is required"),
  description: Yup.string()
    .max(200, "Description must not exceed 200 characters"),
  color: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#7263F3"),
});

export const columnValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Column name is required")
    .max(30, "Column name must not exceed 30 characters")
    .required("Column name is required"),
  position: Yup.number().integer().min(0),
  color: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#6c7983"),
  boardId: Yup.string().required("Board ID is required"),
});

export const createBoardSchema = boardValidationSchema;
export const updateBoardSchema = boardValidationSchema.partial();

export const createColumnSchema = columnValidationSchema;
export const updateColumnSchema = columnValidationSchema.partial();

export type BoardFormValues = Yup.InferType<typeof boardValidationSchema>;
export type ColumnFormValues = Yup.InferType<typeof columnValidationSchema>;
