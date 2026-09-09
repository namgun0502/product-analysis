import { NextResponse } from "next/server";

// ============================================================================
// [API 설명] 제미나이 ListModels 기반 실시간 키 검증 및 지원 모델 확인 엔드포인트
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

    const cleanKey = apiKey.trim();

    // 1. Google Gemini ListModels API 호출로 키 유효성 및 실제 지원 모델 목록 획득
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const listRes = await fetch(listUrl);

    if (!listRes.ok) {
      const errText = await listRes.text();
      let errorDetail = "API 키가 올바르지 않습니다.";
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) {
          errorDetail = parsed.error.message;
        }
      } catch {}

      return NextResponse.json(
        { valid: false, message: `구글 인증 실패: ${errorDetail}` },
        { status: 400 }
      );
    }

    const data = (await listRes.json()) as any;
    const models: any[] = data?.models || [];

    // generateContent를 지원하는 모델 필터링
    const contentModels = models.filter((m) =>
      m?.supportedGenerationMethods?.includes("generateContent")
    );

    if (contentModels.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          message: "인증은 성공했으나 사용할 수 있는 텍스트/비전 생성 모델이 없습니다.",
        },
        { status: 400 }
      );
    }

    // 우선순위 키워드로 최적 모델 이름 추출
    const priorityKeywords = [
      "2.5-flash",
      "2.0-flash",
      "1.5-flash",
      "flash",
      "2.5-pro",
      "1.5-pro",
    ];

    let chosenModelName = contentModels[0].displayName || contentModels[0].name;

    for (const kw of priorityKeywords) {
      const matched = contentModels.find((m) =>
        m.name?.toLowerCase().includes(kw)
      );
      if (matched) {
        chosenModelName = matched.displayName || matched.name.replace("models/", "");
        break;
      }
    }

    return NextResponse.json({
      valid: true,
      model: chosenModelName,
      message: `키가 정상 인증되었습니다! (${chosenModelName} 엔진 활성화)`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, message: "검증 통신 오류: " + err.message },
      { status: 500 }
    );
  }
}
