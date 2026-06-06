import { expect, Page } from "@playwright/test";

export class OrangeHrmPage {
  constructor(private readonly page: Page) {}

  private async waitForSpinnerToClear(timeout = 15000) {
    await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout }).catch(() => {});
  }

  private async waitForAdminUsersContent(timeout = 10000) {
    await this.page.waitForFunction(() => {
      const addButton = Array.from(document.querySelectorAll("button"))
        .some((button) => (button.textContent ?? "").trim() === "Add");
      const usernameLabel = Array.from(document.querySelectorAll("label"))
        .some((label) => /^Username/i.test((label.textContent ?? "").trim()));
      const tableContainer = document.querySelector(".orangehrm-paper-container, .oxd-table-filter-header");
      return addButton || usernameLabel || Boolean(tableContainer);
    }, { timeout }).catch(() => {});
  }

  private async hasVisibleAdminUsersPage() {
    const addButtonVisible = await this.page.getByRole("button", { name: /Add/i })
      .isVisible()
      .catch(() => false);
    if (addButtonVisible) return true;

    const usernameFilterVisible = await this.page.locator(".oxd-input-group")
      .filter({ has: this.page.locator("label").filter({ hasText: /^Username/i }) })
      .locator("input")
      .first()
      .isVisible()
      .catch(() => false);
    if (usernameFilterVisible) return true;

    return this.page.locator(".oxd-table-filter-header, .orangehrm-paper-container")
      .first()
      .isVisible()
      .catch(() => false);
  }

  private isAdminUsersUrl() {
    return /\/admin\/viewSystemUsers/i.test(this.page.url());
  }

  async ensureAdminUsersReady() {
    if (!this.isAdminUsersUrl()) {
      await this.openAdminUsers();
      return;
    }

    await this.waitForSpinnerToClear();
    await this.waitForAdminUsersContent(5000);
    if (await this.hasVisibleAdminUsersPage()) return;

    await this.openAdminUsers();
  }

  async gotoLogin() {
    try {
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch (e) {
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 45000 });
    }

    const loginVisible = await this.page.locator("button[type='submit']")
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (!loginVisible && this.page.url().includes("/dashboard")) {
      await this.logoutIfLoggedIn();
      await this.page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
      await this.page.locator("input[name='username']").waitFor({ state: "visible", timeout: 15000 });
    }
  }

  async login(username: string, password: string) {
    await this.gotoLogin();
    let lastError = "";

    for (let attempt = 0; attempt < 3; attempt++) {
      const usernameInput = this.page.locator("input[name='username']");
      const loginReady = await usernameInput.waitFor({ state: "visible", timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      if (!loginReady) {
        await this.page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
        continue;
      }
      await usernameInput.fill(username);
      await this.page.locator("input[name='password']").fill(password);
      await this.page.locator("button[type='submit']").click();

      const reachedDashboard = await this.page.waitForURL(/dashboard/i, { timeout: 20000 })
        .then(() => true)
        .catch(() => false);

      if (reachedDashboard || this.page.url().includes("/dashboard")) {
        await this.page.locator("a[href*='viewAdminModule']").first()
          .waitFor({ state: "visible", timeout: 15000 })
          .catch(() => {});
        return;
      }
      const errorBanner = this.page.locator(".oxd-alert-content, .oxd-input-field-error-message").first();
      if (await errorBanner.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false)) {
        lastError = (await errorBanner.innerText().catch(() => "")).trim();
      }

      await this.page.waitForTimeout(1000);
    }

    throw new Error(`Login did not reach the dashboard after 3 attempts. ${lastError || `Current URL: ${this.page.url()}`}`.trim());
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
    if (this.isAdminUsersUrl()) {
      await this.waitForSpinnerToClear();
      await this.waitForAdminUsersContent(5000);
      if (await this.hasVisibleAdminUsersPage()) return;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.page.goto("/web/index.php/admin/viewSystemUsers", { waitUntil: "domcontentloaded", timeout: 45000 });
      await expect(this.page).toHaveURL(/admin\/viewSystemUsers/, { timeout: 15000 });
      await this.waitForSpinnerToClear();
      await this.waitForAdminUsersContent();

      if (await this.hasVisibleAdminUsersPage()) return;

      const bodyText = await this.page.locator("body").innerText().catch(() => "");
      if (bodyText.trim()) {
        await this.page.reload({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
        await this.waitForSpinnerToClear();
        if (await this.hasVisibleAdminUsersPage()) return;
      }
    }

    const adminSidebarLink = this.page.locator("a[href*='viewAdminModule']").first();
    if (await adminSidebarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await adminSidebarLink.click();
      await expect(this.page).toHaveURL(/admin\/viewSystemUsers/, { timeout: 20000 });
      await this.waitForSpinnerToClear();
      await this.waitForAdminUsersContent();
      if (await this.hasVisibleAdminUsersPage()) return;
    }

    throw new Error("Admin User Management page did not render visible controls after 3 navigation attempts.");
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
