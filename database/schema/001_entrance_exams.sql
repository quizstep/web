-- ============================================
-- ENTRANCE EXAMS
-- ============================================
create table entrance_exams (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  created_at timestamptz default now()
);