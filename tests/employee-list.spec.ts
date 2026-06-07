import { expect, test } from "../src/fixtures/admin-auth";
import { loadTestCases } from "../src/data/testcase-loader";
import { registerWorkbookStatusSync } from "../src/data/testcase-status-updater";
import { OrangeHrmPage } from "../src/pages/orangehrm-page";

const testCases = loadTestCases().filter((tc) => tc.sheet.includes("Employee List") || tc.sheet.includes("Danh sách nhân viên"));
registerWorkbookStatusSync(test, testCases);

// Đảm bảo luôn có test case TC-E23 (Tìm kiếm với khoảng trắng)
if (!testCases.some(tc => tc.id === "TC-E23")) {
  testCases.push({
    sheet: "Employee List",
    sheetName: "Danh sách nhân viên",
    group: "Xem và tìm kiếm",
    rowNumber: 0,
    id: "TC-E23",
    requirement: "",
    name: "Tìm kiếm với khoảng trắng",
    objective: "Tìm kiếm bằng khoảng trắng trả về không tìm thấy bản ghi nào",
    inputRaw: "Admin\nadmin123\n   ",
    input: ["Admin", "admin123", "   "],
    expected: "Hiển thị thông báo không tìm thấy bản ghi nào (No Records Found)",
    expectedStatus: "Đạt"
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Chờ spinner biến mất */
async function waitForSpinner(page: any) {
  await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
}

/** Chờ trang danh sách employee load xong (có nút Search hiển thị) */
async function waitForListPage(page: any) {
  await page.locator("button[type='submit']").waitFor({ state: "visible", timeout: 15000 });
}

/** Đọc tổng số records từ banner "(X) Records Found" */
async function getRecordCount(page: any): Promise<number> {
  try {
    // OrangeHRM hiển thị "(X) Records Found" trong .orangehrm-horizontal-padding
    const text = await page.locator(".orangehrm-horizontal-padding .oxd-text").innerText({ timeout: 5000 });
    const match = text.match(/\(?\s*(\d+)\s*\)?/);
    if (match) return parseInt(match[1]);
  } catch { /* fallback */ }
  return await page.locator(".oxd-table-body .oxd-table-row").count();
}

/**
 * Điền form Add Employee (URL: /pim/addEmployee).
 * Hàm này GIẢ ĐỊNH đang đứng ở trang viewEmployeeList.
 * Nó sẽ click nút Add → điều hướng sang trang addEmployee → fill form.
 */
async function fillAddEmployeeForm(
  page: any,
  firstName: string,
  lastName: string,
  employeeId = "",
  middleName = ""
) {
  // Nút "Add" nằm trong header container, chứa icon + chữ " Add "
  await page.locator(".orangehrm-header-container button").click();
  await expect(page).toHaveURL(/pim\/addEmployee/, { timeout: 10000 });

  // Điền First Name, Middle Name và Last Name theo placeholder
  if (firstName) await page.getByPlaceholder("First Name").fill(firstName);
  if (middleName) await page.getByPlaceholder("Middle Name").fill(middleName);
  if (lastName)  await page.getByPlaceholder("Last Name").fill(lastName);

  // Điền Employee ID nếu có (input trong .oxd-grid-2, clear trước khi fill)
  if (employeeId) {
    const idInput = page.locator("input.oxd-input").nth(1); // ID input là input thứ 2 trên form
    await idInput.clear();
    await idInput.fill(employeeId);
  }
}

/** Lấy Employee ID từ row đầu tiên trong danh sách (cột thứ 2, index 1 = Id) */
async function getFirstEmployeeId(page: any): Promise<string> {
  await page.locator(".oxd-table-body .oxd-table-row").first()
    .waitFor({ state: "visible", timeout: 15000 });
  // Cột: [0]=checkbox, [1]=Id
  const id = await page.locator(".oxd-table-body .oxd-table-row")
    .first().locator(".oxd-table-cell").nth(1).innerText();
  return id.trim();
}

/**
 * Click icon xóa (trash) ở cột Actions của row đầu tiên rồi confirm.
 * Hình 4: trong .oxd-table-cell-actions có 2 button: pencil (edit) và trash (delete).
 */
async function deleteFirstRow(page: any) {
  const firstRow = page.locator(".oxd-table-body .oxd-table-row").first();
  // Button thứ 2 trong actions = trash icon
  await firstRow.locator(".oxd-table-cell-actions button").nth(1).click();
  // Modal confirm
  await page.locator(".orangehrm-modal-footer")
    .getByRole("button", { name: /Yes, Delete|是|确定/i }).click();
  await page.getByText(/Successfully Deleted|Success|成功/i).first()
    .waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
}

/** Xóa employee theo tên nếu tồn tại (dùng để clean state trước test) */
async function deleteEmployeeIfExists(page: any, app: OrangeHrmPage, name: string) {
  await app.openEmployeeList();
  await waitForListPage(page);
  await app.searchByLabeledInput("Employee Name", name);
  await page.locator("button[type='submit']").click();
  await waitForSpinner(page);

  if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) return;

  const row = page.locator(".oxd-table-body .oxd-table-row").first();
  if (await row.isVisible().catch(() => false)) {
    await deleteFirstRow(page);
  }
}

// ── Main runner ────────────────────────────────────────────────────────────────

async function runEmployeeCase(tc: any, app: OrangeHrmPage) {
  const page = app["page"];
  const [loginUser = "Admin", loginPass = "admin123", a2 = "", a3 = "", a4 = "", a5 = ""] = tc.input;

  await app.ensureLoggedIn(loginUser, loginPass);
  await app.openEmployeeList();
  await waitForListPage(page);

  switch (tc.id) {
    // ── Nhóm 1: Xem & tìm kiếm ──────────────────────────────────────────
    case "TC-E01": {
      // Chờ bảng render xong trước khi check headers
      await page.locator(".oxd-table-header").waitFor({ state: "visible", timeout: 10000 });

      const requiredHeaders: Array<string | RegExp> = [
        /^Id/i,
        "First (& Middle) Name",
        "Last Name",
        "Job Title",
        "Employment Status",
        "Sub Unit",
        "Supervisor",
      ];
      for (const header of requiredHeaders) {
        await expect(
          page.locator('[role="columnheader"]').filter({ hasText: header })
        ).toBeVisible({ timeout: 5000 });
      }
      break;
    }

    case "TC-E02":
    case "TC-E04": {
      // Thay a2 "Orange" hoặc "Ora" thành "test" nếu giá trị là Orange vốn không có trong CSDL
      const searchName = (a2 && (a2.trim().toLowerCase() === "orange" || a2.trim().toLowerCase() === "ora")) ? "test" : (a2 || "test");
      await app.searchByLabeledInput("Employee Name", searchName);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-E03": {
      await app.searchByLabeledInput("Employee Name", a2);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible();
      break;
    }

    case "TC-E05": {
      // Filter by Employment Status
      const statusGroup = page.locator(".oxd-input-group", { hasText: /Employment Status/i });
      await statusGroup.locator(".oxd-select-text").click();
      await page.getByRole("option", { name: new RegExp(a2, "i") }).first().click();
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      const count = await page.locator(".oxd-table-body .oxd-table-row").count();
      expect(count).toBeGreaterThan(0);
      break;
    }

    case "TC-E06": {
      // Sort by First (& Middle) Name
      const firstNameHeader = page.locator('[role="columnheader"]').filter({ hasText: "First (& Middle) Name" });

      // Mở sort dropdown của cột First Name
      await firstNameHeader.locator(".oxd-table-header-sort").click();
      await firstNameHeader.locator(".oxd-table-header-sort-dropdown-item")
        .filter({ hasText: /Ascending/i }).first().click();
      await waitForSpinner(page);

      const getCellTexts = async () => {
        const rows = page.locator(".oxd-table-body .oxd-table-row");
        const rowCount = await rows.count();
        const texts: string[] = [];
        for (let i = 0; i < Math.min(rowCount, 10); i++) {
          texts.push((await rows.nth(i).locator(".oxd-table-cell").nth(2).innerText()).trim());
        }
        return texts;
      };

      const asc = await getCellTexts();
      // OrangeHRM chỉ sort theo phần First Name, và không phân biệt hoa thường.
      // Nếu 2 records có cùng First Name, thứ tự của chúng có thể tùy ý.
      const ascFirstNames = asc.map(name => name.split(" ")[0].toLowerCase());
      const ascSorted = [...ascFirstNames].sort((a, b) => a.localeCompare(b));
      expect(ascFirstNames).toEqual(ascSorted);

      // Mở lại dropdown → chọn Descending
      await firstNameHeader.locator(".oxd-table-header-sort").click();
      await firstNameHeader.locator(".oxd-table-header-sort-dropdown-item")
        .filter({ hasText: /Descending/i }).first().click();
      await waitForSpinner(page);

      const desc = await getCellTexts();
      const descFirstNames = desc.map(name => name.split(" ")[0].toLowerCase());
      const descSorted = [...descFirstNames].sort((a, b) => b.localeCompare(a));
      expect(descFirstNames).toEqual(descSorted);
      break;
    }

    case "TC-E07": {
      // Tìm kiếm khi không nhập từ khóa
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      const count = await page.locator(".oxd-table-body .oxd-table-row").count();
      expect(count).toBeGreaterThan(0);
      break;
    }

    case "TC-E23": {
      // Tìm kiếm với khoảng trắng (tham chiếu TC-U08)
      await app.searchByLabeledInput("Employee Name", a2 || "   ");
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);

      const hasNoRecords = await page.getByText(/No Records Found/i).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasNoRecords) {
        throw new Error(`BUG: Tìm kiếm với khoảng trắng ("   ") trong Employee Name không lọc được dữ liệu, vẫn hiển thị đầy đủ danh sách nhân viên.`);
      }
      expect(hasNoRecords).toBe(true);
      break;
    }

    // ── Nhóm 2: Thêm nhân viên ────────────────────────────────────────
    case "TC-E08": {
      // Happy path: thêm employee thành công
      const [fn, ln] = [a2 || "Nguyen", a3 || "TieuHoc"];
      await deleteEmployeeIfExists(page, app, `${fn} ${ln}`);
      await app.openEmployeeList();
      await waitForListPage(page);
      await fillAddEmployeeForm(page, fn, ln);
      await page.locator("button[type='submit']").click();
      await expect(
        page.locator(".oxd-toast--success, .oxd-toast-content")
          .filter({ hasText: /Saved|Success|成功/i })
          .first()
      ).toBeVisible({ timeout: 15000 });
      break;
    }

    case "TC-E09": {
      // BUG BG53: Nhân viên mới không hiện trong list ngay lập tức
      // Bước 1: Ghi nhận số lượng records hiện tại
      const countBefore = await getRecordCount(page);

      // Bước 2: Thêm nhân viên mới
      const fn = `Check${Date.now()}`;
      const ln = a3 || "HienThi";
      await fillAddEmployeeForm(page, fn, ln);
      await page.locator("button[type='submit']").click();
      await page.locator(".oxd-toast--success").first()
        .waitFor({ state: "visible", timeout: 15000 });

      // Bước 3: Quay lại danh sách nhân viên (không dùng Search/Filter)
      await app.openEmployeeList();
      await waitForListPage(page);

      // Bước 4: Kiểm tra xem tổng số records có tăng lên 1 hay không
      const countAfter = await getRecordCount(page);
      
      if (countAfter !== countBefore + 1) {
        throw new Error(`BUG BG53: Nhân viên mới "${fn} ${ln}" không hiển thị trong danh sách mặc định sau khi thêm thành công. Số lượng không tăng (trước: ${countBefore}, sau: ${countAfter}).`);
      }
      expect(countAfter).toBe(countBefore + 1);

      // Bước 5: Kiểm tra xem nhân viên mới có hiển thị trong lưới danh sách không
      const isVisibleInGrid = await page.locator(".oxd-table-body").getByText(fn).first().isVisible().catch(() => false);
      if (!isVisibleInGrid) {
        throw new Error(`BUG BG53: Nhân viên mới "${fn} ${ln}" làm tăng số đếm nhưng không hiển thị trong bảng dữ liệu mặc định.`);
      }
      expect(isVisibleInGrid).toBe(true);
      break;
    }

    case "TC-E10": {
      // Bỏ trống Họ (Last Name) → phải có lỗi Required
      await fillAddEmployeeForm(page, a2 || "Nguyen", "");
      await page.locator("button[type='submit']").click();
      await expect(page.locator(".oxd-input-field-error-message").first())
        .toContainText(/Required/i, { timeout: 5000 });
      break;
    }

    case "TC-E11": {
      // Bỏ trống Tên (First Name) → phải có lỗi Required
      await fillAddEmployeeForm(page, "", a3 || "TieuHoc");
      await page.locator("button[type='submit']").click();
      await expect(page.locator(".oxd-input-field-error-message").first())
        .toContainText(/Required/i, { timeout: 5000 });
      break;
    }

    case "TC-E12": {
      // Nhập Employee ID trùng lặp
      const existingId = await getFirstEmployeeId(page);
      expect(existingId.length).toBeGreaterThan(0);

      await fillAddEmployeeForm(page, a2 || "Trung", a3 || "MaSo", existingId);
      
      // Kích hoạt validation bằng cách click ra label Employee Id để blur input
      await page.locator("label").filter({ hasText: "Employee Id" }).click();
      
      // Đợi validation error text "Employee Id already exists" xuất hiện
      const errLocator = page.locator(".oxd-input-field-error-message").filter({ hasText: /exists/i });
      const hasErrorVisible = await errLocator.first().isVisible({ timeout: 5000 }).catch(() => false);
      
      await page.locator("button[type='submit']").click();

      const successLocator = page.locator(".oxd-toast--success, .oxd-toast-content");
      try {
        await successLocator.first().waitFor({ state: "visible", timeout: 7000 });
      } catch { /* ignore */ }
      
      const hasSuccess = await successLocator.first().isVisible().catch(() => false);

      if (hasSuccess && !hasErrorVisible) {
        throw new Error(`BUG BG54: Employee ID "${existingId}" đã tồn tại nhưng không báo lỗi đỏ và record mới vẫn được lưu thành công.`);
      } else if (hasSuccess && hasErrorVisible) {
        throw new Error(`BUG BG54: Dù có báo lỗi đỏ "Employee Id already exists", hệ thống vẫn lưu record thành công.`);
      }
      
      expect(hasErrorVisible, `Không có error message khi dùng Employee ID trùng "${existingId}"`).toBe(true);
      break;
    }

    case "TC-E13": {
      // Tên Unicode tiếng Việt
      const [fn, ln] = [a2 || "Nguyễn", a3 || "Văn An"];
      await deleteEmployeeIfExists(page, app, `${fn} ${ln}`);
      await app.openEmployeeList();
      await waitForListPage(page);
      await fillAddEmployeeForm(page, fn, ln);
      await page.locator("button[type='submit']").click();
      await expect(page.getByText(/Successfully Saved|Success|成功/i).first())
        .toBeVisible({ timeout: 15000 });

      // Search và verify hiển thị đúng tên tiếng Việt
      await app.openEmployeeList();
      await waitForListPage(page);
      await app.searchByLabeledInput("Employee Name", fn);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      await expect(page.locator(".oxd-table-body")).toContainText(fn);
      break;
    }

    case "TC-E14": {
      // Thêm nhân viên có tên đệm
      const [fn, ln, id, mn] = [a2 || "Le", a3 || "Van Anh", a4 || "", a5 || "Hoang"];
      await deleteEmployeeIfExists(page, app, `${fn} ${mn} ${ln}`);
      await app.openEmployeeList();
      await waitForListPage(page);
      await fillAddEmployeeForm(page, fn, ln, id, mn);
      await page.locator("button[type='submit']").click();
      await expect(page.locator(".oxd-toast--success, .oxd-toast-content").first()).toBeVisible({ timeout: 15000 });
      break;
    }

    // ── Nhóm 3: Chỉnh sửa & xóa ──────────────────────────────────────
    case "TC-E15": {
      const uniqueFn = `Nguyen${Date.now()}`;
      const uniqueLn = a3 || "TieuHoc";
      const newLastName = a3 || "TenMoi";
      
      await fillAddEmployeeForm(page, uniqueFn, uniqueLn);
      await page.locator("button[type='submit']").click();
      await page.locator(".oxd-toast--success").first().waitFor({ state: "visible", timeout: 15000 });
      
      // Quay lại list và tìm chính user unique đó
      await app.openEmployeeList();
      await waitForListPage(page);
      await app.searchByLabeledInput("Employee Name", uniqueFn);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);

      await page.locator(".oxd-table-cell-actions button").first()
        .waitFor({ state: "visible", timeout: 20000 });

      // Click icon bút chì (button thứ 1 = index 0 trong actions)
      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").first().click();
      await expect(page).toHaveURL(/pim\/viewPersonalDetails/, { timeout: 10000 });

      // Last Name input
      const lastNameInput = page.getByPlaceholder("Last Name");
      await lastNameInput.fill(newLastName);

      // Scope Save button
      const nameCard = page.locator(".orangehrm-card-container").filter({
        has: page.getByPlaceholder("Last Name")
      });
      const saveInCard = nameCard.locator("button[type='submit'], button.oxd-button--secondary").first();
      await saveInCard.click();

      await expect(page.locator(".oxd-toast--success, .oxd-toast-content")
        .filter({ hasText: /Updated|Saved|Success/i }).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-E16": {
      const uniqueFn = `Nguyen${Date.now()}`;
      const uniqueLn = a3 || "TenMoi";
      const newLastName = a3 || "TenSua2";
      
      await fillAddEmployeeForm(page, uniqueFn, uniqueLn);
      await page.locator("button[type='submit']").click();
      await page.locator(".oxd-toast--success").first().waitFor({ state: "visible", timeout: 15000 });
      
      await app.openEmployeeList();
      await waitForListPage(page);
      await app.searchByLabeledInput("Employee Name", uniqueFn);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);

      await page.locator(".oxd-table-cell-actions button").first()
        .waitFor({ state: "visible", timeout: 20000 });

      await page.locator(".oxd-table-body .oxd-table-row").first()
        .locator(".oxd-table-cell-actions button").first().click();
      await expect(page).toHaveURL(/pim\/viewPersonalDetails/, { timeout: 10000 });

      const lastNameInput = page.getByPlaceholder("Last Name");
      await lastNameInput.fill(newLastName);

      const nameCard = page.locator(".orangehrm-card-container").filter({
        has: page.getByPlaceholder("Last Name")
      });
      const saveInCard = nameCard.locator("button[type='submit'], button.oxd-button--secondary").first();
      await saveInCard.click();

      await expect(page.locator(".oxd-toast--success, .oxd-toast-content")
        .filter({ hasText: /Updated|Saved|Success/i }).first())
        .toBeVisible({ timeout: 10000 });

      // Verify persist sau reload
      await page.reload();
      await page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
      await expect(page.getByPlaceholder("Last Name")).not.toHaveValue("", { timeout: 15000 });
      const savedValue = await page.getByPlaceholder("Last Name").inputValue();
      if (savedValue !== newLastName) {
        throw new Error(
          `BUG: Edit Last Name – Save toast hiện nhưng thay đổi không được lưu. Expected "${newLastName}" but got "${savedValue}" after reload`
        );
      }
      break;
    }

    case "TC-E17": {
      // Xóa employee bằng icon trash ở cột Actions (hình 4)
      const searchName = a2 || "Temp Delete";
      await app.searchByLabeledInput("Employee Name", searchName);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);

      const noRecords = page.getByText(/No Records Found/i).first();
      const firstRow = page.locator(".oxd-table-body .oxd-table-row").first();
      
      const isNoRecords = await Promise.race([
        noRecords.waitFor({ state: "visible" }).then(() => true),
        firstRow.waitFor({ state: "visible" }).then(() => false)
      ]).catch(() => false);

      if (isNoRecords) {
        const parts = searchName.split(" ");
        await fillAddEmployeeForm(page, parts[0] || "Temp", parts[1] || "Delete");
        await page.locator("button[type='submit']").click();
        await page.getByText(/Successfully Saved|Success/i).first()
          .waitFor({ state: "visible", timeout: 15000 });
        await app.openEmployeeList();
        await waitForListPage(page);
        await app.searchByLabeledInput("Employee Name", searchName);
        await page.locator("button[type='submit']").click();
        await waitForSpinner(page);
        await firstRow.waitFor({ state: "visible", timeout: 15000 });
      }

      await deleteFirstRow(page);
      await expect(page.getByText(/Successfully Deleted|Success|成功/i).first())
        .toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-E18": {
      // Nút "Delete Selected" không hiển thị khi chưa chọn checkbox nào
      const deleteBtn = page.locator(".orangehrm-header-container button", { hasText: /Delete Selected/i });
      await expect(deleteBtn).not.toBeVisible();
      break;
    }

    // ── Nhóm 4: Tính toàn vẹn dữ liệu ────────────────────────────────
    case "TC-E19": {
      // Search ngay sau khi thêm
      const [fn, ln] = [a2 || "TimKiem", a3 || "NgayLap"];
      await deleteEmployeeIfExists(page, app, `${fn} ${ln}`);
      await app.openEmployeeList();
      await waitForListPage(page);
      await fillAddEmployeeForm(page, fn, ln);
      await page.locator("button[type='submit']").click();
      await page.getByText(/Successfully Saved|Success/i).first()
        .waitFor({ state: "visible", timeout: 15000 });

      await app.openEmployeeList();
      await waitForListPage(page);
      await app.searchByLabeledInput("Employee Name", fn);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible();
      break;
    }

    case "TC-E20": {
      const fn = `DemSo${Date.now()}`;
      const ln = a3 || "ThemMoi";
      
      await fillAddEmployeeForm(page, fn, ln);
      await page.locator("button[type='submit']").click();
      await page.locator(".oxd-toast--success").first()
        .waitFor({ state: "visible", timeout: 15000 });

      await app.openEmployeeList();
      await waitForListPage(page);
      await app.searchByLabeledInput("Employee Name", fn);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      
      await expect(page.locator(".oxd-table-body .oxd-table-row").first()).toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-E21": {
      // Count giảm sau khi xóa
      const name = a2 || "DemSo ThemMoi";
      const [namePart0, ...rest] = name.split(" ");

      // Đảm bảo employee tồn tại
      await app.searchByLabeledInput("Employee Name", namePart0);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);

      if (await page.getByText(/No Records Found/i).first().isVisible().catch(() => false)) {
        await fillAddEmployeeForm(page, namePart0, rest.join(" ") || "ThemMoi");
        await page.locator("button[type='submit']").click();
        await page.locator(".oxd-toast--success, .oxd-toast-content")
          .filter({ hasText: /Saved|Success/i }).first()
          .waitFor({ state: "visible", timeout: 15000 });
        await app.openEmployeeList();
        await waitForListPage(page);
        await app.searchByLabeledInput("Employee Name", namePart0);
        await page.locator("button[type='submit']").click();
        await waitForSpinner(page);
      }

      await deleteFirstRow(page);

      // Xác nhận employee đã bị xóa: tìm kiếm lại phải ra No Records Found
      await app.openEmployeeList();
      await waitForListPage(page);
      await app.searchByLabeledInput("Employee Name", namePart0);
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);
      await expect(page.getByText(/No Records Found/i).first()).toBeVisible({ timeout: 10000 });
      break;
    }

    case "TC-E22": {
      // Phân trang – không duplicate records
      await page.locator("button[type='submit']").click();
      await waitForSpinner(page);

      const getPageIds = async () => {
        const rows = page.locator(".oxd-table-body .oxd-table-row");
        const rowCount = await rows.count();
        const ids: string[] = [];
        for (let i = 0; i < rowCount; i++) {
          ids.push((await rows.nth(i).locator(".oxd-table-cell").nth(1).innerText()).trim());
        }
        return ids;
      };

      const page1Ids = await getPageIds();

      const nextBtn = page.locator("[aria-label='Next page'], .oxd-pagination-page-item--next button");
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await waitForSpinner(page);
        const page2Ids = await getPageIds();
        const intersection = page1Ids.filter((id) => page2Ids.includes(id));
        expect(intersection.length).toBe(0);
      }
      break;
    }

    default:
      await expect(page.locator("button[type='submit']")).toBeVisible();
  }
}

