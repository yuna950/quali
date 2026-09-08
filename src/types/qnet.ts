/**
 * Q-net 공공데이터 API 원본 응답 필드 타입.
 * 필드명은 2026-09-08에 실제 API를 호출해 확인한 값을 그대로 반영함(XML -> JSON 변환 후 형태).
 * 이 타입들은 나중에 Supabase Edge Function이 XML을 파싱할 때도 동일하게 참고한다.
 */

/** InquiryListNationalQualifcationSVC/getList - 국가자격 종목(자격명) 정보 */
export interface QnetQualificationItem {
  jmcd: string
  jmfldnm: string
  mdobligfldcd: string
  mdobligfldnm: string
  obligfldcd: string
  obligfldnm: string
  qualgbcd: string
  qualgbnm: string
  seriescd: string
  seriesnm: string
}

/** InquiryTestInformationNTQSVC/getJMList - 종목별 시험 시행일정 */
export interface QnetExamScheduleItem {
  implplannm: string
  jmfldnm: string
  mdobligfldcd: string
  mdobligfldnm: string
  obligfldcd: string
  obligfldnm: string
  docregstartdt: string
  docregenddt: string
  docexamstartdt: string
  docexamenddt: string
  docpassdt: string
  docsubmitstartdt: string
  docsubmitenddt: string
  pracregstartdt: string
  pracregenddt: string
  pracexamstartdt: string
  pracexamenddt: string
  pracpassstartdt: string
  pracpassenddt: string
}

/** InquiryTestInformationNTQSVC/getFeeList - 응시 수수료 */
export interface QnetFeeItem {
  infogb: string
  contents: string
  jmfldnm: string
  mdobligfldcd: string
  mdobligfldnm: string
  obligfldcd: string
  obligfldnm: string
}

/** InquiryExamKmInfo/getList - 시험 과목 정보 */
export interface QnetExamSubjectItem {
  jmNm: string
  dtlTypNm: string
  kmNm: string
  kmOrder: string
  kmYn: string
  lssnNo: string
  omrStdPnt: string
  qitemCnt: string
  selfldNm: string
  seqNo: string
  suhmTmMi: string
}

/** InquiryExamAreaSVC/getList - 시험장소 기본정보 */
export interface QnetExamAreaItem {
  brchCd: string
  brchNm: string
  examAreaGbNm: string
  examAreaNm: string
  address: string
  plceLoctGid: string
  telNo: string
}

/** InquiryTestSiteSVC/getList - CBT 시설여부 + 세부 장소코드 */
export interface QnetTestSiteItem {
  brchNm: string
  areaRole: string
  examAreaNm: string
  cbtFcltyYnCcd: string
}

/**
 * InquirySeriesSVC/getRule - 계열/대직무분야 코드
 * 실측 결과 이 API는 코드 매핑표가 아니라 계열별 시행 규칙(Y/N) 목록을 반환함.
 * seriesCd/seriesNm은 부가 필드로 포함되어 있어 계열 코드-이름 매핑 용도로만 활용 가능.
 * 대직무분야(obligfldcd/obligfldnm)는 QnetQualificationItem에서 얻는다.
 */
export interface QnetSeriesRuleItem {
  seriesCd: string
  seriesNm: string
  srRuleNm: string
  srRuleYn: 'Y' | 'N'
}

/**
 * InquiryStatSVC/getTotExamList - 연도별 응시자/합격자 수
 * 실측 결과 jmCd 파라미터를 받지 않고, 종목별이 아닌 자격 등급 구간별 전체 집계만 반환함.
 * 종목별(jmCd별) 합격률 산출에는 별도 검토가 필요 - 지금은 목데이터로 대체.
 */
export interface QnetTotExamStatItem {
  [key: string]: string
}
