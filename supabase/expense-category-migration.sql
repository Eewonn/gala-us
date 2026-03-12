-- Migration: Add 'category' column to expenses for budget categorization
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;
