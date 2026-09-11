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
  /** 나의 자격증(MyExamPlan)에서 결과를 입력해 생성된 경우 그 플랜의 id. 독립적으로 추가한 기록은 undefined */
  planId?: string
}

/** 시험 준비물 체크리스트에서 라벨이 고정된 기본 항목(신분증/수험표/필기구) */
export type DefaultChecklistItemId = 'idCard' | 'admissionTicket' | 'writingTools'

export interface ChecklistCustomItem {
  id: string
  label: string
  checked: boolean
}

/** 마이페이지 - 시험 준비물 체크리스트 (나의 시험 플랜 하나당 하나) */
export interface ExamChecklist {
  planId: string
  checkedDefaults: DefaultChecklistItemId[]
  customItems: ChecklistCustomItem[]
}

/** 마이페이지 - 관심 자격증 */
export interface InterestCertificate {
  jmCd: string
  addedAt: string
}

/** 마이페이지 - 설정 */
export interface UserSettings {
  interestFieldCodes: string[]
}

export interface AuthUser {
  email: string
  name: string
}
