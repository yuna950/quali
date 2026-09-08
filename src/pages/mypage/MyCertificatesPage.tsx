import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays } from '@/lib/date'
import { listMyPlans } from '@/services/userService'
import type { MyExamPlan } from '@/types/user'

interface CertGroup {
  jmCd: string
  certificateName: string
  count: number
  needsResult: boolean
}

function groupByCertificate(plans: MyExamPlan[]): CertGroup[] {
  const groups = new Map<string, CertGroup>()
  for (const plan of plans) {
    const existing = groups.get(plan.jmCd)
    const isPast = diffInDays(plan.examDate) < 0
    if (existing) {
      existing.count += 1
      existing.needsResult = existing.needsResult || isPast
    } else {
      groups.set(plan.jmCd, {
        jmCd: plan.jmCd,
        certificateName: plan.certificateName,
        count: 1,
        needsResult: isPast,
      })
    }
  }
  return [...groups.values()]
}

export function MyCertificatesPage() {
  const [plans, setPlans] = useState<MyExamPlan[] | null>(null)

  useEffect(() => {
    listMyPlans().then(setPlans)
  }, [])

  if (!plans) return null

  const groups = groupByCertificate(plans)

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">준비 중인 시험이 없어요.</p>
          <Button variant="outline" size="sm" render={<Link to="/search" />}>
            자격증 검색하러 가기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <Link key={group.jmCd} to={`/mypage/records/${group.jmCd}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold">{group.certificateName}</p>
                <p className="mt-1 text-sm text-muted-foreground">준비 중인 시험 {group.count}건</p>
              </div>
              {group.needsResult && <Badge variant="outline">결과 입력 필요</Badge>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
