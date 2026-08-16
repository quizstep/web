-- ============================================
-- QUESTION VIDEOS
-- ============================================
create table question_videos (
  id bigint generated always as identity primary key,

  question_id bigint not null
    references mcq_questions(id) on delete cascade,

  video_url text not null,

  title text,

  description text,

  order_no int default 1,

  created_at timestamptz default now()
);