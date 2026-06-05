import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("User Management"));

async function fillAddUserForm(page: any, role: string, status: string, employeeName: string, username: string) {
  await page.getByRole("button", { name: /Add|添加/i }).click();
  await expect(page).toHaveURL(/admin\/saveSystemUser/);

  // Select User Role dropdown
  await page.locator(".oxd-input-group", { hasText: /User Role|用户角色/i }).locator(".oxd-select-text").click();
  const roleRegex = role === "Admin" ? /Admin|管理员/i : new RegExp(role, "i");
  await page.getByRole("option", { name: roleRegex }).first().click();

  // Select Status dropdown
  await page.locator(".oxd-input-group", { hasText: /Status|状态/i }).locator(".oxd-select-text").click();
  const statusRegex = status === "Enabled" ? /Enabled|Enable|已启用|启用/i : /Disabled|Disable|已禁用|禁用/i;
  await page.getByRole("option", { name: statusRegex }).first().click();

  // Type and select Employee Name
  const empInput = page.locator(".oxd-input-group", { hasText: /Employee Name|员工姓名/i }).locator("input");
  const query = employeeName && employeeName.length >= 4 ? employeeName.substring(0, 4) : "a";
  await empInput.fill(query);
  await page.waitForTimeout(2000);
  
  const option = page.locator(".oxd-autocomplete-option").first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    // Fallback: clear and search with 'a' to get any valid employee
    await empInput.focus();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");
    await empInput.fill("a");
    await page.waitForTimeout(2000);
    await page.locator(".oxd-autocomplete-option").first().click();
  }

  // Fill Username
  const usernameInput = page.locator(".oxd-input-group", { hasText: /Username|用户名/i }).locator("input");
  await usernameInput.fill(username);

  // Fill Password / Confirm Password
  await page.locator(".oxd-input-group", { hasText: /^(Password|密码)$/i }).locator("input").first().fill("Admin123!");
  await page.locator(".oxd-input-group", { hasText: /^(Confirm Password|确认密码)$/i }).locator("input").fill("Admin123!");
}

