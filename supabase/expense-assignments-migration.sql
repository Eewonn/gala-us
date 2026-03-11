-- Migration: Add Expense Assignment System
-- This enables tracking who is assigned to pay each expense and their payment status

-- 1. Add 'created_by' column to expenses table (who logged the expense)
alter table public.expenses
  add column if not exists created_by uuid references public.users(id);

-- Set existing expenses' created_by to paid_by (migration)
update public.expenses
  set created_by = paid_by
  where created_by is null;

-- 2. Create expense_assignments junction table
create table if not exists public.expense_assignments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(10, 2) not null, -- their portion of the expense
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  
  -- Ensure unique assignment per user per expense
  unique(expense_id, user_id)
);

-- 3. Enable RLS on expense_assignments
alter table public.expense_assignments enable row level security;

-- 4. Create RLS policies for expense_assignments
create policy "Anyone can read expense assignments" on public.expense_assignments
  for select using (true);

create policy "Anyone can create expense assignments" on public.expense_assignments
  for insert with check (true);

create policy "Anyone can update expense assignments" on public.expense_assignments
  for update using (true);

create policy "Anyone can delete expense assignments" on public.expense_assignments
  for delete using (true);

-- 5. Create indexes for performance
create index if not exists expense_assignments_expense_id_idx on public.expense_assignments(expense_id);
create index if not exists expense_assignments_user_id_idx on public.expense_assignments(user_id);

-- 6. Migrate existing expense data (create assignments for all existing expenses)
-- For each existing expense, create an assignment for the paid_by user
insert into public.expense_assignments (expense_id, user_id, amount, status, paid_at)
select 
  id as expense_id,
  paid_by as user_id,
  amount,
  'paid' as status, -- assume existing expenses are already paid
  created_at as paid_at
from public.expenses
where not exists (
  select 1 from public.expense_assignments ea 
  where ea.expense_id = expenses.id
);

-- Done! The system now supports:
-- - Multiple users assigned to each expense
-- - Individual payment tracking per user
-- - Who created/logged the expense vs who pays it
