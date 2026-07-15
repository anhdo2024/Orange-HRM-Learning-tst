import Page from './BasePage.js';

class LoginPage extends Page {
    get inputUsername() {
        return $('//input[@name="username"]');
    }

    get inputPassword() {
        return $('//input[@name="password"]');
    }

    get btnSubmit() {
        return $('button[type="submit"]');
    }

    get errorAlert() {
        return $('.oxd-alert-content-text');
    }

    get requiredErrors() {
        return $$('.oxd-input-field-error-message');
    }

    get forgotPasswordLink() {
        return $('.orangehrm-login-forgot');
    }

    open() {
        return super.open('auth/login');
    }

    /**
     * @param {string} username
     */
    async setUsername(username) {
        await this.inputUsername.setValue(username);
    }

    /**
     * @param {string} password
     */
    async setPassword(password) {
        await this.inputPassword.setValue(password);
    }

    async clickLogin() {
        await this.btnSubmit.click();
    }

    /**
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(password);
        await this.btnSubmit.click();
    }

    /**
     * @returns {Promise<string>}
     */
    async getErrorText() {
        return this.errorAlert.getText();
    }

    /**
     * @returns {Promise<number>}
     */
    async getRequiredErrorCount() {
        const errors = await this.requiredErrors;
        return errors.length;
    }

    async clickForgotPassword() {
        await this.forgotPasswordLink.click();
    }
}

export default new LoginPage();
