import type { ExamSubject } from '@/types/certificate'

/** 0752(가스기술사)는 2026-09-08 Q-net InquiryExamKmInfo/getList 실측 응답 반영 */
export const mockExamSubjects: Record<string, ExamSubject[]> = {
  '0752': [
    { jmCd: '0752', type: '필답형', subjectName: '영역1', order: 1, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 300, totalQuestions: 1, durationMinutes: 100 },
    { jmCd: '0752', type: '필답형', subjectName: '영역2', order: 2, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 300, totalQuestions: 1, durationMinutes: 100 },
    { jmCd: '0752', type: '필답형', subjectName: '영역3', order: 3, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 300, totalQuestions: 1, durationMinutes: 100 },
    { jmCd: '0752', type: '필답형', subjectName: '영역4', order: 4, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 300, totalQuestions: 1, durationMinutes: 100 },
    { jmCd: '0752', type: '면접형', subjectName: '면접위원1', order: 1, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 1, durationMinutes: 30 },
  ],
  '1320': [
    { jmCd: '1320', type: '객관식', subjectName: '소프트웨어설계', order: 1, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 20, durationMinutes: 30 },
    { jmCd: '1320', type: '객관식', subjectName: '소프트웨어개발', order: 2, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 20, durationMinutes: 30 },
    { jmCd: '1320', type: '객관식', subjectName: '데이터베이스구축', order: 3, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 20, durationMinutes: 30 },
    { jmCd: '1320', type: '객관식', subjectName: '프로그래밍언어활용', order: 4, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 20, durationMinutes: 30 },
    { jmCd: '1320', type: '객관식', subjectName: '정보시스템구축관리', order: 5, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 20, durationMinutes: 30 },
    { jmCd: '1320', type: '실기(필답형)', subjectName: '정보처리 실무', order: 1, isRequired: true, optionalFieldName: '선택분야없음', fullScore: 100, totalQuestions: 20, durationMinutes: 150 },
  ],
}
