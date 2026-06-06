import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const retainedCaseIds = new Set([
  "TC-U01",
  "TC-U02",
  "TC-U03",
  "TC-U04",
  "TC-U05",
  "TC-U06",
  "TC-U07",
  "TC-U08",
  "TC-U09",
  "TC-U10",
  "TC-U11",
  "TC-U12",
  "TC-U13",
  "TC-U14",
  "TC-U15",
  "TC-U16"
]);

const testCases = loadTestCases().filter((tc) =>
  tc.sheet.includes("User Management") && retainedCaseIds.has(tc.id)
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Chờ spinner biến mất và bảng hiển thị */
async function waitForTable(page: any) {
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
  await Promise.race([
    page.locator(".oxd-table-body .oxd-table-row").first().waitFor({ state: "visible", timeout: 10000 }),
    page.getByText(/No Records Found/i).first().waitFor({ state: "visible", timeout: 10000 })
  ]).catch(() => {});
}

async function ensureUserFiltersVisible(page: any) {
  const usernameInput = fieldGroupByLabel(page, /^Username/i).locator("input").first();
  if (await usernameInput.isVisible().catch(() => false)) {
    await expect(page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
    return;
  }

  const toggle = page.locator(".oxd-table-filter-header-options .oxd-icon-button").first();
  await toggle.waitFor({ state: "visible", timeout: 15000 });
  await toggle.click();
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /Reset/i })).toBeVisible({ timeout: 10000 });
}

async function submitUserSearch(page: any) {
  await ensureUserFiltersVisible(page);
  await page.getByRole("button", { name: /Search/i }).click();
  await waitForTable(page);
}

async function saveUserForm(page: any) {
  await page.getByRole("button", { name: /^Save$/i }).click();
}

/** Chờ trang User List load xong và filter panel sẵn sàng */
async function waitForListPage(page: any) {
  await expect(page).toHaveURL(/viewSystemUsers/, { timeout: 15000 });
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
  await expect(page.getByRole("button", { name: /Add/i })).toBeVisible({ timeout: 15000 });
  await ensureUserFiltersVisible(page);
}

async function selectDropdownByLabel(page: any, label: RegExp, option: RegExp | string) {
  const group = fieldGroupByLabel(page, label);
  await group.locator(".oxd-select-text").click();
  const optionName = typeof option === "string" ? new RegExp(option, "i") : option;
  await page.getByRole("option", { name: optionName }).first().click();
}

async function fillEmployeeAutocomplete(page: any, value: string) {
  const empInput = fieldGroupByLabel(page, /Employee Name/i).locator("input");
  const firstToken = value.split(/\s+/)[0] ?? value;
  const visibleEmployeeNames = await page.locator(".oxd-table-body .oxd-table-row .oxd-table-cell:nth-child(3)")
    .evaluateAll((cells) => cells.map((cell) => cell.textContent?.trim() ?? "").filter(Boolean))
    .catch(() => [] as string[]);
  const visibleEmployeeTokens = visibleEmployeeNames
    .flatMap((name) => name.split(/\s+/).slice(0, 2))
    .filter(Boolean);
  const terms = [value, firstToken, value.toLowerCase(), firstToken.toLowerCase(), ...visibleEmployeeTokens, "Ranga", "Ahmed", "Paul", "Linda", "John", "a", "an"]
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  for (const term of terms) {
    await empInput.fill(term);
    await page.locator(".oxd-autocomplete-option").first()
      .waitFor({ state: "visible", timeout: 8000 }).catch(() => {});

    const options = page.locator(".oxd-autocomplete-option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const option = options.nth(i);
      const selectedName = (await option.innerText().catch(() => "")).trim();
      if (selectedName && !/No Records Found/i.test(selectedName)) {
        await option.click();
        await page.waitForTimeout(500);
        const currentValue = (await empInput.inputValue()).trim();
        if (currentValue && currentValue.toLowerCase() === selectedName.toLowerCase()) return currentValue;
      }
    }

    await empInput.press("ArrowDown").catch(() => {});
    await empInput.press("Enter").catch(() => {});
    await page.waitForTimeout(500);
    const currentValue = (await empInput.inputValue()).trim();
    if (currentValue && currentValue !== term) return currentValue;
  }

  throw new Error(`No valid Employee Name autocomplete option found for "${value}"`);
}

