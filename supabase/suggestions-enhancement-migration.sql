-- Migration: Add Links, Date/Time, and Itinerary Support to Suggestions
-- This enables location links, food/drink links, date/time selection, and event itinerary

-- 1. Add link and date/time fields to suggestions table
alter table public.suggestions
  add column if not exists link text,
  add column if not exists event_date date,
  add column if not exists start_time time,
  add column if not exists end_time time;

-- 2. Create itinerary_items table for structured event schedules
create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid not null references public.galas(id) on delete cascade,
  title text not null,
  description text,
  scheduled_time time not null,
  order_index integer not null default 0,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  
  -- Ensure reasonable constraints
  constraint title_length check (char_length(title) >= 1 and char_length(title) <= 200)
);

-- 3. Enable RLS on itinerary_items
alter table public.itinerary_items enable row level security;

-- 4. Create RLS policies for itinerary_items
create policy "Anyone can read itinerary items" on public.itinerary_items
  for select using (true);

create policy "Anyone can create itinerary items" on public.itinerary_items
  for insert with check (true);

create policy "Anyone can update itinerary items" on public.itinerary_items
  for update using (true);

create policy "Anyone can delete itinerary items" on public.itinerary_items
  for delete using (true);

-- 5. Create indexes for performance
create index if not exists itinerary_items_gala_id_idx on public.itinerary_items(gala_id);
create index if not exists itinerary_items_scheduled_time_idx on public.itinerary_items(scheduled_time);

-- Done! The system now supports:
-- - Links for location, food, and drink suggestions
-- - Date and time fields for date suggestions
-- - Structured itinerary with multiple time-based activities
