-- Add checklist column to tasks for storing subtask list as JSON string
ALTER TABLE "Task"
ADD COLUMN "checklist" TEXT NOT NULL DEFAULT '[]';
