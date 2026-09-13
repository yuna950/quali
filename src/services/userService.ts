import { supabase } from '@/lib/supabase'
import type {
  ChecklistCustomItem,
  DefaultChecklistItemId,
  ExamChecklist,
  ExamRecord,
  InterestCertificate,
  MyExamPlan,
  UserSettings,
} from '@/types/user'
import type { Json, Tables, TablesUpdate } from '@/types/supabase'

/**
 * 마이페이지 관련 사용자 액션 데이터 접근 레이어.
 * 로그인한 사용자의 Supabase 테이블을 읽고 쓴다 (RLS로 본인 것만 보이고 고칠 수 있음).
 */

async function requireUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('로그인이 필요해요.')
  return session.user.id
}

function toMyExamPlan(row: Tables<'my_exam_plans'>): MyExamPlan {
  return {
    id: row.id,
    jmCd: row.jm_cd,
    certificateName: row.certificate_name,
    stage: row.stage as MyExamPlan['stage'],
    year: row.year,
    round: row.round,
    examDate: row.exam_date,
    examLocation: row.exam_location ?? undefined,
  }
}

function toExamRecord(row: Tables<'exam_records'>): ExamRecord {
  return {
    id: row.id,
    jmCd: row.jm_cd,
    certificateName: row.certificate_name,
    stage: row.stage as ExamRecord['stage'],
    year: row.year,
    round: row.round,
    examDate: row.exam_date,
    passed: row.passed,
    score: row.score ?? undefined,
    memo: row.memo ?? undefined,
    planId: row.plan_id ?? undefined,
  }
}

function toChecklist(row: Tables<'exam_checklists'>): ExamChecklist {
  return {
    planId: row.plan_id,
    checkedDefaults: (row.checked_defaults ?? []) as DefaultChecklistItemId[],
    customItems: (row.custom_items ?? []) as unknown as ChecklistCustomItem[],
  }
}

// 나의 시험 (준비 중)
export async function listMyPlans(): Promise<MyExamPlan[]> {
  const { data, error } = await supabase.from('my_exam_plans').select('*').order('exam_date')
  if (error) throw error
  return data.map(toMyExamPlan)
}

export async function addMyPlan(plan: Omit<MyExamPlan, 'id'>): Promise<MyExamPlan> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('my_exam_plans')
    .insert({
      user_id: userId,
      jm_cd: plan.jmCd,
      certificate_name: plan.certificateName,
      stage: plan.stage,
      year: plan.year,
      round: plan.round,
      exam_date: plan.examDate,
      exam_location: plan.examLocation,
    })
    .select()
    .single()
  if (error) throw error
  return toMyExamPlan(data)
}

export async function removeMyPlan(id: string): Promise<void> {
  // exam_checklists는 plan_id에 ON DELETE CASCADE가 걸려 있어 DB가 알아서 같이 정리함
  const { error } = await supabase.from('my_exam_plans').delete().eq('id', id)
  if (error) throw error
}

// 시험 준비물 체크리스트
function emptyChecklist(planId: string): ExamChecklist {
  return { planId, checkedDefaults: [], customItems: [] }
}

export async function getChecklist(planId: string): Promise<ExamChecklist> {
  const { data, error } = await supabase.from('exam_checklists').select('*').eq('plan_id', planId).maybeSingle()
  if (error) throw error
  return data ? toChecklist(data) : emptyChecklist(planId)
}

async function upsertChecklist(
  planId: string,
  updater: (checklist: ExamChecklist) => ExamChecklist,
): Promise<ExamChecklist> {
  const userId = await requireUserId()
  const updated = updater(await getChecklist(planId))
  const { data, error } = await supabase
    .from('exam_checklists')
    .upsert({
      plan_id: planId,
      user_id: userId,
      checked_defaults: updated.checkedDefaults,
      custom_items: updated.customItems as unknown as Json,
    })
    .select()
    .single()
  if (error) throw error
  return toChecklist(data)
}

export async function toggleDefaultChecklistItem(
  planId: string,
  itemId: DefaultChecklistItemId,
): Promise<ExamChecklist> {
  return upsertChecklist(planId, (checklist) => ({
    ...checklist,
    checkedDefaults: checklist.checkedDefaults.includes(itemId)
      ? checklist.checkedDefaults.filter((id) => id !== itemId)
      : [...checklist.checkedDefaults, itemId],
  }))
}

