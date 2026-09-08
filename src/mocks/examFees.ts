import type { ExamFee } from '@/types/certificate'

/** 1320(정보처리기사)은 2026-09-08 Q-net InquiryTestInformationNTQSVC/getFeeList 실측 응답 반영 */
export const mockExamFees: Record<string, ExamFee> = {
  '0752': { jmCd: '0752', description: '필기 : 67800, 면접 : 63800' },
  '0080': { jmCd: '0080', description: '필기 : 67800, 면접 : 63800' },
  '0490': { jmCd: '0490', description: '필기 : 67800, 면접 : 63800' },
  '1320': { jmCd: '1320', description: '1차 : 19400, 2차 : 22600' },
  '1321': { jmCd: '1321', description: '1차 : 19400, 2차 : 20800' },
  '1322': { jmCd: '1322', description: '1차 : 14500, 2차 : 17200' },
  '7793': { jmCd: '7793', description: '1차 : 19400, 2차 : 22600' },
  '9762': { jmCd: '9762', description: '1차 : 20000, 2차 : 20000' },
  '9763': { jmCd: '9763', description: '1차 : 20000, 2차 : 20000' },
}
