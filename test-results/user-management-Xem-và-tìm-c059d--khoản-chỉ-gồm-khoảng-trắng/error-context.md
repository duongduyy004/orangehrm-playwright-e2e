# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-management.spec.ts >> Xem và tìm kiếm >> TC-U08 | Tìm kiếm tên tài khoản chỉ gồm khoảng trắng
- Location: tests\user-management.spec.ts:841:11

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/No Records Found/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/No Records Found/i).first()

```

```yaml
- complementary:
  - navigation "Sidepanel":
    - link "client brand banner":
      - /url: https://www.orangehrm.com/
      - img "client brand banner"
    - textbox "Search"
    - button ""
    - separator
    - list:
      - listitem:
        - link "Admin":
          - /url: /web/index.php/admin/viewAdminModule
      - listitem:
        - link "PIM":
          - /url: /web/index.php/pim/viewPimModule
      - listitem:
        - link "Leave":
          - /url: /web/index.php/leave/viewLeaveModule
      - listitem:
        - link "Time":
          - /url: /web/index.php/time/viewTimeModule
      - listitem:
        - link "Recruitment":
          - /url: /web/index.php/recruitment/viewRecruitmentModule
      - listitem:
        - link "My Info":
          - /url: /web/index.php/pim/viewMyDetails
      - listitem:
        - link "Performance":
          - /url: /web/index.php/performance/viewPerformanceModule
      - listitem:
        - link "Dashboard":
          - /url: /web/index.php/dashboard/index
      - listitem:
        - link "Directory":
          - /url: /web/index.php/directory/viewDirectory
      - listitem:
        - link "Maintenance":
          - /url: /web/index.php/maintenance/viewMaintenanceModule
      - listitem:
        - link "Claim":
          - /url: /web/index.php/claim/viewClaimModule
          - img
          - text: Claim
      - listitem:
        - link "Buzz":
          - /url: /web/index.php/buzz/viewBuzz
- banner:
  - heading "Admin" [level=6]
  - heading "/ User Management" [level=6]
  - link "Upgrade":
    - /url: https://orangehrm.com/open-source/upgrade-to-advanced
    - button "Upgrade"
  - list:
    - listitem:
      - img "profile picture"
      - paragraph: AdminAuto User
      - text: 
  - navigation "Topbar Menu":
    - list:
      - listitem: User Management 
      - listitem: Job 
      - listitem: Organization 
      - listitem: Qualifications 
      - listitem:
        - link "Nationalities":
          - /url: "#"
      - listitem:
        - link "Corporate Branding":
          - /url: "#"
      - listitem: Configuration 
      - button ""
- heading "System Users" [level=5]
- button ""
- separator
- text: Username
- textbox
- text: User Role -- Select --  Employee Name
- textbox "Type for hints..."
- text: Status -- Select -- 
- separator
- button "Reset"
- button "Search"
- button " Add"
- separator
- text: (27) Records Found
- table:
  - rowgroup:
    - row " Username  User Role  Employee Name  Status  Actions":
      - columnheader "":
        - checkbox ""
        - text: 
      - columnheader "Username "
      - columnheader "User Role "
      - columnheader "Employee Name "
      - columnheader "Status "
      - columnheader "Actions"
  - rowgroup
- paragraph: OrangeHRM OS 5.8
- paragraph:
  - text: © 2005 - 2026
  - link "OrangeHRM, Inc":
    - /url: http://www.orangehrm.com
  - text: . All rights reserved.
