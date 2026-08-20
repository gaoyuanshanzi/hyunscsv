"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SpreadsheetMeta {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  size_bytes?: number;
}

interface DbListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSpreadsheet: (id: string, title: string) => Promise<void>;
  currentDocId: string | null;
}

export default function DbListModal({
  isOpen,
  onClose,
  onLoadSpreadsheet,
  currentDocId,
}: DbListModalProps) {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSpreadsheets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/spreadsheets");
      const data = await res.json();
      if (data.success) {
        setSpreadsheets(data.spreadsheets || []);
      } else {
        setError(data.error || "목록을 불러오지 못했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSpreadsheets();
    }
  }, [isOpen, fetchSpreadsheets]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`정말로 "${title}" 문서를 DB에서 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/spreadsheets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSpreadsheets((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (err: any) {
      alert("삭제 중 오류가 발생했습니다: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredList = spreadsheets.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
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
          width: "560px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#f0fdf4",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              📂
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                Neon DB 문서 목록
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                클라우드에 저장된 스프레드시트를 불러옵니다.
              </p>
            </div>
          </div>
          <button
            onClick={fetchSpreadsheets}
            className="btn btn-ghost"
            style={{ fontSize: "12px", padding: "4px 8px" }}
            title="새로고침"
          >
            🔄 새로고침
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="저장된 문서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px",
              fontSize: "12px",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              outline: "none",
              background: "var(--color-bg-secondary)",
            }}
          />
        </div>

        {/* Content List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: "200px",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            padding: "6px",
          }}
        >
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "180px", gap: "8px", color: "var(--color-text-secondary)" }}>
              <span className="spinner" />
              <span>DB에서 불러오는 중...</span>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--color-danger)", fontSize: "13px" }}>
              {error}
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--color-text-muted)", fontSize: "13px" }}>
              {searchQuery ? "일치하는 문서가 없습니다." : "저장된 문서가 없습니다. 현재 문서를 [DB 저장]해 보세요!"}
            </div>
          ) : (
            filteredList.map((item) => {
              const isCurrent = item.id === currentDocId;
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: isCurrent ? "#eff6ff" : "#ffffff",
                    borderBottom: "1px solid var(--color-border-light)",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = "var(--color-bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, marginRight: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                        {item.title}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: "10px", background: "var(--color-accent)", color: "#fff", padding: "1px 5px", borderRadius: "4px" }}>
                          현재 열림
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      최종 수정: {formatDate(item.updated_at)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => {
                        onLoadSpreadsheet(item.id, item.title);
                        onClose();
                      }}
                      disabled={isDeleting}
                    >
                      열기
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: "12px", color: "var(--color-danger)" }}
                      onClick={(e) => handleDelete(item.id, item.title, e)}
                      disabled={isDeleting}
                      title="삭제"
                    >
                      {isDeleting ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
