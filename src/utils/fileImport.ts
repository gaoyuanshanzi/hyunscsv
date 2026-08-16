import * as XLSX from "xlsx";
import type { Sheet } from "@fortune-sheet/core";

/** SheetJS row-data 타입 (셀값 배열) */
type RowData = (string | number | boolean | null | undefined)[];

/**
 * FortuneSheet celldata 포맷으로 변환
 */
function aoa2CellData(
  aoa: RowData[]
): Sheet["celldata"] {
  const celldata: Sheet["celldata"] = [];
  aoa.forEach((row, r) => {
    if (!row) return;
    row.forEach((val, c) => {
      if (val === null || val === undefined || val === "") return;
      celldata.push({
        r,
        c,
        v: {
          v: val,
          m: String(val),
          ct: { fa: "General", t: typeof val === "number" ? "n" : "s" },
        },
      });
    });
  });
  return celldata;
}

/**
 * XLSX 파일 ArrayBuffer → FortuneSheet Sheet[] 포맷으로 변환
 */
export function parseXlsx(buffer: ArrayBuffer): Sheet[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const aoa: RowData[] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: null,
      raw: false,
    }) as RowData[];
    return {
      name,
      celldata: aoa2CellData(aoa),
      row: Math.max(aoa.length + 10, 100),
      column: Math.max((aoa[0]?.length ?? 0) + 5, 26),
    } satisfies Sheet;
  });
}

/**
 * CSV 파일 텍스트 → FortuneSheet Sheet[] 포맷으로 변환
 */
export function parseCsv(text: string, fileName = "Sheet1"): Sheet[] {
  const sheetName = fileName.replace(/\.csv$/i, "") || "Sheet1";
  const ws = XLSX.read(text, { type: "string" }).Sheets["Sheet1"];
  const aoa: RowData[] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
    raw: false,
  }) as RowData[];
  return [
    {
      name: sheetName,
      celldata: aoa2CellData(aoa),
      row: Math.max(aoa.length + 10, 100),
      column: Math.max((aoa[0]?.length ?? 0) + 5, 26),
    },
  ];
}

/**
 * File 객체를 읽어 적절한 포맷으로 파싱 후 반환
 */
export async function importFile(file: File): Promise<Sheet[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    const text = await file.text();
    return parseCsv(text, file.name);
  }
  // xlsx, xls, ods 등
  const buffer = await file.arrayBuffer();
  return parseXlsx(buffer);
}
