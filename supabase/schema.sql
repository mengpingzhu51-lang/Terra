create table if not exists public.resumes (
  id text primary key,
  user_id text not null,
  title text not null,
  source_resume_id text,
  related_jd_id text,
  related_evaluation_id text,
  template_id text not null default 'simple',
  content jsonb not null,
  version_type text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.job_descriptions (
  id text primary key,
  user_id text not null,
  title text not null,
  company text,
  raw_content text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  keywords text[] not null default '{}',
  experience_requirement text,
  education_requirement text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.evaluations (
  id text primary key,
  user_id text not null,
  resume_id text not null,
  jd_id text not null,
  total_score integer not null,
  dimension_scores jsonb not null,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  risks text[] not null default '{}',
  keyword_matches jsonb not null default '[]'::jsonb,
  missing_keywords text[] not null default '{}',
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null
);

create table if not exists public.generation_records (
  id text primary key,
  user_id text not null,
  type text not null,
  input_summary text,
  output_content jsonb,
  resume_id text,
  jd_id text,
  evaluation_id text,
  status text not null,
  error_message text,
  created_at timestamptz not null
);

create index if not exists resumes_user_id_updated_at_idx on public.resumes (user_id, updated_at desc);
create index if not exists job_descriptions_user_id_updated_at_idx on public.job_descriptions (user_id, updated_at desc);
create index if not exists evaluations_user_id_created_at_idx on public.evaluations (user_id, created_at desc);
create index if not exists generation_records_user_id_created_at_idx on public.generation_records (user_id, created_at desc);

alter table public.resumes enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.evaluations enable row level security;
alter table public.generation_records enable row level security;
