# Orange HRM — E2E Test Automation

End-to-End automated tests for the **OrangeHRM** demo application, built with **WebdriverIO v9** following the **Page Object Model (POM)** pattern.

- **Application under test:** https://opensource-demo.orangehrmlive.com
- **Demo credentials:** `Admin` / `admin123`

---

## 🧰 Tech Stack

| Component      | Technology                                                                  |
| -------------- | --------------------------------------------------------------------------- |
| Test runner    | [WebdriverIO v9](https://webdriver.io/) (`@wdio/cli`, `@wdio/local-runner`) |
| Test framework | Mocha (`@wdio/mocha-framework`)                                             |
| Language       | JavaScript (ESM, `"type": "module"`)                                        |
| Pattern        | Page Object Model — page objects exported as **singletons**                 |
| Reporter       | Spec + [Allure](https://allure.qatools.ru/) (`@wdio/allure-reporter`)       |
| Browser        | Chrome (default, driven via chromedriver)                                   |

---

## ✅ Prerequisites

- **Node.js** ≥ 18
- **pnpm** (this project uses pnpm — see `pnpm-lock.yaml`)
- **Google Chrome** installed locally

---

## 🚀 Setup & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Run tests using the default configuration in wdio.conf.js
pnpm run wdio

# 3. Run a specific spec
npx wdio run ./wdio.conf.js --spec ./test/specs/Login.js
```

> **Note:** the `specs` field in [`wdio.conf.js`](wdio.conf.js) controls which specs run with `pnpm run wdio`. To run a different file, edit `specs` or use the `--spec` flag as shown above.

### View the Allure report

Raw results are written to `allure-results/` after each run. Generate & open the report:

```bash
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

---

## 📁 Project Structure

```
Orange-HRM-Learning/
├── test/
│   ├── specs/                    # Test specs (Mocha describe/it)
│   │   ├── Login.js              # Login module
│   │   └── EmployeeList.js       # PIM — employee search
│   └── pageobjects/              # Page Objects (POM)
│       ├── BasePage.js           # Base class: navigation via browser.url()
│       ├── LoginPage.js
│       ├── DashboardPage.js
│       ├── ForgotPasswordPage.js
│       ├── EmployeeListPage.js
│       └── components/           # Reusable UI components
│           └── SideMenuComponent.js
├── wdio.conf.js                  # WebdriverIO config (baseUrl, capabilities, reporters...)
├── package.json
└── allure-results/               # Report output (gitignored)
```

---

## 🧩 Page Object Conventions

Page objects in `test/pageobjects/` follow a consistent convention:

1. **Extend `BasePage`** (`class LoginPage extends Page`) to reuse `open(path)`.
2. **Export a singleton**: `export default new LoginPage();` → import and use directly, no need to `new` it again in specs.
3. **Inline locators** inside getters; prefer `name`/`id`/stable CSS, use XPath when needed:
   ```js
   get inputUsername() { return $('//input[@name="username"]'); }
   ```
4. **Do NOT import `$`, `$$`, `browser`, `expect` from `@wdio/globals`** — they are global variables injected automatically by WebdriverIO. (Under pnpm, `@wdio/globals` is not hoisted, so importing it directly fails with `Cannot find module`.)
5. **Specs only call page object methods** — never use `$()` directly in a spec.

### Element selector naming

Name each locator getter as **`descriptor` + `Suffix`** in camelCase, where the suffix marks the GUI control type. This makes the control type obvious at a glance.

```js
get usernameTxb()        { return $('//input[@name="username"]'); }  // text input field
get loginBtn()           { return $('button[type="submit"]'); }      // button
get forgotPasswordLnk()  { return $('.orangehrm-login-forgot'); }    // link
get dashboardLbl()       { return $('//h6[text()="Dashboard"]'); }   // label
```

Suffix reference:

| GUI Control                   | Suffix          |
| ----------------------------- | --------------- |
| Text input field              | `txb`           |
| Text                          | `txt`           |
| Text area                     | `txa`           |
| Placeholder                   | `plh`           |
| Button                        | `btn`           |
| Link                          | `lnk`           |
| Checkbox                      | `ckb`           |
| Tab                           | `tab`           |
| Table                         | `tbl`           |
| File Upload                   | `ful`           |
| Spinner                       | `spn`           |
| Radio Button                  | `rad`           |
| Drop down                     | `ddn`           |
| List Options inside Drop Down | `opt` \| `opts` |
| List box                      | `lbx`           |
| Label                         | `lbl`           |
| Image                         | `img`           |
| Icon                          | `icn`           |
| Navigator                     | `nav`           |
| Modal Windows (pop-up)        | `pup`           |
| Pagination                    | `pag`           |
| iFrame                        | `ifr`           |
| Progress Bar                  | `prb`           |
| Calendar                      | `cal`           |

> Some existing getters (e.g. `inputUsername`, `btnSubmit`) predate this convention. New locators should follow the table above.

Example spec:

```js
import LoginPage from "../pageobjects/LoginPage.js";
import DashboardPage from "../pageobjects/DashboardPage.js";

describe("Login Module", () => {
  it("logs in successfully", async () => {
    await LoginPage.open();
    await LoginPage.login("Admin", "admin123");
    await expect(DashboardPage.dashboardTag).toBeDisplayed();
  });
});
```

---

## 📛 File & Spec Naming

| File type        | Pattern              | Location                       | Example                            |
| ---------------- | -------------------- | ------------------------------ | ---------------------------------- |
| Spec (test file) | `<Feature>.js`       | `test/specs/`                  | `Login.js`, `EmployeeList.js`      |
| Page object      | `<Name>Page.js`      | `test/pageobjects/`            | `LoginPage.js`, `DashboardPage.js` |
| Component        | `<Name>Component.js` | `test/pageobjects/components/` | `SideMenuComponent.js`             |

- Use **PascalCase** for the `<Feature>` / `<Name>` part, matching the class name inside.
- One page object class per file; the class name matches the file name (`class LoginPage` → `LoginPage.js`).

---

## 🧾 Test Naming & Structure

- **`describe`** = the feature/module under test — e.g. `describe('Login Module', ...)`, `describe('Employee List', ...)`.
- **`it`** = one test case, titled **`<TC ID>: <short description>`**.
  - Specs generated from a test-case doc/Excel use the **module-prefixed ID** so it traces back to the source: `it('LOGIN_TC01: đăng nhập thành công với tài khoản hợp lệ', ...)`.
- One scenario per `it` — keep each test **atomic** and independently runnable.
- All test callbacks are `async` and every WDIO action is `await`-ed.

```js
describe("Login Module", () => {
  it("LOGIN_TC01: logs in successfully with valid credentials", async () => {
    await LoginPage.open();
    await LoginPage.login("Admin", "admin123");
    await expect(DashboardPage.dashboardTag).toBeDisplayed();
  });
});
```

---

## 🔁 Setup Hooks (`before` / `beforeEach`)

Choose the hook based on how much isolation each test needs:

- **`before`** — run **once** per `describe` for shared, read-only setup that tests won't corrupt. Example: log in once, then run several search tests.

  ```js
  describe("Employee List", () => {
    before(async () => {
      await LoginPage.open();
      await LoginPage.login("Admin", "admin123");
    });
    // it(...) blocks reuse the same logged-in session
  });
  ```

- **`beforeEach`** — run **before every `it`** to reset state so tests don't depend on each other. Example: the Login suite mixes logged-in and logged-out cases, so it clears the session before each test:
  ```js
  beforeEach(async () => {
    // auth/logout destroys any existing session and returns a fresh login page
    await browser.url("auth/logout");
    await LoginPage.inputUsername.waitForDisplayed({ timeout: 10000 });
  });
  ```

Guidelines:

- Every `it` must be able to run **on its own** — never rely on a previous test's side effects.
- Put shared setup in a hook, not copy-pasted into each `it`.
- Prefer resetting via a fast path (API/URL such as `auth/logout`) over clicking through the UI.
- Do state cleanup in `after`/`afterEach` when a test creates data that would affect others.

---

## 🧪 Existing Test Suites

| Spec                         | Module | Description                                                                                                                                            |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `test/specs/Login.js`        | Login  | 20 test cases: happy path, validation, password case-sensitivity, SQL injection, XSS, forgot password, logout, route guard, session, boundary, unicode |
| `test/specs/EmployeeList.js` | PIM    | Search employee by name                                                                                                                                |
| `test/specs/Login.js`        | Login  | Basic login demo                                                                                                                                       |

---

## ⚠️ Notes When Running Against the Public Demo

`opensource-demo.orangehrmlive.com` is a **shared public** environment with anti-automation measures:

- **Repeated failed logins** sometimes return `CSRF token validation failed` or no error alert → some negative-login tests can be **flaky**.
- The **Forgot/Reset Password** flow may hang at the submit step.

Cases that depend on the demo's unstable behavior are marked `it.skip` with a `TODO` note inside the spec. For 100% stable runs, point the tests at a **self-hosted/private OrangeHRM** instance.

> ❌ Do not use `browser.pause()`/`sleep` to "fix" flakiness — prefer `waitForDisplayed`/`waitUntil`.

---

## 📌 Miscellaneous

- AI tooling configuration (skills, agents) lives in the `.claude/` directory (gitignored, not part of the shared repo).
- `baseUrl` is preset in `wdio.conf.js`, so `open('auth/login')` is automatically resolved to the full URL.
