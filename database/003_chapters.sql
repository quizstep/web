-- ============================================
-- CHAPTERS
-- ============================================
create table chapters (
  id bigint generated always as identity primary key,

  subject_id bigint not null
    references subjects(id) on delete cascade,

  title text not null,
  description text,
  order_no int default 1,
  created_at timestamptz default now()
);