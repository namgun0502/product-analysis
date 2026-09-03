# 06_infinite_build_loop_fix.md

남건, Cloudflare 배포 시 발생한 '무한 빌드 루프' 오류 해결 계획서입니다.

---

## 1. 오류 원인 분석
- `package.json`의 `"build"` 스크립트를 `"opennextjs-cloudflare build"`로 설정해 두었습니다.
- 그런데 `opennextjs-cloudflare build`는 내부적으로 Next.js 빌드를 위해 `npm run build`를 다시 호출합니다.
- 결과적으로 `npm run build` → `opennextjs-cloudflare build` → `npm run build` → ... 로 끝없이 반복되는 무한 루프가 발생했습니다.

---

## 2. 해결 방법
- `open-next.config.ts`에 `buildCommand: "npm run build:next"`를 명시적으로 지정합니다.
- 이렇게 하면 `opennextjs-cloudflare build`가 내부적으로 `"npm run build:next"` (= `next build`)만 실행하고 다시 `"npm run build"`를 호출하지 않아 루프가 끊어집니다.

```
수정 전 흐름 (무한 루프):
npm run build
  → opennextjs-cloudflare build
    → npm run build  ← 다시 처음으로!
      → opennextjs-cloudflare build
        → ... (무한 반복)

수정 후 흐름 (정상):
npm run build
  → opennextjs-cloudflare build
    → npm run build:next  ← next build만 실행하고 끝!
      ✅ 빌드 완료
```
