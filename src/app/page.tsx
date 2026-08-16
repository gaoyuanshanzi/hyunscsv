"use client";

import React, { useState, useRef, useCallback } from "react";
import type { Sheet } from "@fortune-sheet/core";
import Header from "@/components/Header";
import Toolbar from "@/components/Toolbar";
import SpreadsheetDynamic from "@/components/SpreadsheetDynamic";
import type { SpreadsheetWrapperHandle } from "@/components/SpreadsheetWrapper";
import { DEFAULT_SHEETS } from "@/components/SpreadsheetWrapper";
import { importFile } from "@/utils/fileImport";
import { exportCsv, exportXlsx } from "@/utils/fileExport";

export default function HomePage() {
  const [sheets, setSheets] = useState<Sheet[]>(DEFAULT_SHEETS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<SpreadsheetWrapperHandle | null>(null);

  // Current sheet name for display
  const currentSheetName = sheets[0]?.name ?? "Sheet1";

  /** Handle file import */
  const handleImport = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const importedSheets = await importFile(file);
      setSheets(importedSheets);
    } catch (err) {
      console.error("파일 불러오기 실패:", err);
      setError(
        err instanceof Error ? err.message : "파일을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Handle CSV export */
  const handleExportCsv = useCallback(() => {
    const currentData = wrapperRef.current?.getData() ?? sheets;
    const activeSheet = currentData[0];
    if (!activeSheet) return;
    try {
      exportCsv(activeSheet, activeSheet.name ?? "hyunscsv_export");
    } catch (err) {
      console.error("CSV 내보내기 실패:", err);
      setError("CSV 내보내기 중 오류가 발생했습니다.");
    }
  }, [sheets]);

  /** Handle XLSX export */
  const handleExportXlsx = useCallback(() => {
    const currentData = wrapperRef.current?.getData() ?? sheets;
    if (!currentData.length) return;
    try {
      exportXlsx(currentData, "hyunscsv_export");
    } catch (err) {
      console.error("XLSX 내보내기 실패:", err);
      setError("XLSX 내보내기 중 오류가 발생했습니다.");
    }
  }, [sheets]);

  /** Handle toolbar formatting commands */
  const handleToolbarCommand = useCallback(
    (command: string, value?: string) => {
      wrapperRef.current?.applyCommand(command, value);
      setActiveFormats((prev) => {
        const next = new Set(prev);
        if (["bold", "italic", "underline", "wrap"].includes(command)) {
          if (next.has(command)) {
            next.delete(command);
          } else {
            next.add(command);
          }
        } else if (command.startsWith("align")) {
          ["alignLeft", "alignCenter", "alignRight"].forEach((a) => next.delete(a));
          next.add(command);
        }
        return next;
      });
    },
    []
  );

  /** Handle data change from spreadsheet */
  const handleDataChange = useCallback((updatedSheets: Sheet[]) => {
    setSheets(updatedSheets);
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <Header
        onImport={handleImport}
        onExportCsv={handleExportCsv}
        onExportXlsx={handleExportXlsx}
        isLoading={isLoading}
        sheetName={currentSheetName}
      />

      {/* Formatting Toolbar */}
      <Toolbar
        onCommand={handleToolbarCommand}
        activeFormats={activeFormats}
      />

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            background: "#fef2f2",
            borderBottom: "1px solid #fecaca",
            color: "var(--color-danger)",
            fontSize: "13px",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: "2px",
              fontSize: "16px",
              lineHeight: 1,
            }}
            aria-label="오류 닫기"
          >
            ×
          </button>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <SpreadsheetDynamic
        sheets={sheets}
        onDataChange={handleDataChange}
        wrapperRef={wrapperRef}
      />
    </main>
  );
}
