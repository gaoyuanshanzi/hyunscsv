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

/** 기본 빈 시트 (2,000행 x 520열 = Z열의 20배) */
export const DEFAULT_SHEETS: Sheet[] = [
  {
    id: "sheet_default_1",
    name: "Sheet1",
    celldata: [],
    row: 2000,
    column: 520,
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
        const wb = workbookInstanceRef.current;
        if (!wb) return;
        try {
          const selection = wb.getSelection();
          let r = 0;
          let c = 0;
          if (selection && selection.length > 0) {
            r = selection[0].row[0] ?? 0;
            c = selection[0].column[0] ?? 0;
          }
          wb.setCellValue(r, c, template);
          navigator.clipboard?.writeText(template);
        } catch (err) {
          console.warn("insertFormula error:", err);
        }
      },
      applyCommand: (command: string, value?: string) => {
        const wb = workbookInstanceRef.current;
        if (!wb) return;

        try {
          const selection = wb.getSelection();
          if (!selection || selection.length === 0) return;

          const range = selection[0];
          const r = range.row[0] ?? 0;
          const c = range.column[0] ?? 0;

          switch (command) {
            case "bold": {
              const cur = wb.getCellValue(r, c, { type: "bl" });
              const next = cur === 1 ? 0 : 1;
              wb.setCellFormatByRange("bl", next, range);
              break;
            }
            case "italic": {
              const cur = wb.getCellValue(r, c, { type: "it" });
              const next = cur === 1 ? 0 : 1;
              wb.setCellFormatByRange("it", next, range);
              break;
            }
            case "underline": {
              const cur = wb.getCellValue(r, c, { type: "un" });
              const next = cur === 1 ? 0 : 1;
              wb.setCellFormatByRange("un", next, range);
              break;
            }
            case "fontSize": {
              if (value) {
                const fs = parseInt(value, 10) || 12;
                wb.setCellFormatByRange("fs", fs, range);
              }
              break;
            }
            case "fontFamily": {
              if (value) {
                wb.setCellFormatByRange("ff", value, range);
              }
              break;
            }
            case "textColor": {
              if (value) {
                wb.setCellFormatByRange("fc", value, range);
              }
              break;
            }
            case "bgColor": {
              if (value) {
                wb.setCellFormatByRange("bg", value, range);
              }
              break;
            }
            case "alignLeft": {
              wb.setCellFormatByRange("ht", 1, range);
              break;
            }
            case "alignCenter": {
              wb.setCellFormatByRange("ht", 0, range);
              break;
            }
            case "alignRight": {
              wb.setCellFormatByRange("ht", 2, range);
              break;
            }
            case "wrap": {
              const cur = wb.getCellValue(r, c, { type: "tb" });
              const next = cur === "2" ? "0" : "2";
              wb.setCellFormatByRange("tb", next, range);
              break;
            }
            case "formatPercent": {
              wb.setCellFormatByRange("ct", { fa: "0.00%", t: "n" }, range);
              break;
            }
            case "formatComma": {
              wb.setCellFormatByRange("ct", { fa: "#,##0", t: "n" }, range);
              break;
            }
            case "increaseDecimal": {
              const curCt = wb.getCellValue(r, c, { type: "ct" });
              const fa = curCt?.fa || "General";
              let newFa = "#,##0.0";

              if (fa.includes("%")) {
                const match = fa.match(/0(\.0+)?%/);
                if (match && match[1]) {
                  const zeros = match[1].substring(1);
                  newFa = `0.${zeros}0%`;
                } else {
                  newFa = "0.0%";
                }
              } else if (fa.includes(".")) {
                newFa = fa.replace(/\.(0+)/, (_, zeros) => `.${zeros}0`);
              } else if (fa.includes("#,##0")) {
                newFa = "#,##0.0";
              } else if (fa === "0") {
                newFa = "0.0";
              } else {
                newFa = "#,##0.0";
              }

              wb.setCellFormatByRange("ct", { fa: newFa, t: "n" }, range);
              break;
            }
            case "decreaseDecimal": {
              const curCt = wb.getCellValue(r, c, { type: "ct" });
              const fa = curCt?.fa || "General";
              let newFa = "#,##0";

              if (fa.includes("%")) {
                const match = fa.match(/0\.0+(0)%/);
                if (match) {
                  newFa = fa.replace(/0(\.0+)%/, (_, zeros) => {
                    const remaining = zeros.slice(0, -1);
                    return remaining === "." ? "0%" : `0${remaining}%`;
                  });
                } else {
                  newFa = "0%";
                }
              } else if (fa.includes(".")) {
                newFa = fa.replace(/\.(0+)/, (_, zeros) => {
                  const remaining = zeros.slice(0, -1);
                  return remaining.length > 0 ? `.${remaining}` : "";
                });
              } else if (fa.includes("#,##0")) {
                newFa = "#,##0";
              } else {
                newFa = "0";
              }

              wb.setCellFormatByRange("ct", { fa: newFa, t: "n" }, range);
              break;
            }
            case "formatDate": {
              wb.setCellFormatByRange("ct", { fa: "yyyy-mm-dd", t: "d" }, range);
              break;
            }
            case "formatTime": {
              wb.setCellFormatByRange("ct", { fa: "hh:mm:ss", t: "d" }, range);
              break;
            }
            case "merge": {
              try {
                wb.mergeCells(selection, "merge-all");
              } catch (_) {
                try {
                  wb.cancelMerge(selection);
                } catch (__) {}
              }
              break;
            }
            default:
              break;
          }
        } catch (err) {
          console.warn("applyCommand error:", err);
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
