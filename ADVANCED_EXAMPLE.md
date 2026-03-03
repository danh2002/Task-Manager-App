/**
 * ADVANCED EXAMPLE: Complete Formik + Yup + Prisma Integration
 * 
 * This file demonstrates best practices for using Formik, Yup, and Prisma together
 * in a Next.js 14+ application.
 */

// ============================================================================
// 1. VALIDATION SCHEMA (app/lib/validations/advancedSchema.ts)
// ============================================================================

import * as Yup from "yup";

export const advancedTaskSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .required("Title is required")
    .test("no-special-chars", "Title contains invalid characters", function (value) {
      if (!value) return true;
      return !/[<>]/.test(value);
    }),
  description: Yup.string()
    .max(500, "Description must not exceed 500 characters"),
  date: Yup.string()
    .required("Date is required")
    .test("valid-date", "Please enter a valid future date", function (value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"], "Invalid priority")
    .default("medium"),
  tags: Yup.array()
    .of(Yup.string())
    .max(5, "Cannot add more than 5 tags"),
  isImportant: Yup.boolean().default(false),
  isCompleted: Yup.boolean().default(false),
});

export type AdvancedTaskFormValues = Yup.InferType<typeof advancedTaskSchema>;

// ============================================================================
// 2. API ROUTE (app/api/advanced-tasks/route.ts)
// ============================================================================

import { auth } from "@clerk/nextjs";
import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { advancedTaskSchema } from "@/app/lib/validations/advancedSchema";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const { userId } = auth();
    if (!userId) {
      return errorResponse("Unauthorized - Please login", 401);
    }

    // 2. Parse and validate request body
    const body = await req.json();
    let validatedData;

    try {
      validatedData = await advancedTaskSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (validationError: any) {
      const messages = validationError.errors.join(", ");
      return errorResponse(`Validation Error: ${messages}`, 400);
    }

    // 3. Database operation with Prisma
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        date: validatedData.date,
        isImportant: validatedData.isImportant,
        isCompleted: validatedData.isCompleted,
        userId,
      },
    });

    // 4. Return success response
    return successResponse(
      {
        id: task.id,
        title: task.title,
        message: "Task created successfully",
      },
      201
    );
  } catch (error: any) {
    console.error("ERROR IN POST /api/advanced-tasks:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return errorResponse("This task already exists", 409);
    }

    return errorResponse("Internal Server Error", 500);
  }
}

// ============================================================================
// 3. FORM COMPONENT (app/components/Forms/AdvancedTaskForm.tsx)
// ============================================================================

"use client";

import React, { useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import styled from "styled-components";
import toast from "react-hot-toast";
import { advancedTaskSchema, type AdvancedTaskFormValues } from "@/app/lib/validations/advancedSchema";

const AdvancedTaskForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: AdvancedTaskFormValues = {
    title: "",
    description: "",
    date: "",
    priority: "medium",
    tags: [],
    isImportant: false,
    isCompleted: false,
  };

  const handleSubmit = async (
    values: AdvancedTaskFormValues,
    { resetForm, setSubmitting }: any
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/advanced-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create task");
        return;
      }

      toast.success(result.data.message);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={advancedTaskSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <FormContainer>
          <Form>
            {/* Title Field */}
            <FormGroup>
              <Label htmlFor="title">Task Title *</Label>
              <Field
                as="input"
                id="title"
                name="title"
                placeholder="Enter task title"
              />
              {touched.title && errors.title && (
                <ErrorText>{errors.title}</ErrorText>
              )}
            </FormGroup>

            {/* Description Field */}
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <Field
                as="textarea"
                id="description"
                name="description"
                placeholder="Enter task description"
                rows={4}
              />
              {touched.description && errors.description && (
                <ErrorText>{errors.description}</ErrorText>
              )}
            </FormGroup>

            {/* Date Field */}
            <FormGroup>
              <Label htmlFor="date">Due Date *</Label>
              <Field
                as="input"
                id="date"
                name="date"
                type="date"
              />
              {touched.date && errors.date && (
                <ErrorText>{errors.date}</ErrorText>
              )}
            </FormGroup>

            {/* Priority Select */}
            <FormGroup>
              <Label htmlFor="priority">Priority</Label>
              <Field as="select" id="priority" name="priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Field>
              {touched.priority && errors.priority && (
                <ErrorText>{errors.priority}</ErrorText>
              )}
            </FormGroup>

            {/* Tags Array Field */}
            <FormGroup>
              <Label>Tags (Max 5)</Label>
              <FieldArray name="tags">
                {({ push, remove }) => (
                  <TagsContainer>
                    {values.tags.map((tag, index) => (
                      <TagInput key={index}>
                        <Field
                          as="input"
                          name={`tags.${index}`}
                          placeholder="Tag"
                        />
                        <RemoveButton
                          type="button"
                          onClick={() => remove(index)}
                        >
                          ×
                        </RemoveButton>
                      </TagInput>
                    ))}
                    {values.tags.length < 5 && (
                      <AddTagButton
                        type="button"
                        onClick={() => push("")}
                      >
                        + Add Tag
                      </AddTagButton>
                    )}
                  </TagsContainer>
                )}
              </FieldArray>
              {touched.tags && errors.tags && (
                <ErrorText>{errors.tags}</ErrorText>
              )}
            </FormGroup>

            {/* Checkboxes */}
            <CheckboxGroup>
              <CheckboxLabel>
                <Field
                  as="input"
                  type="checkbox"
                  name="isImportant"
                />
                Mark as important
              </CheckboxLabel>
              <CheckboxLabel>
                <Field
                  as="input"
                  type="checkbox"
                  name="isCompleted"
                />
                Mark as completed
              </CheckboxLabel>
            </CheckboxGroup>

            {/* Submit Button */}
            <ButtonGroup>
              <SubmitButton
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isLoading ? "Creating..." : "Create Task"}
              </SubmitButton>
            </ButtonGroup>
          </Form>
        </FormContainer>
      )}
    </Formik>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
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
  color: #1f2937;
`;

const Input = styled(Field)`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorText = styled.span`
  color: #dc2626;
  font-size: 0.8rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
  }
`;

const RemoveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
`;

const AddTagButton = styled.button`
  padding: 0.75rem;
  background: #dbeafe;
  color: #2563eb;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;

  input {
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 2rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default AdvancedTaskForm;

// ============================================================================
// KEY TAKEAWAYS
// ============================================================================

/*
✅ VALIDATION LAYER:
   - Custom validation rules with .test()
   - Type-safe form values with Yup.InferType<>
   - Separates validation logic from components

✅ API LAYER:
   - Validates data before database operations
   - Handles Prisma-specific errors
   - Provides standardized responses
   - Implements proper error handling

✅ FORM COMPONENT:
   - Uses Formik for state management
   - Displays validation errors inline
   - Handles loading states
   - Provides better UX with controlled components

✅ BEST PRACTICES:
   - Single source of truth for validation schema
   - Reusable API response helpers
   - Proper TypeScript typing
   - Error boundaries and error states
   - Loading indicators during submission
*/
