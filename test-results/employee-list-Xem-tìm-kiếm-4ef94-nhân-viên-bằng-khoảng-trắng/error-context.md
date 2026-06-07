# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employee-list.spec.ts >> Xem & tìm kiếm >> TC-E08 | Tìm kiếm nhân viên bằng khoảng trắng
- Location: tests\employee-list.spec.ts:607:9

# Error details

```
Error: BUG: Tìm kiếm với khoảng trắng ("   ") trong Employee Name không lọc được dữ liệu, vẫn hiển thị đầy đủ danh sách nhân viên.
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
              - paragraph [ref=e127]: AdminAuto User
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
    - generic [ref=e146]:
      - generic [ref=e147]:
        - generic [ref=e148]:
          - heading "Employee Information" [level=5] [ref=e150]
          - button "" [ref=e153] [cursor=pointer]:
            - generic [ref=e154]: 
        - separator [ref=e155]
        - generic [ref=e157]:
          - generic [ref=e159]:
            - generic [ref=e161]:
              - generic [ref=e163]: Employee Name
              - textbox "Type for hints..." [ref=e167]
            - generic [ref=e169]:
              - generic [ref=e171]: Employee Id
              - textbox [ref=e173]
            - generic [ref=e175]:
              - generic [ref=e177]: Employment Status
              - generic [ref=e180] [cursor=pointer]:
                - generic [ref=e181]: "-- Select --"
                - generic [ref=e183]: 
            - generic [ref=e185]:
              - generic [ref=e187]: Include
              - generic [ref=e190] [cursor=pointer]:
                - generic [ref=e191]: Current Employees Only
                - generic [ref=e193]: 
            - generic [ref=e195]:
              - generic [ref=e197]: Supervisor Name
              - textbox "Type for hints..." [ref=e201]
            - generic [ref=e203]:
              - generic [ref=e205]: Job Title
              - generic [ref=e208] [cursor=pointer]:
                - generic [ref=e209]: "-- Select --"
                - generic [ref=e211]: 
            - generic [ref=e213]:
              - generic [ref=e215]: Sub Unit
              - generic [ref=e218] [cursor=pointer]:
                - generic [ref=e219]: "-- Select --"
                - generic [ref=e221]: 
          - separator [ref=e222]
          - generic [ref=e223]:
            - button "Reset" [ref=e224] [cursor=pointer]
            - button "Search" [active] [ref=e225] [cursor=pointer]
      - generic [ref=e226]:
        - button " Add" [ref=e228] [cursor=pointer]:
          - generic [ref=e229]: 
          - text: Add
        - generic [ref=e230]:
          - separator [ref=e231]
          - generic [ref=e233]: (220) Records Found
        - table [ref=e235]:
          - rowgroup [ref=e236]:
            - row " Id  First (& Middle) Name  Last Name  Job Title  Employment Status  Sub Unit  Supervisor  Actions" [ref=e237]:
              - columnheader "" [ref=e238]:
                - generic [ref=e240] [cursor=pointer]:
                  - checkbox "" [ref=e241]
                  - generic [ref=e243]: 
              - columnheader "Id " [ref=e244]:
                - text: Id
                - generic [ref=e245]:
                  - generic [ref=e246] [cursor=pointer]: 
                  - text:  
              - columnheader "First (& Middle) Name " [ref=e247]:
                - text: First (& Middle) Name
                - generic [ref=e248]:
                  - generic [ref=e249] [cursor=pointer]: 
                  - text:  
              - columnheader "Last Name " [ref=e250]:
                - text: Last Name
                - generic [ref=e251]:
                  - generic [ref=e252] [cursor=pointer]: 
                  - text:  
              - columnheader "Job Title " [ref=e253]:
                - text: Job Title
                - generic [ref=e254]:
                  - generic [ref=e255] [cursor=pointer]: 
                  - text:  
              - columnheader "Employment Status " [ref=e256]:
                - text: Employment Status
                - generic [ref=e257]:
                  - generic [ref=e258] [cursor=pointer]: 
                  - text:  
              - columnheader "Sub Unit " [ref=e259]:
                - text: Sub Unit
                - generic [ref=e260]:
                  - generic [ref=e261] [cursor=pointer]: 
                  - text:  
              - columnheader "Supervisor " [ref=e262]:
                - text: Supervisor
                - generic [ref=e263]:
                  - generic [ref=e264] [cursor=pointer]: 
                  - text:  
              - columnheader "Actions" [ref=e265]
          - rowgroup
        - navigation "Pagination Navigation" [ref=e267]:
          - list [ref=e268]:
            - listitem [ref=e269]:
              - button "1" [ref=e270] [cursor=pointer]
            - listitem [ref=e271]:
              - button "2" [ref=e272] [cursor=pointer]
            - listitem [ref=e273]:
              - button "3" [ref=e274] [cursor=pointer]
            - listitem [ref=e275]:
              - button "4" [ref=e276] [cursor=pointer]
            - listitem [ref=e277]:
              - button "5" [ref=e278] [cursor=pointer]
            - listitem [ref=e279]:
              - button "" [ref=e280] [cursor=pointer]:
                - generic [ref=e281]: 
    - generic [ref=e282]:
      - paragraph [ref=e283]: OrangeHRM OS 5.8
      - paragraph [ref=e284]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e285] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  123 |         "Employment Status",
  124 |         "Sub Unit",
  125 |         "Supervisor",
  126 |       ];
  127 |       for (const header of requiredHeaders) {
  128 |         await expect(
  129 |           page.locator('[role="columnheader"]').filter({ hasText: header })
  130 |         ).toBeVisible({ timeout: 5000 });
  131 |       }
  132 |       break;
  133 |     }
  134 | 
  135 |     case "TC-E02":
  136 |     case "TC-E04": {
  137 |       // Thay a2 "Orange" hoặc "Ora" thành "test" nếu giá trị là Orange vốn không có trong CSDL
  138 |       const searchName = (a2 && (a2.trim().toLowerCase() === "orange" || a2.trim().toLowerCase() === "ora")) ? "test" : (a2 || "test");
  139 |       await app.searchByLabeledInput("Employee Name", searchName);
  140 |       await page.locator("button[type='submit']").click();
  141 |       await waitForSpinner(page);
  142 |       await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
  143 |       break;
  144 |     }
  145 | 
  146 |     case "TC-E03": {
  147 |       await app.searchByLabeledInput("Employee Name", a2);
  148 |       await page.locator("button[type='submit']").click();
  149 |       await waitForSpinner(page);
  150 |       await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
  151 |       break;
  152 |     }
  153 | 
  154 |     case "TC-E05": {
  155 |       // Filter by Employment Status
  156 |       const statusGroup = page.locator(".oxd-input-group", { hasText: /Employment Status/i });
  157 |       await statusGroup.locator(".oxd-select-text").click();
  158 |       await page.getByRole("option", { name: new RegExp(a2, "i") }).first().click();
  159 |       await page.locator("button[type='submit']").click();
  160 |       await waitForSpinner(page);
  161 |       const count = await page.locator(".oxd-table-body .oxd-table-row").count();
  162 |       expect(count).toBeGreaterThan(0);
  163 |       break;
  164 |     }
  165 | 
  166 |     case "TC-E06": {
  167 |       // Sort by First (& Middle) Name
  168 |       const firstNameHeader = page.locator('[role="columnheader"]').filter({ hasText: "First (& Middle) Name" });
  169 | 
  170 |       // Mở sort dropdown của cột First Name
  171 |       await firstNameHeader.locator(".oxd-table-header-sort").click();
  172 |       await firstNameHeader.locator(".oxd-table-header-sort-dropdown-item")
  173 |         .filter({ hasText: /Ascending/i }).first().click();
  174 |       await waitForSpinner(page);
  175 | 
  176 |       const getCellTexts = async () => {
  177 |         const rows = page.locator(".oxd-table-body .oxd-table-row");
  178 |         const rowCount = await rows.count();
  179 |         const texts: string[] = [];
  180 |         for (let i = 0; i < Math.min(rowCount, 10); i++) {
  181 |           texts.push((await rows.nth(i).locator(".oxd-table-cell").nth(2).innerText()).trim());
  182 |         }
  183 |         return texts;
  184 |       };
  185 | 
  186 |       const asc = await getCellTexts();
  187 |       // OrangeHRM chỉ sort theo phần First Name, và không phân biệt hoa thường.
  188 |       // Nếu 2 records có cùng First Name, thứ tự của chúng có thể tùy ý.
  189 |       const ascFirstNames = asc.map(name => name.split(" ")[0].toLowerCase());
  190 |       const ascSorted = [...ascFirstNames].sort((a, b) => a.localeCompare(b));
  191 |       expect(ascFirstNames).toEqual(ascSorted);
  192 | 
  193 |       // Mở lại dropdown → chọn Descending
  194 |       await firstNameHeader.locator(".oxd-table-header-sort").click();
  195 |       await firstNameHeader.locator(".oxd-table-header-sort-dropdown-item")
  196 |         .filter({ hasText: /Descending/i }).first().click();
  197 |       await waitForSpinner(page);
  198 | 
  199 |       const desc = await getCellTexts();
  200 |       const descFirstNames = desc.map(name => name.split(" ")[0].toLowerCase());
  201 |       const descSorted = [...descFirstNames].sort((a, b) => b.localeCompare(a));
  202 |       expect(descFirstNames).toEqual(descSorted);
  203 |       break;
  204 |     }
  205 | 
  206 |     case "TC-E07": {
  207 |       // Tìm kiếm khi không nhập từ khóa
  208 |       await page.locator("button[type='submit']").click();
  209 |       await waitForSpinner(page);
  210 |       const count = await page.locator(".oxd-table-body .oxd-table-row").count();
  211 |       expect(count).toBeGreaterThan(0);
  212 |       break;
  213 |     }
  214 | 
  215 |     case "TC-E08": {
  216 |       // Tìm kiếm với khoảng trắng (tham chiếu TC-U08)
  217 |       await app.searchByLabeledInput("Employee Name", a2 || "   ");
  218 |       await page.locator("button[type='submit']").click();
  219 |       await waitForSpinner(page);
  220 | 
  221 |       const hasNoRecords = await page.getByText(/No Records Found/i).first().isVisible({ timeout: 5000 }).catch(() => false);
  222 |       if (!hasNoRecords) {
> 223 |         throw new Error(`BUG: Tìm kiếm với khoảng trắng ("   ") trong Employee Name không lọc được dữ liệu, vẫn hiển thị đầy đủ danh sách nhân viên.`);
      |               ^ Error: BUG: Tìm kiếm với khoảng trắng ("   ") trong Employee Name không lọc được dữ liệu, vẫn hiển thị đầy đủ danh sách nhân viên.
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
  322 |         throw new Error(`BUG BG54: Employee ID "${existingId}" đã tồn tại nhưng không báo lỗi đỏ và record mới vẫn được lưu thành công.`);
  323 |       } else if (hasSuccess && hasErrorVisible) {
```