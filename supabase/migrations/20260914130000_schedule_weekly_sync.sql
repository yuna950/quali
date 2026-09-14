-- 매주 sync-exam-schedules Edge Function을 자동 호출해서 기존 자격증들의 시험일정을 갱신한다.
-- 매주 일요일 18:00 UTC(한국시간 월요일 새벽 3시, 트래픽 적은 시간대)에 실행.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'sync-exam-schedules-weekly',
  '0 18 * * 0',
  $$
  select net.http_post(
    url := 'https://kfytuojajjrnydwudxxb.supabase.co/functions/v1/sync-exam-schedules',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
