// Q-net API를 실제로 호출해서 data/qnet/ 아래에 JSON으로 저장하는 스크립트.
// 기본은 지금 앱이 쓰는 18개 자격증만 갱신하고, --all을 주면 qualifications.json에 있는
// 국가자격 전체(613개, 2026-09-14 기준)를 대상으로 함.
// 실행: node --env-file=.env scripts/fetch-qnet-snapshot.mjs [--all]
// 중간에 끊겨도 이미 받아둔 자격증(subjects.json 존재)은 건너뛰고 이어서 받음.
//
// --retry-missing-schedules: schedule.json이 없는 자격증만 대상으로 InquiryTestInformationNTQSVC/getJMList를
// 더 너그러운 조건(재시도 4번, 타임아웃 20초)으로 다시 시도. 등급별(정기 회차) API에서 값을 빌려오는
// 방식은 "그 자격증 본인의 데이터라고 API가 확인해준 게 아니다"라는 이유로 채택 안 하기로 했고
// (2026-09-14 결정), 그 대신 원래 쓰던 자격증별 getJMList를 다시 두드리는 이 방식만 쓰기로 함 —
// 재시도해서 성공하면 100% 그 자격증 본인 데이터, 끝까지 실패하면 그냥 없는 채로 둠(추측 안 함).
// 실행: node --env-file=.env scripts/fetch-qnet-snapshot.mjs --retry-missing-schedules
import { XMLParser } from 'fast-xml-parser'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const FETCH_ALL = process.argv.includes('--all')
const RETRY_MISSING_SCHEDULES = process.argv.includes('--retry-missing-schedules')

const SERVICE_KEY = process.env.QNET_API_KEY
if (!SERVICE_KEY) {
  console.error('QNET_API_KEY가 없습니다. .env 파일을 확인하세요.')
  process.exit(1)
}

const BASE_URL = 'http://openapi.q-net.or.kr/api/service/rest'
const OUT_DIR = path.resolve(import.meta.dirname, '../data/qnet')
// jmcd 앞자리 0, brchCd "00" 같은 코드값이 숫자로 변환되며 깨지는 걸 막기 위해 끔
const parser = new XMLParser({ parseTagValue: false })

// src/mocks/certificates.ts와 동일한 jmCd 목록.
// 2026-09-14 재검증: 1321(정보처리산업기사)은 실제 코드가 2290, 7793(전기기사)은 1150으로 확인돼 수정.
// 1322(정보처리기능사)는 국가기술자격 목록 자체에 없는 폐지된 자격증이라 제외(18개로 축소).
const JM_CODES = [
  '0752', '0080', '0490', '1320', '2290', '1150', '9762', '9763',
  '0960', '1790', '2434', '1512', '2432', '1982', '2982', '7798', '6793', '7796',
]

function toArray(value) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callApi(path, params, { retries = 2, timeoutMs = 10_000, backoffMs = 400 } = {}) {
  const url = new URL(`${BASE_URL}/${path}`)
  url.searchParams.set('serviceKey', SERVICE_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let resultCode
    let json

    try {
      // Q-net이 요청을 받고도 응답을 안 주는 경우가 있어서, 시간 넘으면 포기하고 재시도하도록 타임아웃 추가
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
      const xmlText = await res.text()
      json = parser.parse(xmlText)
      resultCode = json?.response?.header?.resultCode
    } catch (err) {
      if (attempt < retries) {
        await sleep(backoffMs)
        continue
      }
      throw new Error(`[${path}?${new URLSearchParams(params)}] ${err.message}`)
    }

    if (resultCode === '00') {
      return toArray(json?.response?.body?.items?.item)
    }

    if (attempt < retries) {
      await sleep(backoffMs)
      continue
    }

    throw new Error(`[${path}?${new URLSearchParams(params)}] resultCode=${resultCode}`)
  }
}

async function writeJson(relPath, data) {
  const fullPath = path.join(OUT_DIR, relPath)
  await mkdir(path.dirname(fullPath), { recursive: true })
  await writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`  ✔ ${relPath}`)
}

