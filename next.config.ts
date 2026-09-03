import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* 여기에 Next.js 기본 설정 옵션을 추가할 수 있습니다 */
};

initOpenNextCloudflareForDev();

export default nextConfig;
