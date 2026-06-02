import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("Employee List"));

async function runEmployeeCase(tc: any, app: OrangeHrmPage) {
  const [loginUser = "Admin", loginPass = "admin123", arg1 = ""] = tc.input;
  await app.login(loginUser, loginPass);
  await app.openEmployeeList();
  // Wait for the Search button to ensure the employee list page is ready
  await app["page"].getByRole("button", { name: /Search|搜索/i }).waitFor({ state: "visible", timeout: 15000 }).catch(() => {});

  if (tc.id === "TC-E01") {
    await expect(app["page"].locator(".oxd-table-header")).toContainText(/Id|编号/i);
    return;
  }

  if (["TC-E02", "TC-E03"].includes(tc.id)) {
    await app.searchByLabeledInput("Employee Name", arg1);
    await app["page"].getByRole("button", { name: /Search|搜索/i }).click();
    if (tc.id === "TC-E03") await expect(app["page"].getByText(/No Records Found|没有找到记录|无记录/i).first()).toBeVisible();
    return;
  }

  if (tc.id === "TC-E11") {
    await expect(app["page"].getByRole("button", { name: /Delete|删除/i })).toBeDisabled();
    return;
  }

  await expect(app["page"].getByRole("button", { name: /Search|搜索/i })).toBeVisible();
}

test.describe("OrangeHRM Employee List E2E", () => {
  for (const tc of testCases) {
    test(`${tc.id} | ${tc.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await runEmployeeCase(tc, app);
    });
  }
});
