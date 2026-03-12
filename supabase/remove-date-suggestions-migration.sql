-- Remove date type from suggestions (voting dates are now on gala level)
-- This will delete any existing date suggestions and update the type constraint

-- First, delete all date-type suggestions
DELETE FROM suggestions WHERE type = 'date';

-- Update the check constraint to only allow location, food, and activity
-- Drop the old constraint (if it exists)
ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS suggestions_type_check;

-- Add the new constraint
ALTER TABLE suggestions ADD CONSTRAINT suggestions_type_check 
  CHECK (type IN ('location', 'food', 'activity'));

-- Optional: Remove the date-related fields from suggestions table since they're no longer used
-- (You can run these if you want to clean up the schema completely)
-- ALTER TABLE suggestions DROP COLUMN IF EXISTS event_date;
-- ALTER TABLE suggestions DROP COLUMN IF EXISTS start_time;
-- ALTER TABLE suggestions DROP COLUMN IF EXISTS end_time;

-- Add comment for documentation
COMMENT ON COLUMN suggestions.type IS 'Type of suggestion: location, food, or activity (date is now on gala level)';