```

# Test source

```ts
  469 |   const page = (app as any)["page"];
  470 |   const [loginUser = "Admin", loginPass = "admin123", ...args] = tc.input;
  471 | 
  472 |   await test.step("Precondition: login and open User Management", async () => {
  473 |     await app.ensureLoggedIn(loginUser, loginPass);
  474 |     await ensureAdminListReady(page, app);
  475 | 
  476 |     const resetButton = page.getByRole("button", { name: /Reset/i });
  477 |     if (await resetButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  478 |       await resetButton.click();
  479 |       await waitForTable(page);
  480 |     }
  481 |   });
  482 | 
  483 |   return {
  484 |     app,
  485 |     page,
  486 |     tc,
  487 |     loginUser,
  488 |     loginPass,
  489 |     args,
  490 |     testInfo
  491 |   };
  492 | }
  493 | 
  494 | async function runViewAndSearchCase(context: UserCaseContext) {
  495 |   const { app, args, page, tc } = context;
  496 |   const [arg1 = "", arg2 = ""] = args;
  497 | 
  498 |   switch (tc.id) {
  499 |     case "TC-U01":
  500 |       await test.step("Verify list headers", async () => {
  501 |         await expect(page.getByRole("columnheader", { name: /Username/i })).toBeVisible();
  502 |         await expect(page.getByRole("columnheader", { name: /User Role/i })).toBeVisible();
  503 |         await expect(page.getByRole("columnheader", { name: /Employee Name/i })).toBeVisible();
  504 |         await expect(page.getByRole("columnheader", { name: /Status/i })).toBeVisible();
  505 |       });
  506 |       return;
  507 | 
  508 |     case "TC-U02":
  509 |       await test.step("Search user by username", async () => {
  510 |         await app.searchByLabeledInput("Username", arg1);
  511 |         await submitUserSearch(page);
  512 |         const firstUsername = await page.locator(".oxd-table-body .oxd-table-row").first()
  513 |           .locator(".oxd-table-cell").nth(1).innerText();
  514 |         expect(firstUsername.trim().toLowerCase()).toContain(arg1.trim().toLowerCase());
  515 |       });
  516 |       return;
  517 | 
  518 |     case "TC-U03":
  519 |       await app.searchByLabeledInput("Username", arg1);
  520 |       await submitUserSearch(page);
  521 |       await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
  522 |       return;
  523 | 
  524 |     case "TC-U04":
  525 |       await selectDropdownByLabel(page, /User Role/i, arg1);
  526 |       await submitUserSearch(page);
  527 |       await assertAllRowsMatch(page, async (row) => {
  528 |         const roleText = await row.locator(".oxd-table-cell").nth(2).innerText();
  529 |         expect(roleText.trim()).toMatch(new RegExp(arg1, "i"));
  530 |       });
  531 |       return;
  532 | 
  533 |     case "TC-U05":
  534 |       await selectDropdownByLabel(page, /^Status/i, statusRegex(arg1));
  535 |       await submitUserSearch(page);
  536 |       await assertAllRowsMatch(page, async (row) => {
  537 |         const statusText = await row.locator(".oxd-table-cell").nth(4).innerText();
  538 |         expect(statusText.trim()).toMatch(statusRegex(arg1));
  539 |       });
  540 |       return;
  541 | 
  542 |     case "TC-U06":
  543 |       await selectDropdownByLabel(page, /User Role/i, arg1);
  544 |       await selectDropdownByLabel(page, /^Status/i, statusRegex(arg2));
  545 |       await submitUserSearch(page);
  546 |       await assertAllRowsMatch(page, async (row) => {
  547 |         const roleText = await row.locator(".oxd-table-cell").nth(2).innerText();
  548 |         const statusText = await row.locator(".oxd-table-cell").nth(4).innerText();
  549 |         expect(roleText.trim()).toMatch(new RegExp(arg1, "i"));
  550 |         expect(statusText.trim()).toMatch(statusRegex(arg2));
  551 |       });
  552 |       return;
  553 | 
  554 |     case "TC-U07":
  555 |       await app.searchByLabeledInput("Username", arg1 || "Admin");
  556 |       await selectDropdownByLabel(page, /User Role/i, arg2 || "Admin");
  557 |       await selectDropdownByLabel(page, /^Status/i, /Enabled|Enable/i);
  558 |       await page.getByRole("button", { name: /Reset/i }).click();
  559 |       await waitForTable(page);
  560 |       await expect(fieldGroupByLabel(page, /Username/i).locator("input")).toHaveValue("");
  561 |       await expect(fieldGroupByLabel(page, /Employee Name/i).locator("input")).toHaveValue("");
  562 |       expect(await getSelectTextByLabel(page, /User Role/i)).toMatch(/-- Select --/);
  563 |       expect(await getSelectTextByLabel(page, /^Status/i)).toMatch(/-- Select --/);
  564 |       return;
  565 | 
  566 |     case "TC-U08":
  567 |       await app.searchByLabeledInput("Username", arg1 || "   ");
  568 |       await submitUserSearch(page);
> 569 |       await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      |                                                                 ^ Error: expect(locator).toBeVisible() failed
  570 |       return;
  571 | 
  572 |     default:
  573 |       throw new Error(`Unhandled view/search case: ${tc.id}`);
  574 |   }
  575 | }
  576 | 
  577 | async function runCreateUserCase(context: UserCaseContext) {
  578 |   const { app, args, page, tc } = context;
  579 |   const [
  580 |     username = "",
  581 |     role = "ESS",
  582 |     status = "Enabled",
  583 |     employeeName = "Orange Test",
  584 |     password = DEFAULT_NEW_USER_PASSWORD,
  585 |     confirmPassword = DEFAULT_NEW_USER_PASSWORD,
  586 |     altInvalidUsername = ""
  587 |   ] = args;
  588 | 
  589 |   switch (tc.id) {
  590 |     case "TC-U09":
  591 |       await addUserFromCase(page, app, username, role, status, employeeName, password, confirmPassword);
  592 |       await waitForSuccessToast(page);
  593 |       await searchUserByUsername(page, app, username);
  594 |       await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
  595 |       return;
  596 | 
  597 |     case "TC-U10":
  598 |       await addUserFromCase(page, app, username, role, status, employeeName, password, confirmPassword);
  599 |       await waitForSuccessToast(page);
  600 |       await searchUserByUsername(page, app, username);
  601 |       const firstRole = await page.locator(".oxd-table-body .oxd-table-row").first()
  602 |         .locator(".oxd-table-cell").nth(2).innerText();
  603 |       expect(firstRole.trim()).toMatch(/Admin/i);
  604 |       return;
  605 | 
  606 |     case "TC-U11": {
  607 |       await openAddUser(page, app);
  608 |       await selectDropdownByLabel(page, /User Role/i, role);
  609 |       await selectDropdownByLabel(page, /^Status/i, statusRegex(status));
  610 |       await selectEmployeeForAdd(page, employeeName);
  611 |       await fieldGroupByLabel(page, /^Password$/i).locator("input").fill(password);
  612 |       await page.locator(".oxd-input-group", { hasText: /Confirm Password/i }).locator("input").fill(confirmPassword);
  613 |       await page.getByRole("button", { name: /^Save$/i }).click();
  614 |       await expect(fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message"))
  615 |         .toContainText(/Required/i, { timeout: 5000 });
  616 |       return;
  617 |     }
  618 | 
  619 |     case "TC-U12":
  620 |       await openAddUser(page, app);
  621 |       await fieldGroupByLabel(page, /Username/i).locator("input").fill(username);
  622 |       await fieldGroupByLabel(page, /Username/i).locator("input").press("Tab");
  623 |       await expect(fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message"))
  624 |         .toContainText(/already exists/i, { timeout: 5000 });
  625 |       return;
  626 | 
  627 |     case "TC-U13": {
  628 |       const usernameInput = fieldGroupByLabel(page, /Username/i).locator("input");
  629 |       await openAddUser(page, app);
  630 |       await usernameInput.fill(username);
  631 |       await usernameInput.press("Tab");
  632 |       await expect(usernameInput).toHaveValue(username);
  633 |       await expect(fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message"))
  634 |         .not.toBeVisible();
  635 |       return;
  636 |     }
  637 | 
  638 |     case "TC-U14":
  639 |       await openAddUser(page, app);
  640 |       await selectDropdownByLabel(page, /User Role/i, role);
  641 |       await selectDropdownByLabel(page, /^Status/i, statusRegex(status));
  642 |       await selectEmployeeForAdd(page, employeeName);
  643 |       await fieldGroupByLabel(page, /Username/i).locator("input").fill(username);
  644 |       await fieldGroupByLabel(page, /Username/i).locator("input").press("Tab");
  645 |       await fieldGroupByLabel(page, /^Password$/i).locator("input").fill(password);
  646 |       await page.locator(".oxd-input-group", { hasText: /Confirm Password/i }).locator("input").fill(confirmPassword);
  647 |       await page.getByRole("button", { name: /^Save$/i }).click();
  648 |       const usernameInputValue = await fieldGroupByLabel(page, /Username/i).locator("input").inputValue();
  649 |       const usernameError = fieldGroupByLabel(page, /Username/i).locator(".oxd-input-field-error-message");
  650 |       const hasValidationError = await usernameError.isVisible().catch(() => false);
  651 |       expect(
  652 |         hasValidationError || usernameInputValue.length < username.length,
  653 |         `${tc.id}: overlong username was neither rejected nor truncated.`
  654 |       ).toBeTruthy();
  655 |       return;
  656 | 
  657 |     case "TC-U15":
  658 |       await openAddUser(page, app);
  659 |       await fillAddUserForm(page, username, role, status, employeeName, password, confirmPassword);
  660 |       await page.getByRole("button", { name: /^Save$/i }).click();
  661 |       await expect(fieldGroupByLabel(page, /Confirm Password/i).locator(".oxd-input-field-error-message"))
  662 |         .toContainText(/Passwords do not match/i, { timeout: 5000 });
  663 |       return;
  664 | 
  665 |     default:
  666 |       throw new Error(`Unhandled create case: ${tc.id}`);
  667 |   }
  668 | }
  669 | 
```