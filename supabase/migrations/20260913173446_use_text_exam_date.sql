-- 앱 전체가 시험일을 'YYYYMMDD' 압축 문자열로 다루는데(exam_schedules.stages의 jsonb 날짜와 동일한 관례),
-- my_exam_plans/exam_records만 네이티브 date 컬럼으로 만들어져 있었음(PostgREST가 'YYYY-MM-DD'로
-- 직렬화해서 앱의 날짜 비교/포맷 로직과 안 맞음). 두 테이블 다 아직 빈 테이블이라 안전하게 바로 교체.
alter table public.my_exam_plans
  alter column exam_date type text using to_char(exam_date, 'YYYYMMDD');

alter table public.exam_records
  alter column exam_date type text using to_char(exam_date, 'YYYYMMDD');
