-- Migration: Add 'cancelled' status to tasks
-- Drop and recreate the check constraint to include 'cancelled'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'doing', 'done', 'cancelled'));
