/** Q-net API 날짜 포맷(YYYYMMDD 문자열)을 다루기 위한 유틸 */

export function parseYyyymmdd(value: string): Date {
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6)) - 1
  const day = Number(value.slice(6, 8))
  return new Date(year, month, day)
}

export function toYyyymmdd(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function formatYyyymmdd(value: string): string {
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
}

export function diffInDays(target: string, from: Date = new Date()): number {
  const targetDate = parseYyyymmdd(target)
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((targetDate.getTime() - fromMidnight.getTime()) / msPerDay)
}

/** "D-3" / "D-DAY" / "D+2" 형태로 표시 */
export function formatDday(examDate: string, from: Date = new Date()): string {
  const days = diffInDays(examDate, from)
  return days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

function formatMonthDay(value: string): string {
  return `${Number(value.slice(4, 6))}월 ${Number(value.slice(6, 8))}일`
}

/** "3월 2일 ~ 3월 5일" 형태로 표시. 시작/종료가 같으면 하루만, 값이 없으면 "-" */
export function formatDateRangeKorean(start?: string, end?: string): string {
  if (!start) return '-'
  if (!end || start === end) return formatMonthDay(start)
  return `${formatMonthDay(start)} ~ ${formatMonthDay(end)}`
}
