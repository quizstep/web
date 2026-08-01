-- ============================================
-- QUESTION REPORTS
-- ============================================
create table question_reports (
  id bigint generated always as identity primary key,

  question_id bigint not null
    references mcq_questions(id) on delete cascade,

  user_id uuid,

  reason text not null,

  status text default 'PENDING'
    check (status in ('PENDING', 'REVIEWED', 'FIXED', 'REJECTED')),

  created_at timestamptz default now()
);


-- ============================================
-- GENERAL USER FEEDBACK
-- ============================================
create table feedback (
  id bigint generated always as identity primary key,

  user_id uuid,

  message text not null,

  created_at timestamptz default now()
);