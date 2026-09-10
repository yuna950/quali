import { CalendarPlus, ChevronRight, ClipboardCheck, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const STEPS = [
  { icon: Search, label: '자격증 검색' },
  { icon: CalendarPlus, label: '시험 일정 등록' },
  { icon: ClipboardCheck, label: '응시 기록 관리' },
]

export function HeroSection() {
  return (
    <section className="flex flex-col items-center gap-12 py-16 text-center sm:py-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          자격증 검색부터 시험 일정 관리,
          <br />
          응시 기록까지 한 곳에서
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          자격증 준비의 모든 순간을 QUALI와 함께해요.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Badge className="border-none bg-brand-light text-brand">이용 방법</Badge>
        <div className="flex items-start gap-4 sm:gap-8">
          {STEPS.map(({ icon: Icon, label }, index) => (
            <div key={label} className="flex items-start gap-4 sm:gap-8">
              <div className="flex flex-col items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-light sm:size-14">
                  <Icon className="size-6 text-brand sm:size-7" />
                </span>
                <p className="text-xs font-medium whitespace-nowrap sm:text-sm">{label}</p>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="mt-4 size-4 shrink-0 text-muted-foreground sm:mt-4.5 sm:size-5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
