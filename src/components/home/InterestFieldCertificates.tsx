import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CertificatePreviewCard } from '@/components/certificate/CertificatePreviewCard'
import { LoginPromptBanner } from '@/components/home/LoginPromptBanner'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { listCertificates } from '@/services/certificateService'
import { getSettings } from '@/services/userService'
import type { Certificate } from '@/types/certificate'

const MAX_ITEMS = 4

export function InterestFieldCertificates() {
  const { isLoggedIn } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return
    Promise.all([listCertificates(), getSettings()]).then(([all, settings]) => {
      const matched = all.filter((c) => settings.interestFieldCodes.includes(c.jobFieldCode))
      setCertificates(matched.slice(0, MAX_ITEMS))
    })
  }, [isLoggedIn])

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">관심 직무분야 자격증</h2>

      {!isLoggedIn && (
        <LoginPromptBanner message="로그인하고 관심 분야를 설정하면 맞춤 자격증을 추천해드려요." />
      )}

      {isLoggedIn && certificates && certificates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">아직 관심 분야가 설정되지 않았어요.</p>
            <Link to="/mypage/settings" className="text-sm font-medium underline">
              관심 분야 설정하기 →
            </Link>
          </CardContent>
        </Card>
      )}

      {isLoggedIn && certificates && certificates.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {certificates.map((certificate) => (
            <CertificatePreviewCard key={certificate.jmCd} certificate={certificate} />
          ))}
        </div>
      )}
    </section>
  )
}
