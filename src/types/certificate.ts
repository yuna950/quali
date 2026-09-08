/**
 * 화면에서 실제로 쓰는 도메인 타입.
 * Q-net raw 필드(src/types/qnet.ts)를 사람이 읽기 쉬운 형태로 정리한 것으로,
 * 지금은 mock 서비스가 이 형태로 데이터를 반환하고, 나중에 Supabase 테이블 조회 결과도
 * 동일한 형태로 매핑해서 반환하면 화면 코드는 변경할 필요가 없다.
 */

export interface Certificate {
  jmCd: string
  name: string
  qualificationTypeCode: string
  qualificationTypeName: string
  seriesCode: string
  seriesName: string
  jobFieldCode: string
  jobFieldName: string
  midJobFieldCode: string
  midJobFieldName: string
}

export interface ExamFee {
  jmCd: string
  description: string
}

export interface ExamSubject {
  jmCd: string
  type: string
  subjectName: string
  order: number
  isRequired: boolean
  optionalFieldName: string
  fullScore: number
  totalQuestions: number
  durationMinutes: number
}

export type ExamStageKey = 'written' | 'practical' | 'interview'

export interface ExamStageDates {
  regStart?: string
  regEnd?: string
  examStart?: string
  examEnd?: string
  passDate?: string
  passStart?: string
  passEnd?: string
}

export interface ExamSchedule {
  jmCd: string
  round: string
  stages: Partial<Record<ExamStageKey, ExamStageDates>>
}

export interface PassRateYear {
  year: number
  applicants: number
  passers: number
  passRate: number
}

export interface PassRateSummary {
  jmCd: string
  years: PassRateYear[]
  averageRate: number
}

export interface ExamArea {
  branchCode: string
  branchName: string
  areaType: string
  areaName: string
  address: string
  locationGuide?: string
  phone?: string
}

export interface TestSite {
  branchName: string
  areaName: string
  areaRole: string
  hasCbtFacility: boolean
}

export interface SeriesOption {
  code: string
  name: string
}

export interface JobFieldOption {
  code: string
  name: string
}

export type ExamApplicationStatus = 'upcoming' | 'open' | 'closed'
