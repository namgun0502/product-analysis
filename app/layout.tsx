import type { Metadata } from "next";
import React from "react";
import "./globals.css";

// ============================================================================
// [웹 애플리케이션 메타데이터 설정]
// ============================================================================
export const metadata: Metadata = {
  title: "ProductLens AI - 영상 속 제품 분석 & 쇼핑 스캐너",
  description: "영상 링크를 넣으면 AI가 영상 속 제품들을 감지하고 타임스탬프와 쇼핑 정보를 제공합니다.",
};

// ============================================================================
// [루트 레이아웃 컴포넌트]
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
