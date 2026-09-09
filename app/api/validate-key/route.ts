import { NextResponse } from "next/server";

// ============================================================================
// [API 설명] 사용자가 입력한 Gemini API 키의 유효성을 실시간으로 사전 검증하는 엔드포인트
// ============================================================================
export async function POST(request: Request) {
  try {
    const { apiKey } = (await request.json()) as { apiKey?: string };

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { valid: false, message: "API 키를 입력해 주세요." },
        { status: 400 }
      );
    }

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

    const res = await fetch(testUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }],
      }),
    });

    if (res.ok) {
      return NextResponse.json({ valid: true, message: "API 키가 정상 작동합니다!" });
    }

    const errText = await res.text();
    let errorDetail = "유효하지 않은 API 키입니다.";
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        errorDetail = parsed.error.message;
      }
    } catch {
      // 파싱 실패 시 기본 메시지 유지
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
