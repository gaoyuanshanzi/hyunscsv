"use client";

import React, { useState } from "react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 관리자 계정 검증: ID "admin", PW "123jesus"
    if (username.trim() === "admin" && password === "123jesus") {
      try {
        localStorage.setItem("hyunscsv_auth", "true");
        sessionStorage.setItem("hyunscsv_auth", "true");
      } catch (_) {}
      onLoginSuccess();
    } else {
      setError("관리자 ID 또는 비밀번호가 올바르지 않습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "36px 32px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "var(--color-accent, #2563eb)",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.9" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            hyunscsv 관리자 로그인
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            스프레드시트 시스템에 접근하려면 인증이 필요합니다.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="admin-username"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              관리자 ID
            </label>
            <input
              id="admin-username"
              type="text"
              placeholder="ID 입력"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                background: "#ffffff",
                color: "#1e293b",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-accent, #2563eb)")}
              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="admin-password"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              관리자 비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                background: "#ffffff",
                color: "#1e293b",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-accent, #2563eb)")}
              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
            />
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: 500,
                marginBottom: "16px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "8px",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isLoading ? "인증 확인 중..." : "입장하기 ↵"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            Lightweight Web Spreadsheet • Cloud DB Powered
          </span>
        </div>
      </div>
    </div>
  );
}
