# RSVP Feature Implementation

## Overview
Added RSVP functionality to the participants section. Users can now confirm their attendance by clicking an RSVP button on their participant card.

## Database Changes

### Migration File: `rsvp-migration.sql`
- Added `rsvp_status` column to `gala_members` table
- Default value: 'pending'
- Allowed values: 'pending' | 'confirmed'
- Created index for quick queries: `idx_gala_members_rsvp`

## Type Updates

### `src/types/database.ts`
Updated `gala_members` table types to include `rsvp_status` field:
- Row type: Added `rsvp_status: "pending" | "confirmed"`
- Insert type: Added `rsvp_status?: "pending" | "confirmed"`
- Update type: Added `rsvp_status?: "pending" | "confirmed"`

## Component Changes

### `src/components/dashboard/OverviewTab.tsx`

#### New State Variables
- `confirmingRsvp`: boolean to track RSVP submission state
- `userRsvpStatus`: "pending" | "confirmed" | null to track current user's RSVP status (overrides DB value when updated)
- `currentUserRsvpStatus`: computed value that uses local state if available, otherwise falls back to DB value

#### New Function
- `handleRsvp()`: Async function that updates the gala_members table with confirmed RSVP status

#### Updated Participants Section
- Changed from destructuring `{ user, role }` to full `member` object
- Added conditional rendering of RSVP button (only shows for current user if not yet confirmed)
- Added conditional styling: cards turn orange with light orange background when RSVP confirmed
- Shows "✓ CONFIRMED" text instead of button after RSVP is confirmed
- Card styling changes based on RSVP status:
  - **Pending**: `bg-secondary border-slate-300`
  - **Confirmed**: `bg-[#ff5833]/10 border-[#ff5833]`

## User Experience

### Before
- Participant cards were static
- Limited way to track who was attending

### After
- Current user's card displays an orange "RSVP" button
- Clicking button sends update to Supabase
- Button shows loading state ("RSVP...") during submission
- Card background turns light orange and border becomes orange when confirmed
- Shows "✓ CONFIRMED" text after RSVP
- Uses custom scrollbar (gala-scrollbar) for participants section

## Technical Notes
- RSVP status updates are tracked both in database and local component state
- Error handling with AlertDialog if RSVP fails
- Refresh data after successful RSVP
- Only current user sees RSVP button and can RSVP
- Other participants cannot modify RSVP status
