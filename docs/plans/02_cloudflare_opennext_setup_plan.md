# Cloudflare + OpenNext 배포 환경 설정 계획

남건, 요청하신 **Cloudflare 배포(@opennextjs/cloudflare 및 Wrangler)** 설정을 프로젝트에 적용하기 위한 상세 계획서입니다.

---

## 1. 현재 프로젝트 상태 점검
- 현재 폴더에는 `index.html`, `style.css`, `app.js`와 같은 순수 정적 파일만 존재하며, `package.json`, `next.config.ts`, `Next.js` 패키지 등이 아직 설치되지 않은 상태입니다.
- `@opennextjs/cloudflare` 빌드(`npm run cf:build`)가 정상 작동하려면 Next.js 및 TypeScript 기본 환경(`next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react` 등)과 `next.config.ts`가 구성되어 있어야 합니다.

---

## 2. 작업 단계 (Step-by-Step)

### 단계 1: 프로젝트 기초 환경 초기화
1. `package.json` 생성 및 Next.js/React/TypeScript 의존성 설치
2. 기본 `next.config.ts` 생성
3. 기본 `.env.local` 및 `.gitignore` 생성

### 단계 2: 요청하신 Cloudflare 및 OpenNext 설정 적용
1. **의존성 설치**: `@opennextjs/cloudflare` 및 `wrangler` (개발 의존성) 설치
2. **`wrangler.jsonc` 생성**:
   - `name`: 영문 소문자 기본 앱 이름 설정 (예: `my-next-app` 또는 지정하시는 이름)
   - Cloudflare Pages / Workers 호환 설정 포함
3. **`open-next.config.ts` 생성**:
   ```typescript
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";
   export default defineCloudflareConfig({});
   ```
4. **`public/_headers` 생성**:
   ```text
   /_next/static/*
     Cache-Control: public,max-age=31536000,immutable
   ```
5. **`next.config.ts` 연동**:
   ```typescript
   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
   initOpenNextCloudflareForDev();
   ```
6. **`package.json` scripts 추가**:
   - `"cf:build": "opennextjs-cloudflare build"`
   - `"cf:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"`
   - `"cf:deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"`
7. **`.gitignore` 설정**:
   - `.open-next/`, `.wrangler/`, `.dev.vars` 추가
8. **`.dev.vars` 생성**:
   - `NEXTJS_ENV=development` 및 `.env.local` 내용 반영
9. **`export const runtime = "edge"` 검사**:
   - 전체 코드베이스 검색 후 보고

### 단계 3: 빌드 검증 (`npm run cf:build`)
- `npm run cf:build` 명령어를 실행하여 정상 빌드 여부 확인 및 결과 보고

---

## 3. 확인이 필요한 사항 (Open Questions)
1. **앱 이름**: `wrangler.jsonc`의 `name`에 들어갈 영어 소문자 이름을 정해주시면 반영하겠습니다. (기본 추천: `my-cf-app` 또는 `base-app`)
2. **Next.js 앱 세팅**: 현재 폴더가 순수 HTML 템플릿만 있으므로, Next.js 구동을 위해 필요한 기본 패키지(`next`, `react`, `react-dom` 등) 및 `app/page.tsx` 기본 페이지를 함께 구성해도 괜찮으실까요?