export async function addChecklistCustomItem(planId: string, label: string): Promise<ExamChecklist> {
  const item: ChecklistCustomItem = { id: crypto.randomUUID(), label, checked: false }
  return upsertChecklist(planId, (checklist) => ({
    ...checklist,
    customItems: [...checklist.customItems, item],
  }))
}

export async function toggleChecklistCustomItem(planId: string, itemId: string): Promise<ExamChecklist> {
  return upsertChecklist(planId, (checklist) => ({
    ...checklist,
    customItems: checklist.customItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    ),
  }))
}

export async function removeChecklistCustomItem(planId: string, itemId: string): Promise<ExamChecklist> {
  return upsertChecklist(planId, (checklist) => ({
    ...checklist,
    customItems: checklist.customItems.filter((item) => item.id !== itemId),
  }))
}

// 응시 기록
export async function listExamRecords(): Promise<ExamRecord[]> {
  const { data, error } = await supabase.from('exam_records').select('*').order('exam_date', { ascending: false })
  if (error) throw error
  return data.map(toExamRecord)
}

export async function addExamRecord(record: Omit<ExamRecord, 'id'>): Promise<ExamRecord> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('exam_records')
    .insert({
      user_id: userId,
      jm_cd: record.jmCd,
      certificate_name: record.certificateName,
      stage: record.stage,
      year: record.year,
      round: record.round,
      exam_date: record.examDate,
      passed: record.passed,
      score: record.score,
      memo: record.memo,
      plan_id: record.planId,
    })
    .select()
    .single()
  if (error) throw error
  return toExamRecord(data)
}

export async function updateExamRecord(
  id: string,
  patch: Partial<Omit<ExamRecord, 'id'>>,
): Promise<ExamRecord | undefined> {
  const payload: TablesUpdate<'exam_records'> = {}
  if (patch.jmCd !== undefined) payload.jm_cd = patch.jmCd
  if (patch.certificateName !== undefined) payload.certificate_name = patch.certificateName
  if (patch.stage !== undefined) payload.stage = patch.stage
  if (patch.year !== undefined) payload.year = patch.year
  if (patch.round !== undefined) payload.round = patch.round
  if (patch.examDate !== undefined) payload.exam_date = patch.examDate
  if (patch.passed !== undefined) payload.passed = patch.passed
  if (patch.score !== undefined) payload.score = patch.score
  if (patch.memo !== undefined) payload.memo = patch.memo
  if (patch.planId !== undefined) payload.plan_id = patch.planId

  const { data, error } = await supabase.from('exam_records').update(payload).eq('id', id).select().maybeSingle()
  if (error) throw error
  return data ? toExamRecord(data) : undefined
}

export async function removeExamRecord(id: string): Promise<void> {
  const { error } = await supabase.from('exam_records').delete().eq('id', id)
  if (error) throw error
}

// 관심 자격증
export async function listInterests(): Promise<InterestCertificate[]> {
  const { data, error } = await supabase
    .from('interest_certificates')
    .select('*')
    .order('added_at', { ascending: false })
  if (error) throw error
  return data.map((row) => ({ jmCd: row.jm_cd, addedAt: row.added_at }))
}

export async function isInterested(jmCd: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('interest_certificates')
    .select('jm_cd')
    .eq('jm_cd', jmCd)
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function addInterest(jmCd: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('interest_certificates').upsert({ user_id: userId, jm_cd: jmCd })
  if (error) throw error
}

export async function removeInterest(jmCd: string): Promise<void> {
  const { error } = await supabase.from('interest_certificates').delete().eq('jm_cd', jmCd)
  if (error) throw error
}

// 설정
const DEFAULT_SETTINGS: UserSettings = { interestFieldCodes: [] }

export async function getSettings(): Promise<UserSettings> {
  const { data, error } = await supabase.from('user_settings').select('*').maybeSingle()
  if (error) throw error
  return data ? { interestFieldCodes: data.interest_field_codes ?? [] } : DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const userId = await requireUserId()
  const next = { ...(await getSettings()), ...patch }
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, interest_field_codes: next.interestFieldCodes })
  if (error) throw error
  return next
}
