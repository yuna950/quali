import type { ExamStageKey } from './certificate'

/** 마이페이지 - 현재 준비 중인 시험 */
export interface MyExamPlan {
  id: string
  jmCd: string
  certificateName: string
  stage: ExamStageKey
  year: number
  round: number
  examDate: string
  examLocation?: string
}

/** 마이페이지 - 응시 기록 */
export interface ExamRecord {
  id: string
  jmCd: string
  certificateName: string
  stage: ExamStageKey
  year: number
  round: number
  examDate: string
  passed: boolean
  score?: number
  memo?: string
}

/** 마이페이지 - 관심 자격증 */
export interface InterestCertificate {
  jmCd: string
  addedAt: string
}

/** 마이페이지 - 설정 */
export interface UserSettings {
  interestFieldCodes: string[]
  examRegionCodes: string[]
}

export interface AuthUser {
  email: string
  name: string
}
