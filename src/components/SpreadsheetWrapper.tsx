"use client";

import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import type { Sheet } from "@fortune-sheet/core";

export interface SpreadsheetWrapperHandle {
  getData: () => Sheet[];
  getWorkbook: () => WorkbookInstance | null;
  insertFormula: (template: string) => void;
  applyCommand: (command: string, value?: string) => void;
}

interface Props {
  sheets: Sheet[];
  onDataChange: (sheets: Sheet[]) => void;
  wrapperRef?: React.MutableRefObject<SpreadsheetWrapperHandle | null>;
}

/** 기본 빈 시트 */
export const DEFAULT_SHEETS: Sheet[] = [
  {
    id: "sheet_default_1",
    name: "Sheet1",
    celldata: [],
    row: 100,
    column: 26,
    status: 1,
    order: 0,
  },
];

export default function SpreadsheetWrapper({ sheets, onDataChange, wrapperRef }: Props) {
  const workbookInstanceRef = useRef<WorkbookInstance | null>(null);
  const internalSheetsRef = useRef<Sheet[]>(sheets);

  // 외부에서 sheets가 주입되었을 때(예: 파일 열기) 동기화
  useEffect(() => {
    internalSheetsRef.current = sheets;
  }, [sheets]);

  // 새로운 시트가 로드될 때 Workbook이 완전하게 새 데이터를 마운트하도록 고유 key 부여
  const workbookKey = useMemo(() => {
    return sheets.map((s) => s.id || s.name).join("-") + "-" + (sheets[0]?.row || 100);
  }, [sheets]);

  // 데이터 변경 핸들러 (onChange)
  const handleChange = useCallback(
    (data: Sheet[]) => {
      internalSheetsRef.current = data;
      onDataChange(data);
    },
    [onDataChange]
  );

  // 외부 핸들 구성
  if (wrapperRef) {
    wrapperRef.current = {
      getData: () => {
        // FortuneSheet 인스턴스에서 실시간 시트 데이터(sheet.data 포함) 가져오기
        if (workbookInstanceRef.current) {
          try {
            const liveSheets = workbookInstanceRef.current.getAllSheets();
            if (liveSheets && Array.isArray(liveSheets) && liveSheets.length > 0) {
              return liveSheets;
            }
          } catch (err) {
            console.warn("getAllSheets() 호출 중 경고:", err);
          }
        }
        return internalSheetsRef.current;
      },
      getWorkbook: () => workbookInstanceRef.current,
      insertFormula: (template: string) => {
        try {
          if (workbookInstanceRef.current) {
            const selection = workbookInstanceRef.current.getSelection();
            if (selection && selection.length > 0) {
              const r = selection[0].row[0];
              const c = selection[0].column[0];
              if (r !== undefined && c !== undefined) {
                workbookInstanceRef.current.setCellValue(r, c, template);
              }
            }
          }
          navigator.clipboard?.writeText(template);
        } catch (err) {
          console.warn("insertFormula error:", err);
        }
      },
      applyCommand: (command: string) => {
        const el = document.querySelector<HTMLElement>(".luckysheet-cell-main");
        if (!el) return;
        
        switch (command) {
          case "bold":
            document.execCommand?.("bold");
            break;
          case "italic":
            document.execCommand?.("italic");
            break;
          case "underline":
            document.execCommand?.("underline");
            break;
          default:
            break;
        }
      },
    };
  }

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        background: "var(--color-bg)",
      }}
    >
      <Workbook
        key={workbookKey}
        ref={workbookInstanceRef}
        data={sheets}
        onChange={handleChange}
        lang="en"
        showFormulaBar={true}
        showSheetTabs={true}
        showToolbar={false}
        allowEdit={true}
      />
    </div>
  );
}
