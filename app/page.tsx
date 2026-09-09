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
// [메인 컴포넌트] 제니트리 JT_ProductLens 영상 제품 분석 시스템
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

  // ── API 키 설정 관련 상태 (브라우저 localStorage 보관) ──
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // API 키 즉시 검증 상태
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // 페이지 마운트 시 localStorage에서 저장된 API 키 로드
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    setApiKey(savedKey);
    setApiKeyInput(savedKey);
  }, []);

  // API 키 유효성 실시간 사전 테스트
  const handleValidateApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setValidationResult({ valid: false, message: "검증할 API 키를 입력해 주세요." });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();
      setValidationResult({
        valid: res.ok && data.valid,
        message: data.message || (res.ok ? "정상 작동하는 키입니다!" : "인증 실패"),
      });
    } catch (err: any) {
      setValidationResult({
        valid: false,
        message: "검증 중 네트워크 통신 오류: " + err.message,
      });
    } finally {
      setIsValidating(false);
    }
  };

  // API 키 저장 핸들러
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    localStorage.setItem("gemini_api_key", trimmed);
    setApiKey(trimmed);
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
      setIsSettingOpen(false);
    }, 1200);
  };

  // API 키 삭제 핸들러
  const handleDeleteApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setApiKeyInput("");
    setValidationResult(null);
  };

  // 1. 영상 분석 요청 핸들러
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setErrorMessage("분석할 유튜브 영상 링크를 입력해 주세요.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep("영상 프레임과 메타데이터를 정밀 조회하고 있습니다...");

    try {
      const timer = setTimeout(() => {
        setLoadingStep("AI 멀티모달 비전 엔진이 화면 속 제품을 시각적으로 식별 중입니다...");
      }, 1400);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim(), apiKey: apiKey || undefined }),
      });

      clearTimeout(timer);

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "영상 분석 처리에 실패했습니다.");
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

  // 2. 테스트용 샘플 링크 자동 채우기
  const handleSampleFill = (sampleUrl: string) => {
    setVideoUrl(sampleUrl);
    setErrorMessage(null);
  };

  // 3. 타임스탬프 클릭 시 영상 해당 구간으로 점프
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
      `[JANYTREE ProductLens 분석 리포트]`,
      `영상명: ${analysisData.video.title}`,
      `URL: ${analysisData.video.url}`,
      `요약: ${analysisData.summary}`,
      "",
      "--- 검출 제품 목록 ---",
      ...analysisData.products.map(
        (p, idx) =>
          `${idx + 1}. [${p.timestamp}] ${p.name} (${p.brand}) / ${p.category} - ${p.description}`
      ),
    ];
    navigator.clipboard.writeText(textLines.join("\n"));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // 5. 카테고리 필터 목록 추출
  const categories = [
    "전체",
    ...Array.from(
      new Set(analysisData?.products.map((p) => p.category) || [])
    ),
  ];

  // 6. 카테고리 필터링된 제품 리스트
  const filteredProducts =
    selectedCategory === "전체"
      ? analysisData?.products || []
      : (analysisData?.products || []).filter(
          (p) => p.category === selectedCategory
        );

  return (
    <div className="app-container">
      {/* ======================= 제니트리 공식 헤더 ======================= */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-group">
            {/* 제니트리 공식 가로형 벡터 로고 (J⁺ + janytree) */}
            <div className="jt-official-logo">
              <img
                src="/brand/logo/logo-h.svg"
                alt="JANYTREE"
                height={28}
                style={{ width: "auto", display: "block" }}
              />
            </div>

            {/* 브랜드 디바이더 */}
            <div className="header-brand-divider"></div>

            {/* 앱 명칭 및 도메인 뱃지 */}
            <div className="logo-title-group">
              <span className="header-app-name">ProductLens</span>
              <span className="domain-tag">AI · R&D</span>
            </div>
          </div>

          <div className="header-right">
            {/* API 키 상태 버튼 */}
            <button
              onClick={() => {
                setApiKeyInput(apiKey);
                setValidationResult(null);
                setIsSettingOpen(true);
              }}
              className={`api-setting-btn ${apiKey ? "has-key" : "no-key"}`}
              title="Gemini API 키 환경 설정"
            >
              <span
                className={`dot-indicator ${apiKey ? "green" : "yellow"}`}
              ></span>
              {apiKey ? "Gemini API 키 등록됨" : "API 키 미설정 (데모)"}
            </button>
            <div className="badge-cloudflare">Cloudflare Pages</div>
          </div>
        </div>
      </header>

      {/* ======================= API 키 설정 모달 ======================= */}
      {isSettingOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Gemini API 키 설정</h2>
              <button
                className="modal-close"
                onClick={() => setIsSettingOpen(false)}
                title="닫기"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                Google Gemini API 키를 등록하시면 실제 영상 속 제품을 실시간 비전 AI 모델로
                정밀 분석합니다. 키는 본인 브라우저에만 안전하게 보관됩니다.
              </p>

              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="api-guide-link"
              >
                Google AI Studio에서 무료 API 키 발급받기 →
              </a>

              {/* API 키 입력창 및 검증 버튼 */}
              <div className="api-input-wrapper">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="AIzaSy... 형태의 API 키를 입력하세요"
                  className="api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="show-key-btn"
                  title={showApiKey ? "키 숨기기" : "키 보기"}
                >
                  {showApiKey ? "숨김" : "표시"}
                </button>
              </div>

              {/* API 키 즉시 테스트 버튼 */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleValidateApiKey}
                  disabled={isValidating || !apiKeyInput.trim()}
                  className="sample-pill"
                  style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                >
                  {isValidating ? "키 연결 확인 중..." : "⚡ 키 정상 작동 테스트"}
                </button>
              </div>

              {/* 검증 결과 표시 */}
              {validationResult && (
                <div
                  className={
                    validationResult.valid ? "saved-key-status" : "error-box"
                  }
                  style={{ margin: 0, padding: "0.6rem 0.9rem" }}
                >
                  {validationResult.valid ? "✅ " : "⚠️ "}
                  {validationResult.message}
                </div>
              )}

              {apiKey && (
                <div className="saved-key-status">
                  <span>등록 키: {apiKey.slice(0, 8)}•••{apiKey.slice(-4)}</span>
                  <button
                    onClick={handleDeleteApiKey}
                    className="delete-key-btn"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setIsSettingOpen(false)}
                className="modal-cancel-btn"
              >
                취소
              </button>
              <button onClick={handleSaveApiKey} className="modal-save-btn">
                {apiKeySaved ? "저장 완료" : "설정 저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= 메인 콘텐츠 본문 ======================= */}
      <main className="main-content">
        {/* 히어로 영역 */}
        <section className="hero-section">
          {!apiKey && (
            <div className="api-warn-banner">
              <span>
                현재 데모 모드로 작동 중입니다. 실시간 비전 AI 분석을 위해{" "}
                <button
                  onClick={() => setIsSettingOpen(true)}
                  className="inline-setting-link"
                >
                  Gemini API 키를 등록
                </button>
                해 주세요.
              </span>
            </div>
          )}

          <h1 className="hero-heading">
            영상 속 제품을 정밀하게 감지하는 <br />
            <span className="hero-heading-highlight">AI 멀티모달 비전 분석 솔루션</span>
          </h1>
          <p className="hero-desc">
            분석할 영상 링크를 입력하면 프레임별 제품 정보(브랜드, 카테고리, 제품 설명)와
            등장 시점(타임스탬프), 최저가 쇼핑 연동 데이터를 한 화면에서 정밀하게 파악합니다.
          </p>

          {/* 링크 입력창 */}
          <form onSubmit={handleAnalyze} className="input-form">
            <div className="input-wrapper">
              <span className="input-icon">⌕</span>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="유튜브 일반 영상 또는 쇼츠 URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)"
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
                  <span>분석 실행</span>
                )}
              </button>
            </div>
          </form>

          {/* 샘플 영상 빠른 버튼 */}
          <div className="sample-buttons">
            <span className="sample-label">테스트 샘플:</span>
            <button
              type="button"
              onClick={() =>
                handleSampleFill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
              }
              className="sample-pill"
            >
              샘플 영상 01
            </button>
            <button
              type="button"
              onClick={() =>
                handleSampleFill("https://www.youtube.com/watch?v=jNQXAC9IVRw")
              }
              className="sample-pill"
            >
              샘플 영상 02
            </button>
          </div>

          {/* 에러 발생 시 안내 박스 */}
          {errorMessage && (
            <div className="error-box">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="loading-card">
              <div className="jt-progress-bar-wrap">
                <div className="jt-progress-bar-inner"></div>
              </div>
              <p className="loading-text">{loadingStep}</p>
              <p className="loading-subtext">데이터 규격에 맞추어 제품 목록을 추출하고 있습니다.</p>
            </div>
          )}
        </section>

        {/* ======================= 분석 결과 영역 ======================= */}
        {analysisData && (
          <section className="results-section">
            {analysisData.isDemoMode && (
              <div className="notice-banner">
                <span>
                  <strong>데모 시뮬레이션 결과:</strong> 실제 AI 분석 결과를 원하시면{" "}
                  <button
                    onClick={() => setIsSettingOpen(true)}
                    className="inline-setting-link"
                  >
                    API 키를 등록
                  </button>
                  해 주세요.
                </span>
              </div>
            )}

            {/* 결과 상단 바 */}
            <div className="results-header-bar">
              <div>
                <h2 className="results-title">
                  총 {analysisData.products.length}개의 제품이 검출되었습니다
                </h2>
                <p className="results-summary">{analysisData.summary}</p>
              </div>
              <button onClick={handleCopyResults} className="copy-btn">
                {copySuccess ? "복사 완료 ✓" : "분석 리포트 복사"}
              </button>
            </div>

            {/* 메인 2열 그리드 */}
            <div className="grid-layout">
              {/* 좌측: 영상 뷰어 */}
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
                    <h3 className="video-title">{analysisData.video.title}</h3>
                    <div className="video-author">
                      <span>채널: {analysisData.video.author}</span>
                      {activeSeconds !== null && (
                        <span className="time-indicator">
                          {Math.floor(activeSeconds / 60)}분 {activeSeconds % 60}초 재생 중
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: 카테고리 필터 & 제품 리스트 */}
              <div className="products-column">
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

                <div className="product-list">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id} className="product-card">
                      <div className="card-top">
                        <span className="category-tag">{prod.category}</span>
                        <button
                          type="button"
                          onClick={() => handleJumpToTime(prod.timestampSeconds)}
                          className="timestamp-btn"
                          title="클릭 시 영상 해당 시점으로 이동"
                        >
                          {prod.timestamp}
                        </button>
                      </div>

                      <h4 className="product-name">{prod.name}</h4>
                      <p className="product-brand">{prod.brand}</p>
                      <p className="product-desc">{prod.description}</p>

                      <div className="shopping-links">
                        <a
                          href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
                            prod.searchKeywords.naver || prod.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn naver"
                        >
                          네이버 쇼핑
                        </a>
                        <a
                          href={`https://www.coupang.com/np/search?component=&q=${encodeURIComponent(
                            prod.searchKeywords.coupang || prod.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn coupang"
                        >
                          쿠팡 검색
                        </a>
                        <a
                          href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
                            prod.searchKeywords.google || prod.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn google"
                        >
                          구글 쇼핑
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

      {/* ======================= 제니트리 표준 푸터 ======================= */}
      <footer className="footer">
        <p>© 2026 JANYTREE Co., Ltd. All rights reserved. · JT_ProductLens v3.0</p>
      </footer>
    </div>
  );
}
