"use client";

import React, { useRef } from "react";
import FormulaSearchBar from "./FormulaSearchBar";
import { SpreadsheetFunction } from "@/data/functions";

export type SyncStatus = "synced" | "syncing" | "error" | "unsaved";

interface HeaderProps {
  onImport: (file: File) => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  onSelectFunction: (func: SpreadsheetFunction) => void;
  onOpenDbSave: () => void;
  onOpenDbList: () => void;
  onLogout?: () => void;
  syncStatus: SyncStatus;
  isLoading: boolean;
  sheetName: string;
}

export default function Header({
  onImport,
  onExportCsv,
  onExportXlsx,
  onSelectFunction,
  onOpenDbSave,
  onOpenDbList,
  onLogout,
  syncStatus,
  isLoading,
  sheetName,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = "";
    }
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 14px",
        height: "52px",
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px var(--color-shadow)",
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Logo + Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginRight: "4px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            background: "var(--color-accent)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.6" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.9" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.3px",
          }}
        >
          hyunscsv
        </span>
      </div>

      {/* Sheet name badge */}
      {sheetName && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 8px",
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            maxWidth: "140px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 2h8M1 5h8M1 8h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {sheetName}
        </div>
      )}

      {/* Real-time Neon DB Sync Status Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 600,
          background:
            syncStatus === "synced"
              ? "#f0fdf4"
              : syncStatus === "syncing"
              ? "#fefce8"
              : syncStatus === "error"
              ? "#fef2f2"
              : "#f8fafc",
          color:
            syncStatus === "synced"
              ? "#16a34a"
              : syncStatus === "syncing"
              ? "#ca8a04"
              : syncStatus === "error"
              ? "#dc2626"
              : "#64748b",
          border: `1px solid ${
            syncStatus === "synced"
              ? "#bbf7d0"
              : syncStatus === "syncing"
              ? "#fef08a"
              : syncStatus === "error"
              ? "#fecaca"
              : "#e2e8f0"
          }`,
        }}
        title="Neon.tech PostgreSQL 실시간 동기화 상태"
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor:
              syncStatus === "synced"
                ? "#22c55e"
                : syncStatus === "syncing"
                ? "#eab308"
                : syncStatus === "error"
                ? "#ef4444"
                : "#94a3b8",
          }}
        />
        <span>
          {syncStatus === "synced"
            ? "DB 동기화됨"
            : syncStatus === "syncing"
            ? "동기화 중..."
            : syncStatus === "error"
            ? "동기화 오류"
            : "미저장 문서"}
        </span>
      </div>

      {/* Loading indicator */}
      {isLoading && <span className="spinner" aria-label="불러오는 중..." />}

      {/* Center: Global Formula / Function Search Bar */}
      <div style={{ marginLeft: "8px" }}>
        <FormulaSearchBar onSelectFunction={onSelectFunction} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Neon DB Actions */}
        <button
          id="btn-db-save"
          className="btn btn-secondary"
          onClick={onOpenDbSave}
          disabled={isLoading}
          data-tooltip="현재 시트를 Neon DB에 저장"
          style={{ borderColor: "#93c5fd", color: "#1d4ed8", background: "#eff6ff" }}
          aria-label="DB 저장"
        >
          <span>☁️</span>
          <span>DB 저장</span>
        </button>

        <button
          id="btn-db-list"
          className="btn btn-secondary"
          onClick={onOpenDbList}
          disabled={isLoading}
          data-tooltip="Neon DB에 저장된 시트 목록 불러오기"
          aria-label="DB 목록"
        >
          <span>📂</span>
          <span>DB 목록</span>
        </button>

        <div className="toolbar-divider" />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="file-import-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileChange}
          aria-label="파일 열기"
        />

        {/* Local file import */}
        <button
          id="btn-open-file"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          data-tooltip="로컬 CSV 또는 XLSX 파일 열기"
          aria-label="파일 열기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1.5 3.5h3l1.5 2h6.5v7h-11V3.5z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          파일 열기
        </button>

        {/* CSV download */}
        <button
          id="btn-export-csv"
          className="btn btn-secondary"
          onClick={onExportCsv}
          disabled={isLoading}
          data-tooltip="현재 시트를 CSV로 다운로드"
          aria-label="CSV 다운로드"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 1v8m0 0L4.5 6.5M7 9l2.5-2.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.5 10.5v2h11v-2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          CSV
        </button>

        {/* XLSX download */}
        <button
          id="btn-export-xlsx"
          className="btn btn-primary"
          onClick={onExportXlsx}
          disabled={isLoading}
          data-tooltip="현재 시트를 XLSX로 다운로드"
          aria-label="XLSX 다운로드"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 1v8m0 0L4.5 6.5M7 9l2.5-2.5"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.5 10.5v2h11v-2"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          XLSX
        </button>

        {onLogout && (
          <>
            <div className="toolbar-divider" />
            <button
              id="btn-logout"
              className="btn btn-ghost"
              onClick={onLogout}
              data-tooltip="관리자 로그아웃"
              aria-label="로그아웃"
              style={{ fontSize: "12px", color: "var(--color-text-muted)", padding: "4px 8px" }}
            >
              🔒 로그아웃
            </button>
          </>
        )}
      </div>
    </header>
  );
}
