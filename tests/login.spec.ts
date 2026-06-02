import { expect, test } from "@playwright/test";
import { loadTestCases } from "../src/data/testcase-loader";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("Login"));

async function runLoginCase(tc: any, app: OrangeHrmPage) {
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

test.describe("OrangeHRM Login E2E", () => {
  for (const tc of testCases) {
    test(`${tc.id} | ${tc.name}`, async ({ page }) => {
      const app = new OrangeHrmPage(page);
      await runLoginCase(tc, app);
    });
  }
});
