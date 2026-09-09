import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CertificatePreviewCard } from '@/components/certificate/CertificatePreviewCard'
import { LoginPromptBanner } from '@/components/home/LoginPromptBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { useAuth } from '@/lib/auth'
import { listCertificates } from '@/services/certificateService'
import { getSettings } from '@/services/userService'
import type { Certificate } from '@/types/certificate'

export function InterestFieldCertificates() {
  const { isLoggedIn } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return
    Promise.all([listCertificates(), getSettings()]).then(([all, settings]) => {
      setCertificates(all.filter((c) => settings.interestFieldCodes.includes(c.jobFieldCode)))
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
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">아직 관심 분야가 설정되지 않았어요.</p>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/mypage/settings" />}>
              관심 분야 설정하기
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoggedIn && certificates && certificates.length > 0 && (
        <Carousel opts={{ align: 'start', dragFree: true }}>
          <CarouselContent>
            {certificates.map((certificate) => (
              <CarouselItem key={certificate.jmCd} className="basis-1/2 sm:basis-1/4">
                <CertificatePreviewCard certificate={certificate} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  )
}
