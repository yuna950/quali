import { getApplicationStatus } from '@/lib/examStatus'
import { mockCertificates } from '@/mocks/certificates'
import { mockExamAreas, mockTestSites } from '@/mocks/examAreas'
import { mockExamFees } from '@/mocks/examFees'
import { mockExamSchedules } from '@/mocks/examSchedules'
import { mockExamSubjects } from '@/mocks/examSubjects'
import { mockPassRates } from '@/mocks/passRates'
import type {
  Certificate,
  ExamApplicationStatus,
  ExamArea,
  ExamFee,
  ExamSchedule,
  ExamStageKey,
  ExamSubject,
  JobFieldOption,
  PassRateSummary,
  SeriesOption,
  TestSite,
} from '@/types/certificate'

const STAGE_LABEL: Record<ExamStageKey, string> = {
  written: '필기',
  practical: '실기',
  interview: '면접',
}

/**
 * 자격증 관련 데이터 접근 레이어.
 * 지금은 목데이터를 반환하지만, Supabase 연동 시 이 함수들의 내부 구현만
 * Supabase 테이블 조회로 교체하면 되고 화면 코드는 그대로 유지된다.
 */

export interface SearchCertificatesQuery {
  keyword?: string
  seriesCode?: string
  jobFieldCode?: string
  status?: ExamApplicationStatus
}

export async function listCertificates(): Promise<Certificate[]> {
  return mockCertificates
}

export async function getCertificate(jmCd: string): Promise<Certificate | undefined> {
  return mockCertificates.find((c) => c.jmCd === jmCd)
}

export async function searchCertificates(query: SearchCertificatesQuery): Promise<Certificate[]> {
  const keyword = query.keyword?.trim().toLowerCase()

  return mockCertificates.filter((certificate) => {
    if (keyword && !certificate.name.toLowerCase().includes(keyword)) return false
    if (query.seriesCode && certificate.seriesCode !== query.seriesCode) return false
    if (query.jobFieldCode && certificate.jobFieldCode !== query.jobFieldCode) return false
    if (query.status) {
      const schedules = mockExamSchedules[certificate.jmCd] ?? []
      if (getApplicationStatus(schedules) !== query.status) return false
    }
    return true
  })
}

export async function listSeriesOptions(): Promise<SeriesOption[]> {
  const seen = new Map<string, SeriesOption>()
  for (const c of mockCertificates) {
    if (!seen.has(c.seriesCode)) seen.set(c.seriesCode, { code: c.seriesCode, name: c.seriesName })
  }
  return [...seen.values()]
}

export async function listJobFieldOptions(): Promise<JobFieldOption[]> {
  const seen = new Map<string, JobFieldOption>()
  for (const c of mockCertificates) {
    if (!c.jobFieldCode) continue
    if (!seen.has(c.jobFieldCode)) seen.set(c.jobFieldCode, { code: c.jobFieldCode, name: c.jobFieldName })
  }
  return [...seen.values()]
}

export async function getExamSchedules(jmCd: string): Promise<ExamSchedule[]> {
  return mockExamSchedules[jmCd] ?? []
}

export async function getExamFee(jmCd: string): Promise<ExamFee | undefined> {
  return mockExamFees[jmCd]
}

export async function getExamSubjects(jmCd: string): Promise<ExamSubject[]> {
  return mockExamSubjects[jmCd] ?? []
}

export async function getPassRateSummary(jmCd: string): Promise<PassRateSummary | undefined> {
  return mockPassRates[jmCd]
}

export async function getSimilarCertificates(jmCd: string, limit = 4): Promise<Certificate[]> {
  const current = await getCertificate(jmCd)
  if (!current) return []
  return mockCertificates
    .filter((c) => c.jmCd !== jmCd && c.jobFieldCode === current.jobFieldCode)
    .slice(0, limit)
}

/** 합격률 4년 평균 기준 인기 자격증 정렬 (기획서 기준. 추후 실제 인기 지표 확정 시 교체) */
export async function getPopularCertificates(limit = 5): Promise<Certificate[]> {
  return [...mockCertificates]
    .sort((a, b) => (mockPassRates[b.jmCd]?.averageRate ?? 0) - (mockPassRates[a.jmCd]?.averageRate ?? 0))
    .slice(0, limit)
}

export async function getExamAreas(branchCode?: string): Promise<ExamArea[]> {
  return branchCode ? mockExamAreas.filter((a) => a.branchCode === branchCode) : mockExamAreas
}

export async function getTestSites(branchName?: string): Promise<TestSite[]> {
  return branchName ? mockTestSites.filter((s) => s.branchName === branchName) : mockTestSites
}

export interface RegistrationWindowEntry {
  jmCd: string
  certificateName: string
  label: string
  regStart: string
  regEnd: string
}

/** rangeStart~rangeEnd(YYYYMMDD)와 접수기간이 겹치는 모든 자격증의 회차/단계를 모아 반환 */
export async function listRegistrationWindowsInRange(
  rangeStart: string,
  rangeEnd: string,
): Promise<RegistrationWindowEntry[]> {
  const entries: RegistrationWindowEntry[] = []

  for (const certificate of mockCertificates) {
    const schedules = mockExamSchedules[certificate.jmCd] ?? []
    for (const schedule of schedules) {
      for (const stageKey of Object.keys(schedule.stages) as ExamStageKey[]) {
        const stage = schedule.stages[stageKey]
        if (!stage?.regStart || !stage.regEnd) continue
        if (stage.regEnd < rangeStart || stage.regStart > rangeEnd) continue

        entries.push({
          jmCd: certificate.jmCd,
          certificateName: certificate.name,
          label: `${schedule.round} ${STAGE_LABEL[stageKey]} 접수`,
          regStart: stage.regStart,
          regEnd: stage.regEnd,
        })
      }
    }
  }

  return entries
}
