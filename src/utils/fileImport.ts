import * as XLSX from "xlsx";
import type { Sheet, Cell } from "@fortune-sheet/core";

/** SheetJS row-data 타입 (셀값 배열) */
type RowData = (string | number | boolean | null | undefined)[];

/**
 * 2D 원시 배열(AoA)을 FortuneSheet의 data(2D Matrix) 및 celldata(희소 배열)로 동시 변환
 */
function aoaToFortuneData(aoa: RowData[], rowCount: number, colCount: number) {
  const celldata: Sheet["celldata"] = [];
  const matrix: (Cell | null)[][] = Array.from({ length: rowCount }, () =>
    new Array(colCount).fill(null)
  );

  aoa.forEach((row, r) => {
    if (!row || !Array.isArray(row)) return;
    row.forEach((val, c) => {
      if (val === null || val === undefined || val === "") return;
      const cellObj: Cell = {
        v: val,
        m: String(val),
        ct: { fa: "General", t: typeof val === "number" ? "n" : "s" },
      };
      celldata.push({
        r,
        c,
        v: cellObj,
      });
      if (r < rowCount && c < colCount) {
        matrix[r][c] = cellObj;
      }
    });
  });

  return { celldata, matrix };
}

/**
 * 순수 CSV 텍스트 직접 파싱 (SheetJS 보조/대체용 안전 폴백)
 */
function parseRawCsvText(text: string): RowData[] {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r\n|\n|\r/);
  const rows: RowData[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // CSV quotation handling regex
    const row: (string | null)[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cur.trim() === "" ? null : cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    row.push(cur.trim() === "" ? null : cur);
    rows.push(row);
  }

  return rows;
}

/**
 * XLSX/XLS 파일 ArrayBuffer → FortuneSheet Sheet[] 포맷으로 변환
 */
export function parseXlsx(buffer: ArrayBuffer): Sheet[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error("엑셀 파일에 시트가 존재하지 않습니다.");
  }

  return wb.SheetNames.map((name, idx) => {
    const ws = wb.Sheets[name];
    const aoa: RowData[] = ws
      ? (XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: null,
          raw: false,
        }) as RowData[])
      : [];

    const maxRow = Math.max(aoa.length + 20, 100);
    const maxCol = Math.max(
      Math.max(...aoa.map((r) => (r ? r.length : 0)), 0) + 10,
      26
    );

    const { celldata, matrix } = aoaToFortuneData(aoa, maxRow, maxCol);

    return {
      id: `sheet_${Date.now()}_${idx}`,
      name,
      status: idx === 0 ? 1 : 0,
      order: idx,
      celldata,
      data: matrix,
      row: maxRow,
      column: maxCol,
    } satisfies Sheet;
  });
}

/**
 * CSV 파일 텍스트/버퍼 → FortuneSheet Sheet[] 포맷으로 변환
 */
export function parseCsv(text: string, fileName = "Sheet1"): Sheet[] {
  const cleanText = text.replace(/^\uFEFF/, "");
  let aoa: RowData[] = [];

  try {
    const wb = XLSX.read(cleanText, { type: "string" });
    const sheetName = wb.SheetNames[0];
    if (sheetName && wb.Sheets[sheetName]) {
      aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
        header: 1,
        defval: null,
        raw: false,
      }) as RowData[];
    }
  } catch (e) {
    console.warn("SheetJS CSV 파싱 실패, 수동 파서로 전환:", e);
  }

  // 만약 SheetJS로 빈 배열이 나왔다면 수동 파서 사용
  if (aoa.length === 0) {
    aoa = parseRawCsvText(cleanText);
  }

  const sheetDisplayName = fileName.replace(/\.[^/.]+$/, "") || "Sheet1";
  const maxRow = Math.max(aoa.length + 20, 100);
  const maxCol = Math.max(
    Math.max(...aoa.map((r) => (r ? r.length : 0)), 0) + 10,
    26
  );

  const { celldata, matrix } = aoaToFortuneData(aoa, maxRow, maxCol);

  return [
    {
      id: `sheet_${Date.now()}`,
      name: sheetDisplayName,
      status: 1,
      order: 0,
      celldata,
      data: matrix,
      row: maxRow,
      column: maxCol,
    },
  ];
}

/**
 * File 객체를 읽어 적절한 Sheet[] 로 로드
 */
export async function importFile(file: File): Promise<Sheet[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  
  if (ext === "csv" || ext === "tsv" || ext === "txt") {
    const text = await file.text();
    return parseCsv(text, file.name);
  }
  
  // xlsx, xls, ods 등 바이너리 엑셀
  const buffer = await file.arrayBuffer();
  return parseXlsx(buffer);
}
