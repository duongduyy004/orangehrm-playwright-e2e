import { expect, test } from "@playwright/test";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";
import { loadTestCases } from "../src/data/testcase-loader";
import { registerWorkbookStatusSync } from "../src/data/testcase-status-updater";

// Load ALL test cases for "Đăng nhập"
const allTestCases = loadTestCases().filter((tc) => tc.sheet === "Login");
registerWorkbookStatusSync(test, allTestCases);

const getTC = (id: string) => allTestCases.find((tc) => tc.id === id);

const BASE_URL = "https://opensource-demo.orangehrmlive.com";

test.describe.configure({ timeout: 60000 });

test.describe("Đăng nhập cơ bản & Kiểm tra trường bắt buộc", () => {
  const tc01 = getTC("TC-L01");
  if (tc01) {
    test(`${tc01.id} | ${tc01.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await app.login(tc01.input[0] || "Admin", tc01.input[1] || "admin123");
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    });
  }

  const tc02 = getTC("TC-L02");
  if (tc02) {
    test(`${tc02.id} | ${tc02.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await app.login(tc02.input[0] || "Admin", tc02.input[1] || "MatKhauSai123", false);
      await expect(page.locator(".oxd-alert-content-text")).toBeVisible({ timeout: 8000 });
      await expect(page).not.toHaveURL(/dashboard/);
    });
  }

  const tc03 = getTC("TC-L03");
  if (tc03) {
    test(`${tc03.id} | ${tc03.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await app.login(tc03.input[0] || "tai_khoan_gia", tc03.input[1] || "batkymatkhau", false);
      await expect(page.locator(".oxd-alert-content-text")).toBeVisible({ timeout: 8000 });
      await expect(page).not.toHaveURL(/dashboard/);
      const msg = await page.locator(".oxd-alert-content-text").innerText();
      expect(msg.trim().toLowerCase()).toContain("invalid credentials");
    });
  }

  const tc04 = getTC("TC-L04");
  if (tc04) {
    test(`${tc04.id} | ${tc04.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      // Only type password
      await page.getByRole("textbox", { name: "Password" }).fill(tc04.input[1] || "admin123");
      await page.getByRole("button", { name: "Login" }).click();
      const errors = page.locator(".oxd-input-field-error-message");
      await expect(errors).toHaveCount(1, { timeout: 5000 });
      await expect(errors.first()).toContainText("Required");
    });
  }

  const tc05 = getTC("TC-L05");
  if (tc05) {
    test(`${tc05.id} | ${tc05.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      // Only type username
      await page.getByRole("textbox", { name: "Username" }).fill(tc05.input[0] || "Admin");
      await page.getByRole("button", { name: "Login" }).click();
      const errors = page.locator(".oxd-input-field-error-message");
      await expect(errors).toHaveCount(1, { timeout: 5000 });
      await expect(errors.first()).toContainText("Required");
    });
  }

  const tc06 = getTC("TC-L06");
  if (tc06) {
    test(`${tc06.id} | ${tc06.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await page.getByRole("button", { name: "Login" }).click();
      const errors = page.locator(".oxd-input-field-error-message");
      await expect(errors).toHaveCount(2, { timeout: 5000 });
    });
  }
});

