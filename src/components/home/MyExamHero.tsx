import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoginPromptBanner } from '@/components/home/LoginPromptBanner'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
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
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) return
    listMyPlans().then(async (plans) => {
      const upcoming = plans
        .filter((plan) => diffInDays(plan.examDate) >= 0)
        .sort((a, b) => (a.examDate < b.examDate ? -1 : a.examDate > b.examDate ? 1 : 0))
      const withCertificates = await Promise.all(
        upcoming.map(async (plan) => ({ plan, certificate: await getCertificate(plan.jmCd) })),
      )
      setSlides(withCertificates)
    })
  }, [isLoggedIn])

  useEffect(() => {
    if (!api) return
    api.on('select', () => setActiveIndex(api.selectedScrollSnap()))
  }, [api])

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{user ? `${user.name}님의 시험` : '나의 시험'}</h2>

      {!isLoggedIn && (
        <LoginPromptBanner message="로그인하면 준비 중인 시험 일정을 한눈에 확인할 수 있어요." />
      )}

      {isLoggedIn && slides && slides.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            아직 준비 중인 시험이 없어요. 자격증을 검색해서 나의 시험을 추가해보세요.
          </CardContent>
        </Card>
      )}

      {isLoggedIn && slides && slides.length > 0 && (
        <>
          <Carousel setApi={setApi} opts={{ align: 'start' }}>
            <CarouselContent>
              {slides.map(({ plan, certificate }) => (
                <CarouselItem key={plan.id}>
                  <Link to={`/mypage/records/${plan.jmCd}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex min-h-32 flex-col justify-between gap-6 sm:flex-row">
                        <div className="sm:self-start">
                          <p className="mb-1 text-xs text-muted-foreground">
                            {certificate
                              ? `${certificate.qualificationTypeName} / ${certificate.jobFieldName}`
                              : ' '}
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
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {slides.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.plan.id}
                  type="button"
                  aria-label={`${i + 1}번째 시험으로 이동`}
                  onClick={() => api?.scrollTo(i)}
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
