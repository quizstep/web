-- ============================================
-- USER PROFILES
-- ============================================
create table profiles (
  id uuid primary key
    references auth.users(id) on delete cascade,

  full_name text not null,

  role text not null default 'student'
    check (role in ('student', 'admin')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);