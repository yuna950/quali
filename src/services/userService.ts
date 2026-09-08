import type { ExamRecord, InterestCertificate, MyExamPlan, UserSettings } from '@/types/user'

/**
 * 마이페이지 관련 사용자 액션 데이터 접근 레이어.
 * 백엔드 연동 전까지는 localStorage에 저장해 새로고침 후에도 유지되도록 하고,
 * Supabase 연동 시 이 함수들의 내부 구현만 테이블 읽기/쓰기로 교체하면 된다.
 */

const KEYS = {
  myPlans: 'quali:myPlans',
  examRecords: 'quali:examRecords',
  interests: 'quali:interests',
  settings: 'quali:settings',
} as const

function readList<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T[]) : []
}

function writeList<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function createId(): string {
  return crypto.randomUUID()
}

// 나의 시험 (준비 중)
export async function listMyPlans(): Promise<MyExamPlan[]> {
  return readList<MyExamPlan>(KEYS.myPlans)
}

export async function addMyPlan(plan: Omit<MyExamPlan, 'id'>): Promise<MyExamPlan> {
  const created = { ...plan, id: createId() }
  writeList(KEYS.myPlans, [...(await listMyPlans()), created])
  return created
}

export async function removeMyPlan(id: string): Promise<void> {
  writeList(
    KEYS.myPlans,
    (await listMyPlans()).filter((p) => p.id !== id),
  )
}

// 응시 기록
export async function listExamRecords(): Promise<ExamRecord[]> {
  return readList<ExamRecord>(KEYS.examRecords)
}

export async function addExamRecord(record: Omit<ExamRecord, 'id'>): Promise<ExamRecord> {
  const created = { ...record, id: createId() }
  writeList(KEYS.examRecords, [...(await listExamRecords()), created])
  return created
}

export async function updateExamRecord(
  id: string,
  patch: Partial<Omit<ExamRecord, 'id'>>,
): Promise<ExamRecord | undefined> {
  const records = await listExamRecords()
  let updated: ExamRecord | undefined
  const next = records.map((r) => {
    if (r.id !== id) return r
    updated = { ...r, ...patch }
    return updated
  })
  writeList(KEYS.examRecords, next)
  return updated
}

export async function removeExamRecord(id: string): Promise<void> {
  writeList(
    KEYS.examRecords,
    (await listExamRecords()).filter((r) => r.id !== id),
  )
}

// 관심 자격증
export async function listInterests(): Promise<InterestCertificate[]> {
  return readList<InterestCertificate>(KEYS.interests)
}

export async function isInterested(jmCd: string): Promise<boolean> {
  return (await listInterests()).some((i) => i.jmCd === jmCd)
}

export async function addInterest(jmCd: string): Promise<void> {
  const current = await listInterests()
  if (current.some((i) => i.jmCd === jmCd)) return
  writeList(KEYS.interests, [...current, { jmCd, addedAt: new Date().toISOString() }])
}

export async function removeInterest(jmCd: string): Promise<void> {
  writeList(
    KEYS.interests,
    (await listInterests()).filter((i) => i.jmCd !== jmCd),
  )
}

// 설정
const DEFAULT_SETTINGS: UserSettings = { interestFieldCodes: [], examRegionCodes: [] }

export async function getSettings(): Promise<UserSettings> {
  const raw = localStorage.getItem(KEYS.settings)
  return raw ? (JSON.parse(raw) as UserSettings) : DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const next = { ...(await getSettings()), ...patch }
  localStorage.setItem(KEYS.settings, JSON.stringify(next))
  return next
}
