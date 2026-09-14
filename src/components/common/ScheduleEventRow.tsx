import { Link } from 'react-router-dom'
import { formatDateRangeKorean } from '@/lib/date'
import type { ScheduleEventEntry } from '@/services/certificateService'

/**
 * 시험 일정 목록의 한 줄. 같은 회차를 여러 자격증이 공유하는 경우(entry.count > 1, 예: "기사" 계열
 * 242개가 전부 "2026년 정기 기사 1회") 특정 자격증 하나로 이동시킬 수 없으므로 링크 없이 표시한다
 * (Q-net도 이런 통합 회차는 링크 없이 제목만 보여줌). count === 1일 때만 그 자격증 상세 페이지로
 * 이동하는 링크를 건다.
 */
export function ScheduleEventRow({ entry }: { entry: ScheduleEventEntry }) {
  const content = (
    <div
      className={`flex flex-col gap-1 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:gap-3 ${
        entry.count === 1 ? 'transition-colors hover:bg-muted' : ''
      }`}
    >
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={`size-1.5 shrink-0 rounded-full ${entry.type === 'registration' ? 'bg-brand' : 'bg-foreground'}`}
        />
        <p className="desc-5 text-muted-foreground">{formatDateRangeKorean(entry.start, entry.end)}</p>
      </div>
      <p className="desc-4 line-clamp-2 sm:truncate">{entry.label}</p>
    </div>
  )

  if (entry.count > 1) return content

  return <Link to={`/certificates/${entry.jmCd}`}>{content}</Link>
}
