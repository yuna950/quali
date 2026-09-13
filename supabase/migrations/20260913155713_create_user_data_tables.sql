-- 사용자 데이터: 로그인 필요, 전부 RLS로 본인 것만 접근 가능하게 함.
-- 표시용 이름(AuthUser.name)은 별도 테이블 없이 Supabase Auth의 user_metadata에 저장하기로 함.

create table if not exists public.my_exam_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  jm_cd text not null references public.certificates (jm_cd),
  certificate_name text not null,
  stage text not null check (stage in ('written', 'practical', 'interview')),
  year int not null,
  round int not null,
  exam_date date not null,
  exam_location text,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  jm_cd text not null references public.certificates (jm_cd),
  certificate_name text not null,
  stage text not null check (stage in ('written', 'practical', 'interview')),
  year int not null,
  round int not null,
  exam_date date not null,
  passed boolean not null,
  score int check (score between 0 and 100),
  memo text,
  -- 나의 자격증(my_exam_plans)에서 결과를 입력해 생성된 경우 그 플랜의 id.
  -- 독립적으로 추가한 기록은 null. 플랜이 지워져도 기록 자체는 남기고 lineage만 끊음.
  plan_id uuid references public.my_exam_plans (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 나의 시험 플랜 하나당 준비물 체크리스트 하나. 플랜이 지워지면 체크리스트도 같이 지움
-- (지금까지 앱 코드가 수동으로 하던 정리를 DB 제약으로 대체).
create table if not exists public.exam_checklists (
  plan_id uuid primary key references public.my_exam_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  checked_defaults text[] not null default '{}',
  custom_items jsonb not null default '[]'::jsonb
);

create table if not exists public.interest_certificates (
  user_id uuid not null references auth.users (id) on delete cascade,
  jm_cd text not null references public.certificates (jm_cd),
  added_at timestamptz not null default now(),
  primary key (user_id, jm_cd)
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  interest_field_codes text[] not null default '{}'
);

alter table public.my_exam_plans enable row level security;
alter table public.exam_records enable row level security;
alter table public.exam_checklists enable row level security;
alter table public.interest_certificates enable row level security;
alter table public.user_settings enable row level security;

create policy "users manage their own plans" on public.my_exam_plans
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage their own records" on public.exam_records
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage their own checklists" on public.exam_checklists
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage their own interests" on public.interest_certificates
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage their own settings" on public.user_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
