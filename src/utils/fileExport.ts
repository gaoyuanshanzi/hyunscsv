import * as XLSX from "xlsx";
import type { Sheet } from "@fortune-sheet/core";

/** FortuneSheet celldata에서 2D 배열(AoA) 추출 */
function celldata2Aoa(sheet: Sheet): (string | number | null)[][] {
  const celldata = sheet.celldata ?? [];
  const maxRow = sheet.row ?? 100;
  const maxCol = sheet.column ?? 26;

  // 실제 데이터 범위만 추출
  let lastRow = 0;
  let lastCol = 0;
  celldata.forEach(({ r, c }) => {
    if (r > lastRow) lastRow = r;
    if (c > lastCol) lastCol = c;
  });

  const aoa: (string | number | null)[][] = Array.from(
    { length: Math.min(lastRow + 1, maxRow) },
    () => new Array(Math.min(lastCol + 1, maxCol)).fill(null)
  );

  celldata.forEach(({ r, c, v }) => {
    if (r < aoa.length && c < (aoa[0]?.length ?? 0)) {
      const val = v?.v ?? null;
      aoa[r][c] = val !== undefined ? (val as string | number | null) : null;
    }
  });

  return aoa;
}

/**
 * FortuneSheet Sheet[] → XLSX Workbook → .xlsx 파일 다운로드
 */
export function exportXlsx(sheets: Sheet[], fileName = "hyunscsv_export") {
  const wb = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const aoa = celldata2Aoa(sheet);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name ?? "Sheet1");
  });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * FortuneSheet 현재 시트 → .csv 파일 다운로드
 */
export function exportCsv(sheet: Sheet, fileName = "hyunscsv_export") {
  const aoa = celldata2Aoa(sheet);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
