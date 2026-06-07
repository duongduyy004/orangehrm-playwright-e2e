import { test as base, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

type WorkerFixtures = {
  workerStorageState: string;
};

export const test = base.extend<{}, WorkerFixtures>({
  storageState: async ({ workerStorageState }, use) => {
    await use(workerStorageState);
  },

  workerStorageState: [async ({ browser }, use, workerInfo) => {
    const authDir = path.join(workerInfo.project.outputDir, ".auth");
    fs.mkdirSync(authDir, { recursive: true });
    const storageStatePath = path.join(authDir, `admin-${process.pid}-${workerInfo.parallelIndex}.json`);
    const baseURL = typeof workerInfo.project.use.baseURL === "string"
      ? workerInfo.project.use.baseURL
      : undefined;
    const username = process.env.ORANGEHRM_ADMIN_USERNAME ?? "Admin";
    const password = process.env.ORANGEHRM_ADMIN_PASSWORD ?? "admin123";

    if (!fs.existsSync(storageStatePath)) {
      const context = await browser.newContext({
        storageState: undefined,
        baseURL
      });
      const page = await context.newPage();
      await page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.locator("input[name='username']").waitFor({ state: "visible", timeout: 20000 });
      await page.locator("input[name='username']").fill(username);
      await page.locator("input[name='password']").fill(password);
      await page.locator("button[type='submit']").click();
      await page.waitForURL(/dashboard/i, { timeout: 20000 });
      await page.locator(".oxd-userdropdown-tab").waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
      await context.storageState({ path: storageStatePath });
      await context.close();
    }

    await use(storageStatePath);
  }, { scope: "worker" }]
});

export { expect };
