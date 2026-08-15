import LoginPage from "../pageobjects/LoginPage.js";

const VALID_USER = process.env.ADMIN_USERNAME;
const VALID_PASS = process.env.ADMIN_PASSWORD;
const INVALID_CREDENTIALS = "Invalid credentials";

describe("Login Module - Failure Scenarios", () => {
  beforeEach(async () => {
    await browser.url("auth/logout");
    await LoginPage.usernameTbx.waitForDisplayed({ timeout: 10000 });
  });

  // LOGIN_FAIL_TC01 | Severity: S | Priority: Critical | Sai mật khẩu
  it("LOGIN_FAIL_TC01: đăng nhập thất bại với mật khẩu sai", async () => {
    await LoginPage.login(VALID_USER, "wrongpass");

    await expect(LoginPage.errorAlert).toBeDisplayed();
    await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
  });

  // LOGIN_FAIL_TC02 | Severity: S | Priority: Critical | Sai username
  it("LOGIN_FAIL_TC02: đăng nhập thất bại với username không tồn tại", async () => {
    await LoginPage.login("NotExist", VALID_PASS);

    await expect(LoginPage.errorAlert).toBeDisplayed();
    await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
  });

  // LOGIN_FAIL_TC03 | Severity: A | Priority: High | Bỏ trống username
  it("LOGIN_FAIL_TC03: bỏ trống username", async () => {
    await LoginPage.setPassword(VALID_PASS);
    await LoginPage.clickLogin();

    await expect(LoginPage.requiredErrors).toBeElementsArrayOfSize(1);
  });

  // LOGIN_FAIL_TC04 | Severity: A | Priority: High | Bỏ trống password
  it("LOGIN_FAIL_TC04: bỏ trống password", async () => {
    await LoginPage.setUsername(VALID_USER);
    await LoginPage.clickLogin();

    await expect(LoginPage.requiredErrors).toBeElementsArrayOfSize(1);
  });

  // LOGIN_FAIL_TC05 | Severity: A | Priority: High | Bỏ trống cả hai trường
  it("LOGIN_FAIL_TC05: bỏ trống cả username và password", async () => {
    await LoginPage.clickLogin();

    await expect(LoginPage.requiredErrors).toBeElementsArrayOfSize(2);
  });

  // LOGIN_FAIL_TC06 | Severity: A | Priority: High | Password phân biệt hoa thường
  it("LOGIN_FAIL_TC06: đăng nhập thất bại khi password sai case", async () => {
    await LoginPage.login(VALID_USER, "ADMIN123");

    await expect(LoginPage.errorAlert).toBeDisplayed();
    await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
  });

  // LOGIN_FAIL_TC07 | Severity: S | Priority: High | SQL Injection
  it("LOGIN_FAIL_TC07: SQL Injection cơ bản trong username", async () => {
    await LoginPage.login("' OR '1'='1", "abc");

    await expect(LoginPage.errorAlert).toBeDisplayed();
    await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
  });

  // LOGIN_FAIL_TC08 | Severity: S | Priority: High | XSS
  it("LOGIN_FAIL_TC08: XSS trong ô username", async () => {
    await LoginPage.login("<script>alert(1)</script>", "abc");

    expect(await browser.getUrl()).toContain("auth/login");
    await expect(LoginPage.submitBtn).toBeDisplayed();
  });

  // LOGIN_FAIL_TC09 | Severity: C | Priority: Low | Username quá dài
  it("LOGIN_FAIL_TC09: username quá dài (>255 ký tự)", async () => {
    await LoginPage.login("a".repeat(300), VALID_PASS);

    await LoginPage.errorAlert.waitForDisplayed({ timeout: 15000 });
    await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
  });

  // LOGIN_FAIL_TC10 | Severity: C | Priority: Low | Ký tự Unicode
  it("LOGIN_FAIL_TC10: ký tự đặc biệt Unicode trong username", async () => {
    await LoginPage.login("Adminñ日本", VALID_PASS);

    await expect(LoginPage.errorAlert).toBeDisplayed();
    await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
  });
});
