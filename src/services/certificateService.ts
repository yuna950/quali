import { formatScheduleRound, getApplicationStatus } from '@/lib/examStatus'
import { supabase } from '@/lib/supabase'
import type {
  Certificate,
  ExamApplicationStatus,
  ExamFee,
  ExamSchedule,
  ExamStageKey,
  ExamSubject,
  JobFieldOption,
  PassRateSummary,
  SeriesOption,
} from '@/types/certificate'
import type { Tables } from '@/types/supabase'

const STAGE_LABEL: Record<ExamStageKey, string> = {
  written: '필기',
  practical: '실기',
}

/**
 * 자격증 관련 데이터 접근 레이어.
 * Supabase의 공개 테이블(certificates 등)을 조회해서 화면이 쓰는 camelCase 타입으로 변환해 반환한다.
 * 화면 코드는 이 함수들의 반환 타입만 보고 동작하므로, 여기 내부만 바뀌고 화면은 그대로다.
 */

function toCertificate(row: Tables<'certificates'>): Certificate {
  return {
    jmCd: row.jm_cd,
    name: row.name,
    qualificationTypeCode: row.qualification_type_code,
    qualificationTypeName: row.qualification_type_name,
    seriesCode: row.series_code,
    seriesName: row.series_name,
    jobFieldCode: row.job_field_code,
    jobFieldName: row.job_field_name,
    midJobFieldCode: row.mid_job_field_code,
    midJobFieldName: row.mid_job_field_name,
  }
}

function toExamSchedule(row: Tables<'exam_schedules'>): ExamSchedule {
  return {
    jmCd: row.jm_cd,
    year: row.year,
    round: row.round,
    stages: (row.stages ?? {}) as ExamSchedule['stages'],
  }
}

function toExamFee(row: Tables<'exam_fees'>): ExamFee {
  return { jmCd: row.jm_cd, items: (row.items ?? []) as unknown as ExamFee['items'] }
}

function toExamSubject(row: Tables<'exam_subjects'>): ExamSubject {
  return {
    jmCd: row.jm_cd,
    type: row.type,
    subjectName: row.subject_name,
    order: row.subject_order,
    isRequired: row.is_required,
    optionalFieldName: row.optional_field_name,
    fullScore: row.full_score,
    totalQuestions: row.total_questions,
    durationMinutes: row.duration_minutes,
  }
}

function toPassRateSummary(row: Tables<'pass_rates'>): PassRateSummary {
  return {
    jmCd: row.jm_cd,
    years: (row.years ?? []) as unknown as PassRateSummary['years'],
    averageRate: row.average_rate,
  }
}

export interface SearchCertificatesQuery {
  keyword?: string
  seriesCode?: string
  jobFieldCode?: string
  midJobFieldCode?: string
  jmCd?: string
  status?: ExamApplicationStatus
}

export async function listCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase.from('certificates').select('*')
  if (error) throw error
  return data.map(toCertificate)
}

export async function getCertificate(jmCd: string): Promise<Certificate | undefined> {
  const { data, error } = await supabase.from('certificates').select('*').eq('jm_cd', jmCd).maybeSingle()
  if (error) throw error
  return data ? toCertificate(data) : undefined
}

export async function searchCertificates(query: SearchCertificatesQuery): Promise<Certificate[]> {
  let request = supabase.from('certificates').select('*')

  if (query.keyword?.trim()) request = request.ilike('name', `%${query.keyword.trim()}%`)
  if (query.seriesCode) request = request.eq('series_code', query.seriesCode)
  if (query.jobFieldCode) request = request.eq('job_field_code', query.jobFieldCode)
  if (query.midJobFieldCode) request = request.eq('mid_job_field_code', query.midJobFieldCode)
  if (query.jmCd) request = request.eq('jm_cd', query.jmCd)

  const { data, error } = await request
  if (error) throw error
  const certificates = data.map(toCertificate)

  if (!query.status) return certificates
  if (certificates.length === 0) return []

  const schedulesByJmCd = await getExamSchedulesByJmCds(certificates.map((c) => c.jmCd))
  return certificates.filter(
    (certificate) => getApplicationStatus(schedulesByJmCd.get(certificate.jmCd) ?? []) === query.status,
  )
}

export async function listSeriesOptions(): Promise<SeriesOption[]> {
  const { data, error } = await supabase.from('series_options').select('*')
  if (error) throw error
  return data.map((row) => ({ code: row.code!, name: row.name! }))
}

export async function listJobFieldOptions(): Promise<JobFieldOption[]> {
  const { data, error } = await supabase.from('job_field_options').select('*')
  if (error) throw error
  return data.filter((row) => row.code).map((row) => ({ code: row.code!, name: row.name! }))
}

export interface MidJobFieldOption {
  code: string
  name: string
}

export async function listMidJobFieldOptions(jobFieldCode: string): Promise<MidJobFieldOption[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('mid_job_field_code, mid_job_field_name')
    .eq('job_field_code', jobFieldCode)
  if (error) throw error

  const seen = new Map<string, MidJobFieldOption>()
  for (const row of data) {
    if (!row.mid_job_field_code || seen.has(row.mid_job_field_code)) continue
    seen.set(row.mid_job_field_code, { code: row.mid_job_field_code, name: row.mid_job_field_name })
  }
  return [...seen.values()]
}

export async function getExamSchedules(jmCd: string): Promise<ExamSchedule[]> {
  const { data, error } = await supabase.from('exam_schedules').select('*').eq('jm_cd', jmCd)
  if (error) throw error
  return data.map(toExamSchedule)
}

/** 여러 자격증의 일정을 한 번의 쿼리로 모아서 jm_cd별로 묶어 반환한다 (자격증 개수만큼 쿼리를
 * 반복하는 걸 피하려고 씀 — 예: 검색 결과 목록에 접수중/접수예정 상태 필터를 적용할 때). */