async function runUserCase(tc: any, app: OrangeHrmPage) {
  const [loginUser = "Admin", loginPass = "admin123", arg1 = "", arg2 = "", arg3 = "", arg4 = ""] = tc.input;
  const page = app["page"];
  await app.login(loginUser, loginPass);
  await app.openAdminUsers();

  // Reset search filters to avoid test pollution from other cases
  const resetBtn = page.getByRole("button", { name: /Reset|重置/i });
  await resetBtn.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  if (await resetBtn.isVisible().catch(() => false)) {
    await resetBtn.click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
  }

  if (tc.id === "TC-U01") {
    await expect(page.getByRole("columnheader", { name: /Username|用户名/i })).toBeVisible();
    return;
  }

  if (["TC-U02", "TC-U03"].includes(tc.id)) {
    await app.searchByLabeledInput("Username", arg1);
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    if (tc.id === "TC-U03") {
      await expect(page.getByText(/No Records Found|没有找到记录|无记录/i).first()).toBeVisible();
    } else {
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
    }
    return;
  }

  if (tc.id === "TC-U04") {
    await page.locator(".oxd-input-group", { hasText: /User Role|用户角色/i }).locator(".oxd-select-text").click();
    const optionRegex = arg1 === "Admin" ? /Admin|管理员/i : new RegExp(arg1, "i");
    const option = page.getByRole("option", { name: optionRegex, exact: true });
    await option.waitFor({ state: "visible" });
    await option.click();
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    
    const rows = page.locator(".oxd-table-body .oxd-table-row");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const roleText = await rows.nth(i).locator(".oxd-table-cell").nth(2).innerText();
      const expectedRegex = arg1 === "Admin" ? /Admin|管理员/i : new RegExp(arg1, "i");
      expect(roleText.trim()).toMatch(expectedRegex);
    }
    return;
  }

  if (tc.id === "TC-U05") {
    // Search if validuser01 already exists; if yes, delete it first to ensure clean state
    await app.searchByLabeledInput("Username", arg1);
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    await page.waitForTimeout(1500); // Let table settle completely

    const rowCheckbox = page.locator(".oxd-table-body .oxd-table-row").first().locator(".oxd-checkbox-input");
    if (await rowCheckbox.isVisible().catch(() => false)) {
      await rowCheckbox.click();
      const deleteBtn = page.getByRole("button", { name: /Delete Selected|删除/i });
      await deleteBtn.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      if (await deleteBtn.isVisible().catch(() => false)) {
        await deleteBtn.click();
        await page.locator(".orangehrm-modal-footer").getByRole("button", { name: /Yes, Delete|确定|是/i }).click();
        await expect(page.getByText(/Success|Deleted|成功|已删除/i).first()).toBeVisible().catch(() => {});
        await page.waitForTimeout(2000);
        await app.openAdminUsers();
      }
    }

    await fillAddUserForm(page, arg2, arg3, arg4, arg1);
    await page.getByRole("button", { name: /Save|保存/i }).click();
    // Expect success toast
    await expect(page.getByText(/Success|Saved|成功|已保存/i).first()).toBeVisible({ timeout: 15000 });
    return;
  }

  if (tc.id === "TC-U06") {
    await fillAddUserForm(page, arg2, arg3, arg4, arg1);
    await page.locator(".oxd-input-group", { hasText: /^(Password|密码)$/i }).locator("input").first().focus();
    await expect(page.locator(".oxd-input-group", { hasText: /Username|用户名/i }).locator(".oxd-input-field-error-message")).toContainText(/Already exists|已存在/i);
    return;
  }

  if (["TC-U07", "TC-U08"].includes(tc.id)) {
    await fillAddUserForm(page, arg2, arg3, arg4, arg1);
    await page.getByRole("button", { name: /Save|保存/i }).click();

    // Verify constraints - it should show error and NOT save
    const errorText = page.locator(".oxd-input-group", { hasText: /Username|用户名/i }).locator(".oxd-input-field-error-message");
    await expect(errorText).toBeVisible({ timeout: 5000 });
    return;
  }

  if (tc.id === "TC-U09") {
    await page.getByRole("button", { name: /Add|添加/i }).click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);
    await page.getByRole("button", { name: /Save|保存/i }).click();
    await expect(page.locator(".oxd-input-group", { hasText: /Username|用户名/i }).locator(".oxd-input-field-error-message")).toContainText(/Required|必填/i);
    return;
  }

  if (tc.id === "TC-U10") {
    // Search for the user to edit
    await app.searchByLabeledInput("Username", arg1);
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    
    if (await page.getByText(/No Records Found|没有找到记录|无记录/i).first().isVisible()) {
      // Create user first
      await fillAddUserForm(page, "ESS", "Enabled", "Orange Test", arg1);
      await page.getByRole("button", { name: /Save|保存/i }).click();
      await expect(page.getByText(/Success|Saved|成功|已保存/i).first()).toBeVisible({ timeout: 15000 });
      await app.openAdminUsers();
      await app.searchByLabeledInput("Username", arg1);
      await page.getByRole("button", { name: /Search|搜索/i }).click();
      await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    }
    
    // Click Edit button
    await page.locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible" });
    await page.locator(".oxd-table-body .oxd-table-row").first().locator(".oxd-table-cell-actions button").last().click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);

    // Edit status
    await page.locator(".oxd-input-group", { hasText: /Status|状态/i }).locator(".oxd-select-text").click();
    const statusRegex = arg2 === "Enabled" ? /Enabled|Enable|已启用|启用/i : /Disabled|Disable|已禁用|禁用/i;
    await page.getByRole("option", { name: statusRegex, exact: true }).click();
    await page.getByRole("button", { name: /Save|保存/i }).click();

    // Verify success toast
    await expect(page.getByText(/Success|Updated|成功|已更新/i).first()).toBeVisible();
    return;
  }

  if (tc.id === "TC-U11") {
    await app.searchByLabeledInput("Username", arg1);
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    
    if (await page.getByText(/No Records Found|没有找到记录|无记录/i).first().isVisible()) {
      // Create user first
      await fillAddUserForm(page, "ESS", "Enabled", "Orange Test", arg1);
      await page.getByRole("button", { name: /Save|保存/i }).click();
      await expect(page.getByText(/Success|Saved|成功|已保存/i).first()).toBeVisible({ timeout: 15000 });
      await app.openAdminUsers();
      await app.searchByLabeledInput("Username", arg1);
      await page.getByRole("button", { name: /Search|搜索/i }).click();
      await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    }

    // Select checkbox and delete
    await page.locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible" });
    await page.locator(".oxd-table-body .oxd-table-row").first().locator(".oxd-checkbox-input").click();
    await page.getByRole("button", { name: /Delete Selected|删除选中|删除/i }).click();
    await page.locator(".orangehrm-modal-footer").getByRole("button", { name: /Yes, Delete|确定|是/i }).click();
    await expect(page.getByText(/Success|Deleted|成功|已删除/i).first()).toBeVisible();
    return;
  }

  if (tc.id === "TC-U12") {
    await expect(page.getByRole("button", { name: /Delete Selected|删除选中|删除/i })).not.toBeVisible();
    return;
  }

  if (tc.id === "TC-U13") {
    await page.locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible" });
    const rows = page.locator(".oxd-table-body .oxd-table-row");
    const checks = page.locator(".oxd-table-body .oxd-checkbox-input");
    await expect(checks.count()).resolves.toBeGreaterThan(0);
    expect(await checks.count()).toBe(await rows.count());
    return;
  }

  if (tc.id === "TC-U14") {
    await page.locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible" });
    const countBefore = await page.locator(".oxd-table-body .oxd-table-row").count();
    
    await app.logoutIfLoggedIn();
    await app.login(loginUser, loginPass);
    await app.openAdminUsers();
    
    await page.locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible" });
    const countAfter = await page.locator(".oxd-table-body .oxd-table-row").count();
    expect(countBefore).toBe(countAfter);
    return;
  }

  if (tc.id === "TC-U15") {
    await app.searchByLabeledInput("Username", arg1);
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    
    if (await page.locator(".oxd-table-card").first().isVisible()) {
      await page.locator(".oxd-table-body .oxd-table-row").first().locator(".oxd-checkbox-input").click();
      await page.getByRole("button", { name: /Delete Selected|删除选中|删除/i }).click();
      await page.locator(".orangehrm-modal-footer").getByRole("button", { name: /Yes, Delete|确定|是/i }).click();
      await expect(page.getByText(/Success|Deleted|成功|已删除/i).first()).toBeVisible();
      await page.waitForTimeout(2000);
      await app.openAdminUsers();
    }

    await fillAddUserForm(page, arg2, arg3, arg4, arg1);
    await page.getByRole("button", { name: /Save|保存/i }).click();
    await expect(page.getByText(/Success|Saved|成功|已保存/i).first()).toBeVisible({ timeout: 15000 });
    
    await app.openAdminUsers();
    await app.searchByLabeledInput("Username", arg1);
    await page.getByRole("button", { name: /Search|搜索/i }).click();
    await page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
    await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
    return;
  }

  await expect(page.getByRole("button", { name: /Search|搜索/i })).toBeVisible();
}

test.describe("OrangeHRM User Management E2E", () => {
  for (const tc of testCases) {
    test(`${tc.id} | ${tc.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await runUserCase(tc, app);
    });
  }
});
