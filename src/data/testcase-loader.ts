import * as XLSX from "xlsx";

export type TestCaseRow = {
  sheet: string;
  sheetName: string;
  group: string;
  rowNumber: number;
  id: string;
  requirement: string;
  name: string;
  objective: string;
  inputRaw: string;
  input: string[];
  expected: string;
  expectedStatus: string;
};

export const DATA_FILE =
  process.env.ORANGEHRM_TESTCASE_FILE ??
  "./Testcase-OrangeHRM.xlsx";

const SHEET_DEFINITIONS = [
  { sheet: "Login", names: ["Đăng nhập", "🔐 Login"] },
  { sheet: "User Management", names: ["Quản lý người dùng", "👤 User Management"] },
  { sheet: "Employee List", names: ["Danh sách nhân viên", "Quản lý nhân viên", "👥 Employee List"] }
];

function normalizeTestCaseId(rawId: string) {
  const id = rawId.trim();
  const match = id.match(/^(TC-[A-Z]+)(\d+)$/i);
  if (!match) return id;

  const [, prefix, digits] = match;
  const caseNumber = Number(digits);
  if (Number.isNaN(caseNumber)) return id;

  const normalizedDigits = caseNumber < 10
    ? String(caseNumber).padStart(2, "0")
    : String(caseNumber);

  return `${prefix}${normalizedDigits}`;
}

export function loadTestCases(): TestCaseRow[] {
  const wb = XLSX.readFile(DATA_FILE);
  const all: TestCaseRow[] = [];

  for (const definition of SHEET_DEFINITIONS) {
    const sheetName = definition.names.find((name) => wb.SheetNames.includes(name));
    if (!sheetName) continue;

    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: ""
    });
    let currentGroup = "";

    for (let index = 2; index < rows.length; index++) {
      const row = rows[index];
      const firstColumn = String(row[0] ?? "").trim();
      if (!firstColumn) continue;

      if (!/^TC-/.test(firstColumn)) {
        const hasOtherContent = row.slice(1).some((cell) => String(cell ?? "").trim() !== "");
        if (!hasOtherContent) currentGroup = firstColumn;
        continue;
      }

      const id = normalizeTestCaseId(firstColumn);
      if (!/^TC-/.test(id)) continue;
      const inputRaw = String(row[3] ?? "");
      all.push({
        sheet: definition.sheet,
        sheetName,
        group: currentGroup,
        rowNumber: index + 1,
        id,
        requirement: String(row[10] ?? "").trim(),
        name: String(row[1] ?? "").trim(),
        objective: String(row[2] ?? "").trim(),
        inputRaw,
        input: inputRaw.split("\n").map(s => s.trim()),
        expected: String(row[5] ?? "").trim(),
        expectedStatus: String(row[7] ?? "").trim()
      });
    }
  }

  return all;
}
