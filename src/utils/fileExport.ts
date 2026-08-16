import * as XLSX from "xlsx";
import type { Sheet, Cell } from "@fortune-sheet/core";

/**
 * FortuneSheet Sheet 객체에서 유효한 2D 데이터 배열(AoA)을 완벽하게 추출
 * sheet.data (CellMatrix 2D 배열) 및 sheet.celldata (희소 배열) 모두 지원
 */
export function sheetToAoa(sheet: Sheet): (string | number | boolean | null)[][] {
  if (!sheet) return [];

  // 1. sheet.data (2D 배열 Matrix 형태) 우선 처리
  if (sheet.data && Array.isArray(sheet.data) && sheet.data.length > 0) {
    let maxRow = -1;
    let maxCol = -1;

    // 데이터가 있는 최대 행, 열 범위 탐색
    sheet.data.forEach((row, r) => {
      if (!row || !Array.isArray(row)) return;
      row.forEach((cell, c) => {
        if (cell !== null && cell !== undefined) {
          const val = getCellValue(cell);
          if (val !== null && val !== undefined && val !== "") {
            if (r > maxRow) maxRow = r;
            if (c > maxCol) maxCol = c;
          }
        }
      });
    });

    if (maxRow === -1 || maxCol === -1) {
      // sheet.data에 값이 없으면 celldata로 넘어감
    } else {
      const aoa: (string | number | boolean | null)[][] = [];
      for (let r = 0; r <= maxRow; r++) {
        const row = sheet.data[r] || [];
        const rowData: (string | number | boolean | null)[] = [];
        for (let c = 0; c <= maxCol; c++) {
          const cell = row[c];
          const val = getCellValue(cell);
          rowData.push(val !== undefined ? val : null);
        }
        aoa.push(rowData);
      }
      return aoa;
    }
  }

  // 2. sheet.celldata ({ r, c, v } 희소 배열 형태) 처리
  if (sheet.celldata && Array.isArray(sheet.celldata) && sheet.celldata.length > 0) {
    let maxRow = -1;
    let maxCol = -1;

    sheet.celldata.forEach(({ r, c, v }) => {
      if (v !== null && v !== undefined) {
        const val = getCellValue(v);
        if (val !== null && val !== undefined && val !== "") {
          if (r > maxRow) maxRow = r;
          if (c > maxCol) maxCol = c;
        }
      }
    });

    if (maxRow >= 0 && maxCol >= 0) {
      const aoa: (string | number | boolean | null)[][] = Array.from(
        { length: maxRow + 1 },
        () => new Array(maxCol + 1).fill(null)
      );

      sheet.celldata.forEach(({ r, c, v }) => {
        if (r <= maxRow && c <= maxCol) {
          const val = getCellValue(v);
          aoa[r][c] = val !== undefined ? val : null;
        }
      });
      return aoa;
    }
  }

  return [];
}

/**
 * 셀 객체 또는 원시값에서 실제 표출값/계산값 추출
 */
function getCellValue(cell: Cell | null | undefined | any): string | number | boolean | null {
  if (cell === null || cell === undefined) return null;
  if (typeof cell !== "object") return cell;

  // 수식 계산값 또는 서식 적용된 표시 문자열 m 우선, 없으면 raw 값 v
  if (cell.m !== undefined && cell.m !== null && cell.m !== "") {
    // 숫자로 변환 가능하면 숫자로, 아니면 문자열로
    const num = Number(cell.m);
    if (!isNaN(num) && String(num) === String(cell.m).trim()) {
      return num;
    }
    return String(cell.m);
  }

  if (cell.v !== undefined && cell.v !== null && cell.v !== "") {
    return cell.v;
  }

  // 수식이 입력되어 있지만 아직 v가 없으면 f 반환
  if (cell.f !== undefined && cell.f !== null && cell.f !== "") {
    return `=${cell.f}`;
  }

  return null;
}

/**
 * FortuneSheet Sheet[] → XLSX Workbook → .xlsx 파일 다운로드
 */
export function exportXlsx(sheets: Sheet[], fileName = "hyunscsv_export") {
  if (!sheets || sheets.length === 0) return;
  const wb = XLSX.utils.book_new();
  
  sheets.forEach((sheet, idx) => {
    const aoa = sheetToAoa(sheet);
    // 빈 시트일 경우 기본 1칸이라도 생성
    const safeAoa = aoa.length > 0 ? aoa : [[""]];
    const ws = XLSX.utils.aoa_to_sheet(safeAoa);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name || `Sheet${idx + 1}`);
  });

  const safeFileName = fileName.replace(/\.[^/.]+$/, "");
  XLSX.writeFile(wb, `${safeFileName}.xlsx`);
}

/**
 * FortuneSheet 현재 시트 → .csv 파일 다운로드 (UTF-8 BOM 포함하여 엑셀 한글 깨짐 방지)
 */
export function exportCsv(sheet: Sheet, fileName = "hyunscsv_export") {
  if (!sheet) return;
  const aoa = sheetToAoa(sheet);
  const safeAoa = aoa.length > 0 ? aoa : [[""]];
  const ws = XLSX.utils.aoa_to_sheet(safeAoa);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // UTF-8 BOM (\uFEFF) 추가
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeFileName = fileName.replace(/\.[^/.]+$/, "");
  a.download = `${safeFileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
