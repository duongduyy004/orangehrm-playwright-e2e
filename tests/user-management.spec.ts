import { expect, test, type TestInfo } from "@playwright/test";
import { loadTestCases, type TestCaseRow } from "../src/data/testcase-loader";
import { registerWorkbookStatusSync } from "../src/data/testcase-status-updater";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

type UserTestCase = TestCaseRow & {
  group: string;
};

type UserCaseContext = {
  app: OrangeHrmPage;
  page: any;
  tc: UserTestCase;
  loginUser: string;
  loginPass: string;
  args: string[];
  testInfo: TestInfo;
};

const DEFAULT_NEW_USER_PASSWORD =
  process.env.ORANGEHRM_DEFAULT_NEW_USER_PASSWORD ??
  "StrongPass123!";

const userCases = loadTestCases()
  .filter((tc): tc is UserTestCase => tc.sheet === "User Management")
  .sort((left, right) => getCaseNumber(left.id) - getCaseNumber(right.id));
registerWorkbookStatusSync(test, userCases);

const groupedUserCases = groupCasesBySection(userCases);

function getCaseNumber(id: string) {
  return Number(id.replace("TC-U", ""));
}

function groupCasesBySection(cases: UserTestCase[]) {
  const groups = new Map<string, UserTestCase[]>();

  for (const tc of cases) {
    const group = tc.group || "Chưa phân nhóm";
    const current = groups.get(group) ?? [];
    current.push(tc);
    groups.set(group, current);
  }

  return groups;
}

function fieldGroupByLabel(page: any, label: RegExp) {
  return page.locator(".oxd-input-group")
    .filter({ has: page.locator("label").filter({ hasText: label }) });
}

function statusRegex(status: string) {
  return /enabled|enable/i.test(status) ? /Enabled|Enable/i : /Disabled|Disable/i;
}

async function attachFailureContext(context: UserCaseContext, error: unknown) {
  const { page, tc, testInfo } = context;
  const currentUrl = page.isClosed?.() ? "page-closed" : page.url();
  const body = JSON.stringify({
    id: tc.id,
    name: tc.name,
    group: tc.group,
    rowNumber: tc.rowNumber,
    input: tc.input,
    expected: tc.expected,
    expectedStatus: tc.expectedStatus,
    url: currentUrl,
    error: error instanceof Error ? error.message : String(error)
  }, null, 2);

  await testInfo.attach(`${tc.id}-context`, {
    body,
    contentType: "application/json"
  });

  try {
    if (page.isClosed?.()) return;
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`${tc.id}-screenshot`, {
      body: screenshot,
      contentType: "image/png"
    });
  } catch (screenshotError) {
    await testInfo.attach(`${tc.id}-screenshot-error`, {
      body: JSON.stringify({
        message: screenshotError instanceof Error ? screenshotError.message : String(screenshotError)
      }, null, 2),
      contentType: "application/json"
    });
  }
}

async function waitForTable(page: any) {
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => { });
  const rowVisible = await page.locator(".oxd-table-body .oxd-table-row").first()
    .waitFor({ state: "visible", timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  if (!rowVisible) {
    await page.getByText(/No Records Found/i).first()
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => { });
  }
}

async function waitForSuccessToast(page: any) {
  await page.getByText(/Successfully Saved|Successfully Updated|Successfully Deleted|Success|成功/i).first()
    .waitFor({ state: "visible", timeout: 15000 });
}

async function ensureUserFiltersVisible(page: any) {
  const usernameInput = fieldGroupByLabel(page, /^Username/i).locator("input").first();
  if (await usernameInput.isVisible().catch(() => false)) {
    await expect(page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
    return;
  }

  const toggle = page.locator(".oxd-table-filter-header-options .oxd-icon-button").first();
  await toggle.waitFor({ state: "visible", timeout: 15000 });
  await toggle.click();
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => { });
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /Reset/i })).toBeVisible({ timeout: 10000 });
}

async function submitUserSearch(page: any) {
  await ensureUserFiltersVisible(page);
  await page.getByRole("button", { name: /Search/i }).click();
  await waitForTable(page);
}

async function waitForListPage(page: any) {
  await expect(page).toHaveURL(/viewSystemUsers/, { timeout: 15000 });
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 10000 }).catch(() => { });
  await expect(page.getByRole("button", { name: /Add/i })).toBeVisible({ timeout: 15000 });
  await ensureUserFiltersVisible(page);
}

