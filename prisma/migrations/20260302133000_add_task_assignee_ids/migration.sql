-- Add assignee IDs to task for assign-to feature
ALTER TABLE "Task"
ADD COLUMN "assigneeIds" TEXT NOT NULL DEFAULT '[]';
