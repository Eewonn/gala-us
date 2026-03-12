# Gala Date Feature - Migration Guide

## Overview
This update moves date/time management from voting suggestions to the gala level. Users can now set a date range (or single date) for the entire gala, and this date will be displayed in the gala header and the my-galas page.

## Changes Made

### 1. Database Schema Changes
- **Added to `galas` table**: `start_date` and `end_date` (both nullable TIMESTAMP WITH TIME ZONE)
- **Modified `suggestions` table**: Removed "date" from allowed types (now only: location, food, activity)

### 2. Application Changes
- **VotingTab**: Removed "Date & Time" category from voting suggestions
- **Gala Dashboard Header**: Added editable date range display below the gala title
- **Gala Title**: Made editable (click edit icon to change)
- **My Galas Page**: Shows gala date range on each card
- **Types**: Updated `database.ts` to reflect schema changes

## Database Migrations Required

### Step 1: Add date fields to galas table
Run: `supabase/gala-dates-migration.sql`

This adds:
- `start_date` column (nullable)
- `end_date` column (nullable)

### Step 2: Remove date suggestions
Run: `supabase/remove-date-suggestions-migration.sql`

This:
- Deletes all existing date-type suggestions
- Updates the type constraint to only allow: location, food, activity
- Optionally removes unused date-related columns from suggestions table

## Testing Checklist

- [ ] Run both migration files in Supabase
- [ ] Create a new gala and set its date range
- [ ] Edit an existing gala's date
- [ ] Edit a gala's title
- [ ] Verify date shows in my-galas page
- [ ] Verify date shows in gala header
- [ ] Verify voting tab only has 3 categories (location, food, activity)
- [ ] Create suggestions in all 3 categories to ensure they work

## Notes

- Existing galas will have `null` dates until manually set
- The date is optional - galas can exist without a date
- Date format displays as "Month Day, Year, Time" (e.g., "Mar 15, 2026, 2:00 PM")
- Date ranges show as "Start - End" format
- Users can edit dates and titles by clicking the edit icon (visible on hover)
