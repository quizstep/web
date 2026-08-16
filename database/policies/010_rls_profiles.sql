-- ============================================
-- RLS FOR PROFILES
-- ============================================

-- Enable Row Level Security
alter table profiles enable row level security;


-- ============================================
-- USERS CAN VIEW THEIR OWN PROFILE
-- ============================================
create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);


-- ============================================
-- USERS CAN INSERT THEIR OWN PROFILE
-- ============================================
create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);


-- ============================================
-- USERS CAN UPDATE THEIR OWN PROFILE
-- ============================================
create policy "Users can update own profile"
on profiles
for update
using (auth.uid() = id);