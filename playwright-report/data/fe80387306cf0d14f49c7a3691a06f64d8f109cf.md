# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Tính năng bổ trợ >> TC-L10 | Đổi mật khẩu rồi đăng nhập lại bằng mật khẩu mới
- Location: tests\login.spec.ts:158:9

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - alert [ref=e13]:
            - generic [ref=e14]:
              - generic [ref=e15]: 
              - paragraph [ref=e16]: Invalid credentials
          - generic [ref=e18]:
            - paragraph [ref=e19]: "Username : Admin"
            - paragraph [ref=e20]: "Password : admin123"
        - generic [ref=e21]:
          - generic [ref=e23]:
            - generic [ref=e24]:
              - generic [ref=e25]: 
              - generic [ref=e26]: Username
            - textbox "Username" [active] [ref=e28]
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: 
              - generic [ref=e33]: Password
            - textbox "Password" [ref=e35]
          - button "Login" [ref=e37] [cursor=pointer]
          - paragraph [ref=e39] [cursor=pointer]: Forgot your password?
      - generic [ref=e40]:
        - generic [ref=e41]:
          - link [ref=e42] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e45] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e48] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e51] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e54]:
          - paragraph [ref=e55]: OrangeHRM OS 5.8
          - paragraph [ref=e56]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e57] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e59]
