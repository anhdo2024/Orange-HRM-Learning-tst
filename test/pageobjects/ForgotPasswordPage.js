import Page from "./BasePage.js";

class ForgotPasswordPage extends Page {
  get usernameTbx() {
    return $('//input[@name="username"]');
  }

  get resetBtn() {
    return $('button[type="submit"]');
  }

  get cancelBtn() {
    return $(".oxd-button--ghost");
  }

  get cardTitle() {
    return $(".orangehrm-card-title");
  }

  get successMessage() {
    return $('//*[contains(text(),"Reset Password link sent")]');
  }

  /**
   * @param {string} username
   */
  async resetPassword(username) {
    await this.usernameTbx.setValue(username);
    await this.resetBtn.click();
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  /**
   * @returns {Promise<string>}
   */
  async getCardTitle() {
    return this.cardTitle.getText();
  }
}

export default new ForgotPasswordPage();
