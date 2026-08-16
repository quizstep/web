-- ============================================
-- RLS FOR CHAPTER RESOURCES
-- ============================================

alter table chapter_resources enable row level security;

create policy "Public can read chapter resources"
on chapter_resources
for select
using (true);

create policy "Admins can insert chapter resources"
on chapter_resources
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update chapter resources"
on chapter_resources
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete chapter resources"
on chapter_resources
for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);


-- ============================================
-- RLS FOR MCQ SETS
-- ============================================

alter table mcq_sets enable row level security;

create policy "Public can read mcq sets"
on mcq_sets
for select
using (true);

create policy "Admins can manage mcq sets"
on mcq_sets
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);


-- ============================================
-- RLS FOR MCQ QUESTIONS
-- ============================================

alter table mcq_questions enable row level security;

create policy "Public can read mcq questions"
on mcq_questions
for select
using (true);

create policy "Admins can manage mcq questions"
on mcq_questions
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);


-- ============================================
-- RLS FOR MCQ OPTIONS
-- ============================================

alter table mcq_options enable row level security;

create policy "Public can read mcq options"
on mcq_options
for select
using (true);

create policy "Admins can manage mcq options"
on mcq_options
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);


-- ============================================
-- RLS FOR QUESTION VIDEOS
-- ============================================

alter table question_videos enable row level security;

create policy "Public can read question videos"
on question_videos
for select
using (true);

create policy "Admins can manage question videos"
on question_videos
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
