# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Tính năng bổ trợ >> TC-L08 | Gửi yêu cầu đặt lại mật khẩu
- Location: tests\login.spec.ts:119:9

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Reset Password link sent successfully|reset.*sent/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/Reset Password link sent successfully|reset.*sent/i).first()

```

```yaml
- heading "504 Gateway Time-out" [level=1]
- separator
- text: nginx/1.18.0 (Ubuntu)
```

# Test source

```ts
  38  |   }
  39  | 
  40  |   const tc02 = getTC("TC-L02");
  41  |   if (tc02) {
  42  |     test(`${tc02.id} | ${tc02.name}`, async ({ page }) => {
  43  |       const app = new OrangeHrmPage(page);
  44  |       await app.gotoLogin();
  45  |       await app.login(tc02.input[0] || "Admin", tc02.input[1] || "MatKhauSai123", false);
  46  |       await expect(page.locator(".oxd-alert-content-text")).toBeVisible({ timeout: 8000 });
  47  |       await expect(page).not.toHaveURL(/dashboard/);
  48  |     });
  49  |   }
  50  | 
  51  |   const tc03 = getTC("TC-L03");
  52  |   if (tc03) {
  53  |     test(`${tc03.id} | ${tc03.name}`, async ({ page }) => {
  54  |       const app = new OrangeHrmPage(page);
  55  |       await app.gotoLogin();
  56  |       await app.login(tc03.input[0] || "tai_khoan_gia", tc03.input[1] || "batkymatkhau", false);
  57  |       await expect(page.locator(".oxd-alert-content-text")).toBeVisible({ timeout: 8000 });
  58  |       await expect(page).not.toHaveURL(/dashboard/);
  59  |       const msg = await page.locator(".oxd-alert-content-text").innerText();
  60  |       expect(msg.trim().toLowerCase()).toContain("invalid credentials");
  61  |     });
  62  |   }
  63  | 
  64  |   const tc04 = getTC("TC-L04");
  65  |   if (tc04) {
  66  |     test(`${tc04.id} | ${tc04.name}`, async ({ page }) => {
  67  |       const app = new OrangeHrmPage(page);
  68  |       await app.gotoLogin();
  69  |       // Only type password
  70  |       await page.getByRole("textbox", { name: "Password" }).fill(tc04.input[1] || "admin123");
  71  |       await page.getByRole("button", { name: "Login" }).click();
  72  |       const errors = page.locator(".oxd-input-field-error-message");
  73  |       await expect(errors).toHaveCount(1, { timeout: 5000 });
  74  |       await expect(errors.first()).toContainText("Required");
  75  |     });
  76  |   }
  77  | 
  78  |   const tc05 = getTC("TC-L05");
  79  |   if (tc05) {
  80  |     test(`${tc05.id} | ${tc05.name}`, async ({ page }) => {
  81  |       const app = new OrangeHrmPage(page);
  82  |       await app.gotoLogin();
  83  |       // Only type username
  84  |       await page.getByRole("textbox", { name: "Username" }).fill(tc05.input[0] || "Admin");
  85  |       await page.getByRole("button", { name: "Login" }).click();
  86  |       const errors = page.locator(".oxd-input-field-error-message");
  87  |       await expect(errors).toHaveCount(1, { timeout: 5000 });
  88  |       await expect(errors.first()).toContainText("Required");
  89  |     });
  90  |   }
  91  | 
  92  |   const tc06 = getTC("TC-L06");
  93  |   if (tc06) {
  94  |     test(`${tc06.id} | ${tc06.name}`, async ({ page }) => {
  95  |       const app = new OrangeHrmPage(page);
  96  |       await app.gotoLogin();
  97  |       await page.getByRole("button", { name: "Login" }).click();
  98  |       const errors = page.locator(".oxd-input-field-error-message");
  99  |       await expect(errors).toHaveCount(2, { timeout: 5000 });
  100 |     });
  101 |   }
  102 | });
  103 | 
  104 | test.describe("Tính năng bổ trợ", () => {
  105 |   const tc07 = getTC("TC-L07");
  106 |   if (tc07) {
  107 |     test(`${tc07.id} | ${tc07.name}`, async ({ page }) => {
  108 |       const app = new OrangeHrmPage(page);
  109 |       await app.gotoLogin();
  110 |       await page.getByRole("textbox", { name: "Username" }).fill(tc07.input[0] || "Admin");
  111 |       await page.getByRole("textbox", { name: "Password" }).fill(tc07.input[1] || "admin123");
  112 |       await page.keyboard.press("Enter");
  113 |       await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  114 |     });
  115 |   }
  116 | 
  117 |   const tc08 = getTC("TC-L08");
  118 |   if (tc08) {
  119 |     test(`${tc08.id} | ${tc08.name}`, async ({ page }) => {
  120 |       const app = new OrangeHrmPage(page);
  121 |       await app.gotoLogin();
  122 |       await page.getByText("Forgot your password?").click();
  123 |       await page.getByRole("textbox", { name: "Username" }).fill(tc08.input[0] || "Admin");
  124 | 
  125 |       const [response] = await Promise.all([
  126 |         page.waitForResponse(
  127 |           (resp) => resp.url().includes("requestPasswordResetCode") || resp.status() >= 400,
  128 |           { timeout: 15000 }
  129 |         ).catch(() => null),
  130 |         page.getByRole("button", { name: "Reset Password" }).click(),
  131 |       ]);
  132 | 
  133 |       if (response) {
  134 |         expect(response.status()).not.toBe(504);
  135 |       }
  136 |       await expect(
  137 |         page.getByText(/Reset Password link sent successfully|reset.*sent/i).first()
> 138 |       ).toBeVisible({ timeout: 10000 });
      |         ^ Error: expect(locator).toBeVisible() failed
  139 |     });
  140 |   }
  141 | 
  142 |   const tc09 = getTC("TC-L09");
  143 |   if (tc09) {
  144 |     test(`${tc09.id} | ${tc09.name}`, async ({ page }) => {
  145 |       const app = new OrangeHrmPage(page);
  146 |       await app.gotoLogin();
  147 |       await page.getByText("Forgot your password?").click();
  148 |       await page.getByRole("textbox", { name: "Username" }).fill(tc09.input[0] || "tai_khoan_khong_ton_tai_9999");
  149 |       await page.getByRole("button", { name: "Reset Password" }).click();
  150 |       await expect(
  151 |         page.getByText(/Reset Password link sent successfully|reset.*sent/i).first()
  152 |       ).toBeVisible({ timeout: 10000 });
  153 |     });
  154 |   }
  155 | 
  156 |   const tc10 = getTC("TC-L10");
  157 |   if (tc10) {
  158 |     test(`${tc10.id} | ${tc10.name}`, async ({ page }) => {
  159 |       const app = new OrangeHrmPage(page);
  160 |       const oldPass = tc10.input[1] || "admin123";
  161 |       const newPass = tc10.input[2] || "MatKhauMoi@2026";
  162 | 
  163 |       await app.gotoLogin();
  164 |       await app.login(tc10.input[0] || "Admin", oldPass);
  165 |       await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  166 | 
  167 |       await page.locator(".oxd-userdropdown-tab").click();
  168 |       await page.getByRole("menuitem", { name: /Change Password/i }).click();
  169 |       await page.locator("input[type='password']").nth(0).fill(oldPass);
  170 |       await page.locator("input[type='password']").nth(1).fill(newPass);
  171 |       await page.locator("input[type='password']").nth(2).fill(newPass);
  172 |       await page.getByRole("button", { name: /Save/i }).click();
  173 |       await expect(page.getByText(/Success|Successfully/i).first()).toBeVisible({ timeout: 10000 });
  174 | 
  175 |       await app.logoutIfLoggedIn();
  176 | 
  177 |       await app.gotoLogin();
  178 |       await app.login(tc10.input[0] || "Admin", newPass);
  179 |       await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  180 | 
  181 |       await page.locator(".oxd-userdropdown-tab").click();
  182 |       await page.getByRole("menuitem", { name: /Change Password/i }).click();
  183 |       await page.locator("input[type='password']").nth(0).fill(newPass);
  184 |       await page.locator("input[type='password']").nth(1).fill(oldPass);
  185 |       await page.locator("input[type='password']").nth(2).fill(oldPass);
  186 |       await page.getByRole("button", { name: /Save/i }).click();
  187 |     });
  188 |   }
  189 | });
  190 | 
  191 | test.describe("Bảo mật và phiên làm việc", () => {
  192 |   const tc11 = getTC("TC-L11");
  193 |   if (tc11) {
  194 |     test(`${tc11.id} | ${tc11.name}`, async ({ page }) => {
  195 |       await page.goto(`${BASE_URL}${tc11.input[0] || "/web/index.php/dashboard/index"}`);
  196 |       await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
  197 |       await expect(page.getByRole("heading", { name: "Dashboard" })).not.toBeVisible();
  198 |     });
  199 |   }
  200 | 
  201 |   const tc12 = getTC("TC-L12");
  202 |   if (tc12) {
  203 |     test(`${tc12.id} | ${tc12.name}`, async ({ page }) => {
  204 |       const app = new OrangeHrmPage(page);
  205 |       await app.gotoLogin();
  206 |       await app.login(tc12.input[0] || "Admin", tc12.input[1] || "admin123");
  207 |       await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  208 | 
  209 |       await app.logoutIfLoggedIn();
  210 | 
  211 |       await page.goBack();
  212 |       await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
  213 |     });
  214 |   }
  215 | 
  216 |   const tc13 = getTC("TC-L13");
  217 |   if (tc13) {
  218 |     test(`${tc13.id} | ${tc13.name}`, async ({ page }) => {
  219 |       const app = new OrangeHrmPage(page);
  220 |       await app.gotoLogin();
  221 |       await page.getByRole("textbox", { name: "Username" }).fill(tc13.input[0] || "OR '1'='1'--");
  222 |       await page.getByRole("textbox", { name: "Password" }).fill(tc13.input[1] || "batkymatkhau");
  223 |       await page.getByRole("button", { name: "Login" }).click();
  224 |       await waitForLoginAttemptToSettle(page);
  225 | 
  226 |       await expect(page).not.toHaveURL(/dashboard/);
  227 |       const content = await page.content();
  228 |       expect(content.toLowerCase()).not.toMatch(/sql|syntax|mysql/);
  229 |     });
  230 |   }
  231 | 
  232 |   const tc14 = getTC("TC-L14");
  233 |   if (tc14) {
  234 |     test(`${tc14.id} | ${tc14.name}`, async ({ page }) => {
  235 |       const app = new OrangeHrmPage(page);
  236 |       await app.gotoLogin();
  237 | 
  238 |       let dialogFired = false;
```