import Page from "./BasePage.js";

class DashboardPage extends Page {
  open() {
    return super.open("dashboard/index");
  }

  get dashboardTag() {
    return $('//h6[text()="Dashboard"]');
  }

  get userDdn() {
    return $(".oxd-userdropdown-tab");
  }

  get logoutLink() {
    return $('//a[text()="Logout"]');
  }

  async logout() {
    await this.userDdn.click();
    await this.logoutLink.click();
  }
}

export default new DashboardPage();
