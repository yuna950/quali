import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toYyyymmdd } from '@/lib/date'
import { listScheduleEventsInRange, type ScheduleEventEntry } from '@/services/certificateService'

function buildWeekDays(from: Date): Date[] {
  const sunday = new Date(from)
  sunday.setDate(sunday.getDate() - sunday.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function UpcomingExamScheduleWeek() {
  const [entries, setEntries] = useState<ScheduleEventEntry[] | null>(null)
  const [days] = useState(() => buildWeekDays(new Date()))
  const currentMonth = new Date().getMonth() + 1

  useEffect(() => {
    listScheduleEventsInRange(toYyyymmdd(days[0]), toYyyymmdd(days[6])).then(setEntries)
  }, [days])

  function entriesOnDay(dateStr: string): ScheduleEventEntry[] {
    return (entries ?? []).filter((entry) => entry.start <= dateStr && dateStr <= entry.end)
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="heading-3">시험 일정</h2>
        <Button
          variant="outline"
          size="sm"
          className="text-neutral"
          nativeButton={false}
          render={<Link to="/schedule" />}
        >
          전체 일정 보기
          <ArrowUpRight />
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold">{currentMonth}월</p>
            <div className="desc-5 flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-brand" /> 접수기간
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground" /> 시험일
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 border-t border-l border-border">
            {days.map((day) => {
              const dateStr = toYyyymmdd(day)
              const dayEvents = entriesOnDay(dateStr)
              const hasRegistration = dayEvents.some((e) => e.type === 'registration')
              const hasExam = dayEvents.some((e) => e.type === 'exam')
              return (
                <div
                  key={dateStr}
                  className="flex flex-col items-center gap-1.5 border-r border-b border-border py-2"
                >
                  <span className="text-sm font-medium">{day.getDate()}</span>
                  <span className="flex h-1.5 gap-0.5">
                    {hasRegistration && <span className="size-1.5 rounded-full bg-brand" />}
                    {hasExam && <span className="size-1.5 rounded-full bg-foreground" />}
                  </span>
                </div>
              )
            })}
          </div>

          {entries?.length === 0 && (
            <p className="desc-3 py-6 text-center text-muted-foreground">이번 주 일정이 없어요.</p>
          )}

          {entries && entries.length > 0 && (
            <div className="flex flex-col gap-2">
              {entries.map((entry, i) => (
                <Link key={`${entry.jmCd}-${entry.label}-${i}`} to={`/certificates/${entry.jmCd}`}>
                  <div className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        entry.type === 'registration' ? 'bg-brand' : 'bg-foreground'
                      }`}
                    />
                    <p className="desc-4 truncate">{entry.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
