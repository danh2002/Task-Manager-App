import * as Yup from "yup";

export const labelValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Label name is required")
    .max(30, "Label name must not exceed 30 characters")
    .required("Label name is required"),
  color: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#6c7983"),
  boardId: Yup.string().required("Board ID is required"),
});

export type LabelFormValues = Yup.InferType<typeof labelValidationSchema>;