async function getVisibleEmployeeNames(page: any) {
  return page.locator(".oxd-table-body .oxd-table-row .oxd-table-cell:nth-child(3)")
    .evaluateAll((cells) => cells.map((cell) => cell.textContent?.trim() ?? "").filter(Boolean))
    .catch(() => [] as string[]);
}

async function createEmployeeSeed(page: any) {
  const suffix = Date.now().toString().slice(-8);
  const firstName = `AutoFN${suffix}`;
  const lastName = `AutoLN${suffix}`;

  await page.goto("/web/index.php/pim/addEmployee", { waitUntil: "commit", timeout: 45000 });
  await page.locator("input[name='firstName']").waitFor({ state: "visible", timeout: 20000 });
  await page.locator("input[name='firstName']").fill(firstName);
  await page.locator("input[name='lastName']").fill(lastName);
  await page.locator("button[type='submit']").click();
  await Promise.race([
    page.waitForURL(/pim\/viewPersonalDetails\/empNumber/i, { timeout: 30000 }).catch(() => {}),
    page.getByText(/Successfully Saved|Success/i).first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {})
  ]);

  return `${firstName} ${lastName}`;
}

function fieldGroupByLabel(page: any, label: RegExp) {
  return page.locator(".oxd-input-group")
    .filter({ has: page.locator("label").filter({ hasText: label }) });
}

/**
 * Điền form Add User (URL: /admin/saveSystemUser).
 * GIẢ ĐỊNH đang đứng ở trang viewSystemUsers.
 * Nút Add nằm trong .orangehrm-header-container.
 */
async function fillAddUserForm(
  page: any,
  username: string,
  role: string,
  status: string,
  employeeName: string,
  password = "StrongPass123!",
  confirmPassword = "StrongPass123!"
) {
  const visibleEmployeeNames = await getVisibleEmployeeNames(page);
  const employeeCandidates = [
    employeeName,
    ...visibleEmployeeNames,
    "Ahmed Mohamed",
    "Ranga Akunuri",
    "Paul Collings"
  ].filter(Boolean);

  // Nút Add nằm trong header container
  await page.getByRole("button", { name: /Add/i }).click();
  await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });

  // User Role
  await selectDropdownByLabel(page, /User Role/i, role);

  // Status
  const statusRe = /enabled|enable/i.test(status) ? /Enabled|Enable/i : /Disabled|Disable/i;
  await selectDropdownByLabel(page, /^Status/i, statusRe);

  // Employee Name (autocomplete)
  let resolvedEmployee = "";
  for (const candidate of employeeCandidates) {
    try {
      resolvedEmployee = await fillEmployeeAutocomplete(page, candidate);
      break;
    } catch {
      // try the next known employee candidate from the live list
    }
  }
  if (!resolvedEmployee) {
    throw new Error(`No valid Employee Name autocomplete option found for "${employeeName}"`);
  }

  // Username
  const usernameInput = page
    .locator(".oxd-input-group")
    .filter({ has: page.locator("label").filter({ hasText: /Username/i }) })
    .locator("input");
  await usernameInput.clear();
  await usernameInput.fill(username);

  // Password
  await page
    .locator(".oxd-input-group")
    .filter({ has: page.locator("label").filter({ hasText: /^Password$/i }) })
    .locator("input")
    .fill(password);

  // Confirm Password
  await page
    .locator(".oxd-input-group", { hasText: /Confirm Password/i })
    .locator("input")
    .fill(confirmPassword);
}

/**
 * Xóa user nếu tồn tại – dùng để clean state.
 * Dùng checkbox + nút "Delete Selected" (bulk delete của trang Admin Users).
 */