async function fileExists(relPath) {
  try {
    await readFile(path.join(OUT_DIR, relPath))
    return true
  } catch {
    return false
  }
}

async function retryMissingSchedules() {
  const raw = await readFile(path.join(OUT_DIR, 'qualifications.json'), 'utf-8')
  const qualifications = JSON.parse(raw)
  const targetCodes = qualifications.map((q) => q.jmcd)

  let alreadyHad = 0
  let recovered = 0
  let stillFailed = 0

  for (const jmCd of targetCodes) {
    if (await fileExists(`certificates/${jmCd}/schedule.json`)) {
      alreadyHad += 1
      continue
    }

    console.log(`[${jmCd}] schedule 재시도 중...`)
    try {
      const schedule = await callApi(
        'InquiryTestInformationNTQSVC/getJMList',
        { jmCd },
        { retries: 3, timeoutMs: 15_000, backoffMs: 800 },
      )
      await writeJson(`certificates/${jmCd}/schedule.json`, schedule)
      recovered += 1
    } catch (err) {
      console.log(`  ✘ 여전히 실패: ${err.message}`)
      stillFailed += 1
    }
    await sleep(500)
  }

  console.log(
    `\n✅ 재시도 완료. 이미 있었음: ${alreadyHad}개, 새로 받음: ${recovered}개, 끝까지 실패: ${stillFailed}개`,
  )
}

async function main() {
  if (RETRY_MISSING_SCHEDULES) {
    await retryMissingSchedules()
    return
  }

  console.log('=== 국가자격 종목 전체 목록 ===')
  const qualifications = await callApi('InquiryListNationalQualifcationSVC/getList', {
    pageNo: 1,
    numOfRows: 1000,
  })
  console.log(`${qualifications.length}건 수신`)
  await writeJson('qualifications.json', qualifications)

  console.log('\n=== 계열 규칙 (InquirySeriesSVC/getRule) ===')
  const seriesRules = await callApi('InquirySeriesSVC/getRule', { pageNo: 1, numOfRows: 100 })
  await writeJson('series-rules.json', seriesRules)

  // 시험장 정보(InquiryExamAreaSVC/InquiryTestSiteSVC)와 연도별 통계(InquiryStatSVC)는
  // 이미 폐기하기로 확정한 기능/못 쓰기로 확인된 데이터라 더 이상 스냅샷을 안 받음
  // (자세한 근거는 PROGRESS.md "시험장 정보 기능" 섹션 참고).

  const targetCodes = FETCH_ALL ? qualifications.map((q) => q.jmcd) : JM_CODES
  console.log(`\n=== 종목별 상세 (${targetCodes.length}개, ${FETCH_ALL ? '전체' : '기존 18개'}) ===`)

  let skipped = 0
  for (const jmCd of targetCodes) {
    if (await fileExists(`certificates/${jmCd}/subjects.json`)) {
      skipped += 1
      continue
    }

    console.log(`\n[${jmCd}]`)

    try {
      const schedule = await callApi('InquiryTestInformationNTQSVC/getJMList', { jmCd })
      await writeJson(`certificates/${jmCd}/schedule.json`, schedule)
    } catch (err) {
      console.log(`  ✘ schedule: ${err.message}`)
    }
    await sleep(200)

    try {
      const fee = await callApi('InquiryTestInformationNTQSVC/getFeeList', { jmCd })
      await writeJson(`certificates/${jmCd}/fee.json`, fee)
    } catch (err) {
      console.log(`  ✘ fee: ${err.message}`)
    }
    await sleep(200)

    try {
      const subjects = await callApi('InquiryExamKmInfo/getList', { jmCd, pageNo: 1, numOfRows: 100 })
      await writeJson(`certificates/${jmCd}/subjects.json`, subjects)
    } catch (err) {
      console.log(`  ✘ subjects: ${err.message}`)
    }
    await sleep(200)
  }

  console.log(`\n✅ 완료 (이미 있어서 건너뜀: ${skipped}개). data/qnet/ 아래 파일들을 확인하세요.`)
}

main().catch((err) => {
  console.error('❌ 실패:', err)
  process.exit(1)
})
