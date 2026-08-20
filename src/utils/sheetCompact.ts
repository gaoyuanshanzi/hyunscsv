import type { Sheet, Cell, CellWithRowAndCol } from "@fortune-sheet/core";
import { DEFAULT_ROW_COUNT, DEFAULT_COL_COUNT } from "./fileImport";

/**
 * DB 저장용 경량화 함수:
 * 2,000행 x 520열의 거대한 null 매트릭스를 제거하고,
 * 실제 데이터가 있는 셀(celldata)과 메타데이터만 추출하여 용량을 99.9% 압축합니다.
 * (6.5MB -> 수 KB로 압축되어 Vercel 4.5MB Payload 한도 문제를 완벽 해결)
 */
export function compactSheetsForStorage(sheets: Sheet[]): Sheet[] {
  if (!sheets || !Array.isArray(sheets)) return [];

  return sheets.map((sheet, idx) => {
    const compactCelldata: CellWithRowAndCol[] = [];

    // 1. sheet.data(2D 매트릭스)에서 실제 데이터가 있는 셀만 추출
    if (sheet.data && Array.isArray(sheet.data)) {
      sheet.data.forEach((row, r) => {
        if (!row || !Array.isArray(row)) return;
        row.forEach((cell, c) => {
          if (cell !== null && cell !== undefined) {
            // 셀 객체 또는 원시값 검증
            if (typeof cell === "object") {
              const hasValue =
                (cell.v !== undefined && cell.v !== null && cell.v !== "") ||
                (cell.m !== undefined && cell.m !== null && cell.m !== "") ||
                (cell.f !== undefined && cell.f !== null && cell.f !== "") ||
                cell.bg ||
                cell.fc ||
                cell.bl ||
                cell.it ||
                cell.un ||
                cell.mc;
              if (hasValue) {
                compactCelldata.push({ r, c, v: cell });
              }
            } else if (cell !== "") {
              compactCelldata.push({
                r,
                c,
                v: {
                  v: cell,
                  m: String(cell),
                  ct: { fa: "General", t: typeof cell === "number" ? "n" : "s" },
                },
              });
            }
          }
        });
      });
    }

    // 2. 만약 sheet.data가 비어있고 celldata가 있다면 celldata 사용
    if (compactCelldata.length === 0 && sheet.celldata && Array.isArray(sheet.celldata)) {
      sheet.celldata.forEach((item) => {
        if (item && item.v !== null && item.v !== undefined) {
          compactCelldata.push(item);
        }
      });
    }

    return {
      id: sheet.id || `sheet_${Date.now()}_${idx}`,
      name: sheet.name || `Sheet${idx + 1}`,
      status: sheet.status ?? (idx === 0 ? 1 : 0),
      order: sheet.order ?? idx,
      row: sheet.row || DEFAULT_ROW_COUNT,
      column: sheet.column || DEFAULT_COL_COUNT,
      config: sheet.config || {},
      celldata: compactCelldata,
      // 거대한 2D null 배열은 제거하여 전송 크기 최소화
      data: undefined,
    } satisfies Sheet;
  });
}

/**
 * DB에서 불러온 경량 시트를 FortuneSheet 렌더링용 2D Matrix로 복원
 */
export function expandSheetsFromStorage(sheets: Sheet[]): Sheet[] {
  if (!sheets || !Array.isArray(sheets)) return [];

  return sheets.map((sheet, idx) => {
    const rowCount = Math.max(sheet.row || DEFAULT_ROW_COUNT, DEFAULT_ROW_COUNT);
    const colCount = Math.max(sheet.column || DEFAULT_COL_COUNT, DEFAULT_COL_COUNT);

    const matrix: (Cell | null)[][] = Array.from({ length: rowCount }, () =>
      new Array(colCount).fill(null)
    );

    const celldata = sheet.celldata || [];
    celldata.forEach(({ r, c, v }) => {
      if (r < rowCount && c < colCount) {
        matrix[r][c] = v;
      }
    });

    return {
      ...sheet,
      id: sheet.id || `sheet_${Date.now()}_${idx}`,
      status: sheet.status ?? (idx === 0 ? 1 : 0),
      row: rowCount,
      column: colCount,
      celldata: celldata,
      data: matrix,
    } satisfies Sheet;
  });
}
