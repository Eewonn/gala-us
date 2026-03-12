-- Migration: Link users table with Supabase Auth
-- This migration updates the users table to work with Supabase Auth email authentication

-- 1. Modify the users table to use auth.users id
-- Note: If you have existing data, you'll need to handle migration carefully
-- For new installations, you can run this directly

-- Drop the existing id default since we'll use auth.users.id
alter table public.users alter column id drop default;

-- Add email column to store user's email
alter table public.users add column if not exists email text unique;

-- Create a trigger to automatically create user profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger to create user profile when new auth user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add RLS policies for users table
alter table public.users enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users are viewable by everyone" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;

-- Users can read all user profiles
create policy "Users are viewable by everyone"
  on public.users for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Only authenticated users can insert (via trigger)
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Add index on email for faster lookups
create index if not exists users_email_idx on public.users(email);

-- Comment on table
comment on table public.users is 'User profiles linked to Supabase Auth';
