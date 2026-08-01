-- ============================================
-- USER SESSIONS
-- ============================================
create table user_sessions (
  id bigint generated always as identity primary key,

  user_id uuid not null
    references profiles(id) on delete cascade,

  device_name text,
  ip_address text,

  created_at timestamptz default now(),

  expires_at timestamptz not null,

  is_active boolean default true
);