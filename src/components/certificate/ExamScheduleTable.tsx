import { AddMyPlanButton } from '@/components/certificate/AddMyPlanButton'
import { formatDateRangeKorean } from '@/lib/date'
import type { Certificate, ExamSchedule, ExamStageDates, ExamStageKey } from '@/types/certificate'

interface ExamScheduleTableProps {
  certificate: Certificate
  schedules: ExamSchedule[]
  stage: ExamStageKey
  title: string
}

function ScheduleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="mb-1 text-sm font-bold">{label}</p>
      <p className="desc-4 text-muted-foreground">{value}</p>
    </div>
  )
}

function ScheduleFields({ stageDates }: { stageDates: ExamStageDates }) {
  return (
    <>
      <ScheduleField label="접수" value={formatDateRangeKorean(stageDates.regStart, stageDates.regEnd)} />
      <ScheduleField label="시험" value={formatDateRangeKorean(stageDates.examStart, stageDates.examEnd)} />
      <ScheduleField
        label="합격자발표"
        value={formatDateRangeKorean(stageDates.passDate ?? stageDates.passStart, stageDates.passEnd)}
      />
    </>
  )
}

export function ExamScheduleTable({ certificate, schedules, stage, title }: ExamScheduleTableProps) {
  const rounds = schedules
    .filter((schedule) => schedule.stages[stage])
    .sort((a, b) => a.round - b.round)

  if (rounds.length === 0) return null

  if (rounds.length === 1) {
    const schedule = rounds[0]
    const stageDates = schedule.stages[stage]!
    return (
      <section>
        <h2 className="heading-3 mb-3">{title}</h2>
        <div className="flex flex-col items-center gap-6 rounded-xl border border-border p-4 sm:flex-row sm:justify-around">
          <ScheduleFields stageDates={stageDates} />
          {stageDates.examStart && (
            <AddMyPlanButton
              jmCd={certificate.jmCd}
              certificateName={certificate.name}
              stage={stage}
              year={schedule.year}
              round={schedule.round}
              examDate={stageDates.examStart}
            />
          )}
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="heading-3 mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(180px, 1fr))` }}>
          {rounds.map((schedule) => (
            <div
              key={schedule.round}
              className="border-b border-l border-border py-3 text-center text-sm font-bold first:border-l-0"
            >
              {schedule.round}차
            </div>
          ))}

          {rounds.map((schedule) => {
            const stageDates = schedule.stages[stage]!
            return (
              <div
                key={schedule.round}
                className="flex flex-col items-center gap-4 border-l border-border p-4 text-center first:border-l-0"
              >
                <ScheduleFields stageDates={stageDates} />
                {stageDates.examStart && (
                  <AddMyPlanButton
                    jmCd={certificate.jmCd}
                    certificateName={certificate.name}
                    stage={stage}
                    year={schedule.year}
                    round={schedule.round}
                    examDate={stageDates.examStart}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
