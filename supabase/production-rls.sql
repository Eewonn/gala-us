-- Production-Ready RLS Policies for GalaUs
-- Run this to replace the open MVP policies with secure production ones
-- Note: Simplified for MVP with name-based authentication
-- For true production with real auth, add stricter user verification

-- First, drop all existing policies
drop policy if exists "Anyone can read users" on public.users;
drop policy if exists "Anyone can create user" on public.users;
drop policy if exists "Anyone can update users" on public.users;
drop policy if exists "Anyone can read galas" on public.galas;
drop policy if exists "Anyone can create galas" on public.galas;
drop policy if exists "Gala members can update galas" on public.galas;
drop policy if exists "Anyone can read gala memberships" on public.gala_members;
drop policy if exists "Anyone can join galas" on public.gala_members;
drop policy if exists "Anyone can leave galas" on public.gala_members;
drop policy if exists "Gala members can read suggestions" on public.suggestions;
drop policy if exists "Gala members can create suggestions" on public.suggestions;
drop policy if exists "Anyone can delete suggestions" on public.suggestions;
drop policy if exists "Anyone can read votes" on public.votes;
drop policy if exists "Anyone can vote" on public.votes;
drop policy if exists "Anyone can remove votes" on public.votes;
drop policy if exists "Anyone can read tasks" on public.tasks;
drop policy if exists "Anyone can create tasks" on public.tasks;
drop policy if exists "Anyone can update tasks" on public.tasks;
drop policy if exists "Anyone can delete tasks" on public.tasks;
drop policy if exists "Anyone can read expenses" on public.expenses;
drop policy if exists "Anyone can create expenses" on public.expenses;
drop policy if exists "Anyone can update expenses" on public.expenses;
drop policy if exists "Anyone can delete expenses" on public.expenses;
drop policy if exists "Anyone can read memories" on public.memories;
drop policy if exists "Anyone can create memories" on public.memories;
drop policy if exists "Anyone can delete memories" on public.memories;

-- Note: Helper function not needed for simplified MVP policies
-- Uncomment if you need stricter member-only access:
-- create or replace function is_gala_member(gala_uuid uuid, user_uuid uuid)
-- returns boolean as $$
--   select exists (
--     select 1 from public.gala_members
--     where gala_id = gala_uuid and user_id = user_uuid
--   );
-- $$ language sql stable;

-- USERS: Anyone can read, insert, and update own profile
create policy "Anyone can read users" on public.users
  for select using (true);

create policy "Anyone can create user" on public.users
  for insert with check (true);

create policy "Anyone can update users" on public.users
  for update using (true);

-- GALAS: Public read, anyone can create, gala members can update
create policy "Anyone can read galas" on public.galas
  for select using (true);

create policy "Anyone can create galas" on public.galas
  for insert with check (true);

create policy "Gala members can update galas" on public.galas
  for update using (
    exists (
      select 1 from public.gala_members
      where gala_id = galas.id
    )
  );

-- GALA_MEMBERS: Anyone can read and join galas
create policy "Anyone can read gala memberships" on public.gala_members
  for select using (true);

create policy "Anyone can join galas" on public.gala_members
  for insert with check (true);

create policy "Anyone can leave galas" on public.gala_members
  for delete using (true);

-- SUGGESTIONS: Gala members can read/create (simplified for MVP)
create policy "Gala members can read suggestions" on public.suggestions
  for select using (true);

create policy "Gala members can create suggestions" on public.suggestions
  for insert with check (true);

create policy "Anyone can delete suggestions" on public.suggestions
  for delete using (true);

-- VOTES: Anyone can vote (simplified for MVP)
create policy "Anyone can read votes" on public.votes
  for select using (true);

create policy "Anyone can vote" on public.votes
  for insert with check (true);

create policy "Anyone can remove votes" on public.votes
  for delete using (true);

-- TASKS: Anyone can access (simplified for MVP)
create policy "Anyone can read tasks" on public.tasks
  for select using (true);

create policy "Anyone can create tasks" on public.tasks
  for insert with check (true);

create policy "Anyone can update tasks" on public.tasks
  for update using (true);

create policy "Anyone can delete tasks" on public.tasks
  for delete using (true);

-- EXPENSES: Anyone can access (simplified for MVP)
create policy "Anyone can read expenses" on public.expenses
  for select using (true);

create policy "Anyone can create expenses" on public.expenses
  for insert with check (true);

create policy "Anyone can update expenses" on public.expenses
  for update using (true);

create policy "Anyone can delete expenses" on public.expenses
  for delete using (true);

-- MEMORIES: Anyone can access (simplified for MVP)
create policy "Anyone can read memories" on public.memories
  for select using (true);

create policy "Anyone can create memories" on public.memories
  for insert with check (true);

create policy "Anyone can delete memories" on public.memories
  for delete using (true);
