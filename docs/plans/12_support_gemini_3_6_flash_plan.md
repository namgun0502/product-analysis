# 12_support_gemini_3_6_flash_plan.md

남건, 구글 최신 안내(`Please update your code to use models/gemini-3.6-flash`)에 따른 **Gemini 3.6 Flash 최신 세대 모델 탑재** 계획서입니다.

---

## 1. 오류 원인
- 구글 공식 메시지:
  > `This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.6-flash for the latest features and improvements.`
- 구글 AI 스튜디오가 2026년 최신 세대인 **`gemini-3.6-flash`**를 신규 기본 모델로 지정하면서, 이전 세대인 2.5-flash의 신규 호출을 제한했습니다.

---

## 2. 해결 방법

### ① 최신 `gemini-3.6-flash` 최우선 탑재
- 모델 자동 감지 파이프라인의 1순위를 **`gemini-3.6-flash`**로 즉각 전면 교체합니다:
  1. `3.6-flash` (구글 권장 최신 플래그십)
  2. `3.5-flash` / `3.0-flash`
  3. `gemini-3` 세대 모델군
  4. `2.0-flash` / `1.5-flash`

### ② 비추천(Deprecated) 모델 자동 회피 로직
- `2.5-flash` 등 구글에서 신규 사용자에게 비활성화한 구형 모델은 자동 탐색 시 제외하고, 구글이 안내한 **`gemini-3.6-flash`**를 우선 바인딩합니다.
