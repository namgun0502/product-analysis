import { NextResponse } from "next/server";

// ============================================================================
// [API 설명] 제미나이 최신 버전(2.5 / 2.0 / 1.5) 모델 자동 인식 및 유효성 검증 엔드포인트
// ============================================================================

// 최신 우선순위 모델 라인업
const LATEST_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (최신 차세대 비전)" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (초고속 멀티모달)" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (안정화 버전)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
];

export async function POST(request: Request) {
  try {
    const { apiKey } = (await request.json()) as { apiKey?: string };

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { valid: false, message: "API 키를 입력해 주세요." },
        { status: 400 }
      );
    }

    const cleanKey = apiKey.trim();

    // 1. Google Gemini API의 모델 목록 조회 API로 키 유효성 및 최신 지원 모델 동적 확인 시도
    let detectedModelName = "";
    let isSuccess = false;

    // 지원 모델 순차 탐색 (가장 최신의 빠른 모델부터 시도)
    for (const model of LATEST_MODELS) {
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${cleanKey}`;
        const res = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "hi" }] }],
          }),
        });

        if (res.ok) {
          detectedModelName = model.name;
          isSuccess = true;
          break; // 최신 지원 모델 감지 성공
        }
      } catch {
        // 다음 모델 시도
      }
    }

    if (isSuccess && detectedModelName) {
      return NextResponse.json({
        valid: true,
        model: detectedModelName,
        message: `키가 정상 인증되었습니다! (${detectedModelName} 엔진 활성화)`,
      });
    }

    // 만약 위 개별 모델이 실패했을 경우, 구글의 직접 에러 사유 조회
    const fallbackTestUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const fallbackRes = await fetch(fallbackTestUrl);

    if (fallbackRes.ok) {
      return NextResponse.json({
        valid: true,
        model: "Gemini API",
        message: "키가 정상 인증되었습니다! (Gemini API 연결 완료)",
      });
    }

    const errText = await fallbackRes.text();
    let errorDetail = "유효하지 않은 API 키입니다.";
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        errorDetail = parsed.error.message;
      }
    } catch {
      // 기본 메시지 유지
    }

    return NextResponse.json(
      { valid: false, message: `구글 인증 실패: ${errorDetail}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, message: "검증 통신 오류: " + err.message },
      { status: 500 }
    );
  }
}