```

# Test source

```ts
  59  |       .isVisible()
  60  |       .catch(() => false);
  61  |   }
  62  | 
  63  |   private isAdminUsersUrl() {
  64  |     return /\/admin\/viewSystemUsers/i.test(this.page.url());
  65  |   }
  66  | 
  67  |   private isEmployeeListUrl() {
  68  |     return /\/pim\/viewEmployeeList/i.test(this.page.url());
  69  |   }
  70  | 
  71  |   private isLoginUrl() {
  72  |     return /\/auth\/login/i.test(this.page.url());
  73  |   }
  74  | 
  75  |   private async isSessionExpiredPage() {
  76  |     if (this.isLoginUrl()) return true;
  77  |     const sessionExpiredBanner = this.page.getByText(/Session Expired/i).first();
  78  |     return sessionExpiredBanner.isVisible().catch(() => false);
  79  |   }
  80  | 
  81  |   async ensureAdminUsersReady() {
  82  |     if (!this.isAdminUsersUrl()) {
  83  |       await this.openAdminUsers();
  84  |       return;
  85  |     }
  86  | 
  87  |     await this.waitForSpinnerToClear();
  88  |     await this.waitForAdminUsersContent(5000);
  89  |     if (await this.hasVisibleAdminUsersPage()) return;
  90  | 
  91  |     await this.openAdminUsers();
  92  |   }
  93  | 
  94  |   async gotoLogin() {
  95  |     try {
  96  |       await this.gotoWithRetry("/web/index.php/auth/login");
  97  |     } catch (e) {
  98  |       await this.gotoWithRetry("/web/index.php/auth/login");
  99  |     }
  100 | 
  101 |     const loginVisible = await this.page.locator("button[type='submit']")
  102 |       .waitFor({ state: "visible", timeout: 15000 })
  103 |       .then(() => true)
  104 |       .catch(() => false);
  105 | 
  106 |     if (!loginVisible && this.page.url().includes("/dashboard")) {
  107 |       await this.logoutIfLoggedIn();
  108 |       await this.gotoWithRetry("/web/index.php/auth/login").catch(() => {});
  109 |       await this.page.locator("input[name='username']").waitFor({ state: "visible", timeout: 15000 });
  110 |     }
  111 |   }
  112 | 
  113 |   async ensureLoggedIn(username: string, password: string) {
  114 |     const userMenu = this.page.locator(".oxd-userdropdown-tab");
  115 |     if (await userMenu.isVisible().catch(() => false)) return;
  116 | 
  117 |     await this.gotoWithRetry("/web/index.php/dashboard/index").catch(() => {});
  118 |     if (await userMenu.isVisible().catch(() => false)) return;
  119 | 
  120 |     await this.login(username, password);
  121 |   }
  122 | 
  123 |   async login(username: string, password: string, expectSuccess = true) {
  124 |     await this.gotoLogin();
  125 |     let lastError = "";
  126 | 
  127 |     for (let attempt = 0; attempt < (expectSuccess ? 3 : 1); attempt++) {
  128 |       const usernameInput = this.page.locator("input[name='username']");
  129 |       const loginReady = await usernameInput.waitFor({ state: "visible", timeout: 20000 })
  130 |         .then(() => true)
  131 |         .catch(() => false);
  132 |       if (!loginReady) {
  133 |         await this.gotoWithRetry("/web/index.php/auth/login").catch(() => {});
  134 |         continue;
  135 |       }
  136 |       await usernameInput.fill(username);
  137 |       await this.page.locator("input[name='password']").fill(password);
  138 |       await this.page.locator("button[type='submit']").click();
  139 | 
  140 |       if (!expectSuccess) {
  141 |         return;
  142 |       }
  143 | 
  144 |       const reachedDashboard = await this.page.waitForURL(/dashboard/i, { timeout: 20000 })
  145 |         .then(() => true)
  146 |         .catch(() => false);
  147 | 
  148 |       if (reachedDashboard || this.page.url().includes("/dashboard")) {
  149 |         await this.page.locator("a[href*='viewAdminModule']").first()
  150 |           .waitFor({ state: "visible", timeout: 15000 })
  151 |           .catch(() => {});
  152 |         return;
  153 |       }
  154 |       const errorBanner = this.page.locator(".oxd-alert-content, .oxd-input-field-error-message").first();
  155 |       if (await errorBanner.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false)) {
  156 |         lastError = (await errorBanner.innerText().catch(() => "")).trim();
  157 |       }
  158 | 
> 159 |       await this.page.waitForTimeout(1000);
      |                       ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  160 |     }
  161 | 
  162 |     throw new Error(`Login did not reach the dashboard after 3 attempts. ${lastError || `Current URL: ${this.page.url()}`}`.trim());
  163 |   }
  164 | 
  165 |   async logoutIfLoggedIn() {
  166 |     const menu = this.page.locator(".oxd-userdropdown-tab");
  167 |     if (await menu.isVisible().catch(() => false)) {
  168 |       await menu.click();
  169 |       await this.page.locator("a[href*='logout']").click();
  170 |       await expect(this.page).toHaveURL(/auth\/login/);
  171 |     }
  172 |   }
  173 | 
  174 |   async openAdminUsers() {
  175 |     if (this.isAdminUsersUrl()) {
  176 |       await this.waitForSpinnerToClear();
  177 |       await this.waitForAdminUsersContent(5000);
  178 |       if (await this.hasVisibleAdminUsersPage()) return;
  179 |     }
  180 | 
  181 |     for (let attempt = 0; attempt < 3; attempt++) {
  182 |       await this.gotoWithRetry("/web/index.php/admin/viewSystemUsers");
  183 |       if (await this.isSessionExpiredPage()) {
  184 |         await this.login(this.getDefaultAdminUsername(), this.getDefaultAdminPassword());
  185 |         await this.gotoWithRetry("/web/index.php/admin/viewSystemUsers");
  186 |       }
  187 |       await expect(this.page).toHaveURL(/admin\/viewSystemUsers/, { timeout: 15000 });
  188 |       await this.waitForSpinnerToClear();
  189 |       await this.waitForAdminUsersContent();
  190 | 
  191 |       if (await this.hasVisibleAdminUsersPage()) return;
  192 | 
  193 |       const bodyText = await this.page.locator("body").innerText().catch(() => "");
  194 |       if (bodyText.trim()) {
  195 |         await this.page.reload({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  196 |         await this.waitForSpinnerToClear();
  197 |         if (await this.hasVisibleAdminUsersPage()) return;
  198 |       }
  199 |     }
  200 | 
  201 |     const adminSidebarLink = this.page.locator("a[href*='viewAdminModule']").first();
  202 |     if (await adminSidebarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
  203 |       await adminSidebarLink.click();
  204 |       await expect(this.page).toHaveURL(/admin\/viewSystemUsers/, { timeout: 20000 });
  205 |       await this.waitForSpinnerToClear();
  206 |       await this.waitForAdminUsersContent();
  207 |       if (await this.hasVisibleAdminUsersPage()) return;
  208 |     }
  209 | 
  210 |     throw new Error(`Admin User Management page did not render visible controls after 3 navigation attempts. Current URL: ${this.page.url()}`);
  211 |   }
  212 | 
  213 |   async ensureAdminUserFiltersVisible() {
  214 |     const usernameInput = this.page.locator(".oxd-input-group")
  215 |       .filter({ has: this.page.locator("label").filter({ hasText: /^Username/i }) })
  216 |       .locator("input")
  217 |       .first();
  218 | 
  219 |     if (await usernameInput.isVisible().catch(() => false)) {
  220 |       await expect(this.page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
  221 |       return;
  222 |     }
  223 | 
  224 |     const toggle = this.page.locator(".oxd-table-filter-header-options .oxd-icon-button").first();
  225 |     await expect(toggle).toBeVisible({ timeout: 15000 });
  226 |     await toggle.click();
  227 |     await this.waitForSpinnerToClear(10000);
  228 |     await expect(usernameInput).toBeVisible({ timeout: 10000 });
  229 |     await expect(this.page.getByRole("button", { name: /Search/i })).toBeVisible({ timeout: 10000 });
  230 |     await expect(this.page.getByRole("button", { name: /Reset/i })).toBeVisible({ timeout: 10000 });
  231 |   }
  232 | 
  233 |   async openEmployeeList() {
  234 |     if (this.isEmployeeListUrl()) {
  235 |       await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
  236 |       const searchVisible = await this.page.locator("button[type='submit']").isVisible().catch(() => false);
  237 |       if (searchVisible) return;
  238 |     }
  239 | 
  240 |     // Thử click link PIM trên sidebar; nếu không tìm thấy (chậm), navigate trực tiếp
  241 |     const pimLink = this.page.locator("a[href*='viewPimModule'], a[href*='pim/viewEmployeeList']").first();
  242 |     const isVisible = await pimLink.isVisible({ timeout: 5000 }).catch(() => false);
  243 |     if (isVisible) {
  244 |       await pimLink.click();
  245 |     } else {
  246 |       await this.gotoWithRetry("/web/index.php/pim/viewEmployeeList", "commit");
  247 |     }
  248 |     await expect(this.page).toHaveURL(/pim\/viewEmployeeList/, { timeout: 20000 });
  249 |     await this.page.locator(".oxd-loading-spinner").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
  250 |   }
  251 | 
  252 |   async searchByLabeledInput(label: string, value: string) {
  253 |     if (/viewSystemUsers/i.test(this.page.url())) {
  254 |       await this.ensureAdminUserFiltersVisible();
  255 |     }
  256 | 
  257 |     const labelRegex = label === "Username" 
  258 |       ? /Username|用户名/i 
  259 |       : label === "Employee Name" 
```