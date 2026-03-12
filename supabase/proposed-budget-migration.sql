-- Migration: Add proposed_budget_per_person to galas table
-- This allows organizers to set an estimated budget per person for budget planning

-- Add the proposed_budget_per_person column
ALTER TABLE public.galas 
ADD COLUMN IF NOT EXISTS proposed_budget_per_person DECIMAL(10, 2) DEFAULT NULL;

-- Add a comment to document the field
COMMENT ON COLUMN public.galas.proposed_budget_per_person IS 'Estimated/proposed budget amount per person for the gala event';

-- Optional: Add a check constraint to ensure budget is non-negative
ALTER TABLE public.galas 
ADD CONSTRAINT positive_budget CHECK (proposed_budget_per_person IS NULL OR proposed_budget_per_person >= 0);