export async function getExamSchedulesByJmCds(jmCds: string[]): Promise<Map<string, ExamSchedule[]>> {
  const schedulesByJmCd = new Map<string, ExamSchedule[]>()
  if (jmCds.length === 0) return schedulesByJmCd

  const { data, error } = await supabase.from('exam_schedules').select('*').in('jm_cd', jmCds)
  if (error) throw error

  for (const schedule of data.map(toExamSchedule)) {
    const list = schedulesByJmCd.get(schedule.jmCd) ?? []
    list.push(schedule)
    schedulesByJmCd.set(schedule.jmCd, list)
  }
  return schedulesByJmCd
}

export async function getExamFee(jmCd: string): Promise<ExamFee | undefined> {
  const { data, error } = await supabase.from('exam_fees').select('*').eq('jm_cd', jmCd).maybeSingle()
  if (error) throw error
  return data ? toExamFee(data) : undefined
}

export async function getExamSubjects(jmCd: string): Promise<ExamSubject[]> {
  const { data, error } = await supabase
    .from('exam_subjects')
    .select('*')
    .eq('jm_cd', jmCd)
    .order('subject_order')
  if (error) throw error
  return data.map(toExamSubject)
}

export async function getPassRateSummary(jmCd: string): Promise<PassRateSummary | undefined> {
  const { data, error } = await supabase.from('pass_rates').select('*').eq('jm_cd', jmCd).maybeSingle()
  if (error) throw error
  return data ? toPassRateSummary(data) : undefined
}

export async function getSimilarCertificates(jmCd: string, limit = 4): Promise<Certificate[]> {
  const current = await getCertificate(jmCd)
  if (!current) return []

  let request = supabase
    .from('certificates')
    .select('*')
    .eq('job_field_code', current.jobFieldCode)
    .neq('jm_cd', jmCd)
  if (Number.isFinite(limit)) request = request.limit(limit)

  const { data, error } = await request
  if (error) throw error
  return data.map(toCertificate)
}

/** 합격률 4년 평균 기준 인기 자격증 정렬 (기획서 기준. 추후 실제 인기 지표 확정 시 교체) */
export async function getPopularCertificates(limit = 5): Promise<Certificate[]> {
  const [certificates, passRates] = await Promise.all([
    listCertificates(),
    supabase.from('pass_rates').select('jm_cd, average_rate').then(({ data, error }) => {
      if (error) throw error
      return new Map(data.map((row) => [row.jm_cd, row.average_rate]))
    }),
  ])

  return [...certificates]
    .sort((a, b) => (passRates.get(b.jmCd) ?? 0) - (passRates.get(a.jmCd) ?? 0))
    .slice(0, limit)
}

export type ScheduleEventType = 'registration' | 'exam'

export interface ScheduleEventEntry {
  jmCd: string
  certificateName: string
  label: string
  type: ScheduleEventType
  start: string
  end: string
  /** 같은 회차(같은 label+기간)를 공유하는 자격증 수. 2 이상이면 특정 자격증 하나로 이동시킬 수
   * 없어서 화면에서는 링크를 걸지 않음(Q-net도 이런 통합 회차는 링크 없이 제목만 표시). */
  count: number
}

/** rangeStart~rangeEnd(YYYYMMDD)와 겹치는 접수기간 + 시험일을 모두 모아 반환 (월간 일정 페이지용).
 * 같은 회차를 공유하는 자격증들(예: 기사 242개가 전부 "2026년 정기 기사 1회")은 label+기간이
 * 완전히 같으므로 하나로 묶어서 반환한다. */
export async function listScheduleEventsInRange(
  rangeStart: string,
  rangeEnd: string,
): Promise<ScheduleEventEntry[]> {
  const [certificates, scheduleRows] = await Promise.all([
    listCertificates(),
    supabase.from('exam_schedules').select('*').then(({ data, error }) => {
      if (error) throw error
      return data.map(toExamSchedule)
    }),
  ])

  const certificateByJmCd = new Map(certificates.map((c) => [c.jmCd, c]))
  const grouped = new Map<string, ScheduleEventEntry>()

  function addEvent(event: Omit<ScheduleEventEntry, 'count'>) {
    const key = `${event.label}|${event.start}|${event.end}`
    const existing = grouped.get(key)
    if (existing) {
      existing.count += 1
    } else {
      grouped.set(key, { ...event, count: 1 })
    }
  }

  for (const schedule of scheduleRows) {
    const certificate = certificateByJmCd.get(schedule.jmCd)
    if (!certificate) continue

    const roundLabel = formatScheduleRound(certificate.seriesName, schedule)

    for (const stageKey of Object.keys(schedule.stages) as ExamStageKey[]) {
      const stage = schedule.stages[stageKey]
      if (!stage) continue

      if (stage.regStart && stage.regEnd && !(stage.regEnd < rangeStart || stage.regStart > rangeEnd)) {
        addEvent({
          jmCd: certificate.jmCd,
          certificateName: certificate.name,
          label: `${roundLabel} ${STAGE_LABEL[stageKey]} 접수`,
          type: 'registration',
          start: stage.regStart,
          end: stage.regEnd,
        })
      }

      if (stage.examStart) {
        const examEnd = stage.examEnd ?? stage.examStart
        if (!(examEnd < rangeStart || stage.examStart > rangeEnd)) {
          addEvent({
            jmCd: certificate.jmCd,
            certificateName: certificate.name,
            label: `${roundLabel} ${STAGE_LABEL[stageKey]} 시험`,
            type: 'exam',
            start: stage.examStart,
            end: examEnd,
          })
        }
      }
    }
  }

  return [...grouped.values()]
}
