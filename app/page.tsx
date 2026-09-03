"use client";

import React, { useState, useEffect } from "react";

// ============================================================================
// [타입 정의] 제품 분석 데이터 인터페이스
// ============================================================================
interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  timestamp: string;
  timestampSeconds: number;
  description: string;
  searchKeywords: {
    naver: string;
    coupang: string;
    google: string;
  };
}

interface AnalysisResponse {
  success: boolean;
  isDemoMode?: boolean;
  notice?: string;
  video: {
    id: string;
    title: string;
    author: string;
    thumbnail: string;
    url: string;
  };
  summary: string;
  products: ProductItem[];
}

// ============================================================================
// [메인 컴포넌트] 영상 속 제품 분석 앱
// ============================================================================
export default function VideoProductAnalyzer() {
  // 사용자가 입력한 영상 링크 상태값
  const [videoUrl, setVideoUrl] = useState("");
  // 로딩 상태 및 진행 단계 메시지
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  // 분석 완료된 결과 데이터
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 현재 재생 중인 타임스탬프 (초)
  const [activeSeconds, setActiveSeconds] = useState<number | null>(null);
  // 카테고리 필터링 ('전체' 또는 개별 카테고리)
  const [selectedCategory, setSelectedCategory] = useState("전체");
  // 클립보드 복사 성공 알림
  const [copySuccess, setCopySuccess] = useState(false);

  // ── API 키 설정 관련 상태 ──
  // API 설정 모달 열림/닫힘
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  // 현재 저장된 API 키 (브라우저 로컬스토리지에서 불러옴)
  const [apiKey, setApiKey] = useState("");
  // 모달 안의 API 키 입력창 임시 값
  const [apiKeyInput, setApiKeyInput] = useState("");
  // API 키 저장 완료 메시지 표시 여부
  const [apiKeySaved, setApiKeySaved] = useState(false);
  // API 키 입력창 비밀번호 표시/숨김
  const [showApiKey, setShowApiKey] = useState(false);

  // 페이지 처음 로드 시 로컬스토리지에서 API 키 불러오기
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    setApiKey(savedKey);
    setApiKeyInput(savedKey);
  }, []);

  // API 키 저장 핸들러
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    localStorage.setItem("gemini_api_key", trimmed);
    setApiKey(trimmed);
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
      setIsSettingOpen(false);
    }, 1500);
  };

  // API 키 삭제 핸들러
  const handleDeleteApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setApiKeyInput("");
  };

  // 1. 영상 분석 요청 핸들러
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setErrorMessage("영상 링크를 입력해 주세요!");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep("영상 정보를 확인하고 있습니다...");

    try {
      // 1초 뒤 단계 메시지 변경 (사용자 시각적 피드백)
      const timer = setTimeout(() => {
        setLoadingStep("AI가 영상 속 제품과 타임스탬프를 스캔 중입니다...");
      }, 1200);

      // API 키를 함께 전송 (서버에서 이 키를 이용해 Gemini API 호출)
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim(), apiKey: apiKey || undefined }),
      });

      clearTimeout(timer);

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "영상 분석에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      setAnalysisData(data);
      setActiveSeconds(null);
      setSelectedCategory("전체");
    } catch (err: any) {
      setErrorMessage("네트워크 통신 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // 2. 예시 링크 자동 채우기 함수
  const handleSampleFill = (sampleUrl: string) => {
    setVideoUrl(sampleUrl);
    setErrorMessage(null);
  };

  // 3. 타임스탬프 클릭 시 영상 해당 시간대로 이동
  const handleJumpToTime = (seconds: number) => {
    setActiveSeconds(seconds);
    const playerEl = document.getElementById("video-player-section");
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // 4. 분석 결과 전체 텍스트 클립보드 복사
  const handleCopyResults = () => {
    if (!analysisData) return;
    const textLines = [
      `[영상] ${analysisData.video.title}`,
      `[링크] ${analysisData.video.url}`,
      `[AI 요약] ${analysisData.summary}`,
      "",
      "--- 감지된 제품 목록 ---",
      ...analysisData.products.map(
        (p, idx) =>
          `${idx + 1}. [${p.timestamp}] ${p.name} (${p.brand}) - ${p.description}`
      ),
    ];
    navigator.clipboard.writeText(textLines.join("\n"));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // 5. 카테고리 목록 추출
  const categories = [
    "전체",
    ...Array.from(
      new Set(analysisData?.products.map((p) => p.category) || [])
    ),
  ];

  // 6. 현재 선택된 카테고리에 맞는 제품들만 필터링
  const filteredProducts =
    selectedCategory === "전체"
      ? analysisData?.products || []
      : (analysisData?.products || []).filter(
          (p) => p.category === selectedCategory
        );

  return (
    <div className="app-container">
      {/* ======================= 상단 네비게이션 헤더 ======================= */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-group">
            <span className="logo-icon">🔍</span>
            <div>
              <h1 className="logo-title">ProductLens AI</h1>
              <p className="logo-sub">영상 속 제품 AI 자동 감지 & 쇼핑 스캐너</p>
            </div>
          </div>
          <div className="header-right">
            {/* API 키 상태 표시 및 설정 버튼 */}
            <button
              onClick={() => {
                setApiKeyInput(apiKey);
                setIsSettingOpen(true);
              }}
              className={`api-setting-btn ${apiKey ? "has-key" : "no-key"}`}
              title="Gemini API 키 설정"
            >
              {apiKey ? (
                <>
                  <span className="dot-green"></span>
                  API 키 설정됨 ⚙️
                </>
              ) : (
                <>
                  <span className="dot-red"></span>
                  API 키 없음 ⚙️
                </>
              )}
            </button>
            <div className="badge-cloudflare">
              <span className="dot-green"></span>
              Cloudflare 배포 지원
            </div>
          </div>
        </div>
      </header>

      {/* ======================= API 키 설정 모달 ======================= */}
      {isSettingOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🔑 Gemini API 키 설정</h2>
              <button className="modal-close" onClick={() => setIsSettingOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                Google Gemini API 키를 입력하시면 영상 속 제품을 실제 AI로 정밀 분석합니다.
                <br />
                API 키는 이 기기의 브라우저에만 안전하게 저장되며, 외부로 절대 전송되지 않습니다.
              </p>

              {/* API 키 발급 안내 링크 */}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="api-guide-link"
              >
                🌐 Google AI Studio에서 무료 API 키 발급받기 →
              </a>

              {/* API 키 입력창 */}
              <div className="api-input-wrapper">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy... 형태의 API 키를 붙여넣으세요"
                  className="api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="show-key-btn"
                  title={showApiKey ? "숨기기" : "보이기"}
                >
                  {showApiKey ? "🙈" : "👁️"}
                </button>
              </div>

              {/* 현재 저장된 키 상태 표시 */}
              {apiKey && (
                <div className="saved-key-status">
                  <span>✅ 저장된 키: {apiKey.slice(0, 8)}•••{apiKey.slice(-4)}</span>
                  <button onClick={handleDeleteApiKey} className="delete-key-btn">
                    🗑️ 삭제
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsSettingOpen(false)} className="modal-cancel-btn">
                취소
              </button>
              <button onClick={handleSaveApiKey} className="modal-save-btn">
                {apiKeySaved ? "✅ 저장 완료!" : "💾 저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= 메인 콘텐츠 본문 ======================= */}
      <main className="main-content">
        {/* 히어로 & 입력 폼 영역 */}
        <section className="hero-section">
          {/* API 키 미설정 안내 배너 */}
          {!apiKey && (
            <div className="api-warn-banner">
              <span>⚠️</span>
              <span>
                Gemini API 키가 없습니다. 지금은 <strong>데모 모드</strong>로 작동합니다.{" "}
                <button
                  onClick={() => setIsSettingOpen(true)}
                  className="inline-setting-link"
                >
                  API 키 설정하기 →
                </button>
              </span>
            </div>
          )}

          <h2 className="hero-heading">
            영상 링크만 넣으면, <br />
            <span className="gradient-text">AI가 영상 속 모든 제품</span>을 찾아드립니다
          </h2>
          <p className="hero-desc">
            유튜브 영상이나 쇼츠 링크를 입력해 보세요. 영상에 등장하는 의류,
            전자기기, 인테리어 소품을 식별하고 타임스탬프와 쇼핑 검색을 한눈에
            보여줍니다.
          </p>

          {/* 링크 입력 폼 */}
          <form onSubmit={handleAnalyze} className="input-form">
            <div className="input-wrapper">
              <span className="input-icon">🔗</span>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="예: https://www.youtube.com/watch?v=... 또는 쇼츠 링크"
                className="url-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn"
              >
                {isLoading ? (
                  <span className="spinner-wrap">
                    <span className="spinner"></span> 분석 중...
                  </span>
                ) : (
                  <span>분석 시작 ✨</span>
                )}
              </button>
            </div>
          </form>

          {/* 빠른 테스트용 샘플 버튼들 */}
          <div className="sample-buttons">
            <span className="sample-label">빠른 체험:</span>
            <button
              type="button"
              onClick={() =>
                handleSampleFill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
              }
              className="sample-pill"
            >
              🎬 샘플 영상 1
            </button>
            <button
              type="button"
              onClick={() =>
                handleSampleFill("https://www.youtube.com/watch?v=jNQXAC9IVRw")
              }
              className="sample-pill"
            >
              📱 샘플 영상 2
            </button>
          </div>

          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="error-box">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* 분석 진행 중 단계 안내 */}
          {isLoading && (
            <div className="loading-card">
              <div className="pulse-loader"></div>
              <p className="loading-text">{loadingStep}</p>
              <p className="loading-subtext">잠시만 기다려 주세요 (약 2~4초 소요)</p>
            </div>
          )}
        </section>

        {/* ======================= 분석 결과 대시보드 ======================= */}
        {analysisData && (
          <section className="results-section">
            {/* 데모 모드 안내 배너 */}
            {analysisData.isDemoMode && (
              <div className="notice-banner">
                <span className="notice-icon">💡</span>
                <div className="notice-text">
                  <strong>체험 데모 모드 작동 중:</strong>{" "}
                  <button
                    onClick={() => setIsSettingOpen(true)}
                    className="inline-setting-link"
                  >
                    API 키를 설정
                  </button>
                  하시면 실제 실시간 AI 분석으로 즉시 전환됩니다.
                </div>
              </div>
            )}

            {/* 결과 상단 정보 바 */}
            <div className="results-header-bar">
              <div>
                <h3 className="results-title">
                  🎉 제품 {analysisData.products.length}개가 감지되었습니다
                </h3>
                <p className="results-summary">"{analysisData.summary}"</p>
              </div>
              <button onClick={handleCopyResults} className="copy-btn">
                {copySuccess ? "✅ 복사 완료!" : "📋 결과 전체 복사"}
              </button>
            </div>

            {/* 메인 2열 그리드: 왼쪽(영상 플레이어) / 오른쪽(제품 카드 리스트) */}
            <div className="grid-layout">
              {/* 왼쪽: 영상 플레이어 영역 */}
              <div id="video-player-section" className="player-column">
                <div className="player-card">
                  <div className="video-responsive">
                    <iframe
                      key={activeSeconds || "default"}
                      src={`https://www.youtube-nocookie.com/embed/${
                        analysisData.video.id
                      }?autoplay=${activeSeconds !== null ? 1 : 0}&start=${
                        activeSeconds || 0
                      }&rel=0`}
                      title={analysisData.video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="iframe-player"
                    ></iframe>
                  </div>
                  <div className="video-meta">
                    <h4 className="video-title">{analysisData.video.title}</h4>
                    <p className="video-author">
                      채널: <strong>{analysisData.video.author}</strong>
                      {activeSeconds !== null && (
                        <span className="time-indicator">
                          ▶ {Math.floor(activeSeconds / 60)}분 {activeSeconds % 60}초로 이동됨
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 카테고리 필터 및 감지된 제품 목록 */}
              <div className="products-column">
                {/* 카테고리 필터 탭 */}
                <div className="category-filter">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`cat-btn ${
                        selectedCategory === cat ? "active" : ""
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* 제품 카드 목록 */}
                <div className="product-list">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id} className="product-card">
                      {/* 상단 뱃지 & 타임스탬프 */}
                      <div className="card-top">
                        <span className="category-tag">{prod.category}</span>
                        <button
                          type="button"
                          onClick={() => handleJumpToTime(prod.timestampSeconds)}
                          className="timestamp-btn"
                          title="클릭 시 이 시간으로 영상 이동"
                        >
                          ⏱️ {prod.timestamp}
                        </button>
                      </div>

                      {/* 제품명 & 브랜드 */}
                      <h4 className="product-name">{prod.name}</h4>
                      <p className="product-brand">브랜드: {prod.brand}</p>

                      {/* 제품 외형 및 특징 설명 */}
                      <p className="product-desc">{prod.description}</p>

                      {/* 쇼핑 검색 바로가기 버튼 그룹 */}
                      <div className="shopping-links">
                        <a
                          href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
                            prod.searchKeywords.naver || prod.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn naver"
                        >
                          🟢 네이버 쇼핑
                        </a>
                        <a
                          href={`https://www.coupang.com/np/search?component=&q=${encodeURIComponent(
                            prod.searchKeywords.coupang || prod.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn coupang"
                        >
                          🔴 쿠팡 검색
                        </a>
                        <a
                          href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
                            prod.searchKeywords.google || prod.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn google"
                        >
                          🔵 구글 쇼핑
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ======================= 푸터 ======================= */}
      <footer className="footer">
        <p>© 2026 ProductLens AI · Cloudflare Pages 자동 배포 준비 완료</p>
      </footer>
    </div>
  );
}
