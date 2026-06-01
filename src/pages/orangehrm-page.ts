import { expect, Page } from "@playwright/test";

export class OrangeHrmPage {
  constructor(private readonly page: Page) {}

  async gotoLogin() {
    await this.page.goto("/web/index.php/auth/login");
    await expect(this.page.getByRole("button", { name: "Login" })).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.gotoLogin();
    await this.page.getByRole("textbox", { name: "Username" }).fill(username);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  async logoutIfLoggedIn() {
    const menu = this.page.locator(".oxd-userdropdown-tab");
    if (await menu.isVisible().catch(() => false)) {
      await menu.click();
      await this.page.getByRole("menuitem", { name: "Logout" }).click();
      await expect(this.page).toHaveURL(/auth\/login/);
    }
  }

  async openAdminUsers() {
    await this.page.getByRole("link", { name: "Admin" }).click();
    await expect(this.page).toHaveURL(/admin\/viewSystemUsers/);
  }

  async openEmployeeList() {
    await this.page.getByRole("link", { name: "PIM" }).click();
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/);
  }

  async searchByLabeledInput(label: string, value: string) {
    const field = this.page
      .locator(".oxd-form-row")
      .filter({ hasText: label })
      .locator("input")
      .first();
    await field.fill(value);
  }
}
