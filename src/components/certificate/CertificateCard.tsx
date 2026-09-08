import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DdayBadge } from '@/components/certificate/DdayBadge'
import { InterestButton } from '@/components/certificate/InterestButton'
import { StatusBadge } from '@/components/certificate/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getApplicationStatus, getNearestExamDate } from '@/lib/examStatus'
import { getExamSchedules } from '@/services/certificateService'
import type { Certificate, ExamApplicationStatus } from '@/types/certificate'

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [status, setStatus] = useState<ExamApplicationStatus | null>(null)
  const [nearestExamDate, setNearestExamDate] = useState<string | undefined>()

  useEffect(() => {
    let active = true
    getExamSchedules(certificate.jmCd).then((schedules) => {
      if (!active) return
      setStatus(getApplicationStatus(schedules))
      setNearestExamDate(getNearestExamDate(schedules))
    })
    return () => {
      active = false
    }
  }, [certificate.jmCd])

  return (
    <Link to={`/certificates/${certificate.jmCd}`}>
      <Card className="h-44 transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-2">{certificate.name}</CardTitle>
          <CardAction>
            <InterestButton jmCd={certificate.jmCd} />
          </CardAction>
        </CardHeader>
        <CardContent className="mt-auto flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{certificate.qualificationTypeName}</Badge>
          {status && <StatusBadge status={status} />}
          {nearestExamDate && <DdayBadge targetDate={nearestExamDate} />}
        </CardContent>
      </Card>
    </Link>
  )
}
