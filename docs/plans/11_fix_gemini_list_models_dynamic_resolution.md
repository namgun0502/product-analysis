# 11_fix_gemini_list_models_dynamic_resolution.md

남건, 구글 API 오류(`models/... is not found for API version v1beta`)를 완벽하게 해결하기 위한 `ListModels` 기반 동적 모델 해결 계획서입니다.

---

## 1. 오류 원인 상세 분석
- 구글 에러 메시지:
  > `models/gemini-1.5-pro is not found for API version v1beta, or is not supported for generateContent. Call ModelService.ListModels to see the list of available models and their supported methods.`
- **원인**:
  1. 구글 AI 스튜디오 계정마다 배정된 실제 모델명(예: `gemini-1.5-flash-latest`, `gemini-1.5-flash-001`, `gemini-2.0-flash`, `gemini-2.5-flash` 등)의 표기법이나 활성화 상태가 다릅니다.
  2. 고정된 모델 이름을 순차 추측해서 부르다가 일치하지 않아 404 오류가 발생했습니다.

---

## 2. 해결 방법 (구글 공식 권장 방식)

### ① `ModelService.ListModels` 실시간 자동 조회
- 구글이 안내한 대로, API를 호출하기 전 `GET /v1beta/models?key=...`를 호출하여 **남건의 계정에서 현재 `generateContent`를 지원하는 실제 모델 목록을 실시간으로 직접 확인**합니다.

### ② 최적 모델 자동 선별
- 실시간으로 받아온 모델 목록 중:
  1. `generateContent`가 지원되는 모델
  2. `flash`가 포함된 가장 빠르고 스마트한 비전 모델 우선 선택 (예: `gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ `gemini-1.5-flash`)
  3. 플래시가 없으면 지원되는 첫 번째 생성 모델 선택

### ③ 완벽한 URL 포맷팅
- 구글 응답의 전체 모델 리소스 경로(`models/gemini-...`)를 그대로 사용하여 `404 Not Found`가 구조적으로 발생할 수 없도록 원천 차단합니다.
