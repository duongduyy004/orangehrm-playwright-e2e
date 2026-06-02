import { expect, Page } from "@playwright/test";

export class OrangeHrmPage {
  constructor(private readonly page: Page) {}

  async gotoLogin() {
    // Use domcontentloaded and a shorter timeout with retry to bypass slow asset load issues
    try {
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (e) {
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 25000 });
    }
    
    // Wait for either the login submit button to render or redirect to dashboard (active session)
    try {
      await Promise.race([
        this.page.locator("button[type='submit']").waitFor({ state: "visible", timeout: 15000 }),
        this.page.waitForURL(/dashboard/i, { timeout: 15000 })
      ]);
    } catch (e) {
      // Ignore timeout
    }

    if (this.page.url().includes("/dashboard")) {
      await this.logoutIfLoggedIn();
      await expect(this.page.locator("button[type='submit']")).toBeVisible({ timeout: 15000 });
    }
  }

  async login(username: string, password: string) {
    await this.gotoLogin();
    await this.page.locator("input[name='username']").fill(username);
    await this.page.locator("input[name='password']").fill(password);
    await this.page.locator("button[type='submit']").click();
    
    // Wait for either dashboard URL (success) or validation error messages (failure)
    try {
      await Promise.race([
        this.page.waitForURL(/dashboard/i, { timeout: 20000 }),
        this.page.locator(".oxd-alert-content, .oxd-input-field-error-message").first().waitFor({ state: "visible", timeout: 10000 })
      ]);
    } catch (e) {
      // Ignore
    }
  }

  async logoutIfLoggedIn() {
    const menu = this.page.locator(".oxd-userdropdown-tab");
    if (await menu.isVisible().catch(() => false)) {
      await menu.click();
      await this.page.locator("a[href*='logout']").click();
      await expect(this.page).toHaveURL(/auth\/login/);
    }
  }

  async openAdminUsers() {
    const adminLink = this.page.locator("a[href*='viewAdminModule']").first();
    await adminLink.waitFor({ state: "visible", timeout: 15000 });
    await adminLink.click();
    await expect(this.page).toHaveURL(/admin\/viewSystemUsers/);
    await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
  }

  async openEmployeeList() {
    const pimLink = this.page.locator("a[href*='viewPimModule']").first();
    await pimLink.waitFor({ state: "visible", timeout: 15000 });
    await pimLink.click();
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/);
    await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached" }).catch(() => {});
  }

  async searchByLabeledInput(label: string, value: string) {
    const labelRegex = label === "Username" 
      ? /Username|用户名/i 
      : label === "Employee Name" 
      ? /Employee Name|员工姓名/i 
      : new RegExp(label, "i");
    const field = this.page
      .locator(".oxd-form-row")
      .filter({ hasText: labelRegex })
      .locator("input")
      .first();
    await field.fill(value);
  }
}
