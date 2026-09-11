import type {
  ChecklistCustomItem,
  DefaultChecklistItemId,
  ExamChecklist,
  ExamRecord,
  InterestCertificate,
  MyExamPlan,
  UserSettings,
} from '@/types/user'

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
  seeded: 'quali:seeded',
  checklists: 'quali:checklists',
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
  writeList(
    KEYS.checklists,
    (await listChecklists()).filter((c) => c.planId !== id),
  )
}

// 시험 준비물 체크리스트
async function listChecklists(): Promise<ExamChecklist[]> {
  return readList<ExamChecklist>(KEYS.checklists)
}

function emptyChecklist(planId: string): ExamChecklist {
  return { planId, checkedDefaults: [], customItems: [] }
}

export async function getChecklist(planId: string): Promise<ExamChecklist> {
  const checklists = await listChecklists()
  return checklists.find((c) => c.planId === planId) ?? emptyChecklist(planId)
}

async function updateChecklist(
  planId: string,
  updater: (checklist: ExamChecklist) => ExamChecklist,
): Promise<ExamChecklist> {
  const checklists = await listChecklists()
  const current = checklists.find((c) => c.planId === planId) ?? emptyChecklist(planId)
  const updated = updater(current)
  const exists = checklists.some((c) => c.planId === planId)
  writeList(
    KEYS.checklists,
    exists ? checklists.map((c) => (c.planId === planId ? updated : c)) : [...checklists, updated],
  )
  return updated
}

export async function toggleDefaultChecklistItem(
  planId: string,
  itemId: DefaultChecklistItemId,
): Promise<ExamChecklist> {
  return updateChecklist(planId, (checklist) => ({
    ...checklist,
    checkedDefaults: checklist.checkedDefaults.includes(itemId)
      ? checklist.checkedDefaults.filter((id) => id !== itemId)
      : [...checklist.checkedDefaults, itemId],
  }))
}

export async function addChecklistCustomItem(planId: string, label: string): Promise<ExamChecklist> {
  const item: ChecklistCustomItem = { id: createId(), label, checked: false }
  return updateChecklist(planId, (checklist) => ({
    ...checklist,
    customItems: [...checklist.customItems, item],
  }))
}

export async function toggleChecklistCustomItem(planId: string, itemId: string): Promise<ExamChecklist> {
  return updateChecklist(planId, (checklist) => ({
    ...checklist,
    customItems: checklist.customItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    ),
  }))
}

export async function removeChecklistCustomItem(planId: string, itemId: string): Promise<ExamChecklist> {
  return updateChecklist(planId, (checklist) => ({
    ...checklist,
    customItems: checklist.customItems.filter((item) => item.id !== itemId),
  }))
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
const DEFAULT_SETTINGS: UserSettings = { interestFieldCodes: [] }

export async function getSettings(): Promise<UserSettings> {
  const raw = localStorage.getItem(KEYS.settings)
  return raw ? (JSON.parse(raw) as UserSettings) : DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const next = { ...(await getSettings()), ...patch }
  localStorage.setItem(KEYS.settings, JSON.stringify(next))
  return next
}

/**
 * 테스트 계정 최초 로그인 시 홈 화면(나의 시험 / 관심 직무분야)이 빈 화면으로 보이지 않도록
 * 데모 데이터를 한 번만 채워준다. 실제 회원 데이터가 생기면(로그인 후 무언가 추가/변경하면)
 * 다시 덮어쓰지 않는다.
 */
export async function seedDemoDataIfNeeded(): Promise<void> {
  if (localStorage.getItem(KEYS.seeded)) return
  localStorage.setItem(KEYS.seeded, '1')

  await addMyPlan({
    jmCd: '1320',
    certificateName: '정보처리기사',
    stage: 'practical',
    year: 2026,
    round: 1,
    examDate: '20260928',
    examLocation: '수원대학교',
  })
  await addMyPlan({
    jmCd: '7793',
    certificateName: '전기기사',
    stage: 'written',
    year: 2026,
    round: 2,
    examDate: '20261012',
  })
  await updateSettings({ interestFieldCodes: ['21', '20'] })
}
