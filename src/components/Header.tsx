"use client";

import React, { useRef } from "react";
import FormulaSearchBar from "./FormulaSearchBar";
import { SpreadsheetFunction } from "@/data/functions";

interface HeaderProps {
  onImport: (file: File) => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  onSelectFunction: (func: SpreadsheetFunction) => void;
  isLoading: boolean;
  sheetName: string;
}

export default function Header({
  onImport,
  onExportCsv,
  onExportXlsx,
  onSelectFunction,
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
        gap: "12px",
        padding: "0 16px",
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
            padding: "3px 10px",
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "20px",
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            maxWidth: "160px",
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

      {/* Loading indicator */}
      {isLoading && <span className="spinner" aria-label="불러오는 중..." />}

      {/* Center: Global Formula / Function Search Bar */}
      <div style={{ marginLeft: "12px" }}>
        <FormulaSearchBar onSelectFunction={onSelectFunction} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

        {/* Open file button */}
        <button
          id="btn-open-file"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          data-tooltip="CSV 또는 XLSX 파일 열기"
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

        <div className="toolbar-divider" />

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
      </div>
    </header>
  );
}
