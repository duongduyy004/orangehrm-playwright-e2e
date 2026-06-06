import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("User Management") || tc.sheet.includes("Quản lý người dùng"));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Chờ spinner biến mất và bảng hiển thị */
async function waitForTable(page: any) {
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
  await page.locator(".oxd-table-body").waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
}

/** Chờ trang User List load xong (nút Search type=submit hiển thị) */
async function waitForListPage(page: any) {
  await page.locator("button[type='submit']").waitFor({ state: "visible", timeout: 15000 });
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
  password = "Admin123!",
  confirmPassword = "Admin123!"
) {
  // Nút Add nằm trong header container
  await page.locator(".orangehrm-header-container button").click();
  await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });

  // User Role
  const roleGroup = page.locator(".oxd-input-group", { hasText: /User Role/i });
  await roleGroup.locator(".oxd-select-text").click();
  await page.getByRole("option", { name: new RegExp(role, "i") }).first().click();

  // Status
  const statusGroup = page.locator(".oxd-input-group", { hasText: /^Status/i });
  await statusGroup.locator(".oxd-select-text").click();
  const statusRe = /enabled|enable/i.test(status) ? /Enabled|Enable/i : /Disabled|Disable/i;
  await page.getByRole("option", { name: statusRe }).first().click();

  // Employee Name (autocomplete)
  const empInput = page
    .locator(".oxd-input-group", { hasText: /Employee Name/i })
    .locator("input");
  const query = employeeName.length >= 3 ? employeeName.substring(0, 3) : "a";
  await empInput.fill(query);
  try {
    await page.locator(".oxd-autocomplete-option").first().waitFor({ state: "visible", timeout: 4000 });
  } catch {
    // Fallback: thử gõ "a" để đảm bảo luôn có kết quả
    await empInput.clear();
    await empInput.fill("a");
    await page.locator(".oxd-autocomplete-option").first().waitFor({ state: "visible", timeout: 6000 });
  }
  await page.locator(".oxd-autocomplete-option").first().click();

  // Username
  const usernameInput = page
    .locator(".oxd-input-group", { hasText: /^Username/i })
    .locator("input");
  await usernameInput.clear();
  await usernameInput.fill(username);

  // Password
  await page
    .locator(".oxd-input-group", { hasText: /^Password$/i })
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
  await page.locator("button[type='submit']").click();
  await waitForTable(page);

  const noRecord = await page.getByText(/No Records Found/i).first().isVisible().catch(() => false);
  if (noRecord) return;

  const row = page.locator(".oxd-table-body .oxd-table-row").first();
  if (await row.isVisible().catch(() => false)) {
    await row.locator(".oxd-checkbox-input").click();
    await page.locator(".orangehrm-header-container button", { hasText: /Delete Selected/i }).click();
    await page.locator(".orangehrm-modal-footer")
      .getByRole("button", { name: /Yes, Delete|是|确定/i }).click();
    await page.getByText(/Successfully Deleted|Success|成功/i).first()
      .waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    await waitForTable(page);
  }
}

// ── Main runner ───────────────────────────────────────────────────────────────