async function ensureAdminListReady(page: any, app: OrangeHrmPage) {
  await app.ensureAdminUsersReady();
  await waitForListPage(page);
}

async function selectDropdownByLabel(page: any, label: RegExp, option: RegExp | string) {
  const group = fieldGroupByLabel(page, label);
  await group.locator(".oxd-select-text").click();
  const optionName = typeof option === "string" ? new RegExp(option, "i") : option;
  await page.getByRole("option", { name: optionName }).first().click();
}

async function getSelectTextByLabel(page: any, label: RegExp) {
  return (await fieldGroupByLabel(page, label)
    .locator(".oxd-select-text")
    .innerText()).trim();
}

async function getVisibleEmployeeNames(page: any) {
  return page.locator(".oxd-table-body .oxd-table-row .oxd-table-cell:nth-child(3)")
    .evaluateAll((cells: Element[]) => cells.map((cell: Element) => cell.textContent?.trim() ?? "").filter(Boolean))
    .catch(() => [] as string[]);
}

async function fillEmployeeAutocomplete(page: any, value: string, excludedEmployeeName = "") {
  const empInput = fieldGroupByLabel(page, /Employee Name/i).locator("input");
  const firstToken = value.split(/\s+/)[0] ?? value;
  const terms = [value, firstToken, value.toLowerCase(), firstToken.toLowerCase()]
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const excluded = excludedEmployeeName.trim().toLowerCase();

  for (const term of terms) {
    await empInput.fill(term);
    await page.waitForFunction(() => {
      const optionNodes = Array.from(document.querySelectorAll(".oxd-autocomplete-option"));
      if (optionNodes.length === 0) return false;
      const texts = optionNodes
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean);
      if (texts.length === 0) return false;
      return texts.some((text) => text !== "Searching....");
    }, { timeout: 10000 }).catch(() => { });

    const optionTexts = await page.locator(".oxd-autocomplete-option").evaluateAll((nodes: Element[]) =>
      nodes.map((node) => node.textContent?.trim() ?? "").filter(Boolean)
    ).catch(() => [] as string[]);

    for (const selectedName of optionTexts) {
      if (excluded && selectedName.toLowerCase() === excluded) continue;
      if (selectedName && !/No Records Found|Searching\.\.\.\.?/i.test(selectedName)) {
        await page.locator(".oxd-autocomplete-option", { hasText: selectedName }).first().click();
        await page.waitForTimeout(300);
        const currentValue = (await empInput.inputValue()).trim();
        if (currentValue && currentValue.toLowerCase() === selectedName.toLowerCase()) return currentValue;
      }
    }
  }

  throw new Error(`No valid Employee Name autocomplete option found for "${value}"`);
}

async function fillAnyEmployeeAutocomplete(page: any, excludedEmployeeName = "") {
  const probes = ["a", "an", "e", "n"];
  for (const probe of probes) {
    try {
      return await fillEmployeeAutocomplete(page, probe, excludedEmployeeName);
    } catch {
      // try the next broad probe
    }
  }
  throw new Error("No valid Employee Name autocomplete option found from live suggestions.");
}

async function selectEmployeeForAdd(page: any, employeeName: string, excludedEmployeeName = "") {
  const normalized = employeeName.trim();
  if (!normalized || /orange test|auto_different_employee/i.test(normalized)) {
    return fillAnyEmployeeAutocomplete(page, excludedEmployeeName);
  }
  return fillEmployeeAutocomplete(page, normalized, excludedEmployeeName);
}

async function openAddUser(page: any, app: OrangeHrmPage) {
  await ensureAdminListReady(page, app);
  await page.getByRole("button", { name: /Add/i }).click();
  await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
}

async function openUserSearch(page: any, app: OrangeHrmPage) {
  await app.ensureAdminUsersReady();
  await ensureUserFiltersVisible(page);
  await expect(fieldGroupByLabel(page, /Employee Name/i).locator("input")).toBeVisible({ timeout: 5000 });
}

async function openEditFormForUser(page: any, app: OrangeHrmPage, username: string) {
  await ensureAdminListReady(page, app);
  await app.searchByLabeledInput("Username", username);
  await submitUserSearch(page);
  await expect(page.getByText(/No Records Found/i).first()).not.toBeVisible();
  await page.locator(".oxd-table-body .oxd-table-row").first()
    .locator(".oxd-table-cell-actions button").last()
    .click();
  await expect(page).toHaveURL(/saveSystemUser/, { timeout: 10000 });
}

