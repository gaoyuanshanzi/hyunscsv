"use client";

import React, { useRef, useCallback } from "react";
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
    name: "Sheet1",
    celldata: [],
    row: 100,
    column: 26,
  },
];

export default function SpreadsheetWrapper({ sheets, onDataChange, wrapperRef }: Props) {
  const workbookInstanceRef = useRef<WorkbookInstance | null>(null);
  const internalSheetsRef = useRef<Sheet[]>(sheets);

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
          // 클립보드에도 복사
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
