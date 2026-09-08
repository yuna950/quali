import type { PassRateSummary } from '@/types/certificate'

/**
 * Q-net InquiryStatSVC/getTotExamList는 종목별(jmCd) 데이터가 아니라 자격 등급 구간별
 * 전체 응시자/합격자 집계만 제공하는 것으로 실측 확인됨 (2026-09-08).
 * 종목별 합격률은 현재 목데이터로만 존재하며, 실제 데이터 소스는 Supabase 연동 단계에서 별도 검토 필요.
 */
function buildSummary(jmCd: string, base: number): PassRateSummary {
  const years = [2021, 2022, 2023, 2024, 2025].map((year, i) => {
    const applicants = base + i * 137
    const rate = Math.round((base % 40) + 25 + i * 1.5)
    const passers = Math.round((applicants * rate) / 100)
    return { year, applicants, passers, passRate: rate }
  })
  const averageRate = Math.round(years.reduce((sum, y) => sum + y.passRate, 0) / years.length)
  return { jmCd, years, averageRate }
}

export const mockPassRates: Record<string, PassRateSummary> = {
  '0752': buildSummary('0752', 812),
  '0080': buildSummary('0080', 640),
  '0490': buildSummary('0490', 905),
  '1320': buildSummary('1320', 21400),
  '1321': buildSummary('1321', 4300),
  '1322': buildSummary('1322', 6100),
  '7793': buildSummary('7793', 18700),
  '9762': buildSummary('9762', 1200),
  '9763': buildSummary('9763', 3800),
  '0960': buildSummary('0960', 450),
  '1790': buildSummary('1790', 5200),
  '2434': buildSummary('2434', 2100),
  '1512': buildSummary('1512', 1800),
  '2432': buildSummary('2432', 1300),
  '1982': buildSummary('1982', 2600),
  '2982': buildSummary('2982', 1100),
  '7798': buildSummary('7798', 3400),
  '6793': buildSummary('6793', 900),
  '7796': buildSummary('7796', 4700),
}