async function getTableRowCount(page: any) {
  const noRecord = await page.getByText(/No Records Found/i).first().isVisible().catch(() => false);
  if (noRecord) return 0;
  return page.locator(".oxd-table-body .oxd-table-row").count();
}

async function assertAllRowsMatch(page: any, matcher: (row: any) => Promise<void>) {
  const rows = page.locator(".oxd-table-body .oxd-table-row");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index++) {
    await matcher(rows.nth(index));
  }
}

async function fillAddUserForm(
  page: any,
  username: string,
  role: string,
  status: string,
  employeeName: string,
  password = DEFAULT_NEW_USER_PASSWORD,
  confirmPassword = DEFAULT_NEW_USER_PASSWORD
) {
  await selectDropdownByLabel(page, /User Role/i, role);
  await selectDropdownByLabel(page, /^Status/i, statusRegex(status));
  await selectEmployeeForAdd(page, employeeName);
  await fieldGroupByLabel(page, /Username/i).locator("input").fill(username);
  await fieldGroupByLabel(page, /^Password$/i).locator("input").fill(password);
  await page.locator(".oxd-input-group", { hasText: /Confirm Password/i })
    .locator("input")
    .fill(confirmPassword);
}

async function deleteUserIfExists(page: any, app: OrangeHrmPage, username: string) {
  await ensureAdminListReady(page, app);
  await app.searchByLabeledInput("Username", username);
  await submitUserSearch(page);

  if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) return;

  await page.locator(".oxd-table-body .oxd-table-row").first()
    .locator(".oxd-table-cell-actions button").first()
    .click();
  const confirmDelete = page.locator(".orangehrm-modal-footer .oxd-button--label-danger").first();
  await expect(confirmDelete).toBeVisible({ timeout: 5000 });
  await confirmDelete.click();
  await waitForSuccessToast(page);
  await waitForTable(page);
}

async function ensureUserExists(
  page: any,
  app: OrangeHrmPage,
  username: string,
  role = "ESS",
  status = "Enabled",
  employeeName = "Orange Test"
) {
  await ensureAdminListReady(page, app);
  await app.searchByLabeledInput("Username", username);
  await submitUserSearch(page);

  if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
    await openAddUser(page, app);
    await fillAddUserForm(page, username, role, status, employeeName);
    await page.getByRole("button", { name: /^Save$/i }).click();
    await waitForSuccessToast(page);
  }
}

async function addUserFromCase(
  page: any,
  app: OrangeHrmPage,
  username: string,
  role: string,
  status: string,
  employeeName: string,
  password = DEFAULT_NEW_USER_PASSWORD,
  confirmPassword = DEFAULT_NEW_USER_PASSWORD
) {
  await deleteUserIfExists(page, app, username);
  await openAddUser(page, app);
  await fillAddUserForm(page, username, role, status, employeeName, password, confirmPassword);
  await page.getByRole("button", { name: /^Save$/i }).click();
}

async function searchUserByUsername(page: any, app: OrangeHrmPage, username: string) {
  await ensureAdminListReady(page, app);
  await app.searchByLabeledInput("Username", username);
  await submitUserSearch(page);
}

async function prepareCaseContext(tc: UserTestCase, app: OrangeHrmPage, testInfo: TestInfo): Promise<UserCaseContext> {
  const page = (app as any)["page"];
  const [loginUser = "Admin", loginPass = "admin123", ...args] = tc.input;

  await test.step("Precondition: login and open User Management", async () => {
    await app.login(loginUser, loginPass);
    await ensureAdminListReady(page, app);

    const resetButton = page.getByRole("button", { name: /Reset/i });
    if (await resetButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resetButton.click();
      await waitForTable(page);
    }
  });

  return {
    app,
    page,
    tc,
    loginUser,
    loginPass,
    args,
    testInfo
  };
}

