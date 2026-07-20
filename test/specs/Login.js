import LoginPage from '../pageobjects/LoginPage.js';
import DashboardPage from '../pageobjects/DashboardPage.js';
import ForgotPasswordPage from '../pageobjects/ForgotPasswordPage.js';

const VALID_USER = 'Admin';
const VALID_PASS = 'admin123';
const INVALID_CREDENTIALS = 'Invalid credentials';

describe('Login Module', () => {
    beforeEach(async () => {
        await browser.url('auth/logout');
        await LoginPage.usernameTbx.waitForDisplayed({ timeout: 10000 });
    });

    // LOGIN_TC01 | Severity: S | Priority: Critical | Happy path
    it('LOGIN_TC01: đăng nhập thành công với tài khoản hợp lệ', async () => {
        await LoginPage.login(VALID_USER, VALID_PASS);
        // Expected: chuyển đến Dashboard, hiển thị breadcrumb "Dashboard"
        await expect(DashboardPage.dashboardTag).toBeDisplayed();
    });

    // LOGIN_TC02 | Severity: S | Priority: Critical | Bảo mật cơ bản
    it('LOGIN_TC02: đăng nhập thất bại với password sai', async () => {
        await LoginPage.login(VALID_USER, 'wrongpass');

        await expect(LoginPage.errorAlert).toBeDisplayed();
        await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
    });

    // LOGIN_TC03 | Severity: S | Priority: Critical | Không tiết lộ username tồn tại
    it('LOGIN_TC03: đăng nhập thất bại với username sai', async () => {
        await LoginPage.login('NotExist', VALID_PASS);

        await expect(LoginPage.errorAlert).toBeDisplayed();
        await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
    });

    // LOGIN_TC04 | Severity: A | Priority: High | Validation client-side
    it('LOGIN_TC04: bỏ trống username', async () => {
        await LoginPage.setPassword(VALID_PASS);
        await LoginPage.clickLogin();

        await expect(LoginPage.requiredErrors).toBeElementsArrayOfSize(1);
    });

    // LOGIN_TC05 | Severity: A | Priority: High | Validation client-side
    it('LOGIN_TC05: bỏ trống password', async () => {
        await LoginPage.setUsername(VALID_USER);
        await LoginPage.clickLogin();

        await expect(LoginPage.requiredErrors).toBeElementsArrayOfSize(1);
    });

    // LOGIN_TC06 | Severity: A | Priority: High | Validation đồng thời nhiều trường
    it('LOGIN_TC06: bỏ trống cả username và password', async () => {
        await LoginPage.clickLogin();

        await expect(LoginPage.requiredErrors).toBeElementsArrayOfSize(2);
    });

    // LOGIN_TC07 | Severity: B | Priority: Medium
    it.skip('LOGIN_TC07: username phân biệt hoa thường', async () => {
        // TODO: xác nhận hành vi thực tế với user trước khi assert cứng (xem cột Note trong Excel)
        await LoginPage.login('admin', VALID_PASS);
    });

    // LOGIN_TC08 | Severity: C | Priority: Medium
    it.skip('LOGIN_TC08: khoảng trắng thừa trong username', async () => {
        // TODO: xác nhận hành vi trim với user trước khi assert (xem cột Note trong Excel)
        await LoginPage.login(' Admin ', VALID_PASS);
    });

    // LOGIN_TC09 | Severity: A | Priority: High | Password luôn case-sensitive
    it('LOGIN_TC09: password phân biệt hoa thường', async () => {
        await LoginPage.login(VALID_USER, 'Admin123');

        await expect(LoginPage.errorAlert).toBeDisplayed();
        await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
    });

    // LOGIN_TC10 | Severity: S | Priority: High | Bảo mật injection
    it('LOGIN_TC10: SQL Injection cơ bản trong username', async () => {
        await LoginPage.login("' OR '1'='1", 'abc');

        await expect(LoginPage.errorAlert).toBeDisplayed();
        await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
    });

    // LOGIN_TC11 | Severity: S | Priority: High | Bảo mật XSS
    it('LOGIN_TC11: XSS trong ô username', async () => {
        await LoginPage.login('<script>alert(1)</script>', 'abc');

        expect(await browser.getUrl()).toContain('auth/login');
        await expect(LoginPage.submitBtn).toBeDisplayed();
    });

    // LOGIN_TC12 | Severity: B | Priority: Medium | Kiểm tra điều hướng
    it('LOGIN_TC12: Forgot Password — điều hướng', async () => {
        await LoginPage.clickForgotPassword();

        await expect(ForgotPasswordPage.usernameTbx).toBeDisplayed();
        expect(await browser.getUrl()).toContain('requestPasswordResetCode');
    });

    // LOGIN_TC13 | Severity: B | Priority: Medium | Luồng quên mật khẩu
    // ⚠️ UNSTABLE trên site demo: bước submit "Reset Password" bị treo (verified qua test + debug
    // spec + wdio-mcp đều timeout ngay tại click Reset — nghi rate-limit/redirect chậm phía demo).
    it.skip('LOGIN_TC13: reset password với username hợp lệ', async () => {
        // TODO: bật lại khi chạy trên môi trường thật (không phải public demo). Bước xác nhận:
        // await LoginPage.clickForgotPassword();
        // await ForgotPasswordPage.resetPassword(VALID_USER);
        // await expect(ForgotPasswordPage.successMessage).toBeDisplayed();
    });

    // LOGIN_TC14 | Severity: C | Priority: Low | Kiểm tra nút Cancel
    it('LOGIN_TC14: reset password — click Cancel', async () => {
        await LoginPage.clickForgotPassword();
        await ForgotPasswordPage.cancel();

        await expect(LoginPage.submitBtn).toBeDisplayed();
        expect(await browser.getUrl()).toContain('auth/login');
    });

    // LOGIN_TC15 | Severity: S | Priority: Critical | Luồng logout cơ bản
    it('LOGIN_TC15: đăng xuất (Logout)', async () => {
        await LoginPage.login(VALID_USER, VALID_PASS);
        await expect(DashboardPage.dashboardTag).toBeDisplayed();
        await DashboardPage.logout();

        await expect(LoginPage.submitBtn).toBeDisplayed();
        expect(await browser.getUrl()).toContain('auth/login');
    });

    // LOGIN_TC16 | Severity: S | Priority: Critical | Bảo vệ route
    it('LOGIN_TC16: truy cập trang nội bộ khi chưa login', async () => {
        await DashboardPage.open();

        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('auth/login'),
            { timeout: 10000, timeoutMsg: 'Không bị redirect về login khi chưa đăng nhập' }
        );
        await expect(LoginPage.submitBtn).toBeDisplayed();
    });

    // LOGIN_TC17 | Severity: A | Priority: High
    // ⚠️ FLAKY: phụ thuộc browser history/back-button + bfcache -> không ổn định để automate
    it.skip('LOGIN_TC17: session sau khi logout (nút Back)', async () => {
        // TODO: cân nhắc test ở tầng khác (kiểm tra cookie/token bị hủy) thay vì back-button
    });

    // LOGIN_TC18 | Severity: B | Priority: Medium | Session persistence
    it('LOGIN_TC18: nhớ trạng thái đăng nhập khi refresh', async () => {
        await LoginPage.login(VALID_USER, VALID_PASS);
        await expect(DashboardPage.dashboardTag).toBeDisplayed();
        await browser.refresh();
        await expect(DashboardPage.dashboardTag).toBeDisplayed();
    });

    // LOGIN_TC19 | Severity: C | Priority: Low | Boundary/độ dài
    it('LOGIN_TC19: username quá dài (>255 ký tự)', async () => {
        await LoginPage.login('a'.repeat(300), VALID_PASS);

        await LoginPage.errorAlert.waitForDisplayed({ timeout: 15000 });
        await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
    });

    // LOGIN_TC20 | Severity: C | Priority: Low | Xử lý Unicode
    it('LOGIN_TC20: ký tự đặc biệt Unicode trong username', async () => {
        await LoginPage.login('Adminñ日本', VALID_PASS);

        await expect(LoginPage.errorAlert).toBeDisplayed();
        await expect(LoginPage.errorAlert).toHaveText(INVALID_CREDENTIALS);
    });
});
