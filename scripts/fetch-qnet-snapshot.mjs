// 지금 앱의 mock 자격증 19개를 기준으로 Q-net API를 실제로 호출해서
// data/qnet/ 아래에 JSON으로 저장하는 스크립트. Supabase 연동 전, 실제 데이터를
// 로컬에서 눈으로 확인하기 위한 용도.
// 실행: node --env-file=.env scripts/fetch-qnet-snapshot.mjs
import { XMLParser } from 'fast-xml-parser'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SERVICE_KEY = process.env.QNET_API_KEY
if (!SERVICE_KEY) {
  console.error('QNET_API_KEY가 없습니다. .env 파일을 확인하세요.')
  process.exit(1)
}

const BASE_URL = 'http://openapi.q-net.or.kr/api/service/rest'
const OUT_DIR = path.resolve(import.meta.dirname, '../data/qnet')
// jmcd 앞자리 0, brchCd "00" 같은 코드값이 숫자로 변환되며 깨지는 걸 막기 위해 끔
const parser = new XMLParser({ parseTagValue: false })

// src/mocks/certificates.ts와 동일한 jmCd 목록
const JM_CODES = [
  '0752', '0080', '0490', '1320', '1321', '1322', '7793', '9762', '9763',
  '0960', '1790', '2434', '1512', '2432', '1982', '2982', '7798', '6793', '7796',
]

function toArray(value) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callApi(path, params, { retries = 2 } = {}) {
  const url = new URL(`${BASE_URL}/${path}`)
  url.searchParams.set('serviceKey', SERVICE_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch(url)
    const xmlText = await res.text()
    const json = parser.parse(xmlText)
    const resultCode = json?.response?.header?.resultCode

    if (resultCode === '00') {
      return toArray(json?.response?.body?.items?.item)
    }

    if (attempt < retries) {
      await sleep(400)
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

async function main() {
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

  console.log('\n=== 시험장소 기본정보 (brchCd=01 서울) ===')
  const examAreas = await callApi('InquiryExamAreaSVC/getList', { brchCd: '01', pageNo: 1, numOfRows: 50 })
  await writeJson('exam-areas/01-seoul.json', examAreas)

  console.log('\n=== CBT 시설여부 (brchCd=01 서울) ===')
  const testSites = await callApi('InquiryTestSiteSVC/getList', { brchCd: '01', pageNo: 1, numOfRows: 50 })
  await writeJson('test-sites/01-seoul.json', testSites)

  console.log('\n=== 연도별 응시자/합격자 수 (baseYY=2023) ===')
  const stat = await callApi('InquiryStatSVC/getTotExamList', { baseYY: '2023' })
  await writeJson('stats/2023.json', stat)

  console.log(`\n=== 종목별 상세 (${JM_CODES.length}개) ===`)
  for (const jmCd of JM_CODES) {
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

  console.log(`\n✅ 완료. data/qnet/ 아래 파일들을 확인하세요.`)
}

main().catch((err) => {
  console.error('❌ 실패:', err)
  process.exit(1)
})
