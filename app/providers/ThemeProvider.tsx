"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Check localStorage - handle both old format (0/1) and new format ("dark"/"light")
    const savedTheme = localStorage.getItem("theme");
    let resolvedTheme = "dark";
    if (savedTheme === "light") {
      resolvedTheme = "light";
    } else if (savedTheme === "dark") {
      resolvedTheme = "dark";
    } else if (savedTheme === "1") {
      resolvedTheme = "light";
    } else {
      resolvedTheme = "dark"; // Default to dark
    }
    setTheme(resolvedTheme);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
