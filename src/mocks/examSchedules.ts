import type { ExamSchedule } from '@/types/certificate'

/**
 * 0752(가스기술사)는 2026-09-08 Q-net InquiryTestInformationNTQSVC/getJMList 실측 응답을 그대로 반영.
 * 그 외는 화면 개발용 예시 일정.
 */
export const mockExamSchedules: Record<string, ExamSchedule[]> = {
  '0752': [
    {
      jmCd: '0752',
      year: 2026,
      round: 138,
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
      year: 2026,
      round: 138,
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
      year: 2026,
      round: 138,
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
      year: 2026,
      round: 1,
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
      year: 2026,
      round: 1,
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
      year: 2026,
      round: 1,
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
    {
      jmCd: '1322',
      year: 2026,
      round: 3,
      stages: {
        written: {
          regStart: '20260908',
          regEnd: '20260912',
          examStart: '20261003',
          examEnd: '20261016',
          passDate: '20261030',
        },
      },
    },
  ],
  '7793': [
    {
      jmCd: '7793',
      year: 2026,
      round: 1,
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
      year: 2026,
      round: 18,
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
      year: 2026,
      round: 12,
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
  '7798': [
    {
      jmCd: '7798',
      year: 2026,
      round: 1,
      stages: {
        written: {
          regStart: '20260106',
          regEnd: '20260109',
          examStart: '20260207',
          examEnd: '20260207',
          passDate: '20260306',
        },
        practical: {
          regStart: '20260302',
          regEnd: '20260305',
          examStart: '20260406',
          examEnd: '20260419',
          passStart: '20260501',
          passEnd: '20260501',
        },
      },
    },
    {
      jmCd: '7798',
      year: 2026,
      round: 2,
      stages: {
        written: {
          regStart: '20260406',
          regEnd: '20260409',
          examStart: '20260509',
          examEnd: '20260509',
          passDate: '20260605',
        },
        practical: {
          regStart: '20260601',
          regEnd: '20260604',
          examStart: '20260705',
          examEnd: '20260718',
          passStart: '20260731',
          passEnd: '20260731',
        },
      },
    },
    {
      jmCd: '7798',
      year: 2026,
      round: 3,
      stages: {
        written: {
          regStart: '20260706',
          regEnd: '20260709',
          examStart: '20260808',
          examEnd: '20260808',
          passDate: '20260904',
        },
        practical: {
          regStart: '20260831',
          regEnd: '20260903',
          examStart: '20261004',
          examEnd: '20261017',
          passStart: '20261030',
          passEnd: '20261030',
        },
      },
    },
    {
      jmCd: '7798',
      year: 2026,
      round: 4,
      stages: {
        written: {
          regStart: '20261005',
          regEnd: '20261009',
          examStart: '20261107',
          examEnd: '20261107',
          passDate: '20261204',
        },
        practical: {
          regStart: '20261130',
          regEnd: '20261203',
          examStart: '20270103',
          examEnd: '20270116',
          passStart: '20270129',
          passEnd: '20270129',
        },
      },
    },
  ],
}
