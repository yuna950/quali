import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DdayBadge } from '@/components/certificate/DdayBadge'
import { InterestButton } from '@/components/certificate/InterestButton'
import { StatusBadge } from '@/components/certificate/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDday } from '@/lib/date'
import { getApplicationStatus, getNearestExamDate, getNearestExamDatesByStage } from '@/lib/examStatus'
import { getExamSchedules } from '@/services/certificateService'
import type { Certificate, ExamApplicationStatus, ExamStageKey } from '@/types/certificate'

const STAGE_LABEL: Record<'written' | 'practical', string> = { written: '필기', practical: '실기' }

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [status, setStatus] = useState<ExamApplicationStatus | null>(null)
  const [nearestExamDate, setNearestExamDate] = useState<string | undefined>()
  const [stageDates, setStageDates] = useState<Partial<Record<ExamStageKey, string>>>({})

  useEffect(() => {
    let active = true
    getExamSchedules(certificate.jmCd).then((schedules) => {
      if (!active) return
      setStatus(getApplicationStatus(schedules))
      setNearestExamDate(getNearestExamDate(schedules))
      setStageDates(getNearestExamDatesByStage(schedules))
    })
    return () => {
      active = false
    }
  }, [certificate.jmCd])

  return (
    <Link to={`/certificates/${certificate.jmCd}`}>
      <Card className="h-56 transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-2">{certificate.name}</CardTitle>
          <CardAction>
            <InterestButton jmCd={certificate.jmCd} />
          </CardAction>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{certificate.qualificationTypeName}</Badge>
            {status && <StatusBadge status={status} />}
            {nearestExamDate && <DdayBadge targetDate={nearestExamDate} />}
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {(['written', 'practical'] as const).map((stage) => (
              <p key={stage}>
                <span className="font-medium text-foreground">{STAGE_LABEL[stage]}</span>{' '}
                {stageDates[stage] ? formatDday(stageDates[stage]!) : '예정된 시험 없음'}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
