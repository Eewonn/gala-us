-- Hotfix: Fix scheduled_time column type in itinerary_items
-- Run this if you already ran the suggestions-enhancement-migration.sql

-- Drop and recreate the table with correct column type
drop table if exists public.itinerary_items cascade;

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid not null references public.galas(id) on delete cascade,
  title text not null,
  description text,
  scheduled_time timestamptz not null,
  order_index integer not null default 0,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  
  constraint title_length check (char_length(title) >= 1 and char_length(title) <= 200)
);

-- Enable RLS
alter table public.itinerary_items enable row level security;

-- Create RLS policies
create policy "Anyone can read itinerary items" on public.itinerary_items
  for select using (true);

create policy "Anyone can create itinerary items" on public.itinerary_items
  for insert with check (true);

create policy "Anyone can update itinerary items" on public.itinerary_items
  for update using (true);

create policy "Anyone can delete itinerary items" on public.itinerary_items
  for delete using (true);

-- Create indexes for performance
create index if not exists itinerary_items_gala_id_idx on public.itinerary_items(gala_id);
create index if not exists itinerary_items_scheduled_time_idx on public.itinerary_items(scheduled_time);
