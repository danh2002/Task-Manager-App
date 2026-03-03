/**
 * FORMIK PATTERNS & EXAMPLES
 * 
 * This file contains commonly used patterns with Formik.
 * Use this as a reference for building forms.
 */

"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import styled from "styled-components";
import * as Yup from "yup";

/**
 * EXAMPLE 1: Basic Form Pattern
 */
export const BasicFormExample = () => {
  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
  });

  return (
    <Formik
      initialValues={{ email: "" }}
      validationSchema={schema}
      onSubmit={(values) => console.log(values)}
    >
      <Form>
        <FormGroup>
          <label htmlFor="email">Email</label>
          <Field id="email" name="email" />
          <ErrorMessage name="email" component="div" />
        </FormGroup>
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
};

/**
 * EXAMPLE 2: Form with Custom Handling
 */
interface MyFormProps {
  onSuccess?: () => void;
}

export const CustomFormExample: React.FC<MyFormProps> = ({ onSuccess }) => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const handleSubmit = async (
    values: { name: string },
    { setSubmitting }: FormikHelpers<{ name: string }>
  ) => {
    try {
      // API call
      setSubmitting(false);
      onSuccess?.();
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ name: "" }}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <FormGroup>
            <label htmlFor="name">Name</label>
            <Field id="name" name="name" />
            <ErrorMessage name="name" component="div" />
          </FormGroup>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

/**
 * EXAMPLE 3: Form with Array Fields
 */
export const ArrayFormExample = () => {
  return (
    <Formik
      initialValues={{ items: [{ name: "" }] }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values }) => (
        <Form>
          {values.items.map((item, idx) => (
            <div key={idx}>
              <Field name={`items.${idx}.name`} />
            </div>
          ))}
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

/**
 * STYLED COMPONENTS
 */
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
  }

  input,
  textarea {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
  }
`;

/**
 * KEY TAKEAWAYS:
 * 
 * 1. Always use validationSchema for type safety
 * 2. Use ErrorMessage component for validation errors
 * 3. Use FormikHelpers for advanced control (setSubmitting, etc)
 * 4. Wrap complex logic in try-catch blocks
 * 5. Disable submit button during submission
 * 
 * For implementation examples, see:
 * - app/components/Forms/CreateTaskForm.tsx
 * - ADVANCED_EXAMPLE.md
 * - QUICK_REFERENCE.md
 */

