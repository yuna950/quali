import type { ExamSchedule } from '@/types/certificate'

/**
 * 0752(가스기술사)는 2026-09-08 Q-net InquiryTestInformationNTQSVC/getJMList 실측 응답을 그대로 반영.
 * 그 외는 화면 개발용 예시 일정.
 */
export const mockExamSchedules: Record<string, ExamSchedule[]> = {
  '0752': [
    {
      jmCd: '0752',
      round: '2026년 정기 기술사 138회',
      stages: {
        written: {
          regStart: '20260106',
          regEnd: '20260109',
          examStart: '20260207',
          examEnd: '20260207',
          passDate: '20260325',
        },
        practical: {
          regStart: '20260303',
          regEnd: '20260402',
          examStart: '20260502',
          examEnd: '20260516',
          passStart: '20260529',
          passEnd: '20260728',
        },
      },
    },
  ],
  '0080': [
    {
      jmCd: '0080',
      round: '2026년 정기 기술사 138회',
      stages: {
        written: {
          regStart: '20260106',
          regEnd: '20260109',
          examStart: '20260208',
          examEnd: '20260208',
          passDate: '20260325',
        },
        practical: {
          regStart: '20260303',
          regEnd: '20260402',
          examStart: '20260509',
          examEnd: '20260523',
          passStart: '20260605',
          passEnd: '20260804',
        },
      },
    },
  ],
  '0490': [
    {
      jmCd: '0490',
      round: '2026년 정기 기술사 138회',
      stages: {
        written: {
          regStart: '20260106',
          regEnd: '20260109',
          examStart: '20260207',
          examEnd: '20260207',
          passDate: '20260325',
        },
        practical: {
          regStart: '20260303',
          regEnd: '20260402',
          examStart: '20260502',
          examEnd: '20260516',
          passStart: '20260529',
          passEnd: '20260728',
        },
      },
    },
  ],
  '1320': [
    {
      jmCd: '1320',
      round: '2026년 정기기사 1회',
      stages: {
        written: {
          regStart: '20260113',
          regEnd: '20260116',
          examStart: '20260207',
          examEnd: '20260207',
          passDate: '20260226',
        },
        practical: {
          regStart: '20260309',
          regEnd: '20260312',
          examStart: '20260411',
          examEnd: '20260428',
          passStart: '20260515',
          passEnd: '20260515',
        },
      },
    },
  ],
  '1321': [
    {
      jmCd: '1321',
      round: '2026년 정기산업기사 1회',
      stages: {
        written: {
          regStart: '20260113',
          regEnd: '20260116',
          examStart: '20260214',
          examEnd: '20260214',
          passDate: '20260305',
        },
        practical: {
          regStart: '20260316',
          regEnd: '20260319',
          examStart: '20260418',
          examEnd: '20260505',
          passStart: '20260522',
          passEnd: '20260522',
        },
      },
    },
  ],
  '1322': [
    {
      jmCd: '1322',
      round: '2026년 정기기능사 1회',
      stages: {
        written: {
          regStart: '20260106',
          regEnd: '20260109',
          examStart: '20260121',
          examEnd: '20260210',
          passDate: '20260218',
        },
        practical: {
          regStart: '20260302',
          regEnd: '20260305',
          examStart: '20260404',
          examEnd: '20260421',
          passStart: '20260508',
          passEnd: '20260508',
        },
      },
    },
  ],
  '7793': [
    {
      jmCd: '7793',
      round: '2026년 정기기사 1회',
      stages: {
        written: {
          regStart: '20260113',
          regEnd: '20260116',
          examStart: '20260215',
          examEnd: '20260215',
          passDate: '20260305',
        },
        practical: {
          regStart: '20260316',
          regEnd: '20260319',
          examStart: '20260418',
          examEnd: '20260508',
          passStart: '20260605',
          passEnd: '20260605',
        },
      },
    },
  ],
  '9762': [
    {
      jmCd: '9762',
      round: '2026년 제18회',
      stages: {
        written: {
          regStart: '20260601',
          regEnd: '20260605',
          examStart: '20260704',
          examEnd: '20260704',
          passDate: '20260812',
        },
        practical: {
          regStart: '20260901',
          regEnd: '20260904',
          examStart: '20261010',
          examEnd: '20261010',
          passStart: '20261127',
          passEnd: '20261127',
        },
      },
    },
  ],
  '9763': [
    {
      jmCd: '9763',
      round: '2026년 제12회',
      stages: {
        written: {
          regStart: '20260504',
          regEnd: '20260508',
          examStart: '20260606',
          examEnd: '20260606',
          passDate: '20260710',
        },
        practical: {
          regStart: '20260803',
          regEnd: '20260807',
          examStart: '20260912',
          examEnd: '20260912',
          passStart: '20261030',
          passEnd: '20261030',
        },
      },
    },
  ],
}
