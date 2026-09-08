import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import type { Certificate } from '@/types/certificate'

/** 라벨 + 제목 + "자세히 보기"만 있는 심플 카드 (홈 관심분야, 상세페이지 유사분야 등에서 공용) */
export function CertificatePreviewCard({ certificate }: { certificate: Certificate }) {
  return (
    <Link to={`/certificates/${certificate.jmCd}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between gap-8">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              {certificate.qualificationTypeName} / {certificate.jobFieldName}
            </p>
            <p className="text-lg font-bold">{certificate.name}</p>
          </div>
          <p className="text-right text-sm text-muted-foreground">자세히 보기 →</p>
        </CardContent>
      </Card>
    </Link>
  )
}
