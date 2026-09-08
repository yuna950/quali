import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DdayBadge } from '@/components/certificate/DdayBadge'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays, formatYyyymmdd } from '@/lib/date'
import { listMyPlans, listExamRecords, removeMyPlan } from '@/services/userService'
import type { MyExamPlan, ExamRecord } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const

export function MyCertificatesPage() {
  const [plans, setPlans] = useState<MyExamPlan[] | null>(null)
  const [records, setRecords] = useState<ExamRecord[]>([])

  useEffect(() => {
    listMyPlans().then(setPlans)
    listExamRecords().then(setRecords)
  }, [])

  async function handleRemove(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setPlans((prev) => prev?.filter((p) => p.id !== id) ?? null)
    await removeMyPlan(id)
    toast('나의 시험에서 삭제했어요.')
  }

  function handleRecordSaved(record: ExamRecord) {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === record.id)
      return exists ? prev.map((r) => (r.id === record.id ? record : r)) : [...prev, record]
    })
  }

  if (!plans) return null

  if (plans.length === 0) {
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
      {plans.map((plan) => {
        const record = records.find((r) => r.planId === plan.id)
        const isPast = diffInDays(plan.examDate) < 0

        return (
          <Link key={plan.id} to={`/certificates/${plan.jmCd}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {STAGE_LABEL[plan.stage]} · {plan.year}년 {plan.round}회
                  </p>
                  <p className="text-lg font-bold">{plan.certificateName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatYyyymmdd(plan.examDate)}
                    {plan.examLocation && ` · ${plan.examLocation}`}
                  </p>
                  {!record && isPast && (
                    <p className="mt-1 text-sm text-brand">시험 결과를 입력해주세요.</p>
                  )}
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                  {record ? (
                    <ExamRecordFormDialog
                      mode="edit"
                      record={record}
                      trigger={
                        <Badge variant={record.passed ? 'default' : 'secondary'} className="cursor-pointer">
                          {record.passed ? '합격' : '불합격'}
                        </Badge>
                      }
                      onSaved={handleRecordSaved}
                    />
                  ) : isPast ? (
                    <ExamRecordFormDialog
                      mode="create"
                      lockedPlan={plan}
                      trigger={
                        <Button variant="outline" size="sm">
                          결과 입력
                        </Button>
                      }
                      onSaved={handleRecordSaved}
                    />
                  ) : (
                    <DdayBadge targetDate={plan.examDate} />
                  )}
                  <Button variant="ghost" size="sm" onClick={(e) => handleRemove(plan.id, e)}>
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
