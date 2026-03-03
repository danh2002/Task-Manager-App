"use client";
import React from "react";
import CreateTaskForm from "../Forms/CreateTaskForm";
import { useGlobalState } from "@/app/context/globalProvider";


const CreateContent = () => {
  const { editingTask, closeModal } = useGlobalState();

  return (
    <>
      {editingTask ? <CreateTaskForm editingTask={editingTask} onCancel={closeModal} /> : <CreateTaskForm onCancel={closeModal} />}
    </>
  );
};

export default CreateContent;
