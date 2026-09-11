import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CertificateCard } from '@/components/certificate/CertificateCard'
import { ExamScheduleTable } from '@/components/certificate/ExamScheduleTable'
import { InterestButton } from '@/components/certificate/InterestButton'
import { PassRateTable } from '@/components/certificate/PassRateTable'
import { BackButton } from '@/components/common/BackButton'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import {
  getCertificate,
  getExamFee,
  getExamSchedules,
  getExamSubjects,
  getPassRateSummary,
  getSimilarCertificates,
} from '@/services/certificateService'
import type {
  Certificate,
  ExamFee,
  ExamSchedule,
  ExamSubject,
  PassRateSummary,
} from '@/types/certificate'

const STAGE_TITLE = { written: '필기시험 일정', practical: '실기시험 일정', interview: '면접시험 일정' } as const

export function CertificateDetailPage() {
  const { jmCd } = useParams<{ jmCd: string }>()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [fee, setFee] = useState<ExamFee | undefined>()
  const [subjects, setSubjects] = useState<ExamSubject[]>([])
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [passRate, setPassRate] = useState<PassRateSummary | undefined>()
  const [similar, setSimilar] = useState<Certificate[]>([])

  useEffect(() => {
    if (!jmCd) return
    let active = true

    Promise.all([
      getCertificate(jmCd),
      getExamFee(jmCd),
      getExamSubjects(jmCd),
      getExamSchedules(jmCd),
      getPassRateSummary(jmCd),
      getSimilarCertificates(jmCd, Infinity),
    ]).then(([cert, feeResult, subjectsResult, schedulesResult, passRateResult, similarResult]) => {
      if (!active) return
      setCertificate(cert ?? null)
      setFee(feeResult)
      setSubjects(subjectsResult)
      setSchedules(schedulesResult)
      setPassRate(passRateResult)
      setSimilar(similarResult)
    })

    return () => {
      active = false
    }
  }, [jmCd])

  if (!certificate) return null

  const stages: (keyof typeof STAGE_TITLE)[] = ['written', 'practical', 'interview']
  const activeStages = stages.filter((stage) => schedules.some((s) => s.stages[stage]))

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 p-6">
      <BackButton />

      <section>
        <div className="flex items-start justify-between">
          <div>
            <p className="desc-5 mb-1 text-muted-foreground">
              {certificate.qualificationTypeName} / {certificate.jobFieldName}
            </p>
            <h1 className="heading-2">{certificate.name}</h1>
          </div>
          <InterestButton jmCd={certificate.jmCd} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-4">
            <p className="w-24 shrink-0 text-sm font-bold">응시 수수료</p>
            {fee && fee.items.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {fee.items.map((item) => (
                  <p key={item.label} className="desc-4 text-muted-foreground">
                    {item.label} : {item.amount.toLocaleString()}원
                  </p>
                ))}
              </div>
            ) : (
              <p className="desc-4 text-muted-foreground">정보 없음</p>
            )}
          </div>
          <div className="flex gap-4">
            <p className="w-24 shrink-0 text-sm font-bold">시험 과목</p>
            {subjects.length === 0 ? (
              <p className="desc-4 text-muted-foreground">정보 없음</p>
            ) : (
              <div className="flex flex-col gap-2">
                {subjects.map((subject) => (
                  <div
                    key={`${subject.type}-${subject.subjectName}-${subject.order}`}
                    className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2"
                  >
                    <p className="desc-4 text-muted-foreground">{subject.subjectName}</p>
                    <p className="desc-5 text-muted-foreground">
                      {subject.type} · {subject.totalQuestions}문항 · {subject.durationMinutes}분
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {activeStages.map((stage) => (
        <ExamScheduleTable
          key={stage}
          certificate={certificate}
          schedules={schedules}
          stage={stage}
          title={STAGE_TITLE[stage]}
        />
      ))}

      {passRate && <PassRateTable summary={passRate} />}

      {similar.length > 0 && (
        <section>
          <h2 className="heading-3 mb-3">유사 분야 자격증</h2>
          <Carousel opts={{ align: 'start', dragFree: true }}>
            <CarouselContent>
              {similar.map((c) => (
                <CarouselItem key={c.jmCd} className="basis-[76.9%] sm:basis-1/3">
                  <CertificateCard certificate={c} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>
      )}
    </div>
  )
}
