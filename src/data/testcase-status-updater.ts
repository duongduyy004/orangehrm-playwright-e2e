import type { TestInfo } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as CFB from "cfb";
import { DATA_FILE, type TestCaseRow } from "./testcase-loader";

type MinimalCaseRow = Pick<TestCaseRow, "id" | "rowNumber" | "sheetName">;

const STATUS_COLUMN = "H";
const LOCK_DIR = path.resolve(process.cwd(), ".tmp-testcase-status-lock");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeStatusText(status: TestInfo["status"]) {
  if (status === "passed") return "Passed";
  if (status === "failed" || status === "timedOut" || status === "interrupted") return "Failed";
  return null;
}

function getSheetXmlPath(cfb: any, sheetName: string) {
  const workbookEntry = (CFB as any).find(cfb, "/xl/workbook.xml");
  const relsEntry = (CFB as any).find(cfb, "/xl/_rels/workbook.xml.rels");
  if (!workbookEntry?.content || !relsEntry?.content) {
    throw new Error("Workbook metadata entries are missing.");
  }

  const workbookXml = workbookEntry.content.toString("utf8");
  const relsXml = relsEntry.content.toString("utf8");
  const escapedSheetName = escapeRegExp(sheetName);
  const sheetMatch = workbookXml.match(
    new RegExp(`<sheet[^>]*name="${escapedSheetName}"[^>]*r:id="([^"]+)"[^>]*/?>`)
  );
  if (!sheetMatch) {
    throw new Error(`Sheet "${sheetName}" not found in workbook.xml`);
  }

  const relationId = sheetMatch[1];
  const relationMatch = relsXml.match(
    new RegExp(`<Relationship[^>]*Id="${escapeRegExp(relationId)}"[^>]*Target="([^"]+)"[^>]*/?>`)
  );
  if (!relationMatch) {
    throw new Error(`Relationship "${relationId}" not found for sheet "${sheetName}"`);
  }

  return `/xl/${relationMatch[1].replace(/^\//, "")}`;
}

function buildInlineStringCell(existingCellXml: string, cellRef: string, statusText: string) {
  const openTagMatch = existingCellXml.match(/^<c\b([^>]*)\/>$/) ?? existingCellXml.match(/^<c\b([^>]*)>/);
  if (!openTagMatch) {
    throw new Error(`Could not parse cell XML for ${cellRef}`);
  }

  const rawAttributes = openTagMatch[1]
    .replace(/\s+t="[^"]*"/g, "")
    .replace(/\s+xml:space="[^"]*"/g, "")
    .trim();
  const attributes = rawAttributes.length > 0 ? ` ${rawAttributes}` : "";
  const textValue = escapeXml(statusText);
  return `<c${attributes} t="inlineStr"><is><t>${textValue}</t></is></c>`;
}

function updateCellTextInSheetXml(sheetXml: string, cellRef: string, statusText: string) {
  const cellPattern = new RegExp(`<c\\b[^>]*r="${escapeRegExp(cellRef)}"[^>]*(?:\\/>|>[\\s\\S]*?<\\/c>)`);
  const cellMatch = sheetXml.match(cellPattern);
  if (!cellMatch) {
    throw new Error(`Cell ${cellRef} not found in sheet XML`);
  }

  const updatedCell = buildInlineStringCell(cellMatch[0], cellRef, statusText);
  return sheetXml.replace(cellPattern, updatedCell);
}

async function withWorkbookLock<T>(callback: () => Promise<T>) {
  const timeoutAt = Date.now() + 60_000;

  while (true) {
    try {
      fs.mkdirSync(LOCK_DIR);
      break;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      if (Date.now() >= timeoutAt) {
        throw new Error(`Timed out waiting for workbook lock: ${LOCK_DIR}`);
      }
      await sleep(100);
    }
  }

  try {
    return await callback();
  } finally {
    fs.rmSync(LOCK_DIR, { recursive: true, force: true });
  }
}

export async function updateWorkbookTestCaseStatus(tc: MinimalCaseRow, testInfo: TestInfo) {
  const statusText = normalizeStatusText(testInfo.status);
  if (!statusText || tc.rowNumber <= 0) return;

  await withWorkbookLock(async () => {
    const workbookPath = path.resolve(DATA_FILE);
    const cfb = (CFB as any).read(workbookPath, { type: "file" });
    const sheetXmlPath = getSheetXmlPath(cfb, tc.sheetName);
    const sheetEntry = (CFB as any).find(cfb, sheetXmlPath);
    if (!sheetEntry?.content) {
      throw new Error(`Sheet XML entry "${sheetXmlPath}" not found`);
    }

    const cellRef = `${STATUS_COLUMN}${tc.rowNumber}`;
    const currentSheetXml = sheetEntry.content.toString("utf8");
    const nextSheetXml = updateCellTextInSheetXml(currentSheetXml, cellRef, statusText);
    sheetEntry.content = Buffer.from(nextSheetXml, "utf8");

    (CFB as any).write(cfb, {
      fileType: "zip",
      type: "file",
      filename: workbookPath
    });
  });
}

export function registerWorkbookStatusSync(
  test: any,
  cases: MinimalCaseRow[]
) {
  const caseMap = new Map(cases.map((tc) => [tc.id, tc]));

  test.afterEach(async ({}: any, testInfo: TestInfo) => {
    const testId = testInfo.title.split("|")[0]?.trim() ?? "";
    const tc = caseMap.get(testId);
    if (!tc) return;
    await updateWorkbookTestCaseStatus(tc, testInfo);
  });
}
