"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React from "react";
import styled from "styled-components";

interface Props {
  content: React.ReactNode;
}

const Modal = ({ content }: Props) => {
  const { closeModal } = useGlobalState();

  return (
    <Overlay onClick={closeModal}>
      <Card onClick={(e) => e.stopPropagation()}>{content}</Card>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
`;

const Card = styled.div`
  width: min(760px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
`;

export default Modal;
