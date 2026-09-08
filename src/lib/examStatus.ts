import type { ExamApplicationStatus, ExamSchedule } from '@/types/certificate'
import { toYyyymmdd } from './date'

/** 여러 시행 회차의 접수 기간을 종합해 접수예정/접수중/접수마감 상태를 판단한다 */
export function getApplicationStatus(
  schedules: ExamSchedule[],
  today: Date = new Date(),
): ExamApplicationStatus {
  const todayStr = toYyyymmdd(today)
  const windows = schedules.flatMap((schedule) =>
    Object.values(schedule.stages)
      .filter((stage) => !!stage?.regStart && !!stage.regEnd)
      .map((stage) => ({ regStart: stage!.regStart!, regEnd: stage!.regEnd! })),
  )

  if (windows.length === 0) return 'closed'

  const isOpen = windows.some((w) => w.regStart <= todayStr && todayStr <= w.regEnd)
  if (isOpen) return 'open'

  const upcomingStarts = windows.filter((w) => w.regStart > todayStr).map((w) => w.regStart)
  if (upcomingStarts.length > 0) return 'upcoming'

  return 'closed'
}

/** 오늘 이후 가장 가까운 시험일(YYYYMMDD)을 여러 회차/단계 중에서 찾는다 */
export function getNearestExamDate(
  schedules: ExamSchedule[],
  today: Date = new Date(),
): string | undefined {
  const todayStr = toYyyymmdd(today)
  const examStarts = schedules
    .flatMap((schedule) => Object.values(schedule.stages))
    .map((stage) => stage?.examStart)
    .filter((date): date is string => !!date && date >= todayStr)
    .sort()

  return examStarts[0]
}

/** "2026년 정기 기사 1회"처럼 회차를 사람이 읽는 표기로 만든다 */
export function formatScheduleRound(seriesName: string, schedule: ExamSchedule): string {
  return `${schedule.year}년 정기 ${seriesName} ${schedule.round}회`
}
