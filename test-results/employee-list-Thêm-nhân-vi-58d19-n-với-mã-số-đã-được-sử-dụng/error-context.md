# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employee-list.spec.ts >> Thêm nhân viên >> TC-E13 | Thêm nhân viên với mã số đã được sử dụng
- Location: tests\employee-list.spec.ts:617:9

# Error details

```
Error: BUG BG54: Employee ID "0295" đã tồn tại nhưng không báo lỗi đỏ và record mới vẫn được lưu thành công.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic:
    - complementary [ref=e4]:
      - navigation "Sidepanel" [ref=e5]:
        - generic [ref=e6]:
          - link "client brand banner" [ref=e7] [cursor=pointer]:
            - /url: https://www.orangehrm.com/
            - img "client brand banner" [ref=e9]
          - text: 
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - textbox "Search" [ref=e15]
              - button "" [ref=e16] [cursor=pointer]:
                - generic [ref=e17]: 
            - separator [ref=e18]
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "Admin" [ref=e21] [cursor=pointer]:
                - /url: /web/index.php/admin/viewAdminModule
                - generic [ref=e24]: Admin
            - listitem [ref=e25]:
              - link "PIM" [ref=e26] [cursor=pointer]:
                - /url: /web/index.php/pim/viewPimModule
                - generic [ref=e40]: PIM
            - listitem [ref=e41]:
              - link "Leave" [ref=e42] [cursor=pointer]:
                - /url: /web/index.php/leave/viewLeaveModule
                - generic [ref=e45]: Leave
            - listitem [ref=e46]:
              - link "Time" [ref=e47] [cursor=pointer]:
                - /url: /web/index.php/time/viewTimeModule
                - generic [ref=e53]: Time
            - listitem [ref=e54]:
              - link "Recruitment" [ref=e55] [cursor=pointer]:
                - /url: /web/index.php/recruitment/viewRecruitmentModule
                - generic [ref=e61]: Recruitment
            - listitem [ref=e62]:
              - link "My Info" [ref=e63] [cursor=pointer]:
                - /url: /web/index.php/pim/viewMyDetails
                - generic [ref=e69]: My Info
            - listitem [ref=e70]:
              - link "Performance" [ref=e71] [cursor=pointer]:
                - /url: /web/index.php/performance/viewPerformanceModule
                - generic [ref=e79]: Performance
            - listitem [ref=e80]:
              - link "Dashboard" [ref=e81] [cursor=pointer]:
                - /url: /web/index.php/dashboard/index
                - generic [ref=e84]: Dashboard
            - listitem [ref=e85]:
              - link "Directory" [ref=e86] [cursor=pointer]:
                - /url: /web/index.php/directory/viewDirectory
                - generic [ref=e89]: Directory
            - listitem [ref=e90]:
              - link "Maintenance" [ref=e91] [cursor=pointer]:
                - /url: /web/index.php/maintenance/viewMaintenanceModule
                - generic [ref=e95]: Maintenance
            - listitem [ref=e96]:
              - link "Claim" [ref=e97] [cursor=pointer]:
                - /url: /web/index.php/claim/viewClaimModule
                - img [ref=e100]
                - generic [ref=e104]: Claim
            - listitem [ref=e105]:
              - link "Buzz" [ref=e106] [cursor=pointer]:
                - /url: /web/index.php/buzz/viewBuzz
                - generic [ref=e109]: Buzz
    - banner [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - text: 
          - heading "PIM" [level=6] [ref=e114]
        - link "Upgrade" [ref=e116]:
          - /url: https://orangehrm.com/open-source/upgrade-to-advanced
          - button "Upgrade" [ref=e117] [cursor=pointer]: Upgrade
        - list [ref=e123]:
          - listitem [ref=e124]:
            - generic [ref=e125] [cursor=pointer]:
              - img "profile picture" [ref=e126]
              - paragraph [ref=e127]: Admin User
              - generic [ref=e128]: 
      - navigation "Topbar Menu" [ref=e130]:
        - list [ref=e131]:
          - listitem [ref=e132] [cursor=pointer]:
            - generic [ref=e133]:
              - text: Configuration
              - generic [ref=e134]: 
          - listitem [ref=e135] [cursor=pointer]:
            - link "Employee List" [ref=e136]:
              - /url: "#"
          - listitem [ref=e137] [cursor=pointer]:
            - link "Add Employee" [ref=e138]:
              - /url: "#"
          - listitem [ref=e139] [cursor=pointer]:
            - link "Reports" [ref=e140]:
              - /url: "#"
          - button "" [ref=e142] [cursor=pointer]:
            - generic [ref=e143]: 
  - generic [ref=e144]:
    - generic [ref=e148]:
      - generic [ref=e149]:
        - generic [ref=e150]:
          - heading "0295 MaSo" [level=6] [ref=e152]
          - img "profile picture" [ref=e155] [cursor=pointer]
        - tablist [ref=e156]:
          - tab "Personal Details" [ref=e157]:
            - link "Personal Details" [ref=e158] [cursor=pointer]:
              - /url: /web/index.php/pim/viewPersonalDetails/empNumber/322
          - tab "Contact Details" [ref=e159]:
            - link "Contact Details" [ref=e160] [cursor=pointer]:
              - /url: /web/index.php/pim/contactDetails/empNumber/322
          - tab "Emergency Contacts" [ref=e161]:
            - link "Emergency Contacts" [ref=e162] [cursor=pointer]:
              - /url: /web/index.php/pim/viewEmergencyContacts/empNumber/322
          - tab "Dependents" [ref=e163]:
            - link "Dependents" [ref=e164] [cursor=pointer]:
              - /url: /web/index.php/pim/viewDependents/empNumber/322
          - tab "Immigration" [ref=e165]:
            - link "Immigration" [ref=e166] [cursor=pointer]:
              - /url: /web/index.php/pim/viewImmigration/empNumber/322
          - tab "Job" [ref=e167]:
            - link "Job" [ref=e168] [cursor=pointer]:
              - /url: /web/index.php/pim/viewJobDetails/empNumber/322
          - tab "Salary" [ref=e169]:
            - link "Salary" [ref=e170] [cursor=pointer]:
              - /url: /web/index.php/pim/viewSalaryList/empNumber/322
          - tab "Report-to" [ref=e171]:
            - link "Report-to" [ref=e172] [cursor=pointer]:
              - /url: /web/index.php/pim/viewReportToDetails/empNumber/322
          - tab "Qualifications" [ref=e173]:
            - link "Qualifications" [ref=e174] [cursor=pointer]:
              - /url: /web/index.php/pim/viewQualifications/empNumber/322
          - tab "Memberships" [ref=e175]:
            - link "Memberships" [ref=e176] [cursor=pointer]:
              - /url: /web/index.php/pim/viewMemberships/empNumber/322
      - generic [ref=e177]:
        - generic [ref=e178]:
          - heading "Personal Details" [level=6] [ref=e179]
          - separator [ref=e180]
          - generic [ref=e181]:
            - generic [ref=e185]:
              - generic [ref=e187]: Employee Full Name*
              - generic [ref=e188]:
                - textbox "First Name" [ref=e191]: "0295"
                - textbox "Middle Name" [ref=e194]
                - textbox "Last Name" [ref=e197]: MaSo
            - separator [ref=e198]
            - generic [ref=e199]:
              - generic [ref=e200]:
                - generic [ref=e202]:
                  - generic [ref=e204]: Employee Id
                  - textbox [ref=e206]: "0521"
                - generic [ref=e208]:
                  - generic [ref=e210]: Other Id
                  - textbox [ref=e212]
              - generic [ref=e213]:
                - generic [ref=e215]:
                  - generic [ref=e217]: Driver's License Number
                  - textbox [ref=e219]
                - generic [ref=e221]:
                  - generic [ref=e223]: License Expiry Date
                  - generic [ref=e226]:
                    - textbox "yyyy-dd-mm" [ref=e227]
                    - generic [ref=e228] [cursor=pointer]: 
            - separator [ref=e229]
            - generic [ref=e230]:
              - generic [ref=e231]:
                - generic [ref=e233]:
                  - generic [ref=e235]: Nationality
                  - generic [ref=e238] [cursor=pointer]:
                    - generic [ref=e239]: "-- Select --"
                    - generic [ref=e241]: 
                - generic [ref=e243]:
                  - generic [ref=e245]: Marital Status
                  - generic [ref=e248] [cursor=pointer]:
                    - generic [ref=e249]: "-- Select --"
                    - generic [ref=e251]: 
              - generic [ref=e252]:
                - generic [ref=e254]:
                  - generic [ref=e256]: Date of Birth
                  - generic [ref=e259]:
                    - textbox "yyyy-dd-mm" [ref=e260]
                    - generic [ref=e261] [cursor=pointer]: 
                - generic [ref=e263]:
                  - generic [ref=e265]: Gender
                  - generic [ref=e266]:
                    - generic [ref=e270] [cursor=pointer]:
                      - radio "Male" [ref=e271]
                      - text: Male
                    - generic [ref=e276] [cursor=pointer]:
                      - radio "Female" [ref=e277]
                      - text: Female
            - separator [ref=e279]
            - generic [ref=e280]:
              - paragraph [ref=e281]: "* Required"
              - button "Save" [ref=e282] [cursor=pointer]
        - generic [ref=e283]:
          - separator [ref=e284]
          - generic [ref=e285]:
            - heading "Custom Fields" [level=6] [ref=e286]
            - separator [ref=e287]
            - generic [ref=e288]:
              - generic [ref=e290]:
                - generic [ref=e292]:
                  - generic [ref=e294]: Blood Type
                  - generic [ref=e297] [cursor=pointer]:
                    - generic [ref=e298]: "-- Select --"
                    - generic [ref=e300]: 
                - generic [ref=e302]:
                  - generic [ref=e304]: Test_Field
                  - textbox [ref=e306]
              - separator [ref=e307]
              - button "Save" [ref=e309] [cursor=pointer]
        - generic [ref=e310]:
          - separator [ref=e311]
          - generic [ref=e313]:
            - heading "Attachments" [level=6] [ref=e314]
            - button " Add" [ref=e315] [cursor=pointer]:
              - generic [ref=e316]: 
              - text: Add
          - generic [ref=e317]:
            - separator [ref=e318]
            - generic [ref=e320]: No Records Found
          - table [ref=e322]:
            - rowgroup [ref=e323]:
              - row " File Name Description Size Type Date Added Added By Actions" [ref=e324]:
                - columnheader "" [ref=e325]:
                  - generic [ref=e327] [cursor=pointer]:
                    - checkbox "" [ref=e328]
                    - generic [ref=e330]: 
                - columnheader "File Name" [ref=e331]
                - columnheader "Description" [ref=e332]
                - columnheader "Size" [ref=e333]
                - columnheader "Type" [ref=e334]
                - columnheader "Date Added" [ref=e335]
                - columnheader "Added By" [ref=e336]
                - columnheader "Actions" [ref=e337]
            - rowgroup
    - generic [ref=e338]:
      - paragraph [ref=e339]: OrangeHRM OS 5.8
      - paragraph [ref=e340]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e341] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  222 |       if (!hasNoRecords) {
  223 |         throw new Error(`BUG: Tìm kiếm với khoảng trắng ("   ") trong Employee Name không lọc được dữ liệu, vẫn hiển thị đầy đủ danh sách nhân viên.`);
  224 |       }
  225 |       expect(hasNoRecords).toBe(true);
  226 |       break;
  227 |     }
  228 | 
  229 |     // ── Nhóm 2: Thêm nhân viên ────────────────────────────────────────
  230 |     case "TC-E09": {
  231 |       // Happy path: thêm employee thành công
  232 |       const [fn, ln] = [a2 || "Nguyen", a3 || "TieuHoc"];
  233 |       await deleteEmployeeIfExists(page, app, `${fn} ${ln}`);
  234 |       await app.openEmployeeList();
  235 |       await waitForListPage(page);
  236 |       await fillAddEmployeeForm(page, fn, ln);
  237 |       await page.locator("button[type='submit']").click();
  238 |       await expect(
  239 |         page.locator(".oxd-toast--success, .oxd-toast-content")
  240 |           .filter({ hasText: /Saved|Success|成功/i })
  241 |           .first()
  242 |       ).toBeVisible({ timeout: 15000 });
  243 |       break;
  244 |     }
  245 | 
  246 |     case "TC-E10": {
  247 |       // BUG BG53: Nhân viên mới không hiện trong list ngay lập tức
  248 |       // Bước 1: Ghi nhận số lượng records hiện tại
  249 |       const countBefore = await getRecordCount(page);
  250 | 
  251 |       // Bước 2: Thêm nhân viên mới
  252 |       const fn = `Check${Date.now()}`;
  253 |       const ln = a3 || "HienThi";
  254 |       await fillAddEmployeeForm(page, fn, ln);
  255 |       await page.locator("button[type='submit']").click();
  256 |       await page.locator(".oxd-toast--success").first()
  257 |         .waitFor({ state: "visible", timeout: 15000 });
  258 | 
  259 |       // Bước 3: Quay lại danh sách nhân viên (không dùng Search/Filter)
  260 |       await app.openEmployeeList();
  261 |       await waitForListPage(page);
  262 | 
  263 |       // Bước 4: Kiểm tra xem tổng số records có tăng lên 1 hay không
  264 |       const countAfter = await getRecordCount(page);
  265 | 
  266 |       if (countAfter !== countBefore + 1) {
  267 |         throw new Error(`BUG BG53: Nhân viên mới "${fn} ${ln}" không hiển thị trong danh sách mặc định sau khi thêm thành công. Số lượng không tăng (trước: ${countBefore}, sau: ${countAfter}).`);
  268 |       }
  269 |       expect(countAfter).toBe(countBefore + 1);
  270 | 
  271 |       // Bước 5: Kiểm tra xem nhân viên mới có hiển thị trong lưới danh sách không
  272 |       const isVisibleInGrid = await page.locator(".oxd-table-body").getByText(fn).first().isVisible().catch(() => false);
  273 |       if (!isVisibleInGrid) {
  274 |         throw new Error(`BUG BG53: Nhân viên mới "${fn} ${ln}" làm tăng số đếm nhưng không hiển thị trong bảng dữ liệu mặc định.`);
  275 |       }
  276 |       expect(isVisibleInGrid).toBe(true);
  277 |       break;
  278 |     }
  279 | 
  280 |     case "TC-E11": {
  281 |       // Bỏ trống Họ (Last Name) → phải có lỗi Required
  282 |       await fillAddEmployeeForm(page, a2 || "Nguyen", "");
  283 |       await page.locator("button[type='submit']").click();
  284 |       await expect(page.locator(".oxd-input-field-error-message").first())
  285 |         .toContainText(/Required/i, { timeout: 5000 });
  286 |       break;
  287 |     }
  288 | 
  289 |     case "TC-E12": {
  290 |       // Bỏ trống Tên (First Name) → phải có lỗi Required
  291 |       await fillAddEmployeeForm(page, "", a3 || "TieuHoc");
  292 |       await page.locator("button[type='submit']").click();
  293 |       await expect(page.locator(".oxd-input-field-error-message").first())
  294 |         .toContainText(/Required/i, { timeout: 5000 });
  295 |       break;
  296 |     }
  297 | 
  298 |     case "TC-E13": {
  299 |       // Nhập Employee ID trùng lặp
  300 |       const existingId = await getFirstEmployeeId(page);
  301 |       expect(existingId.length).toBeGreaterThan(0);
  302 | 
  303 |       await fillAddEmployeeForm(page, a2 || "Trung", a3 || "MaSo", existingId);
  304 | 
  305 |       // Kích hoạt validation bằng cách click ra label Employee Id để blur input
  306 |       await page.locator("label").filter({ hasText: "Employee Id" }).click();
  307 | 
  308 |       // Đợi validation error text "Employee Id already exists" xuất hiện
  309 |       const errLocator = page.locator(".oxd-input-field-error-message").filter({ hasText: /exists/i });
  310 |       const hasErrorVisible = await errLocator.first().isVisible({ timeout: 5000 }).catch(() => false);
  311 | 
  312 |       await page.locator("button[type='submit']").click();
  313 | 
  314 |       const successLocator = page.locator(".oxd-toast--success, .oxd-toast-content");
  315 |       try {
  316 |         await successLocator.first().waitFor({ state: "visible", timeout: 7000 });
  317 |       } catch { /* ignore */ }
  318 | 
  319 |       const hasSuccess = await successLocator.first().isVisible().catch(() => false);
  320 | 
  321 |       if (hasSuccess && !hasErrorVisible) {
> 322 |         throw new Error(`BUG BG54: Employee ID "${existingId}" đã tồn tại nhưng không báo lỗi đỏ và record mới vẫn được lưu thành công.`);
      |               ^ Error: BUG BG54: Employee ID "0295" đã tồn tại nhưng không báo lỗi đỏ và record mới vẫn được lưu thành công.
  323 |       } else if (hasSuccess && hasErrorVisible) {
  324 |         throw new Error(`BUG BG54: Dù có báo lỗi đỏ "Employee Id already exists", hệ thống vẫn lưu record thành công.`);
  325 |       }
  326 | 
  327 |       expect(hasErrorVisible, `Không có error message khi dùng Employee ID trùng "${existingId}"`).toBe(true);
  328 |       break;
  329 |     }
  330 | 
  331 |     case "TC-E14": {
  332 |       // Tên Unicode tiếng Việt
  333 |       const [fn, ln] = [a2 || "Nguyễn", a3 || "Văn An"];
  334 |       await deleteEmployeeIfExists(page, app, `${fn} ${ln}`);
  335 |       await app.openEmployeeList();
  336 |       await waitForListPage(page);
  337 |       await fillAddEmployeeForm(page, fn, ln);
  338 |       await page.locator("button[type='submit']").click();
  339 |       await expect(page.getByText(/Successfully Saved|Success|成功/i).first())
  340 |         .toBeVisible({ timeout: 15000 });
  341 | 
  342 |       // Search và verify hiển thị đúng tên tiếng Việt
  343 |       await app.openEmployeeList();
  344 |       await waitForListPage(page);
  345 |       await app.searchByLabeledInput("Employee Name", fn);
  346 |       await page.locator("button[type='submit']").click();
  347 |       await waitForSpinner(page);
  348 |       await expect(page.locator(".oxd-table-body")).toContainText(fn);
  349 |       break;
  350 |     }
  351 | 
  352 |     case "TC-E15": {
  353 |       // Thêm nhân viên có tên đệm
  354 |       const [fn, ln, id, mn] = [a2 || "Le", a3 || "Van Anh", a4 || "", a5 || "Hoang"];
  355 |       await deleteEmployeeIfExists(page, app, `${fn} ${mn} ${ln}`);
  356 |       await app.openEmployeeList();
  357 |       await waitForListPage(page);
  358 |       await fillAddEmployeeForm(page, fn, ln, id, mn);
  359 |       await page.locator("button[type='submit']").click();
  360 |       await expect(page.locator(".oxd-toast--success, .oxd-toast-content").first()).toBeVisible({ timeout: 15000 });
  361 |       break;
  362 |     }
  363 | 
  364 |     // ── Nhóm 3: Chỉnh sửa & xóa ──────────────────────────────────────
  365 |     case "TC-E16": {
  366 |       const uniqueFn = `Nguyen${Date.now()}`;
  367 |       const uniqueLn = a3 || "TieuHoc";
  368 |       const newLastName = a3 || "TenMoi";
  369 | 
  370 |       await fillAddEmployeeForm(page, uniqueFn, uniqueLn);
  371 |       await page.locator("button[type='submit']").click();
  372 |       await page.locator(".oxd-toast--success").first().waitFor({ state: "visible", timeout: 15000 });
  373 | 
  374 |       // Quay lại list và tìm chính user unique đó
  375 |       await app.openEmployeeList();
  376 |       await waitForListPage(page);
  377 |       await app.searchByLabeledInput("Employee Name", uniqueFn);
  378 |       await page.locator("button[type='submit']").click();
  379 |       await waitForSpinner(page);
  380 | 
  381 |       await page.locator(".oxd-table-cell-actions button").first()
  382 |         .waitFor({ state: "visible", timeout: 20000 });
  383 | 
  384 |       // Click icon bút chì (button thứ 1 = index 0 trong actions)
  385 |       await page.locator(".oxd-table-body .oxd-table-row").first()
  386 |         .locator(".oxd-table-cell-actions button").first().click();
  387 |       await expect(page).toHaveURL(/pim\/viewPersonalDetails/, { timeout: 10000 });
  388 | 
  389 |       // Last Name input
  390 |       const lastNameInput = page.getByPlaceholder("Last Name");
  391 |       await lastNameInput.fill(newLastName);
  392 | 
  393 |       // Scope Save button
  394 |       const nameCard = page.locator(".orangehrm-card-container").filter({
  395 |         has: page.getByPlaceholder("Last Name")
  396 |       });
  397 |       const saveInCard = nameCard.locator("button[type='submit'], button.oxd-button--secondary").first();
  398 |       await saveInCard.click();
  399 | 
  400 |       await expect(page.locator(".oxd-toast--success, .oxd-toast-content")
  401 |         .filter({ hasText: /Updated|Saved|Success/i }).first())
  402 |         .toBeVisible({ timeout: 10000 });
  403 |       break;
  404 |     }
  405 | 
  406 |     case "TC-E17": {
  407 |       const uniqueFn = `Nguyen${Date.now()}`;
  408 |       const uniqueLn = a3 || "TenMoi";
  409 |       const newLastName = a3 || "TenSua2";
  410 | 
  411 |       await fillAddEmployeeForm(page, uniqueFn, uniqueLn);
  412 |       await page.locator("button[type='submit']").click();
  413 |       await page.locator(".oxd-toast--success").first().waitFor({ state: "visible", timeout: 15000 });
  414 | 
  415 |       await app.openEmployeeList();
  416 |       await waitForListPage(page);
  417 |       await app.searchByLabeledInput("Employee Name", uniqueFn);
  418 |       await page.locator("button[type='submit']").click();
  419 |       await waitForSpinner(page);
  420 | 
  421 |       await page.locator(".oxd-table-cell-actions button").first()
  422 |         .waitFor({ state: "visible", timeout: 20000 });
```