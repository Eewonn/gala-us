-- Migration: Add 'location' column to itinerary_items
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL;