async function runViewAndSearchCase(context: UserCaseContext) {
  const { app, args, page, tc } = context;
  const [arg1 = "", arg2 = ""] = args;

  switch (tc.id) {
    case "TC-U01":
      await test.step("Verify list headers", async () => {
        await expect(page.getByRole("columnheader", { name: /Username/i })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: /User Role/i })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: /Employee Name/i })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: /Status/i })).toBeVisible();
      });
      return;

    case "TC-U02":
      await test.step("Search user by username", async () => {
        await app.searchByLabeledInput("Username", arg1);
        await submitUserSearch(page);
        const firstUsername = await page.locator(".oxd-table-body .oxd-table-row").first()
          .locator(".oxd-table-cell").nth(1).innerText();
        expect(firstUsername.trim().toLowerCase()).toContain(arg1.trim().toLowerCase());
      });
      return;

    case "TC-U03":
      await app.searchByLabeledInput("Username", arg1);
      await submitUserSearch(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      return;

    case "TC-U04":
      await selectDropdownByLabel(page, /User Role/i, arg1);
      await submitUserSearch(page);
      await assertAllRowsMatch(page, async (row) => {
        const roleText = await row.locator(".oxd-table-cell").nth(2).innerText();
        expect(roleText.trim()).toMatch(new RegExp(arg1, "i"));
      });
      return;

    case "TC-U05":
      await selectDropdownByLabel(page, /^Status/i, statusRegex(arg1));
      await submitUserSearch(page);
      await assertAllRowsMatch(page, async (row) => {
        const statusText = await row.locator(".oxd-table-cell").nth(4).innerText();
        expect(statusText.trim()).toMatch(statusRegex(arg1));
      });
      return;

    case "TC-U06":
      await selectDropdownByLabel(page, /User Role/i, arg1);
      await selectDropdownByLabel(page, /^Status/i, statusRegex(arg2));
      await submitUserSearch(page);
      await assertAllRowsMatch(page, async (row) => {
        const roleText = await row.locator(".oxd-table-cell").nth(2).innerText();
        const statusText = await row.locator(".oxd-table-cell").nth(4).innerText();
        expect(roleText.trim()).toMatch(new RegExp(arg1, "i"));
        expect(statusText.trim()).toMatch(statusRegex(arg2));
      });
      return;

    case "TC-U07":
      await app.searchByLabeledInput("Username", arg1 || "Admin");
      await selectDropdownByLabel(page, /User Role/i, arg2 || "Admin");
      await selectDropdownByLabel(page, /^Status/i, /Enabled|Enable/i);
      await page.getByRole("button", { name: /Reset/i }).click();
      await waitForTable(page);
      await expect(fieldGroupByLabel(page, /Username/i).locator("input")).toHaveValue("");
      await expect(fieldGroupByLabel(page, /Employee Name/i).locator("input")).toHaveValue("");
      expect(await getSelectTextByLabel(page, /User Role/i)).toMatch(/-- Select --/);
      expect(await getSelectTextByLabel(page, /^Status/i)).toMatch(/-- Select --/);
      return;

    case "TC-U08":
      await app.searchByLabeledInput("Username", arg1 || "   ");
      await submitUserSearch(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      return;

    default:
      throw new Error(`Unhandled view/search case: ${tc.id}`);
  }
}

