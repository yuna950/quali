import type { ExamFee } from '@/types/certificate'

/** 1320(정보처리기사)은 2026-09-08 Q-net InquiryTestInformationNTQSVC/getFeeList 실측 응답(원문 텍스트)을 구조화해 반영 */
export const mockExamFees: Record<string, ExamFee> = {
  '0752': { jmCd: '0752', items: [{ label: '필기', amount: 67800 }, { label: '면접', amount: 63800 }] },
  '0080': { jmCd: '0080', items: [{ label: '필기', amount: 67800 }, { label: '면접', amount: 63800 }] },
  '0490': { jmCd: '0490', items: [{ label: '필기', amount: 67800 }, { label: '면접', amount: 63800 }] },
  '1320': { jmCd: '1320', items: [{ label: '1차', amount: 19400 }, { label: '2차', amount: 22600 }] },
  '1321': { jmCd: '1321', items: [{ label: '1차', amount: 19400 }, { label: '2차', amount: 20800 }] },
  '1322': { jmCd: '1322', items: [{ label: '1차', amount: 14500 }, { label: '2차', amount: 17200 }] },
  '7793': { jmCd: '7793', items: [{ label: '1차', amount: 19400 }, { label: '2차', amount: 22600 }] },
  '9762': { jmCd: '9762', items: [{ label: '1차', amount: 20000 }, { label: '2차', amount: 20000 }] },
  '9763': { jmCd: '9763', items: [{ label: '1차', amount: 20000 }, { label: '2차', amount: 20000 }] },
  '7798': { jmCd: '7798', items: [{ label: '필기', amount: 14500 }, { label: '실기', amount: 17200 }] },
}
