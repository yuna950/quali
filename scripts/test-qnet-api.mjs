// Supabase Edge Function 이전에, "서버에서 Q-net API를 호출하고 XML을 JSON으로
// 파싱한다"는 핵심 파이프라인이 실제로 동작하는지 확인하기 위한 로컬 검증 스크립트.
// 실행: node --env-file=.env scripts/test-qnet-api.mjs
import { XMLParser } from 'fast-xml-parser'

const SERVICE_KEY = process.env.QNET_API_KEY
if (!SERVICE_KEY) {
  console.error('QNET_API_KEY가 없습니다. .env 파일을 확인하세요.')
  process.exit(1)
}

const BASE_URL = 'http://openapi.q-net.or.kr/api/service/rest'
// parseTagValue: false — 안 하면 jmcd="0080", brchCd="00" 같은 코드값의 앞자리 0이
// 숫자 변환 과정에서 날아간다 (실측 확인됨). 코드값이 많은 API라 반드시 꺼야 함.
const parser = new XMLParser({ parseTagValue: false })

function toArray(value) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

async function callApi(path, params) {
  const url = new URL(`${BASE_URL}/${path}`)
  url.searchParams.set('serviceKey', SERVICE_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url)
  const xmlText = await res.text()
  const json = parser.parse(xmlText)

  const resultCode = json?.response?.header?.resultCode
  const resultMsg = json?.response?.header?.resultMsg
  if (resultCode !== '00') {
    throw new Error(`[${path}] resultCode=${resultCode} ${resultMsg}`)
  }

  return toArray(json?.response?.body?.items?.item)
}

async function main() {
  console.log('=== 1. 국가자격 종목 목록 (앞 3건만 출력) ===')
  const quals = await callApi('InquiryListNationalQualifcationSVC/getList', { pageNo: 1, numOfRows: 3 })
  console.log(`총 ${quals.length}건 수신`)
  console.log(JSON.stringify(quals.slice(0, 3), null, 2))

  console.log('\n=== 2. 시험일정 (jmCd=1320 정보처리기사) ===')
  const schedule = await callApi('InquiryTestInformationNTQSVC/getJMList', { jmCd: '1320' })
  console.log(JSON.stringify(schedule, null, 2))

  console.log('\n=== 3. 응시수수료 (jmCd=1320) ===')
  const fee = await callApi('InquiryTestInformationNTQSVC/getFeeList', { jmCd: '1320' })
  console.log(JSON.stringify(fee, null, 2))

  console.log('\n✅ 서버 사이드 호출 + XML→JSON 파싱 정상 동작 확인')
}

main().catch((err) => {
  console.error('❌ 실패:', err.message)
  process.exit(1)
})
