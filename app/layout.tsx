import type { Metadata } from "next";
import React from "react";
import "./globals.css";

// ============================================================================
// [제니트리(JANYTREE) 디자인 시스템 규격 메타데이터 설정]
// ============================================================================
export const metadata: Metadata = {
  title: "JT_ProductLens — 제니트리 영상 제품 분석 시스템",
  description:
    "제니트리(JANYTREE) 피부 과학 및 R&D 기반 AI 멀티모달 영상 제품 분석 솔루션",
};

// ============================================================================
// [루트 레이아웃]
// - 제니트리 표준 폰트: Pretendard Variable(한글/기본) + Figtree(숫자/영문)
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 제니트리 표준 웹폰트 로드: Pretendard Variable (한글) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
        {/* 제니트리 표준 웹폰트 로드: Figtree (영문·숫자·코드) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
