import { useEffect, useRef, useState } from 'react'
import { LoginPromptBanner } from '@/components/home/LoginPromptBanner'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays, formatYyyymmdd } from '@/lib/date'
import { useAuth } from '@/lib/auth'
import { getCertificate } from '@/services/certificateService'
import { listMyPlans } from '@/services/userService'
import type { Certificate } from '@/types/certificate'
import type { MyExamPlan } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const

interface Slide {
  plan: MyExamPlan
  certificate: Certificate | undefined
}

function DdayText({ examDate }: { examDate: string }) {
  const days = diffInDays(examDate)
  return <>{days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`}</>
}

export function MyExamHero() {
  const { isLoggedIn, user } = useAuth()
  const [slides, setSlides] = useState<Slide[] | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoggedIn) return
    listMyPlans().then(async (plans) => {
      const withCertificates = await Promise.all(
        plans.map(async (plan) => ({ plan, certificate: await getCertificate(plan.jmCd) })),
      )
      setSlides(withCertificates)
    })
  }, [isLoggedIn])

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  function goTo(index: number) {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{user?.name ?? '나'}님의 시험</h2>

      {!isLoggedIn && (
        <LoginPromptBanner message="로그인하면 준비 중인 시험 일정을 한눈에 확인할 수 있어요." />
      )}

      {isLoggedIn && slides && slides.length === 0 && (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            아직 준비 중인 시험이 없어요. 자격증을 검색해서 나의 시험을 추가해보세요.
          </CardContent>
        </Card>
      )}

      {isLoggedIn && slides && slides.length > 0 && (
        <>
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none]"
          >
            {slides.map(({ plan, certificate }) => (
              <Card key={plan.id} className="w-full shrink-0 snap-start">
                <CardContent className="flex min-h-32 flex-col justify-between gap-6 sm:flex-row">
                  <div className="sm:self-start">
                    <p className="mb-1 text-xs text-muted-foreground">
                      {certificate ? `${certificate.qualificationTypeName} / ${certificate.jobFieldName}` : ' '}
                    </p>
                    <p className="text-xl font-bold">
                      {plan.certificateName} {plan.round}회
                    </p>
                  </div>
                  <div className="text-right sm:self-end">
                    <p className="mb-1 text-xs text-muted-foreground">{STAGE_LABEL[plan.stage]} 시험</p>
                    <p className="text-3xl font-extrabold">
                      <DdayText examDate={plan.examDate} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatYyyymmdd(plan.examDate)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.plan.id}
                  aria-label={`${i + 1}번째 시험으로 이동`}
                  onClick={() => goTo(i)}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === activeIndex ? 'bg-foreground' : 'bg-foreground/20'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
