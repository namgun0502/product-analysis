# 08_janytree_official_logo_and_brand_system.md

남건, 제니트리 공식 로고(`logo-h.svg` 가로 조합 정본) 탑재 및 제니트리 브랜드 규격에 맞춘 전체 화면 전면 재정비 계획서입니다.

---

## 1. 문제 분석
- 기존에는 공식 벡터 로고 SVG 파일 대신 `JT`라는 텍스트 박스로 임시 표시되어 있었습니다.
- 제니트리 공식 로고 정본(`public/brand/logo/logo-h.svg`)을 불러와서, 상단 헤더 및 브랜딩 영역에 공식 규격(높이 28~32px, 원형 심볼 J⁺ + janytree 영문 워드마크)을 완벽하게 적용합니다.

---

## 2. 세부 변경 계획

### ① 공식 로고 정본 배치 (`public/brand/logo/`)
- `logo-h.svg` (밝은 배경용 먹색 #1F2328 공식 가로형 로고)
- `logo-h-light.svg` (어두운 배경용 흰색 로고)
- `logo-v.svg` / `logo-v-light.svg` (세로형)

### ② 헤더 레이아웃 재구성 (`app/page.tsx`, `app/globals.css`)
- 공식 가로형 로고(`logo-h.svg`, 높이 28px) 삽입
- 로고 우측에 버티컬 디바이더(`|`) 및 앱 정식 명칭 `ProductLens` (Figtree 폰트, 600 weight)
- R&D/AI 도메인 뱃지 (`AI · R&D`, Teal `#12A3A3`) 정돈
- 제니트리 표준 App Shell 헤더 규격 준수

### ③ 전체 화면 정밀 개선
- **히어로 영역**: 제니트리 더마 R&D / 스마트 공정 / AI 비전의 브랜드 톤을 반영한 정갈한 타이포그래피
- **입력 폼**: 제니트리 인풋 박스 규격 (`height: 40px`, `--r-lg: 16px`, `--color-focus-ring: #305CDE`)
- **결과 카드**: 불필요한 장식을 덜어내고, 제니트리 전성분/품목 카드처럼 정밀하고 깨끗한 레이아웃 구성
- **쇼핑 버튼**: 과한 색상을 지양하고 제니트리 6단 시맨틱 기반의 정제된 버튼 스타일 적용
