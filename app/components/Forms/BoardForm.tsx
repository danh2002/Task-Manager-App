"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "styled-components";
import toast from "react-hot-toast";
import { useGlobalState } from "@/app/context/globalProvider";
import { boardValidationSchema, type BoardFormValues } from "@/app/lib/validations/boardSchema";

interface BoardFormProps {
  onSuccess?: () => void;
}

const BoardForm: React.FC<BoardFormProps> = ({ onSuccess }) => {
  const { createBoard, closeModal } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: BoardFormValues = {
    name: "",
    description: "",
    color: "#2b7fff",
  };

  const handleSubmit = async (
    values: BoardFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    setIsLoading(true);
    try {
      const result = await createBoard(values);
      if (result) {
        resetForm();
        closeModal();
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create board");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <Header>
        <TitleWrap>
          <IconCircle>
            <i className="fa-regular fa-folder-open"></i>
          </IconCircle>
          <div>
            <Title>Create New Board</Title>
            <Subtitle>Create a workspace to organize tasks and columns.</Subtitle>
          </div>
        </TitleWrap>
        <CloseButton type="button" onClick={closeModal}>
          <i className="fa-solid fa-xmark"></i>
        </CloseButton>
      </Header>

      <Formik initialValues={initialValues} validationSchema={boardValidationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, values }) => (
          <StyledForm>
            <Body>
              <FieldGroup>
                <Label htmlFor="name">
                  Board Name <Required>*</Required>
                </Label>
                <TextInput as={Field} id="name" name="name" type="text" placeholder="e.g. Product Development" />
                <ErrorText>
                  <ErrorMessage name="name" />
                </ErrorText>
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea as={Field} id="description" name="description" rows={4} placeholder="Describe this board and its purpose..." />
                <ErrorText>
                  <ErrorMessage name="description" />
                </ErrorText>
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="color">Board Color</Label>
                <ColorRow>
                  <ColorPreview style={{ backgroundColor: values.color }} />
                  <ColorInput as={Field} id="color" name="color" type="color" />
                  <ColorValue>{values.color}</ColorValue>
                </ColorRow>
                <ErrorText>
                  <ErrorMessage name="color" />
                </ErrorText>
              </FieldGroup>
            </Body>

            <Footer>
              <CancelButton type="button" onClick={closeModal}>
                Cancel
              </CancelButton>
              <SubmitButton type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? "Creating..." : "Create Board"}
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

const TextInput = styled.input`
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border: 1px solid #d4deeb;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  color: #2d3b53;
  resize: vertical;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #2b7fff;
    box-shadow: 0 0 0 3px rgba(43, 127, 255, 0.12);
  }
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ColorPreview = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #d4deeb;
`;

const ColorInput = styled.input`
  width: 56px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #d4deeb;
  padding: 2px;
  cursor: pointer;
  background: #fff;
`;

const ColorValue = styled.code`
  font-size: 13px;
  color: #5d7697;
`;

const ErrorText = styled.div`
  min-height: 16px;
  margin-top: 4px;
  font-size: 12px;
  color: #dc2626;
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

export default BoardForm;
