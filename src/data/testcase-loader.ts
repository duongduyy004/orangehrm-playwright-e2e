import * as XLSX from "xlsx";

export type TestCaseRow = {
  sheet: string;
  id: string;
  name: string;
  objective: string;
  inputRaw: string;
  input: string[];
  expected: string;
  expectedStatus: string;
};

const DATA_FILE =
  process.env.ORANGEHRM_TESTCASE_FILE ??
  "/home/duongduy/Downloads/OrangeHRM_TestCases_v5.xlsx";

const SHEETS = ["🔐 Login", "👤 User Management", "👥 Employee List"];

export function loadTestCases(): TestCaseRow[] {
  const wb = XLSX.readFile(DATA_FILE);
  const all: TestCaseRow[] = [];

  for (const sheet of SHEETS) {
    const ws = wb.Sheets[sheet];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: ""
    });

    for (const row of rows.slice(2)) {
      const id = String(row[0] ?? "").trim();
      if (!/^TC-/.test(id)) continue;
      const inputRaw = String(row[3] ?? "");
      all.push({
        sheet,
        id,
        name: String(row[1] ?? "").trim(),
        objective: String(row[2] ?? "").trim(),
        inputRaw,
        input: inputRaw.split("\n"),
        expected: String(row[5] ?? "").trim(),
        expectedStatus: String(row[7] ?? "").trim()
      });
    }
  }

  return all;
}
