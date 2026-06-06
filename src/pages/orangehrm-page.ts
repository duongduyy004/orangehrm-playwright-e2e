import { expect, Page } from "@playwright/test";

export class OrangeHrmPage {
  constructor(private readonly page: Page) {}

  private async waitForSpinnerToClear(timeout = 15000) {
    await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout }).catch(() => {});
  }

  async gotoLogin() {
    // Use domcontentloaded and a shorter timeout with retry to bypass slow asset load issues
    try {
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "commit", timeout: 45000 });
    } catch (e) {
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "commit", timeout: 45000 });
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
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "commit", timeout: 45000 }).catch(() => {});
      await this.page.locator("input[name='username']").waitFor({ state: "visible", timeout: 15000 });
    }
  }

  async login(username: string, password: string) {
    await this.gotoLogin();

    for (let attempt = 0; attempt < 3; attempt++) {
      const usernameInput = this.page.locator("input[name='username']");
      const loginReady = await usernameInput.waitFor({ state: "visible", timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      if (!loginReady) {
        await this.page.goto("/web/index.php/auth/login", { waitUntil: "commit", timeout: 45000 }).catch(() => {});
        continue;
      }
      await usernameInput.fill(username);
      await this.page.locator("input[name='password']").fill(password);
      await this.page.locator("button[type='submit']").click();

      await Promise.race([
        this.page.waitForURL(/dashboard/i, { timeout: 20000 }).catch(() => {}),
        this.page.locator(".oxd-alert-content, .oxd-input-field-error-message").first()
          .waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
      ]);

      if (this.page.url().includes("/dashboard")) return;
      if (await this.page.locator(".oxd-alert-content, .oxd-input-field-error-message").first().isVisible().catch(() => false)) return;

      await this.page.waitForTimeout(1000);
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
    await this.page.goto("/web/index.php/admin/viewSystemUsers", { waitUntil: "commit", timeout: 45000 });
    await expect(this.page).toHaveURL(/admin\/viewSystemUsers/);
    await this.waitForSpinnerToClear();
    await expect(this.page.getByRole("heading", { name: /System Users/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole("button", { name: /Add/i })).toBeVisible({ timeout: 15000 });
  }

  async ensureAdminUserFiltersVisible() {
    const usernameInput = this.page.locator(".oxd-input-group")
      .filter({ has: this.page.locator("label").filter({ hasText: /^Username/i }) })
      .locator("input")
      .first();

    if (await usernameInput.isVisible().catch(() => false)) {
      await expect(this.page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
      return;
    }

    const toggle = this.page.locator(".oxd-table-filter-header-options .oxd-icon-button").first();
    await expect(toggle).toBeVisible({ timeout: 15000 });
    await toggle.click();
    await this.waitForSpinnerToClear(10000);
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByRole("button", { name: /Reset/i })).toBeVisible({ timeout: 10000 });
  }

  async openEmployeeList() {
    // Thử click link PIM trên sidebar; nếu không tìm thấy (chậm), navigate trực tiếp
    const pimLink = this.page.locator("a[href*='viewPimModule'], a[href*='pim/viewEmployeeList']").first();
    const isVisible = await pimLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await pimLink.click();
    } else {
      await this.page.goto("/web/index.php/pim/viewEmployeeList", { waitUntil: "commit", timeout: 45000 });
    }
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/, { timeout: 20000 });
    await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
  }

  async searchByLabeledInput(label: string, value: string) {
    if (/viewSystemUsers/i.test(this.page.url())) {
      await this.ensureAdminUserFiltersVisible();
    }

    const labelRegex = label === "Username" 
      ? /Username|用户名/i 
      : label === "Employee Name" 
      ? /Employee Name|员工姓名/i 
      : new RegExp(label, "i");
    const field = this.page
      .locator(".oxd-input-group")
      .filter({ has: this.page.locator("label").filter({ hasText: labelRegex }) })
      .locator("input")
      .first();
    await expect(field).toBeVisible({ timeout: 10000 });
    await field.fill(value);
  }
}
