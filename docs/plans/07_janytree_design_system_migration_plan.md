# 07_janytree_design_system_migration_plan.md

남건, 영상 속 제품 분석 앱을 **제니트리(JANYTREE) 통합 디자인 시스템 (MASTER v3.0 & Foundation v1.0)** 규격에 맞추어 전면 리디자인하기 위한 계획서입니다.

---

## 1. 디자인 시스템 적용 목적
기존의 알록달록하고 네온/글래스모피즘 위주의 다크 UI에서 탈피하여, 제니트리 브랜드의 핵심 가치인 **"전문성(Professionalism) · 신뢰감(Trust) · 피부 과학(Skin Science)"**을 담은 **단정하고 정밀한 모던 클린 UI**로 전환합니다.

---

## 2. 제니트리 디자인 시스템 핵심 토큰 및 규칙 적용

### ① 색상 체계 (Seed ➔ Alias Token)
- **Primary(브랜드)**: Neutral Charcoal (`#1F2328`) — 주 액션 버튼, 메인 타이틀, 헤더
- **Accent(상호작용)**: Info Blue (`#305CDE`) — 링크, 포커스 링, 활성 탭, 타임스탬프 이동
- **배경 구조**:
  - 페이지 전체 배경: Neutral-50 / Gray-50 (`#F7F8F9`)
  - 카드 및 컨테이너: Neutral-0 (`#FFFFFF`) 순백색 표면
  - 테두리: Neutral-200 (`#DEE2E6`)
  - 구분선: Neutral-100 (`#EEF0F2`)
- **텍스트 계층**:
  - 본문/제목: Charcoal (`#1F2328`)
  - 보조 설명: Neutral-500 (`#757F8A`)
  - 힌트/플레이스홀더: Neutral-400 (`#9DA5AF`)
- **시맨틱 상태 표현**:
  - 성공(Success): `#E7F7F0` 배경 + `#0C744E` 텍스트
  - 주의/경고(Warning): `#FEF6E4` 배경 + `#6B4A0C` 텍스트 (Yellow 흰글자 금지 원칙 준수)
  - 에러(Error): `#FDECEC` 배경 + `#A82F35` 텍스트
  - 정보/안내(Info): `#EEF3FE` 배경 + `#24419E` 텍스트

### ② 타이포그래피 (다국어 및 숫자 대응)
- 한글/기본: **Pretendard Variable** (웹폰트 연동)
- 숫자/코드: **Figtree** (정밀한 tabular-nums 지원)
- 영문/폴백: System font stack

### ③ 아이콘 및 디테일 (이모지 절제 원칙)
- 유치하거나 남발되는 이모지를 절제하고, 제니트리 표준의 단정한 뱃지 및 심볼 구조 채택.
- 카드 그림자: `0 4px 16px rgba(18, 21, 26, 0.06)` (과장 없는 섬세한 깊이감)
- 라운드: 8px 기준 (`--r-md: 8px`, `--r-lg: 16px`, `--r-full: 9999px`)

---

## 3. 세부 파일 수정 계획

1. **[MODIFY] `app/layout.tsx`**:
   - Pretendard Variable 및 Figtree 웹폰트 로드 링크 삽입
   - 페이지 타이틀 및 메타데이터를 제니트리 규격(`JT_ProductLens`)에 맞게 정돈

2. **[MODIFY] `app/globals.css`**:
   - 제니트리 MASTER v3.0 및 Foundation v1.0 CSS 변수(Seed, Map, Alias) 전면 선언
   - 클린 라이트 테마 기반의 레이아웃, 헤더, 인풋, 카드, 모달, 뱃지 스타일 재정의

3. **[MODIFY] `app/page.tsx`**:
   - 헤더 브랜드 아이덴티티 적용 (`JT_ProductLens`, 도메인 태그, 정돈된 API 키 상태)
   - 제니트리 버튼 규격 (Primary Charcoal 채움 버튼, Default 라인 버튼)
   - 정갈한 입력 바 및 빠른 체험 샘플 버튼
   - 감지된 제품 카드 및 쇼핑 링크 버튼을 세련되고 정제된 톤으로 개선
   - API 키 모달 팝업의 제니트리 규격화

---

## 4. 검증 및 배포 계획
- 로컬 빌드(`npm run build`) 테스트로 컴파일 및 문법 오류 검증
- 검증 완료 후 깃 커밋 및 푸시하여 클라우드플레어 자동 배포 트리거
