import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays, formatDday, formatYyyymmdd } from '@/lib/date'
import { listMyPlans } from '@/services/userService'
import type { MyExamPlan } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const
const VISIBLE_LIMIT = 2

interface CertGroup {
  jmCd: string
  certificateName: string
  visible: MyExamPlan[]
  moreCount: number
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
    const rest = list.filter((p) => diffInDays(p.examDate) >= 0).sort((a, b) => diffInDays(a.examDate) - diffInDays(b.examDate))
    const sorted = [...overdue, ...rest]
    return {
      jmCd: sorted[0].jmCd,
      certificateName: sorted[0].certificateName,
      visible: sorted.slice(0, VISIBLE_LIMIT),
      moreCount: Math.max(0, sorted.length - VISIBLE_LIMIT),
    }
  })
}

export function MyCertificatesPage() {
  const [plans, setPlans] = useState<MyExamPlan[] | null>(null)

  useEffect(() => {
    listMyPlans().then(setPlans)
  }, [])

  function handlePlanRemoved(planId: string) {
    setPlans((prev) => prev?.filter((p) => p.id !== planId) ?? null)
  }

  if (!plans) return null

  const groups = groupByCertificate(plans)

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="desc-3 text-muted-foreground">준비 중인 시험이 없어요.</p>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/search" />}>
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
            <CardContent className="flex flex-col gap-3">
              <p className="heading-4">{group.certificateName}</p>

              {group.visible.map((plan, i) => {
                const needsResult = diffInDays(plan.examDate) < 0
                return (
                  <div
                    key={plan.id}
                    className={`flex items-center justify-between gap-4 ${i > 0 ? 'border-t border-border pt-3' : ''}`}
                  >
                    <div>
                      <p className="desc-5 text-muted-foreground">
                        {STAGE_LABEL[plan.stage]} · {plan.year}년 {plan.round}회
                      </p>
                      {needsResult ? (
                        <p className="desc-4 mt-1 text-brand">시험 결과를 입력해주세요.</p>
                      ) : (
                        <p className="desc-4 mt-1 text-muted-foreground">
                          {formatYyyymmdd(plan.examDate)} · <span className="text-brand">{formatDday(plan.examDate)}</span>
                        </p>
                      )}
                    </div>
                    {needsResult && (
                      <div onClick={(e) => e.preventDefault()}>
                        <ExamRecordFormDialog
                          mode="create"
                          lockedPlan={plan}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-transparent bg-brand-light px-3 text-brand hover:bg-brand-light/70"
                            >
                              결과 입력
                            </Button>
                          }
                          onSaved={() => {}}
                          onPlanRemoved={handlePlanRemoved}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {group.moreCount > 0 && (
                <p className="desc-5 text-muted-foreground">외 {group.moreCount}건 더 보기 →</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
