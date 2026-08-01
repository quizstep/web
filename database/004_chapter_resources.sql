-- ============================================
-- CHAPTER RESOURCES
-- ============================================
create table chapter_resources (
  id bigint generated always as identity primary key,

  chapter_id bigint not null
    references chapters(id) on delete cascade,

  title text not null,

  type text not null
    check (type in ('NOTE', 'MCQ', 'VIDEO')),

  description text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);