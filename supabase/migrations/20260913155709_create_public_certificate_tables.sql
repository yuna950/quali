-- 공개 데이터: Q-net에서 적재, 로그인 여부와 무관하게 누구나 조회 가능.
-- 쓰기는 RLS에 정책을 안 만들어서 anon/authenticated 키로는 막고, service_role(Edge Function)만 가능하게 함.

create table if not exists public.certificates (
  jm_cd text primary key,
  name text not null,
  qualification_type_code text not null,
  qualification_type_name text not null,
  series_code text not null,
  series_name text not null,
  job_field_code text not null,
  job_field_name text not null,
  mid_job_field_code text not null,
  mid_job_field_name text not null,
  updated_at timestamptz not null default now()
);

-- jmCd+연도+회차당 1행. 필기/실기/면접 단계별 날짜는 지금 앱 타입(ExamStageDates) 구조 그대로 jsonb에 저장.
create table if not exists public.exam_schedules (
  id uuid primary key default gen_random_uuid(),
  jm_cd text not null references public.certificates (jm_cd) on delete cascade,
  year int not null,
  round int not null,
  stages jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (jm_cd, year, round)
);

create table if not exists public.exam_fees (
  jm_cd text primary key references public.certificates (jm_cd) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_subjects (
  id uuid primary key default gen_random_uuid(),
  jm_cd text not null references public.certificates (jm_cd) on delete cascade,
  type text not null,
  subject_name text not null,
  subject_order int not null,
  is_required boolean not null default true,
  optional_field_name text not null default '',
  full_score int not null default 0,
  total_questions int not null default 0,
  duration_minutes int not null default 0,
  updated_at timestamptz not null default now(),
  unique (jm_cd, type, subject_order)
);

-- Q-net 실API가 종목별(jmCd) 합격률을 제공하지 않아서, 당분간 mock 값을 그대로 시드해서 채우는 테이블.
create table if not exists public.pass_rates (
  jm_cd text primary key references public.certificates (jm_cd) on delete cascade,
  years jsonb not null default '[]'::jsonb,
  average_rate numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- 검색 필터용 직무분야/계열 옵션은 certificates에 이미 있는 값에서 파생 — 별도 동기화 불필요.
create or replace view public.job_field_options as
select distinct
  job_field_code as code,
  job_field_name as name
from public.certificates
order by code;

create or replace view public.series_options as
select distinct
  series_code as code,
  series_name as name
from public.certificates
order by code;

alter table public.certificates enable row level security;
alter table public.exam_schedules enable row level security;
alter table public.exam_fees enable row level security;
alter table public.exam_subjects enable row level security;
alter table public.pass_rates enable row level security;

create policy "certificates are publicly readable" on public.certificates
for select using (true);

create policy "exam_schedules are publicly readable" on public.exam_schedules
for select using (true);

create policy "exam_fees are publicly readable" on public.exam_fees
for select using (true);

create policy "exam_subjects are publicly readable" on public.exam_subjects
for select using (true);

create policy "pass_rates are publicly readable" on public.pass_rates
for select using (true);
