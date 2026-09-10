import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CertificateCard } from '@/components/certificate/CertificateCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { listCertificates } from '@/services/certificateService'
import { getSettings } from '@/services/userService'
import type { Certificate } from '@/types/certificate'

export function InterestFieldCertificates() {
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)

  useEffect(() => {
    Promise.all([listCertificates(), getSettings()]).then(([all, settings]) => {
      setCertificates(all.filter((c) => settings.interestFieldCodes.includes(c.jobFieldCode)))
    })
  }, [])

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">관심 직무분야 자격증</h2>

      {certificates && certificates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">아직 관심 분야가 설정되지 않았어요.</p>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/mypage/settings" />}>
              관심 분야 설정하기
            </Button>
          </CardContent>
        </Card>
      )}

      {certificates && certificates.length > 0 && (
        <Carousel opts={{ align: 'start', dragFree: true }}>
          <CarouselContent>
            {certificates.map((certificate) => (
              <CarouselItem key={certificate.jmCd} className="basis-2/3 sm:basis-1/4">
                <CertificateCard certificate={certificate} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  )
}
