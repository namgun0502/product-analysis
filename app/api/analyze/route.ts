import { NextResponse } from "next/server";

// ============================================================================
// [API 설명] 제니트리 JT_ProductLens 영상 제품 분석 백엔드 엔드포인트
// - 최신 Gemini 2.5 Flash / 2.0 Flash / 1.5 Flash 전 세대 모델 지능형 자동 감지
// - 유튜브 영상 프레임(고화질 썸네일)을 실시간으로 가져와 멀티모달 비전 AI로 분석
// - 클라우드플레어(Cloudflare) 엣지 환경과 100% 호환
// ============================================================================

// 1. 유튜브 URL에서 비디오 ID 추출 함수
function extractYouTubeVideoId(url: string): string | null {
  try {
    const trimmed = url.trim();
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    const parsedUrl = new URL(trimmed);
    const v = parsedUrl.searchParams.get("v");
    if (v && v.length === 11) return v;

    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return null;
  } catch {
    return null;
  }
}

// 2. 유튜브 공식 oEmbed API 메타데이터 조회
async function getYouTubeMetadata(url: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url
    )}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: { "User-Agent": "ProductLens-AI/1.0" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title || "유튜브 영상",
      author: data.author_name || "크리에이터",
      thumbnail: data.thumbnail_url || "",
    };
  } catch (error) {
    console.error("YouTube 메타데이터 조회 예외:", error);
    return null;
  }
}

// 3. 유튜브 프레임(썸네일 이미지)을 다운로드하여 base64 문자열로 변환 (Gemini Vision 연동용)
async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  } catch (err) {
    console.error("썸네일 이미지 base64 변환 실패:", err);
    return null;
  }
}

