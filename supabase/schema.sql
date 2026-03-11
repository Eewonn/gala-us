-- GalaUs Database Schema
-- Run this in your Supabase SQL editor to set up the database.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Users table (mirrors auth.users, extend as needed)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  created_at timestamptz default now()
);

-- Galas table
create table if not exists public.galas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image text,
  organizer_id uuid references public.users(id) on delete cascade,
  decision_type text not null default 'majority' check (decision_type in ('organizer', 'majority', 'random')),
  stage text not null default 'planning' check (stage in ('planning', 'confirmed', 'live', 'completed')),
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- Gala members
create table if not exists public.gala_members (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid references public.galas(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('organizer', 'member')),
  joined_at timestamptz default now(),
  unique(gala_id, user_id)
);

-- Suggestions
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid references public.galas(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  type text not null check (type in ('location', 'food', 'date', 'activity')),
  content text not null,
  created_at timestamptz default now()
);

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid references public.suggestions(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  unique(suggestion_id, user_id)
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid references public.galas(id) on delete cascade,
  title text not null,
  assigned_to uuid references public.users(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  created_at timestamptz default now()
);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid references public.galas(id) on delete cascade,
  paid_by uuid references public.users(id) on delete set null,
  amount numeric(10,2) not null,
  description text not null,
  created_at timestamptz default now()
);

-- Memories
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  gala_id uuid references public.galas(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  drive_link text not null,
  caption text,
  created_at timestamptz default now()
);

-- Row Level Security (basic open policies for MVP – tighten in production)
alter table public.users enable row level security;
alter table public.galas enable row level security;
alter table public.gala_members enable row level security;
alter table public.suggestions enable row level security;
alter table public.votes enable row level security;
alter table public.tasks enable row level security;
alter table public.expenses enable row level security;
alter table public.memories enable row level security;

create policy "Public read" on public.users for select using (true);
create policy "Public read" on public.galas for select using (true);
create policy "Public read" on public.gala_members for select using (true);
create policy "Public read" on public.suggestions for select using (true);
create policy "Public read" on public.votes for select using (true);
create policy "Public read" on public.tasks for select using (true);
create policy "Public read" on public.expenses for select using (true);
create policy "Public read" on public.memories for select using (true);

create policy "Public insert" on public.users for insert with check (true);
create policy "Public insert" on public.galas for insert with check (true);
create policy "Public insert" on public.gala_members for insert with check (true);
create policy "Public insert" on public.suggestions for insert with check (true);
create policy "Public insert" on public.votes for insert with check (true);
create policy "Public insert" on public.tasks for insert with check (true);
create policy "Public insert" on public.expenses for insert with check (true);
create policy "Public insert" on public.memories for insert with check (true);

create policy "Public update" on public.tasks for update using (true);
create policy "Public delete" on public.votes for delete using (true);
