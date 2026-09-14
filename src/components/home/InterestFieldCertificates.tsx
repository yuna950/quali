import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CertificateCard } from '@/components/certificate/CertificateCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
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
      <h2 className="heading-3 mb-3">관심 직무분야 자격증</h2>

      {certificates === null && (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="min-w-0 flex-[0_0_76.9%] sm:flex-[0_0_25%]">
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {certificates && certificates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="desc-3 text-muted-foreground">아직 관심 분야가 설정되지 않았어요.</p>
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
              <CarouselItem key={certificate.jmCd} className="basis-[76.9%] sm:basis-1/4">
                <CertificateCard certificate={certificate} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  )
}