test.describe("Tính năng bổ trợ", () => {
  const tc07 = getTC("TC-L07");
  if (tc07) {
    test(`${tc07.id} | ${tc07.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await page.getByRole("textbox", { name: "Username" }).fill(tc07.input[0] || "Admin");
      await page.getByRole("textbox", { name: "Password" }).fill(tc07.input[1] || "admin123");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
    });
  }

  const tc08 = getTC("TC-L08");
  if (tc08) {
    test(`${tc08.id} | ${tc08.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await page.getByText("Forgot your password?").click();
      await page.getByRole("textbox", { name: "Username" }).fill(tc08.input[0] || "Admin");

      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) => resp.url().includes("requestPasswordResetCode") || resp.status() >= 400,
          { timeout: 15000 }
        ).catch(() => null),
        page.getByRole("button", { name: "Reset Password" }).click(),
      ]);

      if (response) {
        expect(response.status()).not.toBe(504);
      }
      await expect(
        page.getByText(/Reset Password link sent successfully|reset.*sent/i).first()
      ).toBeVisible({ timeout: 10000 });
    });
  }

  const tc09 = getTC("TC-L09");
  if (tc09) {
    test(`${tc09.id} | ${tc09.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await page.getByText("Forgot your password?").click();
      await page.getByRole("textbox", { name: "Username" }).fill(tc09.input[0] || "tai_khoan_khong_ton_tai_9999");
      await page.getByRole("button", { name: "Reset Password" }).click();
      await expect(
        page.getByText(/Reset Password link sent successfully|reset.*sent/i).first()
      ).toBeVisible({ timeout: 10000 });
    });
  }

  const tc10 = getTC("TC-L10");
  if (tc10) {
    test(`${tc10.id} | ${tc10.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      const oldPass = tc10.input[1] || "admin123";
      const newPass = tc10.input[2] || "MatKhauMoi@2026";

      await app.gotoLogin();
      await app.login(tc10.input[0] || "Admin", oldPass);
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

      await page.locator(".oxd-userdropdown-tab").click();
      await page.getByRole("menuitem", { name: /Change Password/i }).click();
      await page.locator("input[type='password']").nth(0).fill(oldPass);
      await page.locator("input[type='password']").nth(1).fill(newPass);
      await page.locator("input[type='password']").nth(2).fill(newPass);
      await page.getByRole("button", { name: /Save/i }).click();
      await expect(page.getByText(/Success|Successfully/i).first()).toBeVisible({ timeout: 10000 });

      await app.logoutIfLoggedIn();

      await app.gotoLogin();
      await app.login(tc10.input[0] || "Admin", newPass);
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

      await page.locator(".oxd-userdropdown-tab").click();
      await page.getByRole("menuitem", { name: /Change Password/i }).click();
      await page.locator("input[type='password']").nth(0).fill(newPass);
      await page.locator("input[type='password']").nth(1).fill(oldPass);
      await page.locator("input[type='password']").nth(2).fill(oldPass);
      await page.getByRole("button", { name: /Save/i }).click();
    });
  }
});

test.describe("Bảo mật và phiên làm việc", () => {
  const tc11 = getTC("TC-L11");
  if (tc11) {
    test(`${tc11.id} | ${tc11.name}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${tc11.input[0] || "/web/index.php/dashboard/index"}`);
      await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
      await expect(page.getByRole("heading", { name: "Dashboard" })).not.toBeVisible();
    });
  }

  const tc12 = getTC("TC-L12");
  if (tc12) {
    test(`${tc12.id} | ${tc12.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await app.login(tc12.input[0] || "Admin", tc12.input[1] || "admin123");
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

      await app.logoutIfLoggedIn();

      await page.goBack();
      await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
    });
  }

  const tc13 = getTC("TC-L13");
  if (tc13) {
    test(`${tc13.id} | ${tc13.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      await page.getByRole("textbox", { name: "Username" }).fill(tc13.input[0] || "OR '1'='1'--");
      await page.getByRole("textbox", { name: "Password" }).fill(tc13.input[1] || "batkymatkhau");
      await page.getByRole("button", { name: "Login" }).click();
      await page.waitForTimeout(2000);

      await expect(page).not.toHaveURL(/dashboard/);
      const content = await page.content();
      expect(content.toLowerCase()).not.toMatch(/sql|syntax|mysql/);
    });
  }

  const tc14 = getTC("TC-L14");
  if (tc14) {
    test(`${tc14.id} | ${tc14.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();

      let dialogFired = false;
      page.on("dialog", () => {
        dialogFired = true;
      });

      await page.getByRole("textbox", { name: "Username" }).fill(tc14.input[0] || "<script>alert('xss')</script>");
      await page.getByRole("textbox", { name: "Password" }).fill(tc14.input[1] || "batkymatkhau");
      await page.getByRole("button", { name: "Login" }).click();
      await page.waitForTimeout(1500);

      expect(dialogFired).toBe(false);
    });
  }
});

test.describe("Kiểm tra xử lý dữ liệu", () => {
  const tc15 = getTC("TC-L15");
  if (tc15) {
    test(`${tc15.id} | ${tc15.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await app.gotoLogin();
      
      await page.getByRole("textbox", { name: "Username" }).fill(tc15.input[0] || " Admin ");
      await page.getByRole("textbox", { name: "Password" }).fill(tc15.input[1] || "admin123");
      await page.getByRole("button", { name: "Login" }).click();
      
      await page.waitForTimeout(2000);
      
      const isOnDashboard = page.url().includes("dashboard");
      const hasError = await page.locator(".oxd-alert-content-text").isVisible().catch(() => false);
      
      expect(isOnDashboard || hasError).toBe(true);
    });
  }
});
