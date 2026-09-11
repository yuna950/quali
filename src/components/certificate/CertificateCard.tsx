import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { InterestButton } from '@/components/certificate/InterestButton'
import { StatusBadge } from '@/components/certificate/StatusBadge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDday, formatYyyymmdd } from '@/lib/date'
import { getApplicationStatus, getNearestExamDatesByStage } from '@/lib/examStatus'
import { getExamSchedules } from '@/services/certificateService'
import type { Certificate, ExamApplicationStatus, ExamStageKey } from '@/types/certificate'

const STAGE_LABEL: Record<'written' | 'practical', string> = { written: '필기', practical: '실기' }

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [status, setStatus] = useState<ExamApplicationStatus | null>(null)
  const [stageDates, setStageDates] = useState<Partial<Record<ExamStageKey, string>>>({})

  useEffect(() => {
    let active = true
    getExamSchedules(certificate.jmCd).then((schedules) => {
      if (!active) return
      setStatus(getApplicationStatus(schedules))
      setStageDates(getNearestExamDatesByStage(schedules))
    })
    return () => {
      active = false
    }
  }, [certificate.jmCd])

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
