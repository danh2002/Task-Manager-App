"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React from "react";
import styled from "styled-components";

interface Props {
  icon?: React.ReactNode;
  name?: string;
  background?: string;
  padding?: string;
  borderRad?: string;
  fw?: string;
  fs?: string;
  click?: () => void;
  type?: "button" | "submit" | "reset" | undefined;
  border?: string;
  color?: string;
  disabled?: boolean;
  $active?: boolean;
  $variant?: "primary" | "secondary" | "danger" | "success";
}

const ButtonStyled = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
  background: ${(props) => props.theme.colorPrimary};
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  i {
    font-size: 14px;
    color: inherit;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Button = ({
  icon,
  name,
  background,
  padding,
  borderRad,
  fw,
  fs,
  click,
  type,
  border,
  color,
  disabled,
  $active,
  $variant
}: Props) => {
  const { theme } = useGlobalState();

  return (
    <ButtonStyled
      theme={theme}
      type={type}
      style={{
        backgroundColor: background,
        padding: padding || "8px 16px",
        borderRadius: borderRad || "6px",
        fontWeight: fw || "600",
        fontSize: fs || "14px",
        border: border || "none",
        color: color || "#ffffff",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={disabled ? undefined : click}
      disabled={disabled}
    >
      {icon && icon}
      {name && name}
    </ButtonStyled>
  );
};

export default Button;
