// data/qnet/(Q-net 실데이터 스냅샷)를 읽어서 supabase/seed.sql을 생성하는 스크립트.
// 네트워크 호출도, API 키도 전혀 안 쓰는 순수 로컬 변환 스크립트라 민감정보가 아예 없음.
// 실행: node scripts/generate-seed-sql.mjs
// 적용: npx supabase db push --include-seed
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const QNET_DIR = path.join(ROOT, 'data/qnet')

// data/qnet/certificates/ 아래에 실제로 받아둔 자격증 전부를 대상으로 함
// (fetch-qnet-snapshot.mjs --all로 613개를 받았으면 613개, 기존 18개만 받았으면 18개)
async function listFetchedJmCodes() {
  const entries = await readdir(path.join(QNET_DIR, 'certificates'), { withFileTypes: true })
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlJson(value) {
  return `$qnetjson$${JSON.stringify(value)}$qnetjson$::jsonb`
}

async function readJson(relPath) {
  try {
    const raw = await readFile(path.join(QNET_DIR, relPath), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function parseYearRound(implplannm) {
  const match = implplannm.match(/(\d{4})년.*?(\d+)회/)
  if (!match) return null
  return { year: Number(match[1]), round: Number(match[2]) }
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

function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v))
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

// src/mocks/passRates.ts의 buildSummary 로직을 그대로 옮김 (전부 알고리즘으로 생성한 자리표시자 값).
// 1321(정보처리산업기사)/7793(전기기사)의 base 값은 코드 수정된 2290/1150으로 그대로 이전.
// 1322(정보처리기능사)는 폐지된 자격증이라 제외.
const PASS_RATE_BASE = {
  '0752': 812, '0080': 640, '0490': 905, '1320': 21400, '2290': 4300, '1150': 18700,
  '9762': 1200, '9763': 3800, '0960': 450, '1790': 5200, '2434': 2100, '1512': 1800,
  '2432': 1300, '1982': 2600, '2982': 1100, '7798': 3400, '6793': 900, '7796': 4700,
}

// PASS_RATE_BASE에 없는(기존 18개 밖의) 자격증은 jmCd에서 결정적으로 뽑아낸 값을 씀 —
// 실행할 때마다 값이 안 바뀌면서도 자격증마다 다른 숫자가 나오게 함.
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

async function main() {
  const lines = []
  lines.push('-- Q-net 실데이터 스냅샷(data/qnet/) 기준으로 자동 생성된 시드 데이터.')
  lines.push('-- pass_rates만 예외로 mock 값(알고리즘 생성 자리표시자) 사용 — Q-net이 종목별 합격률을 안 줌.')
  lines.push('-- 재생성: node scripts/generate-seed-sql.mjs')
  lines.push('')

  const qualifications = await readJson('qualifications.json')
  const byJmCd = new Map(qualifications.map((q) => [q.jmcd, q]))
  const targetCodes = await listFetchedJmCodes()
  console.log(`대상 자격증: ${targetCodes.length}개`)

  lines.push('-- certificates')
  for (const jmCd of targetCodes) {
    const q = byJmCd.get(jmCd)
    if (!q) {
      console.warn(`[경고] qualifications.json에 ${jmCd}가 없어서 certificates row를 못 만듦`)
      continue
    }
    lines.push(
      `insert into public.certificates (jm_cd, name, qualification_type_code, qualification_type_name, series_code, series_name, job_field_code, job_field_name, mid_job_field_code, mid_job_field_name, updated_at) values (` +
        [
          sqlStr(q.jmcd),
          sqlStr(q.jmfldnm),
          sqlStr(q.qualgbcd),
          sqlStr(q.qualgbnm),
          sqlStr(q.seriescd),
          sqlStr(q.seriesnm),
          sqlStr(q.obligfldcd),
          sqlStr(q.obligfldnm),
          sqlStr(q.mdobligfldcd),
          sqlStr(q.mdobligfldnm),
          'now()',
        ].join(', ') +
        `) on conflict (jm_cd) do update set name = excluded.name, qualification_type_code = excluded.qualification_type_code, qualification_type_name = excluded.qualification_type_name, series_code = excluded.series_code, series_name = excluded.series_name, job_field_code = excluded.job_field_code, job_field_name = excluded.job_field_name, mid_job_field_code = excluded.mid_job_field_code, mid_job_field_name = excluded.mid_job_field_name, updated_at = now();`
    )
  }
  lines.push('')

  lines.push('-- exam_schedules')
  for (const jmCd of targetCodes) {
    const schedule = await readJson(`certificates/${jmCd}/schedule.json`)
    if (!schedule) continue
    for (const item of schedule) {
      const parsed = parseYearRound(item.implplannm ?? '')
      if (!parsed) {
        console.warn(`[건너뜀] ${jmCd}: "${item.implplannm}"에서 연도/회차를 못 뽑음`)
        continue
      }
      const stages = buildStages(item)
      lines.push(
        `insert into public.exam_schedules (jm_cd, year, round, stages, updated_at) values (` +
          [sqlStr(jmCd), parsed.year, parsed.round, sqlJson(stages), 'now()'].join(', ') +
          `) on conflict (jm_cd, year, round) do update set stages = excluded.stages, updated_at = now();`
      )
    }
  }
  lines.push('')

  lines.push('-- exam_fees')
  for (const jmCd of targetCodes) {
    const fee = await readJson(`certificates/${jmCd}/fee.json`)
    if (!fee || fee.length === 0) continue
    const items = fee.flatMap((f) => parseFeeItems(f.contents ?? ''))
    if (items.length === 0) continue
    lines.push(
      `insert into public.exam_fees (jm_cd, items, updated_at) values (` +
        [sqlStr(jmCd), sqlJson(items), 'now()'].join(', ') +
        `) on conflict (jm_cd) do update set items = excluded.items, updated_at = now();`
    )
  }
  lines.push('')

  lines.push('-- exam_subjects')
  for (const jmCd of targetCodes) {
    const subjects = await readJson(`certificates/${jmCd}/subjects.json`)
    if (!subjects) continue
    for (const s of subjects) {
      const order = Number(s.kmOrder)
      if (!Number.isFinite(order)) continue
      lines.push(
        `insert into public.exam_subjects (jm_cd, type, subject_name, subject_order, is_required, optional_field_name, full_score, total_questions, duration_minutes, updated_at) values (` +
          [
            sqlStr(jmCd),
            sqlStr(s.dtlTypNm ?? ''),
            sqlStr(s.kmNm ?? ''),
            order,
            (s.kmYn ?? '').includes('필수'),
            sqlStr(s.selfldNm ?? ''),
            Number(s.omrStdPnt) || 0,
            Number(s.qitemCnt) || 0,
            Number(s.suhmTmMi) || 0,
            'now()',
          ].join(', ') +
          `) on conflict (jm_cd, type, subject_order) do update set subject_name = excluded.subject_name, is_required = excluded.is_required, optional_field_name = excluded.optional_field_name, full_score = excluded.full_score, total_questions = excluded.total_questions, duration_minutes = excluded.duration_minutes, updated_at = now();`
      )
    }
  }
  lines.push('')

  lines.push('-- pass_rates (mock 값 — Q-net 실데이터 없음)')
  for (const jmCd of targetCodes) {
    const base = PASS_RATE_BASE[jmCd] ?? hashBase(jmCd)
    const { years, averageRate } = buildPassRateSummary(base)
    lines.push(
      `insert into public.pass_rates (jm_cd, years, average_rate, updated_at) values (` +
        [sqlStr(jmCd), sqlJson(years), averageRate, 'now()'].join(', ') +
        `) on conflict (jm_cd) do update set years = excluded.years, average_rate = excluded.average_rate, updated_at = now();`
    )
  }
  lines.push('')

  const outPath = path.join(ROOT, 'supabase/seed.sql')
  await writeFile(outPath, lines.join('\n'), 'utf-8')
  console.log(`✅ supabase/seed.sql 생성 완료 (${lines.length}줄)`)
}

main().catch((err) => {
  console.error('❌ 실패:', err)
  process.exit(1)
})
