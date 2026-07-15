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
npx wdio run ./wdio.conf.js --spec ./test/specs/Login.e2e.js
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
│   │   ├── Login.js              # Basic login demo
│   │   ├── Login.e2e.js          # Login Module — 22 test cases (from Excel test cases)
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