async function runUserCase(tc: any, app: OrangeHrmPage) {
  const page = app["page"];
  const [loginUser = "Admin", loginPass = "admin123", a2 = "", a3 = "", a4 = "", a5 = ""] = tc.input;

  await app.login(loginUser, loginPass);
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
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-U03": {
      await app.searchByLabeledInput("Username", a2);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      break;
    }

    case "TC-U04": {
      // Filter by User Role
      const roleGroup = page.locator(".oxd-input-group", { hasText: /User Role/i });
      await roleGroup.locator(".oxd-select-text").click();
      await page.getByRole("option", { name: new RegExp(a2, "i") }).first().click();
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      const rows = page.locator(".oxd-table-body .oxd-table-row");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const roleCell = await rows.nth(i).locator(".oxd-table-cell").nth(2).innerText();
        expect(roleCell.trim()).toMatch(new RegExp(a2, "i"));
      }
      break;
    }

    case "TC-U05": {
      // Filter by Status
      const statusGroup = page.locator(".oxd-input-group", { hasText: /^Status/i });
      await statusGroup.locator(".oxd-select-text").click();
      const re = /enabled/i.test(a2) ? /Enabled|Enable/i : /Disabled|Disable/i;
      await page.getByRole("option", { name: re }).first().click();
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      const rows = page.locator(".oxd-table-body .oxd-table-row");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const statusCell = await rows.nth(i).locator(".oxd-table-cell").nth(3).innerText();
        expect(statusCell.trim()).toMatch(re);
      }
      break;
    }

    // ── Nhóm 2: Thêm mới ──────────────────────────────────────────────
    case "TC-U06": {
      const username = a2;
      await deleteUserIfExists(page, app, username);
      await app.openAdminUsers();
      await waitForListPage(page);
      await fillAddUserForm(page, username, a3, a4, a5);
      // Nút Save trên form saveSystemUser
      await page.locator("button[type='submit']").click();
      await expect(page.getByText(/Successfully Saved|Success|成功/i).first())
        .toBeVisible({ timeout: 15000 });
      break;
    }

    case "TC-U07": {
      // Duplicate username – expect error ngay khi blur/focus out
      await fillAddUserForm(page, a2, a3, a4, a5);
      await page.locator(".oxd-input-group", { hasText: /^Username/i })
        .locator("input").press("Tab");
      await page.waitForTimeout(500);
      const alreadyExistsErr = page.locator(".oxd-input-group", { hasText: /^Username/i })
        .locator(".oxd-input-field-error-message");
      await expect(alreadyExistsErr).toContainText(/already exists/i, { timeout: 5000 });
      break;
    }

    case "TC-U08": {
      // Empty username – click Add, click Save ngay, phải có lỗi Required
      await page.locator(".orangehrm-header-container button").click();
      await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
      await page.locator("button[type='submit']").click();
      const usernameErr = page.locator(".oxd-input-group", { hasText: /^Username/i })
        .locator(".oxd-input-field-error-message");
      await expect(usernameErr).toContainText(/Required/i, { timeout: 5000 });
      break;
    }

    case "TC-U09":
    case "TC-U10": {
      // BUG BG07: Username với ký tự đặc biệt hoặc quá dài được lưu thành công
      const username = a2;
      await fillAddUserForm(page, username, a3, a4, a5);
      await page.locator("button[type='submit']").click();

      const errorLocator  = page.locator(".oxd-input-group", { hasText: /^Username/i })
        .locator(".oxd-input-field-error-message");
      const successLocator = page.locator(".oxd-toast--success, .oxd-toast-content");

      try {
        await Promise.race([
          errorLocator.waitFor({ state: "visible", timeout: 6000 }),
          successLocator.waitFor({ state: "visible", timeout: 6000 }),
        ]);
      } catch { /* Cả hai đều không xuất hiện */ }

      const hasError   = await errorLocator.isVisible().catch(() => false);
      const hasSuccess = await successLocator.isVisible().catch(() => false);

      if (hasSuccess) {
        throw new Error(
          `BUG BG07: Username không hợp lệ "${username}" được lưu thành công – thiếu server-side validation`
        );
      }
      expect(hasError, `Không có error message cho username "${username}"`).toBe(true);
      break;
    }

    case "TC-U11": {
      // Password mismatch
      const [pw, confirmPw] = [tc.input[6] ?? "Admin123!", tc.input[7] ?? "DifferentPass!"];
      await fillAddUserForm(page, a2, a3, a4, a5, pw, confirmPw);
      await page.locator("button[type='submit']").click();
      const confirmErr = page.locator(".oxd-input-group", { hasText: /Confirm Password/i })
        .locator(".oxd-input-field-error-message");
      await expect(confirmErr).toContainText(/Passwords do not match/i, { timeout: 5000 });
      break;
    }

    // ── Nhóm 3: Chỉnh sửa & xóa ──────────────────────────────────────
    case "TC-U12": {
      // Edit user status – click icon Edit (bút chì) ở cột Actions
      await app.searchByLabeledInput("Username", a2);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);

      if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
        await deleteUserIfExists(page, app, a2);
        await app.openAdminUsers();
        await waitForListPage(page);
        await fillAddUserForm(page, a2, "ESS", "Enabled", "a");
        await page.locator("button[type='submit']").click();
        await page.getByText(/Successfully Saved|Success/i).first()
          .waitFor({ state: "visible", timeout: 15000 });
        await app.openAdminUsers();
        await waitForListPage(page);
        await app.searchByLabeledInput("Username", a2);
        await page.locator("button[type='submit']").click();
        await waitForTable(page);
      }

      // Click icon Edit (button cuối cùng trong actions của row đầu)
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);

      const statusGroup = page.locator(".oxd-input-group", { hasText: /^Status/i });
      await statusGroup.locator(".oxd-select-text").click();
      const re = /enabled/i.test(a3) ? /Enabled|Enable/i : /Disabled|Disable/i;
      await page.getByRole("option", { name: re }).first().click();
      await page.locator("button[type='submit']").click();
      await expect(page.getByText(/Successfully Updated|Success|成功/i).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-U13": {
      // Xóa user (a2 = username) – dùng checkbox + Delete Selected
      await app.searchByLabeledInput("Username", a2);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);

      if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
        await app.openAdminUsers();
        await waitForListPage(page);
        await fillAddUserForm(page, a2, "ESS", "Enabled", "a");
        await page.locator("button[type='submit']").click();
        await page.getByText(/Successfully Saved|Success/i).first()
          .waitFor({ state: "visible", timeout: 15000 });
        await app.openAdminUsers();
        await waitForListPage(page);
        await app.searchByLabeledInput("Username", a2);
        await page.locator("button[type='submit']").click();
        await waitForTable(page);
      }

      // Tick checkbox của row đầu tiên
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-checkbox-input").click();
      // Nút Delete Selected xuất hiện trong header sau khi chọn checkbox
      await page.locator(".orangehrm-header-container button", { hasText: /Delete Selected/i }).click();
      await page.locator(".orangehrm-modal-footer")
        .getByRole("button", { name: /Yes, Delete|是|确定/i }).click();
      await expect(page.getByText(/Successfully Deleted|Success|成功/i).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-U14": {
      // Nút "Delete Selected" KHÔNG hiển thị khi chưa chọn checkbox nào
      await expect(
        page.locator(".orangehrm-header-container button", { hasText: /Delete Selected/i })
      ).not.toBeVisible();
      break;
    }

    case "TC-U15": {
      // BUG BG08: Checkbox thiếu tại ít nhất 1 row
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .waitFor({ state: "visible", timeout: 15000 });

      const rows      = page.locator(".oxd-table-body .oxd-table-row");
      const checkboxes = page.locator(".oxd-table-body .oxd-checkbox-input");

      const rowCount   = await rows.count();
      const checkCount = await checkboxes.count();

      expect(rowCount).toBeGreaterThan(0);

      // BUG: số checkbox < số rows → có row thiếu checkbox
      expect(
        checkCount,
        `BUG BG08: ${rowCount} rows nhưng chỉ ${checkCount} checkboxes – thiếu ${rowCount - checkCount} checkbox`
      ).toBe(rowCount);
      break;
    }

    // ── Nhóm 4: Tìm kiếm kết hợp & khác ─────────────────────────────
    case "TC-U16": {
      // Tìm kiếm ngay sau khi thêm
      const username = a2;
      await deleteUserIfExists(page, app, username);
      await app.openAdminUsers();
      await waitForListPage(page);
      await fillAddUserForm(page, username, a3, a4, a5);
      await page.locator("button[type='submit']").click();
      await page.getByText(/Successfully Saved|Success/i).first()
        .waitFor({ state: "visible", timeout: 15000 });

      await app.openAdminUsers();
      await waitForListPage(page);
      await app.searchByLabeledInput("Username", username);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-U17": {
      // Reset filter
      await app.searchByLabeledInput("Username", a2);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      const countAfterFilter = await page.locator(".oxd-table-body .oxd-table-row").count();

      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      const countAfterReset = await page.locator(".oxd-table-body .oxd-table-row").count();

      expect(countAfterReset).toBeGreaterThanOrEqual(countAfterFilter);
      break;
    }

    case "TC-U18": {
      // Lọc kết hợp Role + Status
      const roleGroup = page.locator(".oxd-input-group", { hasText: /User Role/i });
      await roleGroup.locator(".oxd-select-text").click();
      await page.getByRole("option", { name: new RegExp(a2, "i") }).first().click();

      const statusGroup = page.locator(".oxd-input-group", { hasText: /^Status/i });
      await statusGroup.locator(".oxd-select-text").click();
      const re = /enabled/i.test(a3) ? /Enabled|Enable/i : /Disabled|Disable/i;
      await page.getByRole("option", { name: re }).first().click();

      await page.locator("button[type='submit']").click();
      await waitForTable(page);

      const rows = page.locator(".oxd-table-body .oxd-table-row");
      const count = await rows.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const roleText   = await rows.nth(i).locator(".oxd-table-cell").nth(2).innerText();
          const statusText = await rows.nth(i).locator(".oxd-table-cell").nth(3).innerText();
          expect(roleText.trim()).toMatch(new RegExp(a2, "i"));
          expect(statusText.trim()).toMatch(re);
        }
      }
      break;
    }

    case "TC-U19": {
      // Add Admin role user
      const username = a2;
      await deleteUserIfExists(page, app, username);
      await app.openAdminUsers();
      await waitForListPage(page);
      await fillAddUserForm(page, username, a3, a4, a5);
      await page.locator("button[type='submit']").click();
      await expect(page.getByText(/Successfully Saved|Success/i).first())
        .toBeVisible({ timeout: 15000 });
      break;
    }

    case "TC-U20": {
      // Xem chi tiết user qua Edit view (click icon bút chì – button cuối trong actions)
      await app.searchByLabeledInput("Username", a2);
      await page.locator("button[type='submit']").click();
      await waitForTable(page);
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").last().click();
      await expect(page).toHaveURL(/saveSystemUser/);
      // Verify field Username không bị trống
      const usernameVal = await page
        .locator(".oxd-input-group", { hasText: /^Username/i })
        .locator("input").inputValue();
      expect(usernameVal.trim().length).toBeGreaterThan(0);
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
