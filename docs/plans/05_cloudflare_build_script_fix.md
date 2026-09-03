# 05_cloudflare_build_script_fix.md

남건, Cloudflare Pages/Workers Git 자동 배포 시 발생한 `Could not find compiled Open Next config` 오류 해결 계획서입니다.

---

## 1. 오류 원인 분석
- Cloudflare의 자동 배포 시스템은 소스코드를 내려받은 후 기본적으로 `npm run build`를 실행합니다.
- 기존 `package.json`의 `"build"` 명령어는 일반 Next.js 빌드(`next build`)로 설정되어 있어서, Cloudflare 전용 번들 폴더인 `.open-next/`가 생성되지 않았습니다.
- 그 결과, 뒤이어 실행된 `opennextjs-cloudflare deploy` 명령어가 `.open-next` 번들 설정 파일을 찾지 못해 오류가 발생했습니다.

---

## 2. 해결 방법
- `package.json`의 `"build"` 명령어를 `"opennextjs-cloudflare build"`로 변경:
  ```json
  "scripts": {
    "build": "opennextjs-cloudflare build",
    "build:next": "next build"
  }
  ```
- 이렇게 설정하면 Cloudflare가 기본값인 `npm run build`를 실행했을 때 자동으로 OpenNext Cloudflare 빌드가 수행되어 `.open-next/worker.js`가 정상적으로 만들어지고 배포가 100% 성공하게 됩니다.
