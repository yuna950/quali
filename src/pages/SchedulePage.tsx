import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateRangeKorean, toYyyymmdd } from '@/lib/date'
import { listScheduleEventsInRange, type ScheduleEventEntry } from '@/services/certificateService'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7
  const gridStart = new Date(year, month, 1 - startWeekday)
  return Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function SchedulePage() {
  const todayStr = toYyyymmdd(new Date())
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [events, setEvents] = useState<ScheduleEventEntry[]>([])
  const eventListRef = useRef<HTMLElement>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])

  useEffect(() => {
    listScheduleEventsInRange(toYyyymmdd(grid[0]), toYyyymmdd(grid[grid.length - 1])).then(setEvents)
  }, [grid])

  function eventsOnDay(dateStr: string): ScheduleEventEntry[] {
    return events.filter((e) => e.start <= dateStr && dateStr <= e.end)
  }

  function goToMonth(offset: number) {
    const next = new Date(year, month + offset, 1)
    setViewDate(next)
    setSelectedDate(toYyyymmdd(next))
  }

  function goToToday() {
    setViewDate(new Date())
    setSelectedDate(todayStr)
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr)
    eventListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const selectedEvents = eventsOnDay(selectedDate)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">시험 일정</h1>
        <Button variant="outline" size="sm" onClick={goToToday}>
          오늘
        </Button>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="이전 달" onClick={() => goToMonth(-1)}>
            <ChevronLeft className="size-5" />
          </Button>
          <p className="text-lg font-bold">
            {year}년 {month + 1}월
          </p>
          <Button variant="ghost" size="icon" aria-label="다음 달" onClick={() => goToMonth(1)}>
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand" /> 접수기간
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-foreground" /> 시험일
          </span>
        </div>

        <div className="grid grid-cols-7 border-t border-l border-border">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="border-r border-b border-border py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {grid.map((day) => {
            const dateStr = toYyyymmdd(day)
            const isOtherMonth = day.getMonth() !== month
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsOnDay(dateStr)
            const hasRegistration = dayEvents.some((e) => e.type === 'registration')
            const hasExam = dayEvents.some((e) => e.type === 'exam')

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleSelectDate(dateStr)}
                className={`flex min-h-11 flex-col items-center gap-1 border-r border-b border-border py-1.5 text-sm transition-colors sm:min-h-16 sm:py-2 ${
                  isOtherMonth ? 'text-muted-foreground/40' : ''
                } ${isSelected ? 'bg-brand/10' : 'hover:bg-muted'}`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full ${
                    isToday ? 'bg-foreground text-background' : ''
                  }`}
                >
                  {day.getDate()}
                </span>
                {(hasRegistration || hasExam) && (
                  <span className="flex gap-0.5">
                    {hasRegistration && <span className="size-1.5 rounded-full bg-brand" />}
                    {hasExam && <span className="size-1.5 rounded-full bg-foreground" />}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <section ref={eventListRef}>
        <h2 className="mb-3 text-lg font-bold">{formatDateRangeKorean(selectedDate, selectedDate)}</h2>
        {selectedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm text-muted-foreground">이 날짜에 해당하는 일정이 없어요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedEvents.map((event, i) => (
              <Link key={`${event.jmCd}-${event.label}-${i}`} to={`/certificates/${event.jmCd}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3">
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        event.type === 'registration' ? 'bg-brand' : 'bg-foreground'
                      }`}
                    />
                    <p className="text-sm">{event.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
