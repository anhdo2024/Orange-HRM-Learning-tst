import Page from './BasePage.js';

class DashboardPage extends Page {
    open() {
        return super.open('dashboard/index');
    }

    get dashboardTag() {
        return $('//h6[text()="Dashboard"]');
    }

    get userDropdown() {
        return $('.oxd-userdropdown-tab');
    }

    get logoutLink() {
        return $('//a[text()="Logout"]');
    }

    async logout() {
        await this.userDropdown.click();
        await this.logoutLink.click();
    }
}

export default new DashboardPage();
