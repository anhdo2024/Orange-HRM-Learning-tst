import LoginPage from '../pageobjects/LoginPage.js';
import DashboardPage from '../pageobjects/DashboardPage.js';

describe('My Login application', () => {
    it('TC01: should login with valid credentials', async () => {
        await LoginPage.open()
        await LoginPage.login('admin', 'admin123');

        await expect(LoginPage.btnSubmit).not.toBeDisplayed();
        await expect(DashboardPage.dashboardTag).toBeDisplayed();
    })
})

