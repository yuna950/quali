import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AddMyPlanButton } from '@/components/certificate/AddMyPlanButton'
import { DdayBadge } from '@/components/certificate/DdayBadge'
import { BackButton } from '@/components/common/BackButton'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays, formatYyyymmdd } from '@/lib/date'
import { getCertificate, getExamFee, getExamSchedules, getExamSubjects } from '@/services/certificateService'
import { listExamRecords, listMyPlans, removeExamRecord, removeMyPlan } from '@/services/userService'
import type { Certificate, ExamFee, ExamSchedule, ExamStageKey, ExamSubject } from '@/types/certificate'
import type { ExamRecord, MyExamPlan } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const
const STAGE_KEYS: ExamStageKey[] = ['written', 'practical', 'interview']

interface NearestRound {
  stage: ExamStageKey
  year: number
  round: number
  examDate: string
}

function findNearestUpcomingByStage(schedules: ExamSchedule[]): NearestRound[] {
  const nearest = new Map<ExamStageKey, NearestRound>()
  for (const schedule of schedules) {
    for (const stageKey of STAGE_KEYS) {
      const stageDates = schedule.stages[stageKey]
      if (!stageDates?.examStart || diffInDays(stageDates.examStart) < 0) continue
      const current = nearest.get(stageKey)
      if (!current || stageDates.examStart < current.examDate) {
        nearest.set(stageKey, {
          stage: stageKey,
          year: schedule.year,
          round: schedule.round,
          examDate: stageDates.examStart,
        })
      }
    }
  }
  return [...nearest.values()]
}

export function MyCertificateRecordPage() {
  const { jmCd } = useParams<{ jmCd: string }>()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [fee, setFee] = useState<ExamFee | undefined>()
  const [subjects, setSubjects] = useState<ExamSubject[]>([])
  const [nearestRounds, setNearestRounds] = useState<NearestRound[]>([])
  const [plans, setPlans] = useState<MyExamPlan[] | null>(null)
  const [records, setRecords] = useState<ExamRecord[]>([])

  useEffect(() => {
    if (!jmCd) return
    let active = true

    Promise.all([
      getCertificate(jmCd),
      getExamFee(jmCd),
      getExamSubjects(jmCd),
      getExamSchedules(jmCd),
      listMyPlans(),
      listExamRecords(),
    ]).then(([cert, feeResult, subjectsResult, schedules, allPlans, allRecords]) => {
      if (!active) return
      setCertificate(cert ?? null)
      setFee(feeResult)
      setSubjects(subjectsResult)
      setNearestRounds(findNearestUpcomingByStage(schedules))
      setPlans(allPlans.filter((p) => p.jmCd === jmCd))
      setRecords(allRecords.filter((r) => r.jmCd === jmCd))
    })

    return () => {
      active = false
    }
  }, [jmCd])

  function refreshPlans() {
    if (!jmCd) return
    listMyPlans().then((all) => setPlans(all.filter((p) => p.jmCd === jmCd)))
  }

  async function handleRemovePlan(id: string) {
    await removeMyPlan(id)
    setPlans((prev) => prev?.filter((p) => p.id !== id) ?? null)
    toast('나의 시험에서 삭제했어요.')
  }

  async function handleRemoveRecord(id: string) {
    await removeExamRecord(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
    toast('응시기록을 삭제했어요.')
  }

  function handleRecordSaved(record: ExamRecord) {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === record.id)
      return exists ? prev.map((r) => (r.id === record.id ? record : r)) : [...prev, record]
    })
  }

  function handlePlanRemoved(planId: string) {
    setPlans((prev) => prev?.filter((p) => p.id !== planId) ?? null)
  }

  if (!certificate || !plans) return null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 p-6">
      <BackButton />

      <section>
        <p className="mb-1 text-xs text-muted-foreground">
          {certificate.qualificationTypeName} / {certificate.jobFieldName}
        </p>
        <h1 className="text-2xl font-bold">{certificate.name}</h1>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-4">
            <p className="w-24 shrink-0 text-sm font-bold">응시 수수료</p>
            {fee && fee.items.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {fee.items.map((item) => (
                  <p key={item.label} className="text-sm text-muted-foreground">
                    {item.label} : {item.amount.toLocaleString()}원
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">정보 없음</p>
            )}
          </div>
          <div className="flex gap-4">
            <p className="w-24 shrink-0 text-sm font-bold">시험 과목</p>
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">정보 없음</p>
            ) : (
              <div className="flex flex-col gap-1">
                {subjects.map((subject) => (
                  <p
                    key={`${subject.type}-${subject.subjectName}-${subject.order}`}
                    className="text-sm text-muted-foreground"
                  >
                    {subject.subjectName}
                    <span className="ml-2 text-xs">
                      {subject.type} · {subject.totalQuestions}문항 · {subject.durationMinutes}분
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">준비 중</h2>

        {certificate &&
          (() => {
            const addable = nearestRounds.filter(
              (nr) => !plans.some((p) => p.stage === nr.stage && p.year === nr.year && p.round === nr.round),
            )
            if (addable.length === 0) return null
            return (
              <div className="mb-3 flex flex-col gap-2">
                {addable.map((nr) => (
                  <Card key={nr.stage}>
                    <CardContent className="flex items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        {STAGE_LABEL[nr.stage]} · {nr.year}년 {nr.round}회 · {formatYyyymmdd(nr.examDate)}
                      </p>
                      <AddMyPlanButton
                        jmCd={certificate.jmCd}
                        certificateName={certificate.name}
                        stage={nr.stage}
                        year={nr.year}
                        round={nr.round}
                        examDate={nr.examDate}
                        onChange={refreshPlans}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          })()}

        {plans.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">준비 중인 시험이 없어요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {plans.map((plan) => {
              const isPast = diffInDays(plan.examDate) < 0
              return (
                <Card key={plan.id}>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">
                        {STAGE_LABEL[plan.stage]} · {plan.year}년 {plan.round}회
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatYyyymmdd(plan.examDate)}
                        {plan.examLocation && ` · ${plan.examLocation}`}
                      </p>
                      {isPast && <p className="mt-1 text-sm text-brand">시험 결과를 입력해주세요.</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      {isPast ? (
                        <ExamRecordFormDialog
                          mode="create"
                          lockedPlan={plan}
                          trigger={
                            <Button variant="outline" size="sm">
                              결과 입력
                            </Button>
                          }
                          onSaved={handleRecordSaved}
                          onPlanRemoved={handlePlanRemoved}
                        />
                      ) : (
                        <DdayBadge targetDate={plan.examDate} />
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleRemovePlan(plan.id)}>
                        삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">응시 기록</h2>
          <ExamRecordFormDialog
            mode="create"
            presetJmCd={jmCd}
            trigger={
              <Button variant="outline" size="sm">
                기록 추가
              </Button>
            }
            onSaved={handleRecordSaved}
          />
        </div>

        {records.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">응시 기록이 없어요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <Card key={record.id}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {STAGE_LABEL[record.stage]} · {record.year}년 {record.round}회
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatYyyymmdd(record.examDate)}
                      {record.score !== undefined && ` · ${record.score}점`}
                    </p>
                    {record.memo && <p className="mt-1 text-sm text-muted-foreground">{record.memo}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={record.passed ? 'default' : 'secondary'}>
                      {record.passed ? '합격' : '불합격'}
                    </Badge>
                    <ExamRecordFormDialog
                      mode="edit"
                      record={record}
                      trigger={
                        <Button variant="ghost" size="sm">
                          수정
                        </Button>
                      }
                      onSaved={handleRecordSaved}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveRecord(record.id)}>
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
