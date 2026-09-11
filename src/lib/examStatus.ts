import type { ExamApplicationStatus, ExamSchedule, ExamStageKey } from '@/types/certificate'
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

/** 단계(필기/실기/면접)별로 오늘 이후 가장 가까운 시험일을 찾는다 */
export function getNearestExamDatesByStage(
  schedules: ExamSchedule[],
  today: Date = new Date(),
): Partial<Record<ExamStageKey, string>> {
  const todayStr = toYyyymmdd(today)
  const result: Partial<Record<ExamStageKey, string>> = {}

  for (const schedule of schedules) {
    for (const stageKey of Object.keys(schedule.stages) as ExamStageKey[]) {
      const examStart = schedule.stages[stageKey]?.examStart
      if (!examStart || examStart < todayStr) continue
      const current = result[stageKey]
      if (!current || examStart < current) {
        result[stageKey] = examStart
      }
    }
  }

  return result
}

/** "2026년 정기 기사 1회"처럼 회차를 사람이 읽는 표기로 만든다 */
export function formatScheduleRound(seriesName: string, schedule: ExamSchedule): string {
  return `${schedule.year}년 정기 ${seriesName} ${schedule.round}회`
}
