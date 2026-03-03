"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React, { useState, useEffect } from "react";


import styled from "styled-components";
import CreateContent from "../Modals/CreateContent";
import TaskItem from "../TaskItem/TaskItem";
import { plus } from "@/app/utils/Icons";
import Modal from "../Modals/Modal";
import SearchFilter from "../Search/SearchFilter";

interface Props {
  title: string;
  tasks: any[];
}

const Tasks = ({ title, tasks }: Props) => {
  const { theme, isLoading, openModal, modal, allTasks } = useGlobalState();


  const [searchResults, setSearchResults] = useState<any[] | undefined>(undefined);
  const [localTasks, setLocalTasks] = useState<any[]>(tasks);

  // Sync local tasks when props tasks change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Determine which tasks to display
  const displayTasks = searchResults !== undefined ? searchResults : localTasks;

  const handleSearchResults = (results: any[] | undefined) => {
    setSearchResults(results);
  };

  const handleTaskUpdate = () => {
    // Reload tasks from API
    allTasks();
  };

  // Callback to remove task from local state immediately
  const handleTaskDeleted = (deletedTaskId: string) => {
    // Remove from localTasks immediately for instant UI update
    setLocalTasks(prev => prev.filter(task => task.id !== deletedTaskId));
    // Also clear from searchResults if present
    if (searchResults) {
      setSearchResults(prev => prev?.filter(task => task.id !== deletedTaskId));
    }
  };

  return (
    <TaskStyled theme={theme}>
      {modal && (
        <Modal content={<CreateContent/>} />
      )}


      <h1>{title}</h1>

      
      {/* Search and Filter Component */}
      <SearchFilter onSearchResults={handleSearchResults} />
      
      {!isLoading ? (
        <div className='tasks grid'>
          {displayTasks.length > 0 ? (
            displayTasks.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                description={task.description}
                date={task.date}
                isCompleted={task.isCompleted}
                isImportant={task.isImportant}
                priority={task.priority}
                labels={task.labels}
                assigneeIds={task.assigneeIds}
                id={task.id}
                onTaskUpdate={handleTaskUpdate}
                onTaskDeleted={handleTaskDeleted}
              />
            ))
          ) : (
            <NoTasksMessage theme={theme}>
              {searchResults !== undefined 
                ? "No tasks found matching your search" 
                : "No tasks yet. Create your first task!"}
            </NoTasksMessage>
          )}
          <button className='create-task' onClick={openModal}>
            {plus}
            Add New Task
          </button>
        </div>
      ) : (
        <div className='tasks-loader w-full h-full flex items-center justify-center'>
          <span className='loader'></span>
        </div>
      )}
    </TaskStyled>
  );
};

const TaskStyled = styled.main`
  width: 100%;
  background-color: ${(props) => props.theme.colorBg2};
  border: 2px solid ${(props) => props.theme.borderColor2};
  border-radius: 1rem;
  padding: 2rem;
  overflow-y: auto;
  height: 100%;
  &::-webkit-scrollbar {
    width: 0.5rem;
  }

  .tasks {
    margin: 2rem 0;
  }
  > h1 {
    font-size: clamp(1.5rem, 2vw, 2rem);
    font-weight: 800;
    position: relative;
    color: ${(props) => props.theme.colorGrey0};

    &::after {
      content: "";
      width: 3rem;
      height: 0.2rem;
      background-color: ${(props) => props.theme.colorPrimaryGreen};
      position: absolute;
      bottom: -0.5rem;
      left: 0;
    }
  }

  .create-task {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 16rem;
    color: ${(props) => props.theme.colorGrey1};
    font-weight: 600;
    cursor: pointer;
    border-radius: 1rem;
    border: 3px dashed ${(props) => props.theme.colorGrey4};
    transition: all 0.3s ease-in-out;
    &:hover {
      background-color: ${(props) => props.theme.colorGrey4};
      color: ${(props) => props.theme.colorGrey0};
    }
  }
`;

const NoTasksMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: ${(props) => props.theme.colorGrey1};
  font-size: 1rem;
`;

export default Tasks;
