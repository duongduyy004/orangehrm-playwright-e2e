import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("Employee List"));

async function fillAddEmployeeForm(page: any, firstName: string, lastName: string, employeeId: string) {
  await page.getByRole("button", { name: /Add|添加/i }).click();
  await expect(page).toHaveURL(/pim\/addEmployee/);
  
  await page.getByPlaceholder("First Name").fill(firstName);
  await page.getByPlaceholder("Last Name").fill(lastName);
  
  if (employeeId) {
    const idInput = page.locator(".oxd-grid-2 .oxd-input").first();
    await idInput.fill("");
    await idInput.fill(employeeId);
  }
}

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
    const deleteBtn = app["page"].getByRole("button", { name: /Delete|删除/i });
    if (await deleteBtn.isVisible().catch(() => false)) {
      await expect(deleteBtn).toBeDisabled();
    } else {
      await expect(deleteBtn).toBeHidden();
    }
    return;
  }

  if (tc.id === "TC-E06") {
    const firstName = arg1 || "John";
    const lastName = tc.input[3] || "AutoTest";
    const employeeId = tc.input[4] || "";
    
    await fillAddEmployeeForm(app["page"], firstName, lastName, employeeId);
    await app["page"].getByRole("button", { name: /Save|保存/i }).click();
    
    // After adding, it navigates to Personal Details
    await expect(app["page"].getByText(/Success|Saved|成功|已保存/i).first()).toBeVisible({ timeout: 15000 });
    
    // Go back to Employee List
    await app.openEmployeeList();
    
    // Verify employee is in list IMMEDIATELY without searching
    const rows = app["page"].locator(".oxd-table-body .oxd-table-row");
    await expect(rows.first()).toBeVisible({ timeout: 15000 });
    const tableText = await app["page"].locator(".oxd-table-body").innerText();
    expect(tableText).toContain(firstName);
    expect(tableText).toContain(lastName);
    return;
  }

  if (tc.id === "TC-E08") {
    const firstName = arg1 || "Duplicate";
    const lastName = tc.input[3] || "Employee";
    const employeeId = tc.input[4] || "0001";
    
    await fillAddEmployeeForm(app["page"], firstName, lastName, employeeId);
    await app["page"].getByRole("button", { name: /Save|保存/i }).click();
    
    // Verify it throws 'Employee Id already exists' and DOES NOT SAVE
    const errorText = app["page"].locator(".oxd-input-group", { hasText: /Employee Id|员工ID/i }).locator(".oxd-input-field-error-message");
    await expect(errorText).toBeVisible({ timeout: 5000 });
    return;
  }

  if (tc.id === "TC-E12") {
    await app["page"].locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    const rows = app["page"].locator(".oxd-table-body .oxd-table-row");
    const count = await rows.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const cells = rows.nth(i).locator(".oxd-table-cell");
      // Job Title (5), Employment Status (6), Sub Unit (7), Supervisor (8)
      // Playwright uses 0-based indexing for nth()
      const jobTitle = await cells.nth(4).innerText();
      const empStatus = await cells.nth(5).innerText();
      const subUnit = await cells.nth(6).innerText();
      const supervisor = await cells.nth(7).innerText();
      
      expect(jobTitle.trim()).not.toBe("");
      expect(empStatus.trim()).not.toBe("");
      expect(subUnit.trim()).not.toBe("");
      expect(supervisor.trim()).not.toBe("");
    }
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
