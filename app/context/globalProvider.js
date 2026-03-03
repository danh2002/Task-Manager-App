"use client";
import React, { createContext, useContext, useState, useRef, useCallback } from "react";

import themes from "./themes";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export const GlobalContext = createContext();
export const GlobalUpdateContext = createContext();

export const GlobalProvider = ({ children }) => {
  const { user } = useUser();
  const [selectedtheme, setSelectedTheme] = useState(() => {
    // Load theme preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      // Handle both old format (0/1) and new format ("dark"/"light")
      if (saved === "dark") return 0;
      if (saved === "light") return 1;
      if (saved) return parseInt(saved);
      return 0; // Default to dark
    }
    return 0;
  });
  const [isloading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Board state
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);

  const [tasks, setTasks] = useState([]);
  const theme = themes[selectedtheme];

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      axios.defaults.baseURL = window.location.origin;
    }
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const themeName = selectedtheme === 0 ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", themeName);
    }
  }, [selectedtheme]);

  // Force update mechanism to ensure re-render
  const [, forceUpdate] = useState({});

  const openModal = useCallback(() => {
    console.log("openModal called");
    setModal(true);
    // Force re-render
    forceUpdate({});
  }, []);

  const closeModal = useCallback(() => {
    console.log("closeModal called");
    // Direct state update
    setModal(false);
    setEditingTask(null);
    // Force re-render
    forceUpdate({});
    console.log("closeModal finished, modal should be false now");
  }, []);

  // DEBUG: Wrap setEditingTask to log what data is being set
  const setEditingTaskWithLog = useCallback((task) => {
    console.log("[globalProvider] setEditingTask called with:", task);
    setEditingTask(task);
  }, []);






  const collapseMenu = () => {
    setCollapsed(!collapsed);
  };

  // Toggle between dark (0) and light (1) theme
  const toggleTheme = () => {
    const newTheme = selectedtheme === 0 ? 1 : 0;
    setSelectedTheme(newTheme);
    // Save as string "0" or "1" for backward compatibility
    localStorage.setItem("theme", newTheme.toString());
    // Also save named value for compatibility with other providers
    localStorage.setItem("theme-name", newTheme === 0 ? "dark" : "light");
  };

  // ============ TASK FUNCTIONS ============
  const allTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/tasks");
      
      // API returns { success, data: { tasks, pagination }, status }
      const tasksData = res.data.data?.tasks || [];

      // DEBUG: Log priority data from API
      console.log("[globalProvider] Raw tasks from API:", tasksData.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        priorityType: typeof t.priority
      })));

      const sorted = tasksData.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setTasks(sorted);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching tasks:", error);
      setIsLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setIsLoading(true);
    try {
      // Add cache-busting headers
      const res = await axios.delete(`/api/tasks/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      toast.success("Task deleted successfully");
      // Refresh tasks immediately
      await allTasks();
    } catch (error) {
      console.log("Error deleting task:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (task) => {
    try {
      const res = await axios.put(`/api/tasks`, task);
      toast.success("Task updated successfully");
      allTasks();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  // ============ BOARD FUNCTIONS ============
  const allBoards = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/boards");
      const boardsData = res.data.data || [];
      setBoards(boardsData);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching boards:", error);
      setIsLoading(false);
    }
  };

  const getBoard = async (boardId) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/boards/${boardId}`);
      if (res.data.success) {
        // DEBUG: Log tasks to check if dueDate and reminder are present
        const boardData = res.data.data;
        if (boardData && boardData.columns && boardData.columns.length > 0) {
          const firstColumn = boardData.columns[0];
          if (firstColumn.tasks && firstColumn.tasks.length > 0) {
            const firstTask = firstColumn.tasks[0];
            console.log("[globalProvider getBoard] First task:", {
              id: firstTask.id,
              title: firstTask.title,
              dueDate: firstTask.dueDate,
              reminder: firstTask.reminder,
            });
          }
        }
        setCurrentBoard(boardData);
      }
      setIsLoading(false);
      return res.data.data;
    } catch (error) {
      console.log("Error fetching board:", error);
      setIsLoading(false);
      return null;
    }
  };


  const createBoard = async (boardData) => {
    try {
      console.log("[createBoard] Sending data:", boardData);
      const res = await axios.post("/api/boards", boardData);
      console.log("[createBoard] Response:", res.data);
      
      if (res.data.success) {
        toast.success("Board created successfully");
        allBoards();
        return res.data.data;
      } else {
        toast.error(res.data.error || "Failed to create board");
        return null;
      }
    } catch (error) {
      console.error("[createBoard] Full error:", error);
      console.error("[createBoard] Response data:", error.response?.data);
      console.error("[createBoard] Status:", error.response?.status);
      
      const errorMsg = error.response?.data?.error || error.message || "Something went wrong!";
      toast.error(`Error: ${errorMsg}`);
      return null;
    }
  };


  const updateBoard = async (boardData) => {
    try {
      const res = await axios.put("/api/boards", boardData);
      if (res.data.success) {
        toast.success("Board updated successfully");
        allBoards();
        if (currentBoard?.id === boardData.id) {
          getBoard(boardData.id);
        }
      } else {
        toast.error(res.data.error || "Failed to update board");
      }
    } catch (error) {
      console.log("Error updating board:", error);
      toast.error("Something went wrong!");
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      const res = await axios.delete(`/api/boards/${boardId}`);
      if (res.data.success) {
        toast.success("Board deleted successfully");
        if (currentBoard?.id === boardId) {
          setCurrentBoard(null);
        }
        allBoards();
      } else {
        toast.error(res.data.error || "Failed to delete board");
      }
    } catch (error) {
      console.log("Error deleting board:", error);
      toast.error("Something went wrong!");
    }
  };

  // ============ COLUMN FUNCTIONS ============
  const createColumn = async (columnData) => {
    try {
      const res = await axios.post("/api/columns", columnData);
      if (res.data.success) {
        toast.success("Column created successfully");
        if (currentBoard?.id === columnData.boardId) {
          getBoard(columnData.boardId);
        }
        return res.data.data;
      } else {
        toast.error(res.data.error || "Failed to create column");
        return null;
      }
    } catch (error) {
      console.log("Error creating column:", error);
      toast.error("Something went wrong!");
      return null;
    }
  };

  const updateColumn = async (columnData) => {
    try {
      const res = await axios.put("/api/columns", columnData);
      if (res.data.success) {
        toast.success("Column updated successfully");
        if (currentBoard) {
          getBoard(currentBoard.id);
        }
      } else {
        toast.error(res.data.error || "Failed to update column");
      }
    } catch (error) {
      console.log("Error updating column:", error);
      toast.error("Something went wrong!");
    }
  };

  const deleteColumn = async (columnId, boardId) => {
    try {
      const res = await axios.delete(`/api/columns?id=${columnId}`);
      if (res.data.success) {
        toast.success("Column deleted successfully");
        if (boardId) {
          getBoard(boardId);
        }
      } else {
        toast.error(res.data.error || "Failed to delete column");
      }
    } catch (error) {
      console.log("Error deleting column:", error);
      toast.error("Something went wrong!");
    }
  };

  React.useEffect(() => {
    if (user) {
      allTasks();
      allBoards();
    }
  }, [user]);

  const completedTasks = tasks.filter((task) => task.isCompleted === true);
  const importantTasks = tasks.filter((task) => task.isImportant === true);
  const incompletedTasks = tasks.filter((task) => task.isCompleted === false);

return (
    <GlobalContext.Provider
      value={{
        theme,
        selectedtheme,
        toggleTheme,
        tasks,
        deleteTask,
        isloading,
        completedTasks,
        importantTasks,
        incompletedTasks,
        updateTask,
        openModal,
        closeModal,
        modal,
        allTasks,
        collapsed,
        collapseMenu,
        editingTask,
        setEditingTask: setEditingTaskWithLog,
        // Board state and functions

        boards,
        currentBoard,
        setCurrentBoard,
        allBoards,
        getBoard,
        createBoard,
        updateBoard,
        deleteBoard,
        createColumn,
        updateColumn,
        deleteColumn,
      }}
    >
      <GlobalUpdateContext.Provider value={{}}>
        {children}
      </GlobalUpdateContext.Provider>
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalContext);
export const useGlobalUpdate = () => useContext(GlobalUpdateContext);
