"use client";
import React from "react";
import styled from "styled-components";

interface props {
  children: React.ReactNode;
}

const GlobalStyleProvider = ({ children }: props) => {
  return <GlobalStyle>{children}</GlobalStyle>;
};

const GlobalStyle = styled.div`
  display: flex;
  gap: 0;
  min-height: 100%;
  width: 100%;
  transition: all 0.3s ease-in-out;

  @media screen and (max-width: 768px) {
    gap: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
`;
export default GlobalStyleProvider;
