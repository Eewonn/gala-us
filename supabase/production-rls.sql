-- Production-Ready RLS Policies for GalaUs
-- Run this to replace the open MVP policies with secure production ones

-- First, drop all existing policies
drop policy if exists "Public read" on public.users;
drop policy if exists "Public insert" on public.users;
drop policy if exists "Public read" on public.galas;
drop policy if exists "Public insert" on public.galas;
drop policy if exists "Public update" on public.galas;
drop policy if exists "Public read" on public.gala_members;
drop policy if exists "Public insert" on public.gala_members;
drop policy if exists "Public read" on public.suggestions;
drop policy if exists "Public insert" on public.suggestions;
drop policy if exists "Public read" on public.votes;
drop policy if exists "Public insert" on public.votes;
drop policy if exists "Public delete" on public.votes;
drop policy if exists "Public read" on public.tasks;
drop policy if exists "Public insert" on public.tasks;
drop policy if exists "Public update" on public.tasks;
drop policy if exists "Public read" on public.expenses;
drop policy if exists "Public insert" on public.expenses;
drop policy if exists "Public read" on public.memories;
drop policy if exists "Public insert" on public.memories;

-- Helper function to check if user is a gala member
create or replace function is_gala_member(gala_uuid uuid, user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.gala_members
    where gala_id = gala_uuid and user_id = user_uuid
  );
$$ language sql stable;

-- USERS: Anyone can read and insert (MVP name-based auth)
create policy "Anyone can read users" on public.users
  for select using (true);

create policy "Anyone can create user" on public.users
  for insert with check (true);

create policy "Users can update own profile" on public.users
  for update using (id = (current_setting('app.user_id', true))::uuid);

-- GALAS: Public read, authenticated insert, members can update
create policy "Anyone can read galas" on public.galas
  for select using (true);

create policy "Authenticated users can create galas" on public.galas
  for insert with check (
    organizer_id = (current_setting('app.user_id', true))::uuid
  );

create policy "Organizers can update galas" on public.galas
  for update using (
    organizer_id = (current_setting('app.user_id', true))::uuid
  );

-- GALA_MEMBERS: Members can read their galas, anyone can join
create policy "Users can read gala memberships" on public.gala_members
  for select using (true);

create policy "Anyone can join galas" on public.gala_members
  for insert with check (
    user_id = (current_setting('app.user_id', true))::uuid
  );

create policy "Users can leave galas" on public.gala_members
  for delete using (
    user_id = (current_setting('app.user_id', true))::uuid
  );

-- SUGGESTIONS: Only gala members can read/create
create policy "Gala members can read suggestions" on public.suggestions
  for select using (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

create policy "Gala members can create suggestions" on public.suggestions
  for insert with check (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid) and
    user_id = (current_setting('app.user_id', true))::uuid
  );

create policy "Users can delete own suggestions" on public.suggestions
  for delete using (
    user_id = (current_setting('app.user_id', true))::uuid
  );

-- VOTES: Only gala members can vote
create policy "Gala members can read votes" on public.votes
  for select using (
    exists (
      select 1 from public.suggestions s
      where s.id = votes.suggestion_id
        and is_gala_member(s.gala_id, (current_setting('app.user_id', true))::uuid)
    )
  );

create policy "Gala members can vote" on public.votes
  for insert with check (
    exists (
      select 1 from public.suggestions s
      where s.id = votes.suggestion_id
        and is_gala_member(s.gala_id, (current_setting('app.user_id', true))::uuid)
    ) and
    user_id = (current_setting('app.user_id', true))::uuid
  );

create policy "Users can remove own votes" on public.votes
  for delete using (
    user_id = (current_setting('app.user_id', true))::uuid
  );

-- TASKS: Only gala members can access
create policy "Gala members can read tasks" on public.tasks
  for select using (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

create policy "Gala members can create tasks" on public.tasks
  for insert with check (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

create policy "Gala members can update tasks" on public.tasks
  for update using (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

create policy "Gala members can delete tasks" on public.tasks
  for delete using (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

-- EXPENSES: Only gala members can access
create policy "Gala members can read expenses" on public.expenses
  for select using (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

create policy "Gala members can create expenses" on public.expenses
  for insert with check (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid) and
    paid_by = (current_setting('app.user_id', true))::uuid
  );

create policy "Users can update own expenses" on public.expenses
  for update using (
    paid_by = (current_setting('app.user_id', true))::uuid
  );

create policy "Users can delete own expenses" on public.expenses
  for delete using (
    paid_by = (current_setting('app.user_id', true))::uuid
  );

-- MEMORIES: Only gala members can access
create policy "Gala members can read memories" on public.memories
  for select using (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid)
  );

create policy "Gala members can create memories" on public.memories
  for insert with check (
    is_gala_member(gala_id, (current_setting('app.user_id', true))::uuid) and
    user_id = (current_setting('app.user_id', true))::uuid
  );

create policy "Users can delete own memories" on public.memories
  for delete using (
    user_id = (current_setting('app.user_id', true))::uuid
  );
