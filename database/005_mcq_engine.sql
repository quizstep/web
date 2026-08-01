-- ============================================
-- MCQ SETS
-- ============================================
create table mcq_sets (
  id bigint generated always as identity primary key,

  resource_id bigint not null
    references chapter_resources(id) on delete cascade,

  difficulty text not null
    check (difficulty in ('EASY', 'MEDIUM', 'HARD')),

  title text not null,

  unlock_after bigint
    references mcq_sets(id) on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- ============================================
-- MCQ QUESTIONS
-- ============================================
create table mcq_questions (
  id bigint generated always as identity primary key,

  set_id bigint not null
    references mcq_sets(id) on delete cascade,

  question text not null,

  explanation text,

  order_no int default 1,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- ============================================
-- MCQ OPTIONS
-- ============================================
create table mcq_options (
  id bigint generated always as identity primary key,

  question_id bigint not null
    references mcq_questions(id) on delete cascade,

  option_text text not null,

  is_correct boolean default false
);