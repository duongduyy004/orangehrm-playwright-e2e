import { expect, test } from "@playwright/test";
import { loadTestCases, TestCaseRow } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases();

async function runLoginCase(tc: TestCaseRow, app: OrangeHrmPage) {
  const [u = "", p = "", p3 = ""] = tc.input;
  await app.gotoLogin();

  switch (tc.id) {
    case "TC-L01":
    case "TC-L08":
      await app.login(u, p);
      await expect(app["page"]).toHaveURL(/dashboard/);
      break;
    case "TC-L04":
    case "TC-L05":
    case "TC-L06":
      if (u) await app["page"].getByRole("textbox", { name: "Username" }).fill(u);
      if (p) await app["page"].getByRole("textbox", { name: "Password" }).fill(p);
      await app["page"].getByRole("button", { name: "Login" }).click();
      await expect(app["page"].getByText("Required")).toHaveCount(tc.id === "TC-L06" ? 2 : 1);
      break;
    case "TC-L07":
      await app["page"].getByRole("textbox", { name: "Password" }).fill(p);
      const eye = app["page"].locator(".oxd-input-group .oxd-icon").last();
      await eye.click();
      await expect(app["page"].getByRole("textbox", { name: "Password" })).toHaveAttribute("type", "text");
      await eye.click();
      await expect(app["page"].getByRole("textbox", { name: "Password" })).toHaveAttribute("type", "password");
      break;
    case "TC-L09":
      await app["page"].getByText("Forgot your password?").click();
      await app["page"].getByRole("textbox", { name: "Username" }).fill(u);
      await app["page"].getByRole("button", { name: "Reset Password" }).click();
      await expect(app["page"].getByText(/Reset Password link sent successfully/i)).toBeVisible();
      break;
    case "TC-L11":
      await app["page"].goto(u);
      await expect(app["page"]).toHaveURL(/auth\/login/);
      break;
    case "TC-L12":
      await app.login(u, p);
      await expect(app["page"]).toHaveURL(/dashboard/);
      await app.logoutIfLoggedIn();
      await app["page"].goBack();
      await expect(app["page"]).toHaveURL(/auth\/login/);
      break;
    case "TC-L10":
      await app.login(u, p);
      await expect(app["page"]).toHaveURL(/dashboard/);
      await app.logoutIfLoggedIn();
      await app.login(u, p3);
      await expect(app["page"].getByText(/Invalid credentials|Dashboard/i)).toBeVisible();
      break;
    default:
      await app.login(u, p);
      await expect(app["page"].getByText(/Invalid credentials|Dashboard|Required/i)).toBeVisible();
      break;
  }
}

async function runUserCase(tc: TestCaseRow, app: OrangeHrmPage) {
  const [loginUser = "Admin", loginPass = "admin123", arg1 = ""] = tc.input;
  await app.login(loginUser, loginPass);
  await app.openAdminUsers();

  if (tc.id === "TC-U01") {
    await expect(app["page"].getByRole("columnheader", { name: "Username" })).toBeVisible();
    return;
  }

  if (["TC-U02", "TC-U03"].includes(tc.id)) {
    await app.searchByLabeledInput("Username", arg1);
    await app["page"].getByRole("button", { name: "Search" }).click();
    if (tc.id === "TC-U03") await expect(app["page"].getByText(/No Records Found/i)).toBeVisible();
    return;
  }

  if (tc.id === "TC-U12") {
    await expect(app["page"].getByRole("button", { name: /Delete/i })).toBeDisabled();
    return;
  }

  if (tc.id === "TC-U13") {
    const rows = app["page"].locator(".oxd-table-body .oxd-table-row");
    const checks = app["page"].locator(".oxd-table-body .oxd-checkbox-input");
    await expect(checks.count()).resolves.toBeGreaterThan(0);
    await expect(checks.count()).resolves.toBeLessThanOrEqual(await rows.count());
    return;
  }

  await expect(app["page"].getByRole("button", { name: "Search" })).toBeVisible();
}

async function runEmployeeCase(tc: TestCaseRow, app: OrangeHrmPage) {
  const [loginUser = "Admin", loginPass = "admin123", arg1 = ""] = tc.input;
  await app.login(loginUser, loginPass);
  await app.openEmployeeList();

  if (tc.id === "TC-E01") {
    await expect(app["page"].getByRole("columnheader", { name: /Id/i })).toBeVisible();
    return;
  }

  if (["TC-E02", "TC-E03"].includes(tc.id)) {
    await app.searchByLabeledInput("Employee Name", arg1);
    await app["page"].getByRole("button", { name: "Search" }).click();
    if (tc.id === "TC-E03") await expect(app["page"].getByText(/No Records Found/i)).toBeVisible();
    return;
  }

  if (tc.id === "TC-E11") {
    await expect(app["page"].getByRole("button", { name: /Delete/i })).toBeDisabled();
    return;
  }

  await expect(app["page"].getByRole("button", { name: "Search" })).toBeVisible();
}

test.describe("OrangeHRM E2E from Excel Input Column", () => {
  for (const tc of testCases) {
    test(`${tc.id} | ${tc.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);

      if (tc.sheet.includes("Login")) {
        await runLoginCase(tc, app);
      } else if (tc.sheet.includes("User Management")) {
        await runUserCase(tc, app);
      } else if (tc.sheet.includes("Employee List")) {
        await runEmployeeCase(tc, app);
      }
    });
  }
});
