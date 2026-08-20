import * as XLSX from "xlsx";
import type { Sheet, Cell } from "@fortune-sheet/core";

/** SheetJS row-data 타입 (셀값 배열) */
type RowData = (string | number | boolean | null | undefined)[];

export const DEFAULT_ROW_COUNT = 2000;
export const DEFAULT_COL_COUNT = 520; // 26 * 20 (A ~ TZ)

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
 * 다국어(일본어 Shift-JIS / CP932 / Windows-31J, EUC-JP, 한국어 EUC-KR / CP949, UTF-8 / UTF-16)
 * 자동 인코딩 감지 및 무손실 텍스트 디코딩
 */
export function decodeBufferAuto(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) return "";

  // 1. UTF-8 with BOM (\uFEFF -> EF BB BF)
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return new TextDecoder("utf-8").decode(buffer.slice(3));
  }

  // 2. UTF-16 LE BOM (FF FE)
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder("utf-16le").decode(buffer.slice(2));
  }

  // 3. UTF-16 BE BOM (FE FF)
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder("utf-16be").decode(buffer.slice(2));
  }

  // 4. Strict UTF-8 테스트 (오류 시 즉시 예외 발생하여 Shift-JIS 등으로 전환)
  try {
    const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
    const text = utf8Decoder.decode(buffer);
    // 대체 문자(\uFFFD)가 없으면 유효한 UTF-8
    if (!text.includes("\uFFFD")) {
      return text;
    }
  } catch (_) {
    // UTF-8 바이트 시퀀스가 아님 -> CJK 인코딩 탐색
  }

  // 5. Shift-JIS (일본어 윈도우/엑셀 표준 CSV 인코딩: CP932)
  try {
    const sjisDecoder = new TextDecoder("shift-jis", { fatal: true });
    const text = sjisDecoder.decode(buffer);
    if (!text.includes("\uFFFD")) {
      return text;
    }
  } catch (_) {}

  // 6. EUC-JP (일본어 리눅스/유닉스 인코딩)
  try {
    const eucJpDecoder = new TextDecoder("euc-jp", { fatal: true });
    const text = eucJpDecoder.decode(buffer);
    if (!text.includes("\uFFFD")) {
      return text;
    }
  } catch (_) {}

  // 7. EUC-KR (한국어 윈도우/엑셀 CP949 인코딩)
  try {
    const eucKrDecoder = new TextDecoder("euc-kr", { fatal: true });
    const text = eucKrDecoder.decode(buffer);
    if (!text.includes("\uFFFD")) {
      return text;
    }
  } catch (_) {}

  // 8. 일본어 Shift-JIS 관용 디코딩 (fallback)
  try {
    const fallbackSjis = new TextDecoder("shift-jis", { fatal: false }).decode(buffer);
    if (fallbackSjis && fallbackSjis.length > 0) {
      return fallbackSjis;
    }
  } catch (_) {}

  // 9. 최종 UTF-8 폴백
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
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

    const maxRow = Math.max(aoa.length + 50, DEFAULT_ROW_COUNT);
    const maxCol = Math.max(
      Math.max(...aoa.map((r) => (r ? r.length : 0)), 0) + 20,
      DEFAULT_COL_COUNT
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
  const maxRow = Math.max(aoa.length + 50, DEFAULT_ROW_COUNT);
  const maxCol = Math.max(
    Math.max(...aoa.map((r) => (r ? r.length : 0)), 0) + 20,
    DEFAULT_COL_COUNT
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
 * File 객체를 읽어 적절한 Sheet[] 로 로드 (다국어/일본어 인코딩 자동 감지)
 */
export async function importFile(file: File): Promise<Sheet[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const buffer = await file.arrayBuffer();
  
  if (ext === "csv" || ext === "tsv" || ext === "txt") {
    const text = decodeBufferAuto(buffer);
    return parseCsv(text, file.name);
  }
  
  // xlsx, xls, ods 등 바이너리 엑셀
  return parseXlsx(buffer);
}
