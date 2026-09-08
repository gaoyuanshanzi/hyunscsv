"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  /** DB 불러오기나 새 파일 생성 시마다 증가시켜 강제 리마운트를 유발 */
  reloadToken?: number;
}

/** 기본 빈 시트 (2,000행 x 520열 = Z열의 20배) */
export const DEFAULT_SHEETS: Sheet[] = [
  {
    id: "sheet_default_1",
    name: "Sheet1",
    celldata: [],
    calcChain: [],
    row: 2000,
    column: 520,
    status: 1,
    order: 0,
  },
];

/* ── 셀 주소 변환 유틸리티 ────────────────────────── */

function colToLetter(col: number): string {
  let temp = "";
  let c = col + 1;
  while (c > 0) {
    const rem = (c - 1) % 26;
    temp = String.fromCharCode(65 + rem) + temp;
    c = Math.floor((c - 1) / 26);
  }
  return temp;
}

function cellToAddress(r: number, c: number): string {
  return `${colToLetter(c)}${r + 1}`;
}

function rangeToAddress(r1: number, c1: number, r2: number, c2: number): string {
  if (r1 === r2 && c1 === c2) {
    return cellToAddress(r1, c1);
  }
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  return `${cellToAddress(minR, minC)}:${cellToAddress(maxR, maxC)}`;
}

const OPERATOR_CHARS = new Set([
  "+",
  "-",
  "*",
  "/",
  "(",
  ")",
  ",",
  "%",
  "^",
  "&",
  ">",
  "<",
  "=",
  ":",
]);