// 4. 타임스탬프 파싱 헬퍼
function parseTimestampToSeconds(ts: string): number {
  if (!ts) return 0;
  const parts = ts.split(":").map((p) => parseInt(p.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (
    parts.length === 3 &&
    !isNaN(parts[0]) &&
    !isNaN(parts[1]) &&
    !isNaN(parts[2])
  ) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// 5. API 키가 전혀 등록되지 않은 초보자 체험용 데모 시뮬레이션 데이터
function generateDemoAnalysis(videoTitle: string, videoId: string) {
  return {
    success: true,
    isDemoMode: true,
    notice:
      "Gemini API 키가 등록되지 않아 데모 시뮬레이션 결과가 표시되었습니다. 상단 [API 키 설정] 메뉴에서 발급받으신 Gemini 키를 등록하시면 실제 영상 속 제품을 실시간 AI로 분석합니다.",
    video: {
      id: videoId,
      title: videoTitle,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    },
    summary:
      "영상 속 분위기와 상황에 어울리는 대표적인 패션, 가전, 데스크테리어 제품들이 포착되었습니다.",
    products: [
      {
        id: "prod-1",
        name: "소니 WH-1000XM5 무선 노이즈캔슬링 헤드폰",
        brand: "SONY",
        category: "전자기기",
        timestamp: "00:15",
        timestampSeconds: 15,
        description:
          "모던한 무광 실버 마감의 프리미엄 헤드폰. 영상 초반 책상 위에서 착용하는 모습으로 등장합니다.",
        searchKeywords: {
          naver: "소니 WH-1000XM5",
          coupang: "소니 WH 1000XM5 헤드폰",
          google: "Sony WH-1000XM5 Silver",
        },
      },
      {
        id: "prod-2",
        name: "오버핏 울 블레이저 자켓 (베이지)",
        brand: "COS (추정)",
        category: "패션/의류",
        timestamp: "00:45",
        timestampSeconds: 45,
        description:
          "자연스러운 드롭 숄더 라인과 차분한 베이지 톤이 돋보이는 미니멀 디자인 자켓입니다.",
        searchKeywords: {
          naver: "남성 오버핏 울 블레이저 베이지",
          coupang: "오버핏 블레이저 베이지",
          google: "Oversized wool blazer oatmeal",
        },
      },
      {
        id: "prod-3",
        name: "로지텍 MX Master 3S 무소음 무선 마우스",
        brand: "Logitech",
        category: "전자기기",
        timestamp: "01:10",
        timestampSeconds: 70,
        description:
          "인체공학적 디자인의 그라파이트 블랙 마우스. 작업 공간에서 확인됩니다.",
        searchKeywords: {
          naver: "로지텍 MX Master 3S",
          coupang: "로지텍 MX 마스터 3S",
          google: "Logitech MX Master 3S",
        },
      },
    ],
  };
}

// 6. POST 요청 처리
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoUrl, apiKey: clientApiKey } = body as {
      videoUrl?: string;
      apiKey?: string;
    };

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "유효한 유튜브 영상 링크를 입력해 주세요." },
        { status: 400 }
      );
    }

    // 유튜브 비디오 ID 추출
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "지원되는 유튜브 링크 형식이 아닙니다. (일반 영상 또는 쇼츠 URL을 입력하세요)",
        },
        { status: 400 }
      );
    }

    // 영상 기본 정보 조회
    const metadata = (await getYouTubeMetadata(videoUrl)) || {
      title: "유튜브 영상",
      author: "크리에이터",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };

    // API 키 결정 (1순위: 앱 화면에서 직접 입력한 키, 2순위: 환경변수)
    const effectiveApiKey =
      (clientApiKey && clientApiKey.trim()) || process.env.GEMINI_API_KEY;

    // 만약 사용자가 API 키를 전혀 입력하지 않은 상태라면 데모 데이터를 제공
    if (!effectiveApiKey) {
      const demoData = generateDemoAnalysis(metadata.title, videoId);
      demoData.video = {
        ...demoData.video,
        author: metadata.author,
        thumbnail: metadata.thumbnail,
      } as any;
      return NextResponse.json(demoData);
    }

    // ========================================================================
    // ★ 최신 Gemini 2.5 / 2.0 / 1.5 비전 멀티모달 분석 실행
    // ========================================================================

    // 1) 고화질 썸네일(영상 프레임) 이미지 다운로드 및 base64 인코딩
    const primaryImgUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const imageBase64 = await fetchImageAsBase64(primaryImgUrl);

    // 2) 시스템 프롬프트 구성 (순수 JSON 강제)
    const systemPrompt = `
당신은 영상 속에 등장하는 제품(패션 의류, 전자기기, 인테리어 소품, 뷰티/화장품 등)을 정밀하게 식별하는 제니트리 AI 비전 분석가입니다.
주어진 영상 프레임 이미지와 메타데이터(제목, 채널)를 면밀히 관찰하여, 화면 속에서 실제로 포착되는 제품들을 찾아내어 아래 JSON 규격으로 응답하세요.

반드시 마크다운 기호 없이 오직 유효한 순수 JSON만 출력하세요:
{
  "summary": "영상에 등장하는 제품들과 전체적인 무드에 대한 한국어 1~2줄 정밀 요약",
  "products": [
    {
      "id": "prod-1",
      "name": "구체적인 제품명",
      "brand": "추정 브랜드명",
      "category": "패션/의류 | 전자기기 | 뷰티/화장품 | 인테리어 | 생활/소품 중 하나",
      "timestamp": "00:15",
      "description": "제품의 색상, 디자인, 영상 속 위치 및 특징에 대한 상세 설명",
      "searchKeywords": {
        "naver": "네이버쇼핑 검색 키워드",
        "coupang": "쿠팡 검색 키워드",
        "google": "구글 검색 키워드"
      }
    }
  ]
}
`;

    const userMessage = `
영상 제목: ${metadata.title}
채널명: ${metadata.author}
영상 URL: https://www.youtube.com/watch?v=${videoId}

첨부된 영상 프레임 이미지와 맥락을 종합 분석하여, 실제 등장하는 매력적인 제품들을 3~6개 식별해 주세요.
`;

    // 3) 멀티모달 요청 parts 구성 (이미지가 있을 경우 inlineData 포함)
    const parts: any[] = [{ text: systemPrompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      });
    }
    parts.push({ text: userMessage });

    // 4) 최신 모델 우선순위 라인업 (Gemini 2.5 ➔ 2.0 ➔ 1.5)
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.5-pro",
      "gemini-1.5-pro",
    ];

    let lastErrorText = "";
    let geminiSuccessData: any = null;
    let usedModel = "";

    for (const modelName of candidateModels) {
      try {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveApiKey}`;

        const apiRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (apiRes.ok) {
          geminiSuccessData = await apiRes.json();
          usedModel = modelName;
          break; // 성공 시 루프 탈출
        } else {
          lastErrorText = await apiRes.text();
          console.warn(`[Gemini API] 모델 ${modelName} 호출 실패:`, lastErrorText);
        }
      } catch (callErr: any) {
        lastErrorText = callErr.message || String(callErr);
      }
    }

    // 모든 모델에서 실패한 경우: 사용자가 API 키를 넣었으므로 절대 조용히 숨기지 않고 명확한 에러를 반환
    if (!geminiSuccessData) {
      let friendlyMessage = "Google Gemini AI 서버와 통신 중 오류가 발생했습니다.";
      try {
        const parsedErr = JSON.parse(lastErrorText);
        if (parsedErr?.error?.message) {
          friendlyMessage = `Google API 오류: ${parsedErr.error.message}`;
        }
      } catch {
        if (lastErrorText) friendlyMessage += ` (${lastErrorText.slice(0, 150)})`;
      }

      return NextResponse.json(
        {
          error: `${friendlyMessage} (입력하신 API 키가 올바른지 확인해 주세요)`,
        },
        { status: 400 }
      );
    }

    // 5) AI 응답 파싱
    const rawContent =
      geminiSuccessData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: "AI 분석 결과 형식을 해석하지 못했습니다. 다시 시도해 주세요." },
          { status: 500 }
        );
      }
    }

    // 6) 규격화된 제품 데이터 완성
    const refinedProducts = (parsedResult.products || []).map(
      (prod: any, idx: number) => ({
        id: prod.id || `prod-${idx + 1}`,
        name: prod.name || "식별된 제품",
        brand: prod.brand || "브랜드 미상",
        category: prod.category || "생활/소품",
        timestamp: prod.timestamp || "00:00",
        timestampSeconds: parseTimestampToSeconds(prod.timestamp || "00:00"),
        description: prod.description || "",
        searchKeywords: prod.searchKeywords || {
          naver: prod.name,
          coupang: prod.name,
          google: prod.name,
        },
      })
    );

    return NextResponse.json({
      success: true,
      isDemoMode: false,
      aiModel: usedModel,
      video: {
        id: videoId,
        title: metadata.title,
        author: metadata.author,
        thumbnail: metadata.thumbnail,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      },
      summary: parsedResult.summary || "영상 속 제품 분석이 완료되었습니다.",
      products: refinedProducts,
    });
  } catch (error: any) {
    console.error("API 처리 중 중대 예외 발생:", error);
    return NextResponse.json(
      { error: "영상 분석 중 문제가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