async function runCreateUserCase(context: UserCaseContext) {
  const { app, args, page, tc } = context;
  const [
    username = "",
    role = "ESS",
    status = "Enabled",
    employeeName = "Orange Test",
    password = DEFAULT_NEW_USER_PASSWORD,
    confirmPassword = DEFAULT_NEW_USER_PASSWORD,
    altInvalidUsername = ""
  ] = args;

  switch (tc.id) {
    case "TC-U09":
      await addUserFromCase(page, app, username, role, status, employeeName, password, confirmPassword);
      await waitForSuccessToast(page);
      await searchUserByUsername(page, app, username);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      return;

    case "TC-U10":
      await addUserFromCase(page, app, username, role, status, employeeName, password, confirmPassword);
      await waitForSuccessToast(page);
      await searchUserByUsername(page, app, username);
      const firstRole = await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell").nth(2).innerText();
      expect(firstRole.trim()).toMatch(/Admin/i);
      return;

    case "TC-U11": {
      await openAddUser(page, app);
      await selectDropdownByLabel(page, /User Role/i, role);
      await selectDropdownByLabel(page, /^Status/i, statusRegex(status));
      await selectEmployeeForAdd(page, employeeName);
      await fieldGroupByLabel(page, /^Password$/i).locator("input").fill(password);
      await page.locator(".oxd-input-group", { hasText: /Confirm Password/i }).locator("input").fill(confirmPassword);
      await page.getByRole("button", { name: /^Save$/i }).click();
      await expect(fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message"))
        .toContainText(/Required/i, { timeout: 5000 });
      return;
    }

    case "TC-U12":
      await openAddUser(page, app);
      await fieldGroupByLabel(page, /Username/i).locator("input").fill(username);
      await fieldGroupByLabel(page, /Username/i).locator("input").press("Tab");
      await expect(fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message"))
        .toContainText(/already exists/i, { timeout: 5000 });
      return;

    case "TC-U13": {
      const usernameInput = fieldGroupByLabel(page, /Username/i).locator("input");
      await openAddUser(page, app);
      await usernameInput.fill(username);
      await usernameInput.press("Tab");
      await expect(usernameInput).toHaveValue(username);
      await expect(fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message"))
        .not.toBeVisible();
      return;
    }

    case "TC-U14":
      await openAddUser(page, app);
      await selectDropdownByLabel(page, /User Role/i, role);
      await selectDropdownByLabel(page, /^Status/i, statusRegex(status));
      await selectEmployeeForAdd(page, employeeName);
      await fieldGroupByLabel(page, /Username/i).locator("input").fill(username);
      await fieldGroupByLabel(page, /Username/i).locator("input").press("Tab");
      await fieldGroupByLabel(page, /^Password$/i).locator("input").fill(password);
      await page.locator(".oxd-input-group", { hasText: /Confirm Password/i }).locator("input").fill(confirmPassword);
      await page.getByRole("button", { name: /^Save$/i }).click();
      const usernameInputValue = await fieldGroupByLabel(page, /Username/i).locator("input").inputValue();
      const usernameError = fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message");
      const hasValidationError = await usernameError.isVisible().catch(() => false);
      expect(
        hasValidationError || usernameInputValue.length < username.length,
        `${tc.id}: overlong username was neither rejected nor truncated.`
      ).toBeTruthy();
      return;

    case "TC-U15":
      await openAddUser(page, app);
      await fillAddUserForm(page, username, role, status, employeeName, password, confirmPassword);
      await page.getByRole("button", { name: /^Save$/i }).click();
      await expect(fieldGroupByLabel(page, /Confirm Password/i).locator(".oxd-input-field-error-message"))
        .toContainText(/Passwords do not match/i, { timeout: 5000 });
      return;

    default:
      throw new Error(`Unhandled create case: ${tc.id}`);
  }
}

async function runEditUserCase(context: UserCaseContext) {
  const { app, args, page, tc } = context;
  const [username = "", arg2 = ""] = args;

  switch (tc.id) {
    case "TC-U16":
      await ensureUserExists(page, app, username);
      await openEditFormForUser(page, app, username);
      await expect(page.getByRole("heading", { name: /Edit User/i })).toBeVisible();
      await expect(fieldGroupByLabel(page, /Username/i).locator("input")).toHaveValue(username);
      expect(await getSelectTextByLabel(page, /User Role/i)).not.toMatch(/^$/);
      expect(await getSelectTextByLabel(page, /^Status/i)).not.toMatch(/^$/);
      return;

    case "TC-U17":
    {
      const [
        sourceUsername = "",
        sourceRole = "ESS",
        sourceStatus = "Enabled",
        sourceEmployeeName = "Orange Test",
        updatedUsername = `${sourceUsername}_edited`,
        updatedRole = "Admin",
        updatedStatus = "Disabled",
        updatedEmployeeName = "AUTO_DIFFERENT_EMPLOYEE"
      ] = args;

      if (updatedUsername !== sourceUsername) {
        await deleteUserIfExists(page, app, updatedUsername);
      }

      await addUserFromCase(page, app, sourceUsername, sourceRole, sourceStatus, sourceEmployeeName);
      await waitForSuccessToast(page);
      await openEditFormForUser(page, app, sourceUsername);

      const currentEmployeeName = (await fieldGroupByLabel(page, /Employee Name/i).locator("input").inputValue()).trim();
      await selectDropdownByLabel(page, /User Role/i, updatedRole);
      const savedEmployeeName = await selectEmployeeForAdd(page, updatedEmployeeName, currentEmployeeName);
      await selectDropdownByLabel(page, /^Status/i, statusRegex(updatedStatus));
      await fieldGroupByLabel(page, /Username/i).locator("input").fill(updatedUsername);
      await page.getByRole("button", { name: /^Save$/i }).click();
      await waitForSuccessToast(page);
      await searchUserByUsername(page, app, updatedUsername);

      const updatedRow = page.locator(".oxd-table-body .oxd-table-row").first();
      await expect(updatedRow).toBeVisible();
      await expect(page.getByText(/No Records Found/i).first()).not.toBeVisible();

      const listedUsername = await updatedRow.locator(".oxd-table-cell").nth(1).innerText();
      const listedRole = await updatedRow.locator(".oxd-table-cell").nth(2).innerText();
      const listedStatus = await updatedRow.locator(".oxd-table-cell").nth(4).innerText();
      expect(listedUsername.trim()).toBe(updatedUsername);
      expect(listedRole.trim()).toMatch(new RegExp(updatedRole, "i"));
      expect(listedStatus.trim()).toMatch(statusRegex(updatedStatus));

      await openEditFormForUser(page, app, updatedUsername);
      await expect(fieldGroupByLabel(page, /Username/i).locator("input")).toHaveValue(updatedUsername);
      await expect(fieldGroupByLabel(page, /Employee Name/i).locator("input")).toHaveValue(savedEmployeeName);
      expect(await getSelectTextByLabel(page, /User Role/i)).toMatch(new RegExp(updatedRole, "i"));
      expect(await getSelectTextByLabel(page, /^Status/i)).toMatch(statusRegex(updatedStatus));
      return;
    }

    default:
      throw new Error(`Unhandled edit case: ${tc.id}`);
  }
}

async function runDeleteUserCase(context: UserCaseContext) {
  const { app, args, page, tc } = context;
  const [username = ""] = args;

  switch (tc.id) {
    case "TC-U18":
      await ensureUserExists(page, app, username);
      await searchUserByUsername(page, app, username);
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-checkbox-wrapper")
        .click();
      await page.getByRole("button", { name: /Delete Selected/i }).click();
      await page.locator(".orangehrm-modal-footer .oxd-button--label-danger").first().click();
      await waitForSuccessToast(page);
      await searchUserByUsername(page, app, username);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      return;

    case "TC-U19":
      await waitForTable(page);
      await expect(page.getByRole("button", { name: /Delete Selected/i })).not.toBeVisible();
      await expect(page.locator(".orangehrm-modal-footer")).not.toBeVisible();
      return;

    default:
      throw new Error(`Unhandled delete case: ${tc.id}`);
  }
}

async function runIntegrationCase(context: UserCaseContext) {
  const { app, args, page, tc } = context;
  const [
    username = "",
    role = "ESS",
    status = "Enabled",
    employeeName = "Orange Test"
  ] = args;

  switch (tc.id) {
    case "TC-U20":
      await addUserFromCase(page, app, username, role, status, employeeName);
      await waitForSuccessToast(page);
      await searchUserByUsername(page, app, username);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      return;

    case "TC-U21":
      await addUserFromCase(page, app, username, role, status, employeeName);
      await waitForSuccessToast(page);
      await openEditFormForUser(page, app, username);
      await expect(fieldGroupByLabel(page, /Username/i).locator("input")).toHaveValue(username);
      expect(await getSelectTextByLabel(page, /User Role/i)).toMatch(new RegExp(role, "i"));
      expect(await getSelectTextByLabel(page, /^Status/i)).toMatch(statusRegex(status));
      return;

    default:
      throw new Error(`Unhandled integration case: ${tc.id}`);
  }
}

async function runUserCase(tc: UserTestCase, app: OrangeHrmPage, testInfo: TestInfo) {
  const context = await prepareCaseContext(tc, app, testInfo);

  switch (tc.group) {
    case "Xem và tìm kiếm":
      return runViewAndSearchCase(context);
    case "Thêm người dùng mới":
      return runCreateUserCase(context);
    case "Chỉnh sửa người dùng":
      return runEditUserCase(context);
    case "Xóa người dùng":
      return runDeleteUserCase(context);
    case "Tích hợp":
      return runIntegrationCase(context);
    default:
      throw new Error(`No runner configured for group "${tc.group}" (${tc.id})`);
  }
}

for (const [group, cases] of groupedUserCases) {
  test.describe(group, () => {
    for (const tc of cases) {
      test(`${tc.id} | ${tc.name}`, async ({ page }, testInfo) => {
        const app = new OrangeHrmPage(page);
        try {
          await runUserCase(tc, app, testInfo);
        } catch (error) {
          await attachFailureContext({
            app,
            page,
            tc,
            loginUser: tc.input[0] ?? "",
            loginPass: tc.input[1] ?? "",
            args: tc.input.slice(2),
            testInfo
          }, error);
          throw error;
        }
      });
    }
  });
}
