-- ============================================
-- SUBJECTS
-- ============================================
create table subjects (
  id bigint generated always as identity primary key,

  exam_id bigint not null
    references entrance_exams(id) on delete cascade,

  name text not null,
  description text,
  created_at timestamptz default now(),

  unique(exam_id, name)
);