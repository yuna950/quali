// 매주 pg_cron이 호출하는 Edge Function. 이미 exam_schedules에 데이터가 있는 자격증만
// 대상으로 Q-net에 다시 물어봐서 최신 회차/날짜로 갱신한다 (v1이라 신규 자격증 감지는 안 함 —
// PROGRESS.md "⑦" 섹션 참고).
//
// 자격증 코드(jmCd)로 직접 조회하는 API만 쓴다 — 등급별로 통째로 받아오는 API도 있지만, 그건
// 특정 자격증 데이터라고 API가 확인해주는 게 아니라서(PROGRESS.md "⑧" 섹션 참고) 안 씀.
//
// 배포: npx supabase functions deploy sync-exam-schedules --no-verify-jwt
// 시크릿: npx supabase secrets set QNET_API_KEY=...
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { XMLParser } from 'npm:fast-xml-parser@4'

const QNET_API_KEY = Deno.env.get('QNET_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const BASE_URL = 'http://openapi.q-net.or.kr/api/service/rest'
const parser = new XMLParser({ parseTagValue: false })
const CONCURRENCY = 20

function toArray(value: unknown) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function compact<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v))
}

function parseYearRound(implplannm: string) {
  const match = implplannm.match(/(\d{4})년.*?(\d+)회/)
  if (!match) return null
  return { year: Number(match[1]), round: Number(match[2]) }
}

// deno-lint-ignore no-explicit-any
function buildStages(item: any) {
  const stages: Record<string, unknown> = {}
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

// deno-lint-ignore no-explicit-any
async function fetchSchedule(jmCd: string): Promise<any[]> {
  const url = new URL(`${BASE_URL}/InquiryTestInformationNTQSVC/getJMList`)
  url.searchParams.set('serviceKey', QNET_API_KEY!)
  url.searchParams.set('jmCd', jmCd)

  const res = await fetch(url, { signal: AbortSignal.timeout(6_000) })
  const xmlText = await res.text()
  const json = parser.parse(xmlText)
  const resultCode = json?.response?.header?.resultCode
  if (resultCode !== '00') throw new Error(`resultCode=${resultCode}`)
  return toArray(json?.response?.body?.items?.item)
}

async function syncOne(supabase: ReturnType<typeof createClient>, jmCd: string) {
  const schedule = await fetchSchedule(jmCd)
  for (const item of schedule) {
    const parsed = parseYearRound(item.implplannm ?? '')
    if (!parsed) continue
    const stages = buildStages(item)
    const { error } = await supabase
      .from('exam_schedules')
      .upsert(
        { jm_cd: jmCd, year: parsed.year, round: parsed.round, stages, updated_at: new Date().toISOString() },
        { onConflict: 'jm_cd,year,round' },
      )
    if (error) throw error
  }
}

Deno.serve(async () => {
  if (!QNET_API_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: '환경변수(QNET_API_KEY 등)가 설정 안 됨' }), { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data, error } = await supabase.from('exam_schedules').select('jm_cd')
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const jmCds = [...new Set((data ?? []).map((row) => row.jm_cd as string))]

  let success = 0
  let failed = 0

  for (let i = 0; i < jmCds.length; i += CONCURRENCY) {
    const batch = jmCds.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map((jmCd) => syncOne(supabase, jmCd)))
    for (const result of results) {
      if (result.status === 'fulfilled') success += 1
      else failed += 1
    }
  }

  return new Response(JSON.stringify({ total: jmCds.length, success, failed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
