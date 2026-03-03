"use client";

import React from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const Sidebar = () => {
  const { toggleTheme, selectedtheme, theme } = useGlobalState();
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const isDark = selectedtheme === 0;

  const navItems = [
    { icon: "fa-solid fa-grip", link: "/", label: "Boards" },
    { icon: "fa-solid fa-users", link: "", label: "Members" },
    { icon: "fa-regular fa-folder", link: "", label: "Projects" },
    { icon: "fa-regular fa-square-check", link: "", label: "Tasks" },
  ];

  return (
    <SidebarStyled $theme={theme}>
      <TopIcons>
        {navItems.map((item, index) => {
          const isActive = item.link && pathname === item.link;

          return (
            <IconButton
              key={`${item.label}-${index}`}
              $active={Boolean(isActive)}
              title={item.label}
              onClick={() => item.link && router.push(item.link)}
            >
              <i className={item.icon}></i>
            </IconButton>
          );
        })}
      </TopIcons>

      <BottomIcons>
        <IconButton title={isDark ? "Light mode" : "Dark mode"} onClick={toggleTheme}>
          <i className={isDark ? "fa-regular fa-sun" : "fa-regular fa-moon"}></i>
        </IconButton>
        <IconButton title="Sign out" onClick={() => signOut(() => router.push("/signin"))}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </IconButton>
      </BottomIcons>
    </SidebarStyled>
  );
};

const SidebarStyled = styled.aside<{ $theme: any }>`
  width: 72px;
  min-width: 72px;
  border-right: 1px solid ${(props) => props.$theme.borderColor2 || "#dbe3ef"};
  background: ${(props) => props.$theme.colorBg2 || "#ffffff"};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 12px;
`;

const TopIcons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const BottomIcons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.$active ? "#2b7fff" : "transparent")};
  background: ${(props) => (props.$active ? "#2b7fff" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#8da0bc")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#2b7fff" : "#eef4fd")};
    color: ${(props) => (props.$active ? "#ffffff" : "#47658d")};
  }
`;

export default Sidebar;
