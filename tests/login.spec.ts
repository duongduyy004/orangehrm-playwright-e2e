import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("Login"));

async function runLoginCase(tc: any, app: OrangeHrmPage) {
  const page = app["page"];
  const [u = "", p = "", p3 = ""] = tc.input;
  await app.gotoLogin();

  switch (tc.id) {
    // ── Nhóm 1: Xác thực cơ bản ──────────────────────────────────────
    case "TC-L01":
    case "TC-L08": {
      // L01: happy path | L08: submit bằng Enter
      if (tc.id === "TC-L08") {
        await page.getByRole("textbox", { name: "Username" }).fill(u);
        await page.getByRole("textbox", { name: "Password" }).fill(p);
        await page.keyboard.press("Enter");
      } else {
        await app.login(u, p);
      }
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
      break;
    }

    case "TC-L02":
    case "TC-L03": {
      // Sai password hoặc username không tồn tại
      await app.login(u, p);
      await expect(page.locator(".oxd-alert-content-text")).toBeVisible({ timeout: 8000 });
      await expect(page).not.toHaveURL(/dashboard/);
      if (tc.id === "TC-L03") {
        // Anti-enumeration: message phải giống TC-L02
        const msg = await page.locator(".oxd-alert-content-text").innerText();
        expect(msg.trim().toLowerCase()).toContain("invalid credentials");
      }
      break;
    }

    case "TC-L04":
    case "TC-L05":
    case "TC-L06": {
      // Required field validation
      if (u) await page.getByRole("textbox", { name: "Username" }).fill(u);
      if (p) await page.getByRole("textbox", { name: "Password" }).fill(p);
      await page.getByRole("button", { name: "Login" }).click();
      const errors = page.locator(".oxd-input-field-error-message");
      const expectedCount = tc.id === "TC-L06" ? 2 : 1;
      await expect(errors).toHaveCount(expectedCount, { timeout: 5000 });
      await expect(errors.first()).toContainText(/Required/i);
      break;
    }

    // ── Nhóm 2: Tính năng phụ trợ ────────────────────────────────────
    case "TC-L09": {
      // BUG BG02: Forgot Password → 504
      await page.getByText("Forgot your password?").click();
      await page.getByRole("textbox", { name: "Username" }).fill(u);

      const [response] = await Promise.all([
        page.waitForResponse((resp) => resp.url().includes("requestPasswordResetCode") || resp.status() >= 400, { timeout: 15000 }).catch(() => null),
        page.getByRole("button", { name: "Reset Password" }).click(),
      ]);

      // Hệ thống không được trả lỗi 504
      if (response) {
        expect(response.status()).not.toBe(504);
      }
      // Trang phải hiển thị xác nhận thành công
      await expect(
        page.getByText(/Reset Password link sent successfully|reset.*sent/i)
      ).toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-L10": {
      // Anti-enumeration: Forgot Password với username không tồn tại
      await page.getByText("Forgot your password?").click();
      await page.getByRole("textbox", { name: "Username" }).fill(u);
      await page.getByRole("button", { name: "Reset Password" }).click();
      // Message phải tồn tại (không crash/error)
      await expect(page.locator(".oxd-text").first()).toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-L11": {
      // BUG BG01: Đổi password → đăng nhập bằng pass mới bị Invalid credentials
      // p = pass cũ, p3 = pass mới
      await app.login(u, p);
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

      // Đổi mật khẩu
      await page.locator(".oxd-userdropdown-tab").click();
      await page.getByRole("menuitem", { name: /Change Password|修改密码/i }).click();
      await page.locator("input[type='password']").nth(0).fill(p);   // Current Password
      await page.locator("input[type='password']").nth(1).fill(p3);  // New Password
      await page.locator("input[type='password']").nth(2).fill(p3);  // Confirm
      await page.getByRole("button", { name: /Save|保存/i }).click();
      await expect(page.getByText(/Success|Successfully|成功/i).first()).toBeVisible({ timeout: 10000 });

      // Logout
      await app.logoutIfLoggedIn();
      await app.gotoLogin();

      // Đăng nhập bằng mật khẩu MỚI – phải thành công
      await app.login(u, p3);
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

      // Cleanup: đổi lại pass cũ để không ảnh hưởng TC khác
      await page.locator(".oxd-userdropdown-tab").click();
      await page.getByRole("menuitem", { name: /Change Password|修改密码/i }).click();
      await page.locator("input[type='password']").nth(0).fill(p3);
      await page.locator("input[type='password']").nth(1).fill(p);
      await page.locator("input[type='password']").nth(2).fill(p);
      await page.getByRole("button", { name: /Save|保存/i }).click();
      break;
    }

    // ── Nhóm 3: Bảo mật & session ────────────────────────────────────
    case "TC-L12": {
      // Truy cập URL nội bộ khi chưa đăng nhập
      await page.goto(u);
      await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
      break;
    }

    case "TC-L13": {
      // Back browser sau logout
      await app.login(u, p);
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
      await app.logoutIfLoggedIn();
      await page.goBack();
      await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
      break;
    }

    case "TC-L14": {
      // SQL Injection
      await page.getByRole("textbox", { name: "Username" }).fill(u);
      await page.getByRole("textbox", { name: "Password" }).fill(p);
      await page.getByRole("button", { name: "Login" }).click();
      await page.waitForTimeout(2000);
      // Không redirect vào dashboard
      await expect(page).not.toHaveURL(/dashboard/);
      // Response không chứa SQL error
      const content = await page.content();
      expect(content.toLowerCase()).not.toMatch(/sql syntax|mysql|ora-[0-9]/);
      break;
    }

    case "TC-L15": {
      // XSS payload
      let dialogFired = false;
      page.on("dialog", () => { dialogFired = true; });
      await page.getByRole("textbox", { name: "Username" }).fill(u);
      await page.getByRole("textbox", { name: "Password" }).fill(p);
      await page.getByRole("button", { name: "Login" }).click();
      await page.waitForTimeout(1500);
      expect(dialogFired).toBe(false);
      break;
    }

    // ── Nhóm 4: Biên ─────────────────────────────────────────────────
    case "TC-L16": {
      // Password 255 ký tự – không crash server
      const responseStatuses: number[] = [];
      page.on("response", (resp) => { if (resp.url().includes("auth")) responseStatuses.push(resp.status()); });
      await app.login(u, p);
      await page.waitForTimeout(2000);
      expect(responseStatuses.every((s) => s !== 500)).toBe(true);
      break;
    }

    case "TC-L17": {
      // Username có khoảng trắng đầu/cuối – document behavior
      await page.getByRole("textbox", { name: "Username" }).fill(u);
      await page.getByRole("textbox", { name: "Password" }).fill(p);
      await page.getByRole("button", { name: "Login" }).click();
      await page.waitForTimeout(2000);
      // Không crash – chấp nhận cả 2 outcome (pass hoặc fail với message rõ)
      const isOnDashboard = page.url().includes("dashboard");
      const hasError = await page.locator(".oxd-alert-content-text").isVisible().catch(() => false);
      expect(isOnDashboard || hasError).toBe(true);
      break;
    }

    case "TC-L18": {
      // Username toàn chữ hoa (ADMIN) – document behavior
      await app.login(u, p);
      await page.waitForTimeout(2000);
      const isOnDashboard = page.url().includes("dashboard");
      const hasError = await page.locator(".oxd-alert-content-text").isVisible().catch(() => false);
      expect(isOnDashboard || hasError).toBe(true);
      break;
    }

    default:
      await app.login(u, p);
      await page.waitForTimeout(1000);
      break;
  }
}

test.describe("OrangeHRM Login E2E", () => {
  for (const tc of testCases) {
    if (tc.id === "TC-L07") {
      test.skip(`${tc.id} | ${tc.name}`, async () => {
        // Skip: password visibility toggle là native browser feature,
        // không kiểm tra được qua DOM locators trong Playwright Chromium
      });
      continue;
    }
    test(`${tc.id} | ${tc.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await runLoginCase(tc, app);
    });
  }
});
