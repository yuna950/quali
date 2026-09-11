import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AddMyPlanButton } from '@/components/certificate/AddMyPlanButton'
import { BackButton } from '@/components/common/BackButton'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { diffInDays, formatDday, formatYyyymmdd } from '@/lib/date'
import { getCertificate, getExamSchedules } from '@/services/certificateService'
import { listExamRecords, listMyPlans, removeExamRecord, removeMyPlan } from '@/services/userService'
import type { Certificate, ExamSchedule, ExamStageKey } from '@/types/certificate'
import type { ExamRecord, MyExamPlan } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const
const STAGE_KEYS: ExamStageKey[] = ['written', 'practical', 'interview']

function ConfirmDeleteButton({ description, onConfirm }: { description: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="rounded-full px-3 text-status-red hover:bg-status-red/5">
            삭제
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 삭제하시겠어요?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            className="bg-status-red text-white hover:bg-status-red/90"
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

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
  const [nearestRounds, setNearestRounds] = useState<NearestRound[]>([])
  const [plans, setPlans] = useState<MyExamPlan[] | null>(null)
  const [records, setRecords] = useState<ExamRecord[]>([])

  useEffect(() => {
    if (!jmCd) return
    let active = true

    Promise.all([
      getCertificate(jmCd),
      getExamSchedules(jmCd),
      listMyPlans(),
      listExamRecords(),
    ]).then(([cert, schedules, allPlans, allRecords]) => {
      if (!active) return
      setCertificate(cert ?? null)
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
        <p className="desc-5 mb-1 text-muted-foreground">
          {certificate.qualificationTypeName} / {certificate.jobFieldName}
        </p>
        <h1 className="heading-2">{certificate.name}</h1>

        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            className="text-neutral"
            nativeButton={false}
            render={<Link to={`/certificates/${jmCd}`} />}
          >
            시험 상세 정보
            <ArrowUpRight />
          </Button>
        </div>
      </section>

      <section>
        <h2 className="heading-3 mb-3">준비 중</h2>

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
                      <p className="desc-4 text-muted-foreground">
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
            <CardContent className="py-10 text-center">
              <p className="desc-3 text-muted-foreground">준비 중인 시험이 없어요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {plans.map((plan) => {
              const isPast = diffInDays(plan.examDate) < 0
              return (
                <Card key={plan.id}>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div>
                      <p className="desc-5 mb-1 text-muted-foreground">
                        {STAGE_LABEL[plan.stage]} · {plan.year}년 {plan.round}회
                      </p>
                      {isPast ? (
                        <p className="desc-4 text-brand">시험 결과를 입력해주세요.</p>
                      ) : (
                        <p className="desc-4 text-muted-foreground">
                          {formatYyyymmdd(plan.examDate)} · <span className="text-brand">{formatDday(plan.examDate)}</span>
                          {plan.examLocation && ` · ${plan.examLocation}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isPast && (
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
                          onSaved={handleRecordSaved}
                          onPlanRemoved={handlePlanRemoved}
                        />
                      )}
                      <ConfirmDeleteButton
                        description="이 시험 일정을 나의 시험에서 삭제할까요? 이 작업은 되돌릴 수 없어요."
                        onConfirm={() => handleRemovePlan(plan.id)}
                      />
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
          <h2 className="heading-3">응시 기록</h2>
          <ExamRecordFormDialog
            mode="create"
            presetJmCd={jmCd}
            trigger={
              <Button variant="outline" size="sm" className="text-brand hover:bg-brand/5">
                기록 추가
              </Button>
            }
            onSaved={handleRecordSaved}
          />
        </div>

        {records.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="desc-3 text-muted-foreground">응시 기록이 없어요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <Card key={record.id}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="desc-5 mb-1 text-muted-foreground">
                      {STAGE_LABEL[record.stage]} · {record.year}년 {record.round}회
                    </p>
                    <p className="desc-4 text-muted-foreground">
                      {formatYyyymmdd(record.examDate)}
                      {record.score !== undefined && ` · ${record.score}점`}
                      {' · '}
                      <span className={record.passed ? 'font-medium text-brand' : 'font-medium text-neutral'}>
                        {record.passed ? '합격' : '불합격'}
                      </span>
                    </p>
                    {record.memo && <p className="desc-4 mt-1 text-muted-foreground">{record.memo}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <ExamRecordFormDialog
                      mode="edit"
                      record={record}
                      trigger={
                        <Button variant="outline" size="sm" className="rounded-full px-3 text-neutral">
                          수정
                        </Button>
                      }
                      onSaved={handleRecordSaved}
                    />
                    <ConfirmDeleteButton
                      description="이 응시기록을 삭제할까요? 이 작업은 되돌릴 수 없어요."
                      onConfirm={() => handleRemoveRecord(record.id)}
                    />
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
