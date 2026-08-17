import ExcelJS from "exceljs";
import { Asset } from "./types";
import { makeId } from "./id";

export type ParsedAsset = {
  group: string;
  name: string;
};

export type ParseResult =
  | { ok: true; assets: ParsedAsset[]; warnings: string[] }
  | { ok: false; error: string };

const LOCATION_HEADERS = [
  "location",
  "functional location",
  "area",
  "room",
  "system",
];
const NAME_HEADERS = [
  "asset",
  "equipment",
  "equipment description",
  "description",
  "name",
];

export function isSupportedExcelFile(file: File): boolean {
  return /\.(xlsx|xls)$/i.test(file.name);
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("richText" in value && Array.isArray((value as any).richText)) {
      return (value as any).richText.map((r: any) => r.text).join("");
    }
    if ("text" in value) return String((value as any).text);
    if ("result" in value) return String((value as any).result ?? "");
  }
  return String(value).trim();
}

function rowToCells(row: ExcelJS.Row, colCount: number): string[] {
  const cells: string[] = [];
  for (let c = 1; c <= colCount; c++) {
    cells.push(cellText(row.getCell(c).value).trim());
  }
  return cells;
}

/** Attempts to find a header row with recognisable location + asset-name columns. */
function findTabularHeader(
  rows: string[][]
): { headerIndex: number; locationCol: number; nameCol: number } | null {
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i];
    let locationCol = -1;
    let nameCol = -1;
    row.forEach((cell, idx) => {
      const lower = cell.toLowerCase();
      if (locationCol === -1 && LOCATION_HEADERS.some((h) => lower === h)) {
        locationCol = idx;
      }
      if (nameCol === -1 && NAME_HEADERS.some((h) => lower === h)) {
        nameCol = idx;
      }
    });
    if (locationCol !== -1 && nameCol !== -1) {
      return { headerIndex: i, locationCol, nameCol };
    }
  }
  return null;
}

function parseTabular(
  rows: string[][],
  headerIndex: number,
  locationCol: number,
  nameCol: number
): { assets: ParsedAsset[]; warnings: string[] } {
  const assets: ParsedAsset[] = [];
  const warnings: string[] = [];
  let blankNames = 0;
  let currentGroup = "";

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every((c) => !c)) continue; // blank separator row

    const location = row[locationCol]?.trim();
    const name = row[nameCol]?.trim();
    if (location) currentGroup = location;

    if (!name) {
      blankNames += 1;
      continue;
    }
    assets.push({ group: currentGroup || "Ungrouped", name });
  }

  if (blankNames > 0) {
    warnings.push(
      `${blankNames} row${blankNames === 1 ? "" : "s"} had no asset name and were skipped.`
    );
  }
  return { assets, warnings };
}

/**
 * Fallback for a flat grouped-list layout: a location header is either the
 * first non-blank row after a blank separator row (matching the SAP export
 * shape — groups separated by a blank line), or, in a multi-column sheet, a
 * row where only column A is filled while asset rows fill more columns.
 * Everything else beneath a header, until the next one, is an asset.
 */
function parseGroupedList(
  rows: string[][],
  colCount: number
): {
  assets: ParsedAsset[];
  warnings: string[];
} {
  const assets: ParsedAsset[] = [];
  const warnings: string[] = [];
  let currentGroup: string | null = null;
  let groupHadAsset = false;
  let emptyGroups = 0;
  let atGroupBoundary = true; // start of sheet counts as a boundary

  function startGroup(name: string) {
    if (currentGroup !== null && !groupHadAsset) emptyGroups += 1;
    currentGroup = name;
    groupHadAsset = false;
  }

  for (const row of rows) {
    if (row.every((c) => !c)) {
      atGroupBoundary = true; // blank separator row
      continue;
    }

    const filledCols = row.filter((c) => c).length;
    const first = row[0]?.trim() ?? "";
    if (!first) {
      atGroupBoundary = false;
      continue;
    }

    const looksLikeHeaderByShape = colCount > 1 && filledCols === 1;
    if (atGroupBoundary || looksLikeHeaderByShape) {
      startGroup(first);
      atGroupBoundary = false;
      continue;
    }

    atGroupBoundary = false;
    if (!currentGroup) {
      assets.push({ group: "Ungrouped", name: first });
    } else {
      assets.push({ group: currentGroup, name: first });
      groupHadAsset = true;
    }
  }
  if (currentGroup !== null && !groupHadAsset) emptyGroups += 1;

  if (emptyGroups > 0) {
    warnings.push(
      `${emptyGroups} location${emptyGroups === 1 ? "" : "s"} had no assets listed and ${
        emptyGroups === 1 ? "was" : "were"
      } skipped.`
    );
  }
  return { assets, warnings };
}

export async function parseAssetExcel(file: File): Promise<ParseResult> {
  if (!isSupportedExcelFile(file)) {
    return {
      ok: false,
      error: "Unsupported file type. Please upload a .xlsx or .xls file.",
    };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { ok: false, error: "Couldn't read the file. Please try again." };
  }

  if (buffer.byteLength === 0) {
    return { ok: false, error: "This file is empty." };
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return {
      ok: false,
      error:
        /\.xls$/i.test(file.name)
          ? "This looks like a legacy .xls file, which isn't supported for parsing. Please re-save it as .xlsx and upload again."
          : "Couldn't read this file as an Excel workbook. It may be corrupted or in an unsupported format.",
    };
  }

  const worksheet = workbook.worksheets.find((ws) => ws.rowCount > 0);
  if (!worksheet) {
    return { ok: false, error: "This workbook has no data to import." };
  }

  const colCount = Math.max(worksheet.columnCount, 1);
  const rows: string[][] = [];
  // includeEmpty: true keeps blank separator rows in place — they're the
  // signal parseGroupedList uses to tell where one location group ends and
  // the next one's header begins.
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    rows.push(rowToCells(row, colCount));
  });

  const nonBlankRows = rows.filter((r) => r.some((c) => c));
  if (nonBlankRows.length === 0) {
    return { ok: false, error: "This sheet has no data to import." };
  }

  const tabular = findTabularHeader(rows);
  const { assets: rawAssets, warnings } = tabular
    ? parseTabular(rows, tabular.headerIndex, tabular.locationCol, tabular.nameCol)
    : parseGroupedList(rows, colCount);

  if (rawAssets.length === 0) {
    return {
      ok: false,
      error:
        "Couldn't find any assets to import. Expected a SAP work-order export grouped by location, with assets listed beneath each (or Location/Asset columns).",
    };
  }

  // De-duplicate identical group+name pairs.
  const seen = new Map<string, ParsedAsset>();
  let duplicateCount = 0;
  for (const asset of rawAssets) {
    const key = `${asset.group.toLowerCase()}::${asset.name.toLowerCase()}`;
    if (seen.has(key)) {
      duplicateCount += 1;
    } else {
      seen.set(key, asset);
    }
  }
  if (duplicateCount > 0) {
    warnings.push(
      `${duplicateCount} duplicate asset${duplicateCount === 1 ? "" : "s"} ${
        duplicateCount === 1 ? "was" : "were"
      } removed.`
    );
  }

  return { ok: true, assets: Array.from(seen.values()), warnings };
}

export function toAssets(
  parsed: ParsedAsset[],
  siteName: string
): Asset[] {
  return parsed.map((p) => ({
    id: makeId("ast"),
    path: `${siteName}/${p.name}`,
    group: p.group,
    name: p.name,
    source: "excel",
  }));
}
