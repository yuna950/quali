import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CertificateCard } from '@/components/certificate/CertificateCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCertificate } from '@/services/certificateService'
import { listInterests } from '@/services/userService'
import type { Certificate } from '@/types/certificate'

export function InterestsPage() {
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)

  useEffect(() => {
    listInterests().then(async (interests) => {
      const resolved = await Promise.all(interests.map((i) => getCertificate(i.jmCd)))
      setCertificates(resolved.filter((c): c is Certificate => !!c))
    })
  }, [])

  if (!certificates) return null

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">관심 자격증이 없어요.</p>
          <Button variant="outline" size="sm" render={<Link to="/search" />}>
            자격증 검색하러 가기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {certificates.map((certificate) => (
        <CertificateCard key={certificate.jmCd} certificate={certificate} />
      ))}
    </div>
  )
}
