# Proposed Budget Per Person Feature

## Overview
This feature allows gala organizers to set an estimated/proposed budget per person for their event. The system will then compare the actual spending per person against this proposed budget, helping organizers stay on track.

## Database Migration

Before using this feature, you need to run the database migration to add the new column:

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Open and run the file: `supabase/proposed-budget-migration.sql`

This will add the `proposed_budget_per_person` column to the `galas` table.

## How to Use

### Setting a Proposed Budget

1. Navigate to any Gala's Budget tab
2. At the top, you'll see a blue card labeled "Proposed Budget Per Person"
3. Click the "Set" or "Edit" button
4. Enter the estimated budget per person (e.g., 150.00)
5. Click "Save"

### Viewing Budget Comparison

Once a proposed budget is set, the card will display:
- **Proposed Budget**: The target amount per person
- **Actual**: Current spending per person based on all expenses
- **Difference**: How much over/under budget you are
  - Green (negative): Under budget
  - Red (positive): Over budget

### Budget Calculations

- **Actual Per Person** = Total Expenses ÷ Number of Members
- **Difference** = Actual Per Person - Proposed Budget

## Features

- ✅ Set/Edit proposed budget at any time
- ✅ Real-time comparison with actual spending
- ✅ Color-coded indicators (over/under budget)
- ✅ Persistent storage in database
- ✅ Accessible only in Budget tab
- ✅ Non-negative constraint (budget must be ≥ 0)

## Technical Details

### Files Modified
- `src/components/dashboard/BudgetTab.tsx` - Added UI and logic
- `src/types/database.ts` - Added TypeScript types
- `src/app/gala/[id]/page.tsx` - Pass proposed budget to BudgetTab
- `supabase/proposed-budget-migration.sql` - Database migration

### Database Schema
```sql
ALTER TABLE public.galas 
ADD COLUMN proposed_budget_per_person DECIMAL(10, 2) DEFAULT NULL;
```

The field is nullable, allowing galas without a set budget.