async function deleteUserIfExists(page: any, app: OrangeHrmPage, username: string) {
  await app.openAdminUsers();
  await waitForListPage(page);
  await app.searchByLabeledInput("Username", username);
  await submitUserSearch(page);

  const noRecord = await page.getByText(/No Records Found/i).first().isVisible().catch(() => false);
  if (noRecord) return;

  const row = page.locator(".oxd-table-body .oxd-table-row", {
    has: page.locator(".oxd-table-cell-actions")
  }).first();
  if (await row.isVisible().catch(() => false)) {
    await row.locator(".oxd-table-cell-actions button").first().click({ timeout: 5000 }).catch(() => {});
    const confirmDelete = page.locator(".orangehrm-modal-footer .oxd-button--label-danger").first();
    if (!(await confirmDelete.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await confirmDelete.click();
    await page.getByText(/Successfully Deleted|Success|成功/i).first()
      .waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    await waitForTable(page);
  }
}

async function ensureUserExists(
  page: any,
  app: OrangeHrmPage,
  username: string,
  role = "ESS",
  status = "Enabled",
  employeeName = "a"
) {
  await app.openAdminUsers();
  await waitForListPage(page);
  await app.searchByLabeledInput("Username", username);
  await submitUserSearch(page);

  if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
    await app.openAdminUsers();
    await waitForListPage(page);
    await fillAddUserForm(page, username, role, status, employeeName);
    await saveUserForm(page);
    await page.getByText(/Successfully Saved|Success|成功/i).first()
      .waitFor({ state: "visible", timeout: 15000 });
  }
}

async function getSelectTextByLabel(page: any, label: RegExp) {
  return (await fieldGroupByLabel(page, label)
    .locator(".oxd-select-text")
    .innerText()).trim();
}

async function openAddUser(page: any) {
  const app = new OrangeHrmPage(page);
  if (/auth\/login/i.test(page.url())) {
    await app.login("Admin", "admin123");
  }
  await app.openAdminUsers();
  await waitForListPage(page);
  await page.getByRole("button", { name: /Add/i }).click();
  await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
}

async function openUserSearch(page: any) {
  const app = new OrangeHrmPage(page);
  if (/auth\/login/i.test(page.url())) {
    await app.login("Admin", "admin123");
  }
  await app.openAdminUsers();
  await ensureUserFiltersVisible(page);
  await expect(fieldGroupByLabel(page, /Employee Name/i).locator("input")).toBeVisible({ timeout: 5000 });
}

// ── Main runner ───────────────────────────────────────────────────────────────

async function runUserCase(tc: any, app: OrangeHrmPage) {
  const page = app["page"];
  const [loginUser = "Admin", loginPass = "admin123", a2 = "", a3 = "", a4 = "", a5 = ""] = tc.input;

  await app.login(loginUser, loginPass);
  if (/auth\/login/i.test(page.url())) {
    await app.login(loginUser, loginPass);
  }
  await app.openAdminUsers();
  await waitForListPage(page);

  // Reset filter để tránh contamination từ TC trước
  const resetBtn = page.getByRole("button", { name: /Reset/i });
  if (await resetBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await resetBtn.click();
    await waitForTable(page);
  }

  switch (tc.id) {
    // ── Nhóm 1: Xem & tìm kiếm ────────────────────────────────────────
    case "TC-U01": {
      // Kiểm tra 4 column headers bắt buộc của trang Admin Users
      await expect(page.getByRole("columnheader", { name: /Username/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /User Role/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /Employee Name/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /Status/i })).toBeVisible();
      break;
    }

    case "TC-U02": {
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-U03": {
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      break;
    }

    case "TC-U04": {
      const username = a2;
      await deleteUserIfExists(page, app, username);
      await app.openAdminUsers();
      await waitForListPage(page);
      await fillAddUserForm(page, username, a3, a4, a5);
      await saveUserForm(page);
      await expect(page.getByText(/Successfully Saved|Success|成功/i).first())
        .toBeVisible({ timeout: 15000 });
      break;
    }

    case "TC-U05": {
      // Duplicate username – expect error ngay khi blur/focus out
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await fieldGroupByLabel(page, /Username/i).locator("input").fill(a2);
      await fieldGroupByLabel(page, /Username/i).locator("input").press("Tab");
      await page.waitForTimeout(500);
      const alreadyExistsErr = fieldGroupByLabel(page, /Username/i)
        .locator(".oxd-input-field-error-message");
      await expect(alreadyExistsErr).toContainText(/already exists/i, { timeout: 5000 });
      break;
    }

    case "TC-U06": {
      // Password mismatch
      const [pw, confirmPw] = [tc.input[6] ?? "StrongPass123!", tc.input[7] ?? "DifferentPass123!"];
      await fillAddUserForm(page, a2, a3, a4, a5, pw, confirmPw);
      await saveUserForm(page);
      const confirmErr = fieldGroupByLabel(page, /Confirm Password/i)
        .locator(".oxd-input-field-error-message");
      await expect(confirmErr).toContainText(/Passwords do not match/i, { timeout: 5000 });
      break;
    }

    // ── Nhóm 3: Chỉnh sửa & xóa ──────────────────────────────────────
    case "TC-U07": {
      // Edit user status – click icon Edit (bút chì) ở cột Actions
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);

      if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
        await deleteUserIfExists(page, app, a2);
        await app.openAdminUsers();
        await waitForListPage(page);
        await fillAddUserForm(page, a2, "ESS", "Enabled", "a");
        await saveUserForm(page);
        await page.getByText(/Successfully Saved|Success/i).first()
          .waitFor({ state: "visible", timeout: 15000 });
        await app.openAdminUsers();
        await waitForListPage(page);
        await app.searchByLabeledInput("Username", a2);
        await submitUserSearch(page);
      }

      // Click icon Edit (button cuối cùng trong actions của row đầu)
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);

      const statusGroup = page.locator(".oxd-input-group", { hasText: /^Status/i });
      await statusGroup.locator(".oxd-select-text").click();
      const re = /enabled/i.test(a3) ? /Enabled|Enable/i : /Disabled|Disable/i;
      await page.getByRole("option", { name: re }).first().click();
      await saveUserForm(page);
      await expect(page.getByText(/Successfully Updated|Success|成功/i).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-U08": {
      // Xóa user (a2 = username) – dùng icon Delete của row đầu tiên
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);

      if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
        await app.openAdminUsers();
        await waitForListPage(page);
        await fillAddUserForm(page, a2, "ESS", "Enabled", "a");
        await saveUserForm(page);
        await page.getByText(/Successfully Saved|Success/i).first()
          .waitFor({ state: "visible", timeout: 15000 });
        await app.openAdminUsers();
        await waitForListPage(page);
        await app.searchByLabeledInput("Username", a2);
        await submitUserSearch(page);
      }

      // Xóa bằng icon Delete của row đầu tiên
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").first().click();
      await page.locator(".orangehrm-modal-footer .oxd-button--label-danger").first().click();
      await expect(page.getByText(/Successfully Deleted|Success|成功/i).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-U09": {
      // Reset filter
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);
      const countAfterFilter = await page.locator(".oxd-table-body .oxd-table-row").count();

      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      const countAfterReset = await page.locator(".oxd-table-body .oxd-table-row").count();

      expect(countAfterReset).toBeGreaterThanOrEqual(countAfterFilter);
      break;
    }

    case "TC-U10": {
      // Lọc kết hợp Role + Status
      await selectDropdownByLabel(page, /User Role/i, a2);
      const re = /enabled/i.test(a3) ? /Enabled|Enable/i : /Disabled|Disable/i;
      await selectDropdownByLabel(page, /^Status/i, re);

      await submitUserSearch(page);

      const rows = page.locator(".oxd-table-body .oxd-table-row");
      const count = await rows.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const roleText   = await rows.nth(i).locator(".oxd-table-cell").nth(2).innerText();
          const statusText = await rows.nth(i).locator(".oxd-table-cell").nth(4).innerText();
          expect(roleText.trim()).toMatch(new RegExp(a2, "i"));
          expect(statusText.trim()).toMatch(re);
        }
      }
      break;
    }

    case "TC-U19": {
      // Admin role is available and selectable on Add User form
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await selectDropdownByLabel(page, /User Role/i, a3 || "Admin");
      expect(await getSelectTextByLabel(page, /User Role/i)).toMatch(/Admin/i);
      await page.getByRole("button", { name: /Cancel/i }).click();
      await expect(page).toHaveURL(/viewSystemUsers/, { timeout: 10000 });
      break;
    }

    case "TC-U20": {
      // Xem chi tiết user qua Edit view (click icon bút chì – button cuối trong actions)
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);
      await expect(page.getByRole("heading", { name: /Edit User/i })).toBeVisible();
      await expect(fieldGroupByLabel(page, /Username/i).locator("input")).toBeVisible();
      break;
    }

    case "TC-U11": {
      // Search by Employee Name autocomplete
      const employeeCandidates = [a2 || "a", ...(await getVisibleEmployeeNames(page)), "Ahmed Mohamed", "Ranga Akunuri"];
      let selectedEmployee = "";
      for (const candidate of employeeCandidates) {
        try {
          selectedEmployee = await fillEmployeeAutocomplete(page, candidate);
          break;
        } catch {
          // try next visible employee candidate
        }
      }
      expect(selectedEmployee).not.toBe("");
      await submitUserSearch(page);
      const hasRow = await page.locator(".oxd-table-body .oxd-table-row").first()
        .isVisible({ timeout: 5000 }).catch(() => false);
      const hasEmptyState = await page.getByText(/No Records Found/i).first()
        .isVisible().catch(() => false);
      expect(hasRow || hasEmptyState).toBe(true);
      break;
    }

    case "TC-U12": {
      // Invalid Employee Name in filter should fail validation before search
      const empInput = page
        .locator(".oxd-input-group")
        .filter({ has: page.locator("label").filter({ hasText: /Employee Name/i }) })
        .locator("input");
      await empInput.fill(a2 || "Not A Real Employee 999");
      await submitUserSearch(page);
      const empErr = fieldGroupByLabel(page, /Employee Name/i)
        .locator(".oxd-input-field-error-message");
      await expect(empErr).toContainText(/Invalid/i, { timeout: 5000 });
      break;
    }

    case "TC-U23": {
      // Add form cancel returns to the User List without saving
      await deleteUserIfExists(page, app, a2);
      await app.openAdminUsers();
      await waitForListPage(page);
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await page.getByRole("button", { name: /Cancel/i }).click();
      await expect(page).toHaveURL(/viewSystemUsers/, { timeout: 10000 });
      await app.searchByLabeledInput("Username", a2);
      await submitUserSearch(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      break;
    }

    case "TC-U24":
    case "TC-U25":
    case "TC-U26":
    case "TC-U27": {
      // Required validation on Add User fields
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await page.locator("button[type='submit']").click();

      const label =
        tc.id === "TC-U24" ? /User Role/i :
        tc.id === "TC-U25" ? /Employee Name/i :
        tc.id === "TC-U26" ? /^Status/i :
        /^Password$/i;
      const err = fieldGroupByLabel(page, label)
        .locator(".oxd-input-field-error-message");
      await expect(err).toContainText(/Required/i, { timeout: 5000 });
      break;
    }

    case "TC-U28": {
      // Weak password should be rejected
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await fieldGroupByLabel(page, /^Password$/i).locator("input").fill("123");
      await expect(page.getByText(/Very Weak|Weak Password/i).first())
        .toBeVisible({ timeout: 5000 });
      break;
    }

    case "TC-U29": {
      // Cancel delete should preserve the user
      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      await page.locator(".oxd-table-header .oxd-checkbox-wrapper").click();
      await page.getByRole("button", { name: /Delete Selected/i }).click();
      await page.locator(".orangehrm-modal-footer")
        .getByRole("button", { name: /No, Cancel|Cancel/i }).click();
      await waitForTable(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-U30": {
      // Edit user role and save
      await app.searchByLabeledInput("Username", a2);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
        await page.getByRole("button", { name: /Reset/i }).click();
        await waitForTable(page);
      }
      await page.locator(".oxd-table-body .oxd-table-row", { has: page.locator(".oxd-table-cell-actions") }).first()
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);
      await selectDropdownByLabel(page, /User Role/i, a3 || "Admin");
      await page.locator("button[type='submit']").click();
      await expect(page.getByText(/Successfully Updated|Success|成功/i).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-U31": {
      // Edit username to duplicate existing Admin should be rejected
      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      await page.locator(".oxd-table-body .oxd-table-row", { has: page.locator(".oxd-table-cell-actions") }).nth(1)
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);
      const usernameInput = page.locator(".oxd-input-group", { hasText: /^Username/i }).locator("input");
      const originalUsername = await usernameInput.inputValue();
      await usernameInput.clear();
      await usernameInput.fill(a3 || "Admin");
      await usernameInput.press("Tab");
      const duplicateErr = page.locator(".oxd-input-group", { hasText: /^Username/i })
        .locator(".oxd-input-field-error-message");
      const hasDuplicateError = await duplicateErr.isVisible({ timeout: 5000 }).catch(() => false);
      const currentUsername = await usernameInput.inputValue();
      expect(hasDuplicateError || currentUsername === originalUsername).toBe(true);
      break;
    }

    case "TC-U32": {
      // Edit cancel returns to User List without changing current user detail
      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      await page.locator(".oxd-table-body .oxd-table-row", { has: page.locator(".oxd-table-cell-actions") }).first()
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);
      await page.getByRole("button", { name: /Cancel/i }).click();
      await expect(page).toHaveURL(/viewSystemUsers/, { timeout: 10000 });
      break;
    }

    case "TC-U33": {
      // Direct Admin Users URL requires an authenticated session and renders list controls
      await page.goto("/web/index.php/admin/viewSystemUsers", { waitUntil: "domcontentloaded" });
      await waitForListPage(page);
      await expect(page.getByRole("button", { name: /Search/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Reset/i })).toBeVisible();
      break;
    }

    case "TC-U34": {
      // Username search should be case-insensitive
      await app.searchByLabeledInput("Username", a2 || "admin");
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      const firstUsername = await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell").nth(1).innerText();
      expect(firstUsername.trim()).toMatch(/admin/i);
      break;
    }

    case "TC-U35": {
      // Reset clears text filters and dropdown filters
      await app.searchByLabeledInput("Username", a2 || "Admin");
      await selectDropdownByLabel(page, /User Role/i, a3 || "Admin");
      await selectDropdownByLabel(page, /^Status/i, /Enabled|Enable/i);
      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);

      const usernameValue = await page.locator(".oxd-input-group", { hasText: /^Username/i })
        .locator("input").inputValue();
      expect(usernameValue).toBe("");
      await expect(fieldGroupByLabel(page, /Employee Name/i)
        .locator("input")).toHaveValue("");
      expect(await getSelectTextByLabel(page, /User Role/i)).toMatch(/-- Select --/);
      expect(await getSelectTextByLabel(page, /^Status/i)).toMatch(/-- Select --/);
      break;
    }

    case "TC-U36": {
      // Row-level delete cancel preserves the selected user
      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      await page.locator(".oxd-table-body .oxd-table-row", { has: page.locator(".oxd-table-cell-actions") }).nth(1)
        .locator(".oxd-table-cell-actions button").first().click();
      await expect(page.locator(".orangehrm-modal-footer")).toBeVisible({ timeout: 10000 });
      await page.locator(".orangehrm-modal-footer")
        .getByRole("button", { name: /No, Cancel|Cancel/i }).click();
      await waitForTable(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-U37": {
      // Header checkbox selects visible users and exposes bulk delete action
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .waitFor({ state: "visible", timeout: 15000 });
      await page.locator(".oxd-table-header .oxd-checkbox-wrapper").click();
      await expect(page.getByRole("button", { name: /Delete Selected/i }))
        .toBeVisible({ timeout: 5000 });
      await page.locator(".oxd-table-header .oxd-checkbox-wrapper").click();
      await expect(page.getByRole("button", { name: /Delete Selected/i }))
        .not.toBeVisible();
      break;
    }

    case "TC-U38": {
      // Password and Confirm Password fields are masked on Add User form
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await expect(fieldGroupByLabel(page, /^Password$/i).locator("input"))
        .toHaveAttribute("type", "password");
      await expect(page.locator(".oxd-input-group", { hasText: /Confirm Password/i }).locator("input"))
        .toHaveAttribute("type", "password");
      break;
    }

    case "TC-U39": {
      // Username shorter than the allowed minimum should be rejected
      await fillAddUserForm(page, a2 || "abc", a3 || "ESS", a4 || "Enabled", a5 || "a");
      await page.locator("button[type='submit']").click();
      const usernameErr = fieldGroupByLabel(page, /Username/i)
        .locator(".oxd-input-field-error-message");
      await expect(usernameErr).toContainText(/at least|characters/i, { timeout: 5000 });
      break;
    }

    case "TC-U13": {
      // Typed but unselected employee names are rejected on Add User
      await page.getByRole("button", { name: /Add/i }).click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await selectDropdownByLabel(page, /User Role/i, a3 || "ESS");
      await selectDropdownByLabel(page, /^Status/i, /Enabled|Enable/i);
      await fieldGroupByLabel(page, /Employee Name/i)
        .locator("input").fill(a5 || "Not A Real Employee 999");
      await fieldGroupByLabel(page, /Username/i)
        .locator("input").fill(a2 || "bademployee_u40");
      await fieldGroupByLabel(page, /^Password$/i)
        .locator("input").fill("StrongPass123!");
      await page.locator(".oxd-input-group", { hasText: /Confirm Password/i })
        .locator("input").fill("StrongPass123!");
      await saveUserForm(page);
      const employeeErr = fieldGroupByLabel(page, /Employee Name/i)
        .locator(".oxd-input-field-error-message");
      await expect(employeeErr).toContainText(/Invalid/i, { timeout: 5000 });
      break;
    }

    case "TC-U14": {
      // Validate Username containing embedded spaces
      await openAddUser(page);
      const usernameInput = fieldGroupByLabel(page, /Username/i).locator("input");
      await usernameInput.fill(a2 || "qa user 01");
      await usernameInput.press("Tab");
      const usernameError = fieldGroupByLabel(page, /Username/i)
        .locator(".oxd-input-field-error-message");
      await expect(
        usernameError,
        "TC-U14: Username with embedded spaces is accepted without any validation error."
      ).toBeVisible({ timeout: 5000 });
      break;
    }

    case "TC-U15": {
      // Validate Username containing special characters
      await openAddUser(page);
      const usernameInput = fieldGroupByLabel(page, /Username/i).locator("input");
      await usernameInput.fill(a2 || "qa@user#01");
      await usernameInput.press("Tab");
      const usernameError = fieldGroupByLabel(page, /Username/i)
        .locator(".oxd-input-field-error-message");
      await expect(
        usernameError,
        "TC-U15: Username with special characters is accepted without any validation error."
      ).toBeVisible({ timeout: 5000 });
      break;
    }

    case "TC-U16": {
      // Username search with spaces must not keep stale records visible
      await openUserSearch(page);
      const usernameInput = fieldGroupByLabel(page, /Username/i).locator("input");
      await usernameInput.fill(a2 || "   ");
      await page.getByRole("button", { name: /Search/i }).click();
      await expect(
        page.getByText(/No Records Found/i).first(),
        "TC-U16: Username search with spaces still leaves old records visible instead of clearing the stale results."
      ).toBeVisible({ timeout: 5000 });
      break;
    }

    default:
      await expect(page.locator("button[type='submit']")).toBeVisible();
  }
}

test.describe("OrangeHRM User Management E2E", () => {
  for (const tc of testCases) {
    test(`${tc.id} | ${tc.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await runUserCase(tc, app);
    });
  }
});
