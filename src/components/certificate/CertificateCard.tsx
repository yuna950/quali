import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { InterestButton } from '@/components/certificate/InterestButton'
import { StatusBadge } from '@/components/certificate/StatusBadge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDday, formatYyyymmdd } from '@/lib/date'
import { getApplicationStatus, getNearestExamDatesByStage } from '@/lib/examStatus'
import { getExamSchedules } from '@/services/certificateService'
import type { Certificate, ExamSchedule, ExamStageKey } from '@/types/certificate'

const STAGE_LABEL: Record<'written' | 'practical', string> = { written: '필기', practical: '실기' }

/**
 * schedules를 넘기면 그 값을 그대로 쓰고, 안 넘기면 카드가 알아서 자기 자격증의 일정을 조회한다.
 * 카드를 여러 개(수십~수백 개) 한 번에 렌더링하는 화면(예: 검색 결과 목록)에서는 부모가
 * 한 번에 모아서 조회한 뒤 넘겨줘야 자격증 개수만큼 요청이 따로 나가는 걸 피할 수 있다.
 */
export function CertificateCard({
  certificate,
  schedules: schedulesProp,
}: {
  certificate: Certificate
  schedules?: ExamSchedule[]
}) {
  const [fetchedSchedules, setFetchedSchedules] = useState<ExamSchedule[] | null>(null)

  useEffect(() => {
    if (schedulesProp) return
    let active = true
    getExamSchedules(certificate.jmCd).then((schedules) => {
      if (active) setFetchedSchedules(schedules)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate.jmCd, schedulesProp])

  const schedules = schedulesProp ?? fetchedSchedules
  const status = schedules ? getApplicationStatus(schedules) : null
  const stageDates: Partial<Record<ExamStageKey, string>> = schedules ? getNearestExamDatesByStage(schedules) : {}

  return (
    <Link to={`/certificates/${certificate.jmCd}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <p className="desc-5 text-muted-foreground">{certificate.qualificationTypeName}</p>
          <CardTitle className="line-clamp-2">{certificate.name}</CardTitle>
          <CardAction>
            <InterestButton jmCd={certificate.jmCd} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-muted-foreground">
            {(['written', 'practical'] as const).map((stage) => (
              <div key={stage} className="desc-4 flex items-center gap-2">
                <span className="w-8 font-medium text-foreground">{STAGE_LABEL[stage]}</span>
                {stageDates[stage] ? (
                  <span>
                    {formatYyyymmdd(stageDates[stage]!)} ·{' '}
                    <span className="font-medium text-brand">{formatDday(stageDates[stage]!)}</span>
                  </span>
                ) : (
                  <span>예정된 시험 없음</span>
                )}
              </div>
            ))}
          </div>
          {status && (
            <div>
              <StatusBadge status={status} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
