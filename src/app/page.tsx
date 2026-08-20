"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Sheet } from "@fortune-sheet/core";
import Header, { SyncStatus } from "@/components/Header";
import Toolbar from "@/components/Toolbar";
import SpreadsheetDynamic from "@/components/SpreadsheetDynamic";
import DbSaveModal from "@/components/DbSaveModal";
import DbListModal from "@/components/DbListModal";
import LoginScreen from "@/components/LoginScreen";
import type { SpreadsheetWrapperHandle } from "@/components/SpreadsheetWrapper";
import { DEFAULT_SHEETS } from "@/components/SpreadsheetWrapper";
import { importFile } from "@/utils/fileImport";
import { exportCsv, exportXlsx } from "@/utils/fileExport";
import { SpreadsheetFunction } from "@/data/functions";
import { compactSheetsForStorage, expandSheetsFromStorage } from "@/utils/sheetCompact";

export default function HomePage() {
  // 관리자 인증 상태 (초기 null: 클라이언트 검사 전)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [sheets, setSheets] = useState<Sheet[]>(DEFAULT_SHEETS);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [currentDocTitle, setCurrentDocTitle] = useState<string>("새 스프레드시트");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("unsaved");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Modal States
  const [isDbSaveOpen, setIsDbSaveOpen] = useState(false);
  const [isDbListOpen, setIsDbListOpen] = useState(false);

  const wrapperRef = useRef<SpreadsheetWrapperHandle | null>(null);
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSheetName = currentDocTitle || sheets[0]?.name || "Sheet1";

  // 인증 상태 확인
  useEffect(() => {
    try {
      const isAuth =
        sessionStorage.getItem("hyunscsv_auth") === "true" ||
        localStorage.getItem("hyunscsv_auth") === "true";
      setIsAuthenticated(isAuth);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  /** 로그아웃 핸들러 */
  const handleLogout = useCallback(() => {
    try {
      sessionStorage.removeItem("hyunscsv_auth");
      localStorage.removeItem("hyunscsv_auth");
    } catch {}
    setIsAuthenticated(false);
    showToast("로그아웃 되었습니다.");
  }, [showToast]);

  /** Real-time Debounced Auto-Sync to Neon DB */
  const triggerAutoSync = useCallback(
    (updatedSheets: Sheet[], docId: string, title: string) => {
      if (autoSyncTimerRef.current) {
        clearTimeout(autoSyncTimerRef.current);
      }

      setSyncStatus("syncing");

      autoSyncTimerRef.current = setTimeout(async () => {
        try {
          // 거대한 2000x520 null 배열을 제거하여 수 KB 단위로 압축 전송
          const compactContent = compactSheetsForStorage(updatedSheets);

          const res = await fetch("/api/spreadsheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: docId,
              title: title,
              content: compactContent,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error("Auto-sync failed:", res.status, errText);
            setSyncStatus("error");
            return;
          }

          const data = await res.json();
          if (data.success) {
            setSyncStatus("synced");
          } else {
            console.error("Auto-sync error:", data.error);
            setSyncStatus("error");
          }
        } catch (err) {
          console.error("Auto-sync network error:", err);
          setSyncStatus("error");
        }
      }, 1500); // 1.5초 디바운스
    },
    []
  );

  /** Handle data change from spreadsheet */
  const handleDataChange = useCallback(
    (updatedSheets: Sheet[]) => {
      setSheets(updatedSheets);

      // 이미 DB에 등록된 문서인 경우 실시간 자동 동기화
      if (currentDocId) {
        triggerAutoSync(updatedSheets, currentDocId, currentDocTitle);
      } else {
        setSyncStatus("unsaved");
      }
    },
    [currentDocId, currentDocTitle, triggerAutoSync]
  );

  /** Clean up timer */
  useEffect(() => {
    return () => {
      if (autoSyncTimerRef.current) {
        clearTimeout(autoSyncTimerRef.current);
      }
    };
  }, []);

  /** Manual Save to Neon DB */
  const handleDbSave = useCallback(
    async (title: string) => {
      const currentData = wrapperRef.current?.getData() ?? sheets;
      const docId = currentDocId || `sp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // 압축하여 Vercel Payload 한도(4.5MB) 완벽 준수
      const compactContent = compactSheetsForStorage(currentData);

      setSyncStatus("syncing");
      const res = await fetch("/api/spreadsheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: docId,
          title: title,
          content: compactContent,
        }),
      });

      if (!res.ok) {
        setSyncStatus("error");
        const errText = await res.text();
        throw new Error(`저장 실패 (${res.status}): ${errText.substring(0, 100)}`);
      }

      const data = await res.json();
      if (!data.success) {
        setSyncStatus("error");
        throw new Error(data.error || "DB 저장 실패");
      }

      setCurrentDocId(docId);
      setCurrentDocTitle(title);
      setSyncStatus("synced");
      showToast(`Neon DB에 "${title}" 문서가 저장되었습니다.`);
    },
    [currentDocId, sheets, showToast]
  );

  /** Load spreadsheet from Neon DB */
  const handleLoadSpreadsheet = useCallback(
    async (id: string, title: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/spreadsheets/${id}`);
        if (!res.ok) {
          throw new Error(`문서 불러오기 실패 (${res.status})`);
        }
        const data = await res.json();
        if (!data.success || !data.spreadsheet) {
          throw new Error(data.error || "문서를 불러오지 못했습니다.");
        }

        const loadedRaw = data.spreadsheet.content;
        const loadedArray = Array.isArray(loadedRaw) ? loadedRaw : [loadedRaw];
        
        // 2000행 x 520열 대용량 캔버스 그리드로 복원
        const expandedSheets = expandSheetsFromStorage(loadedArray);

        setSheets(expandedSheets);
        setCurrentDocId(id);
        setCurrentDocTitle(title);
        setSyncStatus("synced");
        showToast(`Neon DB에서 "${title}" 문서를 불러왔습니다.`);
      } catch (err: any) {
        console.error("DB 로드 실패:", err);
        setError(err.message || "문서 로드 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  /** Handle local file import */
  const handleImport = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      try {
        const importedSheets = await importFile(file);
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setSheets(importedSheets);
        setCurrentDocId(null); // 로컬 파일 로드 시 신규 미저장 상태로 시작
        setCurrentDocTitle(fileName);
        setSyncStatus("unsaved");
        showToast(`"${file.name}" 파일을 성공적으로 불러왔습니다.`);
      } catch (err) {
        console.error("파일 불러오기 실패:", err);
        setError(
          err instanceof Error ? err.message : "파일을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  /** Handle CSV export */
  const handleExportCsv = useCallback(() => {
    const currentData = wrapperRef.current?.getData() ?? sheets;
    const activeSheet = currentData[0];
    if (!activeSheet) {
      setError("내보낼 시트 데이터가 없습니다.");
      return;
    }
    try {
      exportCsv(activeSheet, currentDocTitle || activeSheet.name || "hyunscsv_export");
      showToast("CSV 파일 다운로드가 완료되었습니다.");
    } catch (err) {
      console.error("CSV 내보내기 실패:", err);
      setError("CSV 내보내기 중 오류가 발생했습니다.");
    }
  }, [sheets, currentDocTitle, showToast]);

  /** Handle XLSX export */
  const handleExportXlsx = useCallback(() => {
    const currentData = wrapperRef.current?.getData() ?? sheets;
    if (!currentData || currentData.length === 0) {
      setError("내보낼 시트 데이터가 없습니다.");
      return;
    }
    try {
      exportXlsx(currentData, currentDocTitle || "hyunscsv_export");
      showToast("XLSX 파일 다운로드가 완료되었습니다.");
    } catch (err) {
      console.error("XLSX 내보내기 실패:", err);
      setError("XLSX 내보내기 중 오류가 발생했습니다.");
    }
  }, [sheets, currentDocTitle, showToast]);

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

  /** Handle function selection from formula dropdown */
  const handleSelectFunction = useCallback(
    (func: SpreadsheetFunction) => {
      wrapperRef.current?.insertFormula(func.template);
      showToast(`함수 ${func.name} 삽입: ${func.example}`);
    },
    [showToast]
  );

  // 클라이언트 인증 검사 중
  if (isAuthenticated === null) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <span className="spinner" style={{ width: "24px", height: "24px" }} />
      </div>
    );
  }

  // 미인증 시 관리자 로그인 화면 노출
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Header */}
      <Header
        onImport={handleImport}
        onExportCsv={handleExportCsv}
        onExportXlsx={handleExportXlsx}
        onSelectFunction={handleSelectFunction}
        onOpenDbSave={() => setIsDbSaveOpen(true)}
        onOpenDbList={() => setIsDbListOpen(true)}
        onLogout={handleLogout}
        syncStatus={syncStatus}
        isLoading={isLoading}
        sheetName={currentSheetName}
      />

      {/* Formatting Toolbar */}
      <Toolbar
        onCommand={handleToolbarCommand}
        onSelectFunction={handleSelectFunction}
        activeFormats={activeFormats}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: "92px",
            right: "20px",
            background: "#1e293b",
            color: "#ffffff",
            padding: "8px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.5 4.5L6.5 11.5L3 8"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {toast}
        </div>
      )}

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

      {/* Neon DB Save Modal */}
      <DbSaveModal
        isOpen={isDbSaveOpen}
        onClose={() => setIsDbSaveOpen(false)}
        onSave={handleDbSave}
        defaultTitle={currentDocTitle}
      />

      {/* Neon DB List & Load Modal */}
      <DbListModal
        isOpen={isDbListOpen}
        onClose={() => setIsDbListOpen(false)}
        onLoadSpreadsheet={handleLoadSpreadsheet}
        currentDocId={currentDocId}
      />
    </main>
  );
}
