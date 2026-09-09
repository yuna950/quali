import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { toYyyymmdd, diffInDays } from '@/lib/date'
import { listRegistrationWindowsInRange, type RegistrationWindowEntry } from '@/services/certificateService'

function buildWeekDays(from: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function UpcomingExamScheduleWeek() {
  const [entries, setEntries] = useState<RegistrationWindowEntry[] | null>(null)
  const [days] = useState(() => buildWeekDays(new Date()))
  const currentMonth = new Date().getMonth() + 1

  useEffect(() => {
    listRegistrationWindowsInRange(toYyyymmdd(days[0]), toYyyymmdd(days[6])).then(setEntries)
  }, [days])

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">시험 일정</h2>
      <Card>
        <CardContent>
          <p className="mb-4 text-xl font-bold">{currentMonth}월</p>

          <div className="relative min-h-44">
            <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
              {days.map((_, i) => (
                <div key={i} className={i < 6 ? 'border-r border-border' : ''} />
              ))}
            </div>

            <div
              className="relative grid gap-y-4"
              style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
            >
              {days.map((day, i) => {
                const isOtherMonth = day.getMonth() + 1 !== currentMonth
                return (
                  <div
                    key={i}
                    style={{ gridColumn: i + 1, gridRow: 1 }}
                    className={`border-b border-border px-2 pt-1 pb-3 text-sm ${
                      isOtherMonth ? 'text-muted-foreground' : 'font-medium'
                    }`}
                  >
                    {isOtherMonth ? `${day.getMonth() + 1}/${day.getDate()}` : day.getDate()}
                  </div>
                )
              })}

              {entries?.length === 0 && (
                <p
                  style={{ gridColumn: '1 / 8', gridRow: 2 }}
                  className="px-2 pt-4 text-sm text-muted-foreground"
                >
                  이번 주 접수 예정인 시험이 없어요.
                </p>
              )}

              {entries?.map((entry, index) => (
                <Link
                  key={`${entry.jmCd}-${entry.label}`}
                  to={`/certificates/${entry.jmCd}`}
                  style={{
                    gridColumn: `${Math.min(Math.max(diffInDays(entry.regStart, days[0]), 0), 6) + 1} / ${
                      Math.min(Math.max(diffInDays(entry.regEnd, days[0]), 0), 6) + 2
                    }`,
                    gridRow: index + 2,
                    marginInline: '0.5rem',
                  }}
                  className="truncate rounded-full bg-brand/15 px-3 py-2 text-xs font-medium text-brand transition-colors hover:bg-brand/25"
                  title={entry.label}
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