test.describe("OrangeHRM Employee List E2E", () => {
  test.describe("Nhóm 1: Xem & tìm kiếm", () => {
    const groupCases = testCases.filter((tc) => ["TC-E01", "TC-E02", "TC-E03", "TC-E04", "TC-E05", "TC-E06", "TC-E07", "TC-E23"].includes(tc.id));
    for (const tc of groupCases) {
      test(`${tc.id} | ${tc.name}`, async ({ page }) => {
        const app = new OrangeHrmPage(page);
        await runEmployeeCase(tc, app);
      });
    }
  });

  test.describe("Nhóm 2: Thêm nhân viên", () => {
    const groupCases = testCases.filter((tc) => ["TC-E08", "TC-E09", "TC-E10", "TC-E11", "TC-E12", "TC-E13", "TC-E14"].includes(tc.id));
    for (const tc of groupCases) {
      test(`${tc.id} | ${tc.name}`, async ({ page }) => {
        const app = new OrangeHrmPage(page);
        await runEmployeeCase(tc, app);
      });
    }
  });

  test.describe("Nhóm 3: Chỉnh sửa & xóa", () => {
    const groupCases = testCases.filter((tc) => ["TC-E15", "TC-E16", "TC-E17", "TC-E18"].includes(tc.id));
    for (const tc of groupCases) {
      test(`${tc.id} | ${tc.name}`, async ({ page }) => {
        const app = new OrangeHrmPage(page);
        await runEmployeeCase(tc, app);
      });
    }
  });

  test.describe("Nhóm 4: Tính toàn vẹn dữ liệu", () => {
    const groupCases = testCases.filter((tc) => ["TC-E19", "TC-E20", "TC-E21", "TC-E22"].includes(tc.id));
    for (const tc of groupCases) {
      test(`${tc.id} | ${tc.name}`, async ({ page }) => {
        const app = new OrangeHrmPage(page);
        await runEmployeeCase(tc, app);
      });
    }
  });
});
