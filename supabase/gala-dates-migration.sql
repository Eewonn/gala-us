-- Add start_date and end_date to galas table
ALTER TABLE galas
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN galas.start_date IS 'Start date and time of the gala event';
COMMENT ON COLUMN galas.end_date IS 'End date and time of the gala event (can be null for single-day events)';
