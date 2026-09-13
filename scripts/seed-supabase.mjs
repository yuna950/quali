// data/qnet/(Q-net 실데이터 스냅샷)를 읽어서 Supabase 테이블에 직접 upsert하는 스크립트.
// `supabase db push --include-seed`가 원격 프로젝트에는 실제로 데이터를 안 넣고 해시만
// 기록하는 걸 확인해서(2026-09-14), service_role 키로 직접 쓰는 방식으로 교체함.
// 이 키는 이 스크립트 밖으로 절대 안 나감(프론트엔드 코드에 안 들어감).
// 실행: node --env-file=.env scripts/seed-supabase.mjs
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env에 필요합니다.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const ROOT = path.resolve(import.meta.dirname, '..')
const QNET_DIR = path.join(ROOT, 'data/qnet')

async function readJson(relPath) {
  try {
    return JSON.parse(await readFile(path.join(QNET_DIR, relPath), 'utf-8'))
  } catch {
    return null
  }
}

async function listFetchedJmCodes() {
  const entries = await readdir(path.join(QNET_DIR, 'certificates'), { withFileTypes: true })
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

function parseYearRound(implplannm) {
  const match = implplannm.match(/(\d{4})년.*?(\d+)회/)
  return match ? { year: Number(match[1]), round: Number(match[2]) } : null
}

function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v))
}

function buildStages(item) {
  const stages = {}
  const written = compact({
    regStart: item.docregstartdt,
    regEnd: item.docregenddt,
    examStart: item.docexamstartdt,
    examEnd: item.docexamenddt,
    passDate: item.docpassdt,
  })
  if (Object.keys(written).length > 0) stages.written = written

  const practical = compact({
    regStart: item.pracregstartdt,
    regEnd: item.pracregenddt,
    examStart: item.pracexamstartdt,
    examEnd: item.pracexamenddt,
    passStart: item.pracpassstartdt,
    passEnd: item.pracpassenddt,
  })
  if (Object.keys(practical).length > 0) stages.practical = practical

  return stages
}

function parseFeeItems(contents) {
  return contents
    .split(',')
    .map((part) => {
      const [label, amountRaw] = part.split(':').map((s) => s?.trim())
      const amount = Number((amountRaw ?? '').replace(/[^0-9]/g, ''))
      return { label, amount }
    })
    .filter((item) => item.label && Number.isFinite(item.amount) && item.amount > 0)
}

// 기존 mock 18개는 실제 손으로 정한 값 유지, 그 밖의 신규 자격증은 jmCd에서 결정적으로 뽑은 값 사용.
const PASS_RATE_BASE = {
  '0752': 812, '0080': 640, '0490': 905, '1320': 21400, '2290': 4300, '1150': 18700,
  '9762': 1200, '9763': 3800, '0960': 450, '1790': 5200, '2434': 2100, '1512': 1800,
  '2432': 1300, '1982': 2600, '2982': 1100, '7798': 3400, '6793': 900, '7796': 4700,
}

function hashBase(jmCd) {
  let hash = 0
  for (const ch of jmCd) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return 300 + (hash % 25000)
}

function buildPassRateSummary(base) {
  const years = [2021, 2022, 2023, 2024, 2025].map((year, i) => {
    const applicants = base + i * 137
    const rate = Math.round((base % 40) + 25 + i * 1.5)
    const passers = Math.round((applicants * rate) / 100)
    return { year, applicants, passers, passRate: rate }
  })
  const averageRate = Math.round(years.reduce((sum, y) => sum + y.passRate, 0) / years.length)
  return { years, averageRate }
}

async function upsertInBatches(table, rows, onConflict, batchSize = 500) {
  let done = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from(table).upsert(batch, { onConflict })
    if (error) {
      console.error(`  ✘ ${table} 배치 ${i}~${i + batch.length}: ${error.message}`)
    } else {
      done += batch.length
    }
  }
  console.log(`  ✔ ${table}: ${done}/${rows.length}건`)
}

async function main() {
  const qualifications = await readJson('qualifications.json')
  const byJmCd = new Map(qualifications.map((q) => [q.jmcd, q]))
  const targetCodes = await listFetchedJmCodes()
  console.log(`대상 자격증: ${targetCodes.length}개\n`)

  console.log('=== certificates ===')
  const certificateRows = []
  for (const jmCd of targetCodes) {
    const q = byJmCd.get(jmCd)
    if (!q) continue
    certificateRows.push({
      jm_cd: q.jmcd,
      name: q.jmfldnm,
      qualification_type_code: q.qualgbcd,
      qualification_type_name: q.qualgbnm,
      series_code: q.seriescd,
      series_name: q.seriesnm,
      job_field_code: q.obligfldcd,
      job_field_name: q.obligfldnm,
      mid_job_field_code: q.mdobligfldcd,
      mid_job_field_name: q.mdobligfldnm,
    })
  }
  await upsertInBatches('certificates', certificateRows, 'jm_cd')

  console.log('\n=== exam_schedules ===')
  const scheduleRows = []
  for (const jmCd of targetCodes) {
    const schedule = await readJson(`certificates/${jmCd}/schedule.json`)
    if (!schedule) continue
    for (const item of schedule) {
      const parsed = parseYearRound(item.implplannm ?? '')
      if (!parsed) continue
      scheduleRows.push({
        jm_cd: jmCd,
        year: parsed.year,
        round: parsed.round,
        stages: buildStages(item),
      })
    }
  }
  await upsertInBatches('exam_schedules', scheduleRows, 'jm_cd,year,round')

  console.log('\n=== exam_fees ===')
  const feeRows = []
  for (const jmCd of targetCodes) {
    const fee = await readJson(`certificates/${jmCd}/fee.json`)
    if (!fee || fee.length === 0) continue
    const items = fee.flatMap((f) => parseFeeItems(f.contents ?? ''))
    if (items.length === 0) continue
    feeRows.push({ jm_cd: jmCd, items })
  }
  await upsertInBatches('exam_fees', feeRows, 'jm_cd')

  console.log('\n=== exam_subjects ===')
  const subjectRows = []
  for (const jmCd of targetCodes) {
    const subjects = await readJson(`certificates/${jmCd}/subjects.json`)
    if (!subjects) continue
    for (const s of subjects) {
      const order = Number(s.kmOrder)
      if (!Number.isFinite(order)) continue
      subjectRows.push({
        jm_cd: jmCd,
        type: s.dtlTypNm ?? '',
        subject_name: s.kmNm ?? '',
        subject_order: order,
        is_required: (s.kmYn ?? '').includes('필수'),
        optional_field_name: s.selfldNm ?? '',
        full_score: Number(s.omrStdPnt) || 0,
        total_questions: Number(s.qitemCnt) || 0,
        duration_minutes: Number(s.suhmTmMi) || 0,
      })
    }
  }
  await upsertInBatches('exam_subjects', subjectRows, 'jm_cd,type,subject_order')

  console.log('\n=== pass_rates (mock 값) ===')
  const passRateRows = targetCodes.map((jmCd) => {
    const base = PASS_RATE_BASE[jmCd] ?? hashBase(jmCd)
    const { years, averageRate } = buildPassRateSummary(base)
    return { jm_cd: jmCd, years, average_rate: averageRate }
  })
  await upsertInBatches('pass_rates', passRateRows, 'jm_cd')

  console.log('\n✅ 완료')
}

main().catch((err) => {
  console.error('❌ 실패:', err)
  process.exit(1)
})
