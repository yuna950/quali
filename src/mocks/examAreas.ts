import type { ExamArea, TestSite } from '@/types/certificate'

/** InquiryExamAreaSVC/getList 응답 형태를 참고한 시험장소 예시 데이터 */
export const mockExamAreas: ExamArea[] = [
  { branchCode: '01', branchName: '서울', areaType: '대학교', areaName: '서울대학교', address: '서울특별시 관악구 관악로 1', phone: '02-880-5114' },
  { branchCode: '01', branchName: '서울', areaType: '고등학교', areaName: '경복고등학교', address: '서울특별시 종로구 자하문로 46', phone: '02-737-1231' },
  { branchCode: '10', branchName: '경기', areaType: '대학교', areaName: '수원대학교', address: '경기도 화성시 봉담읍 와우안길 17', phone: '031-220-2114' },
  { branchCode: '03', branchName: '부산', areaType: '대학교', areaName: '부산대학교', address: '부산광역시 금정구 부산대학로63번길 2', phone: '051-510-0114' },
  { branchCode: '04', branchName: '대구', areaType: '고등학교', areaName: '대구고등학교', address: '대구광역시 수성구 동대구로 305', phone: '053-740-1500' },
]

export const mockTestSites: TestSite[] = [
  { branchName: '서울', areaName: '(1급)서울국가자격시험장', areaRole: '시험장', hasCbtFacility: true },
  { branchName: '경기', areaName: '수원CBT시험장', areaRole: '시험장', hasCbtFacility: true },
  { branchName: '부산', areaName: '부산국가자격시험장', areaRole: '시험장', hasCbtFacility: false },
]
