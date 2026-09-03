# 04_cloudflare_git_deploy_and_video_analysis_plan.md

남건, 'Git Commit & Push 기반 Cloudflare 자동 배포' 환경에 최적화된 영상 속 제품 분석 앱 구현 계획서입니다.

---

## 1. Cloudflare 자동 배포(CI/CD) 연동 핵심 포인트
남건께서 깃허브(GitHub)에 코드를 올리면(Commit & Push), Cloudflare가 이를 자동으로 감지하여 빌드하고 배포하게 됩니다.
이를 위해 다음 사항이 완벽히 세팅되어야 합니다:

1. **Cloudflare 호환성 (Edge/Worker 환경)**:
   - 무거운 외부 라이브러리 대신 표준 `fetch` 기반의 Gemini REST API 연동 방식을 사용하여, Cloudflare Workers/Pages 환경에서 에러 없이 초고속으로 빌드 및 작동되도록 만듭니다.
2. **보안 및 환경변수 (Environment Variables)**:
   - 로컬 테스트용: `.env.local` 및 `.dev.vars`에 `GEMINI_API_KEY` 저장 (Git에 올라가지 않도록 방지).
   - Cloudflare 배포용: Cloudflare 대시보드의 [Settings] -> [Environment variables]에 `GEMINI_API_KEY`를 한 번만 등록해 두면 자동 배포 시 안전하게 적용됩니다.
3. **Cloudflare 빌드 설정 최적화**:
   - Build Command: `npm run cf:build`
   - Output Directory: `.open-next/assets` (또는 Cloudflare Pages OpenNext 규격)

---

## 2. 세부 개발 단계 (Step-by-Step)

### [1단계] 세련된 프론트엔드 UI 구축 (`app/page.tsx`, CSS)
- **영상 입력창**: 유튜브(YouTube) 일반 영상 및 쇼츠(Shorts) 링크 입력 지원.
- **영상 뷰어 영역**: 입력한 영상이 즉시 재생되는 플레이어 화면.
- **제품 분석 결과 영역**:
  - 감지된 제품 카드 리스트 (제품명, 카테고리 뱃지, 외형 특징 설명)
  - **타임스탬프 버튼 (예: 00:15)**: 누르면 영상이 해당 시간대로 자동 이동
  - **쇼핑 바로가기 버튼**: [네이버 쇼핑], [쿠팡], [구글 쇼핑] 최저가 검색 연동

### [2단계] Cloudflare 완벽 호환 AI 분석 API 구축 (`app/api/analyze/route.ts`)
- Next.js 15 App Router 기반의 서버 엔드포인트 생성.
- Gemini 1.5 Flash / Pro API를 표준 REST Fetch로 호출하여 Cloudflare 배포 환경에서 100% 오류 없는 실행 보장.
- 영상 속 제품들을 정밀한 JSON 데이터 구조로 추출.

### [3단계] Cloudflare 빌드 및 로컬 테스트 검증
- `npm run cf:build` 명령어를 통해 Cloudflare 번들링이 오류 없이 깔끔하게 성공하는지 직접 사전 검증.
- 남건께서 언제든 안심하고 `git push` 하실 수 있는 상태로 완성.
