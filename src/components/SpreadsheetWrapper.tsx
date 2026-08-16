"use client";

import React, { useRef, useCallback } from "react";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import type { Sheet } from "@fortune-sheet/core";

export interface SpreadsheetWrapperHandle {
  getData: () => Sheet[];
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
  const internalSheetsRef = useRef<Sheet[]>(sheets);

  // 데이터 변경 핸들러 (onChange)
  const handleChange = useCallback(
    (data: Sheet[]) => {
      internalSheetsRef.current = data;
      onDataChange(data);
    },
    [onDataChange]
  );

  // 외부에서 현재 데이터 가져오기 & 명령 실행
  if (wrapperRef) {
    wrapperRef.current = {
      getData: () => internalSheetsRef.current,
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