export default function SpreadsheetWrapper({
  sheets,
  onDataChange,
  wrapperRef,
  reloadToken = 0,
}: Props) {
  const workbookInstanceRef = useRef<WorkbookInstance | null>(null);
  const wrapperDivRef = useRef<HTMLDivElement | null>(null);
  const internalSheetsRef = useRef<Sheet[]>(sheets);
  const [pointingRect, setPointingRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // 수식 포인팅(화살표 키/마우스 클릭) 상태 추적
  const formulaPointingRef = useRef<{
    isPointing: boolean;
    originR: number;
    originC: number;
    targetR: number;
    targetC: number;
    anchorR: number;
    anchorC: number;
    replacedLen: number;
  }>({
    isPointing: false,
    originR: 0,
    originC: 0,
    targetR: 0,
    targetC: 0,
    anchorR: 0,
    anchorC: 0,
    replacedLen: 0,
  });

  // 외부에서 sheets가 주입되었을 때 동기화
  useEffect(() => {
    internalSheetsRef.current = sheets;
  }, [sheets]);

  // reloadToken이 바뀔 때마다 항상 Workbook을 새로 마운트
  const workbookKey = useMemo(() => {
    return `wb-${reloadToken}-${sheets.map((s) => s.id || s.name).join("-")}-${
      sheets[0]?.row || 100
    }`;
  }, [sheets, reloadToken]);

  // 데이터 변경 핸들러 (onChange)
  const handleChange = useCallback(
    (data: Sheet[]) => {
      internalSheetsRef.current = data;
      onDataChange(data);
    },
    [onDataChange]
  );

  /** 아래로 채우기 (Excel Fill Down / Ctrl+D) */
  const fillDown = useCallback(() => {
    const wb = workbookInstanceRef.current;
    if (!wb) return;

    try {
      const selection = wb.getSelection();
      if (!selection || selection.length === 0) return;

      for (const range of selection) {
        const r_start = range.row[0];
        const r_end = range.row[1];
        const c_start = range.column[0];
        const c_end = range.column[1];

        if (r_end > r_start) {
          // 다중 행 선택: 맨 위 행(r_start)의 수식/값/서식을 아래 행들(r_start + 1 ~ r_end)로 채우기
          wb.autoFillCell(
            { row: [r_start, r_start], column: [c_start, c_end] },
            { row: [r_start + 1, r_end], column: [c_start, c_end] },
            "down"
          );
        } else if (r_start > 0) {
          // 단일 셀 선택: 바로 위 행(r_start - 1)의 수식/값/서식을 현재 셀(r_start)로 채우기
          wb.autoFillCell(
            { row: [r_start - 1, r_start - 1], column: [c_start, c_end] },
            { row: [r_start, r_start], column: [c_start, c_end] },
            "down"
          );
        }
      }
    } catch (err) {
      console.warn("fillDown error:", err);
    }
  }, []);

  // 엑셀 수식 포인팅(화살표 키로 셀 주소 자동 삽입) 및 Ctrl+D 전역 키보드 리스너
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl+D / Cmd+D 단축키
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "d" || e.key === "D" || e.keyCode === 68)
      ) {
        e.preventDefault();
        e.stopPropagation();
        fillDown();
        return;
      }

      // 2. 수식 입력 중 화살표 키(ArrowUp, ArrowDown, ArrowLeft, ArrowRight)로 셀 참조 이동
      const cellEditor = document.getElementById("luckysheet-rich-text-editor");
      const fxEditor = document.getElementById("luckysheet-functionbox-cell");
      const isCellActive =
        cellEditor &&
        (document.activeElement === cellEditor ||
          cellEditor.contains(document.activeElement));
      const isFxActive =
        fxEditor &&
        (document.activeElement === fxEditor ||
          fxEditor.contains(document.activeElement));

      const activeEditor = isFxActive ? fxEditor : isCellActive ? cellEditor : null;

      if (activeEditor) {
        const text = (
          activeEditor.innerText ||
          activeEditor.textContent ||
          ""
        ).trim();

        // 수식 모드인지 확인
        if (text.startsWith("=")) {
          const isArrow = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
          ].includes(e.key);

          if (isArrow) {
            const pointing = formulaPointingRef.current;
            const lastChar = text.slice(-1);
            const canStartPointing =
              OPERATOR_CHARS.has(lastChar) || lastChar === "=";

            if (pointing.isPointing || canStartPointing) {
              e.preventDefault();
              e.stopPropagation();

              const wb = workbookInstanceRef.current;
              const selection = wb?.getSelection();
              const currentR = selection?.[0]?.row[0] ?? 0;
              const currentC = selection?.[0]?.column[0] ?? 0;

              if (!pointing.isPointing) {
                // 새로운 포인팅 세션 시작
                pointing.isPointing = true;
                pointing.originR = currentR;
                pointing.originC = currentC;
                pointing.targetR = currentR;
                pointing.targetC = currentC;
                pointing.anchorR = currentR;
                pointing.anchorC = currentC;
                pointing.replacedLen = 0;
              }

              // 화살표 방향으로 이동
              let dr = 0;
              let dc = 0;
              if (e.key === "ArrowUp") dr = -1;
              if (e.key === "ArrowDown") dr = 1;
              if (e.key === "ArrowLeft") dc = -1;
              if (e.key === "ArrowRight") dc = 1;

              pointing.targetR = Math.max(0, pointing.targetR + dr);
              pointing.targetC = Math.max(0, pointing.targetC + dc);

              let newAddress = "";
              if (e.shiftKey) {
                newAddress = rangeToAddress(
                  pointing.anchorR,
                  pointing.anchorC,
                  pointing.targetR,
                  pointing.targetC
                );
              } else {
                pointing.anchorR = pointing.targetR;
                pointing.anchorC = pointing.targetC;
                newAddress = cellToAddress(pointing.targetR, pointing.targetC);
              }

              // 에디터 텍스트에서 이전 포인팅 주소를 새 주소로 치환
              const baseText = text.slice(
                0,
                text.length - pointing.replacedLen
              );
              const updatedText = baseText + newAddress;
              pointing.replacedLen = newAddress.length;

              activeEditor.innerText = updatedText;
              if (cellEditor && cellEditor !== activeEditor) {
                cellEditor.innerText = updatedText;
              }
              if (fxEditor && fxEditor !== activeEditor) {
                fxEditor.innerText = updatedText;
              }

              // 커서를 맨 끝으로 이동
              const sel = window.getSelection();
              if (sel) {
                const range = document.createRange();
                range.selectNodeContents(activeEditor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
              }

              // 대상 셀의 화면 좌표 계산 — getColumnWidth/getRowHeight API로 실제 열/행 크기를 구해 정확히 계산
              try {
                const wbInst = workbookInstanceRef.current;
                const inputBox =
                  document.getElementById("luckysheet-input-box") ||
                  document.querySelector(".luckysheet-input-box");

                if (wbInst && inputBox && inputBox instanceof HTMLElement) {
                  // luckysheet-input-box의 left/top은 fortune-cell-area 내부 절대 좌표
                  const origLeft = parseFloat(inputBox.style.left) || 0;
                  const origTop = parseFloat(inputBox.style.top) || 0;

                  // fortune-cell-area와 wrapperDiv 사이의 오프셋 계산
                  // (오버레이는 wrapperDiv 기준 absolute, inputBox 좌표는 fortune-cell-area 기준)
                  let cellAreaOffsetX = 0;
                  let cellAreaOffsetY = 0;
                  const cellArea = document.querySelector(".fortune-cell-area");
                  if (cellArea && wrapperDivRef.current) {
                    const cellAreaRect = cellArea.getBoundingClientRect();
                    const wrapperRect = wrapperDivRef.current.getBoundingClientRect();
                    cellAreaOffsetX = cellAreaRect.left - wrapperRect.left;
                    cellAreaOffsetY = cellAreaRect.top - wrapperRect.top;
                  }

                  const oR = pointing.originR;
                  const oC = pointing.originC;
                  const tR = pointing.targetR;
                  const tC = pointing.targetC;

                  // origin~target 사이 열들의 실제 너비 합산 → targetLeft 계산
                  let targetLeft = origLeft;
                  if (tC > oC) {
                    // 오른쪽으로 이동: origin열 너비부터 (target-1)열까지 더함
                    const colIndices = Array.from({ length: tC - oC }, (_, i) => oC + i);
                    const colWidths = wbInst.getColumnWidth(colIndices);
                    for (const idx of colIndices) {
                      targetLeft += (colWidths[idx] ?? 73);
                    }
                  } else if (tC < oC) {
                    // 왼쪽으로 이동: target열부터 (origin-1)열까지 너비를 뺌
                    const colIndices = Array.from({ length: oC - tC }, (_, i) => tC + i);
                    const colWidths = wbInst.getColumnWidth(colIndices);
                    for (const idx of colIndices) {
                      targetLeft -= (colWidths[idx] ?? 73);
                    }
                  }

                  // origin~target 사이 행들의 실제 높이 합산 → targetTop 계산
                  let targetTop = origTop;
                  if (tR > oR) {
                    const rowIndices = Array.from({ length: tR - oR }, (_, i) => oR + i);
                    const rowHeights = wbInst.getRowHeight(rowIndices);
                    for (const idx of rowIndices) {
                      targetTop += (rowHeights[idx] ?? 20);
                    }
                  } else if (tR < oR) {
                    const rowIndices = Array.from({ length: oR - tR }, (_, i) => tR + i);
                    const rowHeights = wbInst.getRowHeight(rowIndices);
                    for (const idx of rowIndices) {
                      targetTop -= (rowHeights[idx] ?? 20);
                    }
                  }

                  // target 셀 자체의 너비/높이
                  const tColWidths = wbInst.getColumnWidth([tC]);
                  const tRowHeights = wbInst.getRowHeight([tR]);
                  const targetCellW = tColWidths[tC] ?? 73;
                  const targetCellH = tRowHeights[tR] ?? 20;

                  if (e.shiftKey) {
                    // shift 선택: anchor~target 범위
                    const aR = pointing.anchorR;
                    const aC = pointing.anchorC;

                    // anchor 셀 위치도 같은 방식으로 계산
                    let anchorLeft = origLeft;
                    if (aC > oC) {
                      const idxs = Array.from({ length: aC - oC }, (_, i) => oC + i);
                      const ws = wbInst.getColumnWidth(idxs);
                      for (const idx of idxs) anchorLeft += (ws[idx] ?? 73);
                    } else if (aC < oC) {
                      const idxs = Array.from({ length: oC - aC }, (_, i) => aC + i);
                      const ws = wbInst.getColumnWidth(idxs);
                      for (const idx of idxs) anchorLeft -= (ws[idx] ?? 73);
                    }
                    let anchorTop = origTop;
                    if (aR > oR) {
                      const idxs = Array.from({ length: aR - oR }, (_, i) => oR + i);
                      const hs = wbInst.getRowHeight(idxs);
                      for (const idx of idxs) anchorTop += (hs[idx] ?? 20);
                    } else if (aR < oR) {
                      const idxs = Array.from({ length: oR - aR }, (_, i) => aR + i);
                      const hs = wbInst.getRowHeight(idxs);
                      for (const idx of idxs) anchorTop -= (hs[idx] ?? 20);
                    }

                    const aColWidths = wbInst.getColumnWidth([aC]);
                    const aRowHeights = wbInst.getRowHeight([aR]);
                    const anchorCellW = aColWidths[aC] ?? 73;
                    const anchorCellH = aRowHeights[aR] ?? 20;

                    const minLeft = Math.min(targetLeft, anchorLeft);
                    const minTop = Math.min(targetTop, anchorTop);
                    const maxRight = Math.max(targetLeft + targetCellW, anchorLeft + anchorCellW);
                    const maxBottom = Math.max(targetTop + targetCellH, anchorTop + anchorCellH);

                    setPointingRect({
                      left: minLeft + cellAreaOffsetX,
                      top: minTop + cellAreaOffsetY,
                      width: maxRight - minLeft,
                      height: maxBottom - minTop,
                    });
                  } else {
                    setPointingRect({
                      left: targetLeft + cellAreaOffsetX,
                      top: targetTop + cellAreaOffsetY,
                      width: targetCellW,
                      height: targetCellH,
                    });
                  }
                }
              } catch (err) {
                console.warn("pointingRect calc error:", err);
              }

              return;
            }
          } else if (
            OPERATOR_CHARS.has(e.key) ||
            e.key === "Enter" ||
            e.key === "Escape"
          ) {
            // 연산자를 타이핑하거나 Enter/Escape를 누르면 현재 포인팅 세션 완료
            formulaPointingRef.current.isPointing = false;
            formulaPointingRef.current.replacedLen = 0;
            setPointingRect(null);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [fillDown]);

  // 외부 핸들 구성
  if (wrapperRef) {
    wrapperRef.current = {
      getData: () => {
        // FortuneSheet 인스턴스에서 실시간 시트 데이터(sheet.data 포함) 가져오기
        if (workbookInstanceRef.current) {
          try {
            const liveSheets = workbookInstanceRef.current.getAllSheets();
            if (
              liveSheets &&
              Array.isArray(liveSheets) &&
              liveSheets.length > 0
            ) {
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
                newFa = fa.replace(
                  /\.(0+)/,
                  (_: string, zeros: string) => `.${zeros}0`
                );
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
                  newFa = fa.replace(
                    /0(\.0+)%/,
                    (_: string, zeros: string) => {
                      const remaining = zeros.slice(0, -1);
                      return remaining === "." ? "0%" : `0${remaining}%`;
                    }
                  );
                } else {
                  newFa = "0%";
                }
              } else if (fa.includes(".")) {
                newFa = fa.replace(
                  /\.(0+)/,
                  (_: string, zeros: string) => {
                    const remaining = zeros.slice(0, -1);
                    return remaining.length > 0 ? `.${remaining}` : "";
                  }
                );
              } else if (fa.includes("#,##0")) {
                newFa = "#,##0";
              } else {
                newFa = "0";
              }

              wb.setCellFormatByRange("ct", { fa: newFa, t: "n" }, range);
              break;
            }
            case "formatDate": {
              wb.setCellFormatByRange(
                "ct",
                { fa: "yyyy-mm-dd", t: "d" },
                range
              );
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
            case "fillDown": {
              fillDown();
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
      ref={wrapperDivRef}
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

      {/* 엑셀 스타일 수식 참조 대상 셀 점선(Marching Ants) 하이라이트 박스 */}
      {pointingRect && (
        <div
          id="formula-pointing-dashed-box"
          style={{
            position: "absolute",
            left: pointingRect.left,
            top: pointingRect.top,
            width: pointingRect.width,
            height: pointingRect.height,
            border: "2px dashed #2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            boxShadow:
              "0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 10px rgba(37, 99, 235, 0.45)",
            pointerEvents: "none",
            zIndex: 999,
            animation: "marchingAnts 0.7s linear infinite",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}
