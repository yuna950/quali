import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DdayBadge } from '@/components/certificate/DdayBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays, formatYyyymmdd } from '@/lib/date'
import { listMyPlans, removeMyPlan } from '@/services/userService'
import type { MyExamPlan } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const

interface CertGroup {
  jmCd: string
  certificateName: string
  representative: MyExamPlan
  extraCount: number
  needsResult: boolean
}

function groupByCertificate(plans: MyExamPlan[]): CertGroup[] {
  const byJmCd = new Map<string, MyExamPlan[]>()
  for (const plan of plans) {
    const list = byJmCd.get(plan.jmCd) ?? []
    list.push(plan)
    byJmCd.set(plan.jmCd, list)
  }

  return [...byJmCd.values()].map((list) => {
    const overdue = list.filter((p) => diffInDays(p.examDate) < 0)
    const representative =
      overdue[0] ?? [...list].sort((a, b) => diffInDays(a.examDate) - diffInDays(b.examDate))[0]
    return {
      jmCd: representative.jmCd,
      certificateName: representative.certificateName,
      representative,
      extraCount: list.length - 1,
      needsResult: overdue.length > 0,
    }
  })
}

export function MyCertificatesPage() {
  const [plans, setPlans] = useState<MyExamPlan[] | null>(null)

  useEffect(() => {
    listMyPlans().then(setPlans)
  }, [])

  async function handleRemove(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await removeMyPlan(id)
    setPlans((prev) => prev?.filter((p) => p.id !== id) ?? null)
    toast('나의 시험에서 삭제했어요.')
  }

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
                <p className="mt-1 text-xs text-muted-foreground">
                  {STAGE_LABEL[group.representative.stage]} · {group.representative.year}년{' '}
                  {group.representative.round}회
                </p>
                {group.needsResult ? (
                  <p className="mt-1 text-sm text-brand">시험 결과를 입력해주세요.</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatYyyymmdd(group.representative.examDate)}
                  </p>
                )}
                {group.extraCount > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">외 {group.extraCount}건</p>
                )}
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                {group.needsResult ? (
                  <Badge variant="outline">결과 입력 필요</Badge>
                ) : (
                  <DdayBadge targetDate={group.representative.examDate} />
                )}
                <Button variant="ghost" size="sm" onClick={(e) => handleRemove(group.representative.id, e)}>
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
