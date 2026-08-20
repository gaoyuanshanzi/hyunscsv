"use client";

import React, { useState, useEffect } from "react";

interface DbSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  defaultTitle: string;
}

export default function DbSaveModal({
  isOpen,
  onClose,
  onSave,
  defaultTitle,
}: DbSaveModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("문서 제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(title.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          width: "420px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#eff6ff",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            ☁️
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Neon DB에 저장
            </h3>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
              작업 중인 스프레드시트를 클라우드 DB에 안전하게 저장합니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="db-sheet-title"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: "6px",
              }}
            >
              문서 제목
            </label>
            <input
              id="db-sheet-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026_일본어단어장"
              autoFocus
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "13px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                outline: "none",
                background: "#ffffff",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--color-danger)",
                marginBottom: "12px",
                padding: "6px 10px",
                background: "#fef2f2",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner" style={{ width: "14px", height: "14px" }} />
                  저장 중...
                </>
              ) : (
                "저장하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
