# QUALI 진행 상황 (2026-09-08 기준)

여러 컴퓨터(집/학원)를 오가며 작업 중이라 만든 인수인계용 문서.
새 컴퓨터에서 이어갈 때는 `git pull` 후 이 파일부터 읽으면 됨.

## 서비스 개요

자격증 정보 + 나의 시험 일정/응시 기록을 한 곳에서 관리하는 개인 맞춤형 자격증 관리 서비스.
Q-net 공공데이터 API(XML)를 Supabase Edge Function이 받아 테이블로 적재하고, 프론트는 Supabase만
조회하는 구조로 갈 계획이지만, **지금은 프론트엔드를 mock 데이터로 전부 완성하는 단계**이고
백엔드는 아직 손대지 않았음.

## 작업 순서 (합의된 원칙)

데이터 모델 → 공통 컴포넌트 → 메인페이지 → 검색페이지 → 상세페이지 → 마이페이지 → 인증 화면
→ (전부 끝난 뒤) Supabase/Edge Function 연동

## Phase별 진행 상황

- **Phase 1 (데이터 모델/공통 세팅)**: 완료. shadcn/ui(Base UI + Tailwind v4), 타입 정의(`src/types`),
  mock 데이터(`src/mocks`), 데이터 접근 레이어(`src/services`), 테스트 계정 인증(`src/lib/auth.tsx`)
- **Phase 2 (공통 컴포넌트)**: 완료. `CertificateCard`, `StatusBadge`, `DdayBadge`, `InterestButton`
- **Phase 3 (메인페이지)**: 완료. Hero 캐러셀, 관심 직무분야, 주간 시험일정 캘린더
- **Phase 4 (검색페이지)**: 완료. 직무분야→분류→시행종목 3단 계층 브라우저 + 상태 필터
- **Phase 5 (자격증 상세페이지)**: 완료. 응시료/과목/시험일정(회차별)/합격률(5년)/유사자격증
  - 이번에 "관련 응시기록" 섹션을 추가했다가 **다시 제거하기로 결정** (마이페이지 쪽 새 페이지가 그 역할을 전담)
- **Phase 6 (마이페이지)**: 거의 완료 — 아래 "남은 것" 참고
- **Phase 7 (인증 화면 디자인)**: 미착수. 로그인은 테스트 계정으로 동작하는 최소 기능만 있고
  디자인/회원가입 페이지는 아직
- **Phase 8 (Supabase/API 연동)**: 미착수. Phase 6, 7 끝난 뒤 시작 예정

## 지금까지 커밋된 것 (마이페이지 v2)

- **나의 자격증 / 응시기록 탭 모두 자격증(jmCd) 하나당 카드 하나**로 표시. 카드 클릭 시
  `/mypage/records/:jmCd`(새 페이지, `MyPageLayout` 탭 없이 독립적, `BackButton` 포함)로 이동해서
  그 자격증의 준비중 플랜 + 응시기록을 한곳에 모아서 보고 관리함. 같은 자격증이 두 탭에 동시에
  나타날 수 있음(준비중인 것 + 이미 끝난 것 둘 다 있을 때).
- `/mypage/records/:jmCd`에는 참고용으로 **응시 수수료 + 시험과목**도 같이 표시함
  (`getExamFee`/`getExamSubjects` — 자격증 전체 기준이고 회차별 데이터는 아님, 지금 데이터 모델의 한계).
- **결과 입력하면 플랜은 삭제**되고 응시기록에 카드로 반영됨 (`ExamRecordFormDialog`가 lockedPlan
  모드로 기록 저장 성공 시 `removeMyPlan`도 같이 호출). `ExamRecord.planId`는 lineage 표시용으로만
  남겨두고, 화면에서 필터링 용도로는 더 안 씀.
- 공개 자격증 상세페이지(`/certificates/:jmCd`)에는 "관련 응시기록" 섹션을 넣었다가 제거함 —
  역할이 `/mypage/records/:jmCd`로 완전히 이전됨.
- 공용 `ExamRecordFormDialog` (추가/수정/플랜에서 결과입력 3모드, `presetJmCd`로 특정 자격증
  미리 선택 가능)
- 자격증 선택 Combobox(검색 가능, 이름 표시), 단계 Select 라벨 표시 수정
- 관심분야/응시지역 설정, 관심 자격증 목록

## 남은 것

- 마이페이지 전체적으로 브라우저에서 실사용 흐름 검증 필요 (플랜 추가 → 결과 입력 → 그룹 카드
  반영 → 새 페이지 이동까지 한 사이클을 직접 클릭해보면서 확인하면 좋음)
- Phase 7(로그인/회원가입 화면 디자인), 이후 Phase 8(Supabase 연동)

## 테스트 계정

- 이메일: `test@quali.com` / 비밀번호: `1234` (`src/lib/auth.tsx`의 `TEST_ACCOUNT`)
- 로그인하면 `seedDemoDataIfNeeded()`가 최초 1회 나의 시험/관심분야 데모 데이터를 채워줌

## 개발 명령어

```
npm run dev      # 개발 서버 (사용자가 직접 실행 — Claude가 임의로 띄우지 않음)
npm run build    # tsc + vite build
npx tsc -b --noEmit   # 타입체크만
npx oxlint       # 린트
```

## 참고

- `.env`의 `QNET_API_KEY`로 Q-net API 직접 조회 가능 (실제 데이터 확인용, 아직 앱에서 직접 호출은 안 함)
- 카드 컴포넌트 등은 shadcn CLI로 관리 (`npx shadcn@latest add <component>`)
- 커밋 메시지는 "왜"를 설명하는 스타일 유지, Co-Authored-By 트레일러 포함
