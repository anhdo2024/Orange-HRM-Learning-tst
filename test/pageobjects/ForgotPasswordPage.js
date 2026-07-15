import Page from './BasePage.js';

class ForgotPasswordPage extends Page {
    get inputUsername() {
        return $('//input[@name="username"]');
    }

    get btnReset() {
        return $('button[type="submit"]');
    }

    get btnCancel() {
        return $('.oxd-button--ghost');
    }

    get cardTitle() {
        return $('.orangehrm-card-title');
    }

    get successMessage() {
        return $('//*[contains(text(),"Reset Password link sent")]');
    }

    /**
     * @param {string} username
     */
    async resetPassword(username) {
        await this.inputUsername.setValue(username);
        await this.btnReset.click();
    }

    async cancel() {
        await this.btnCancel.click();
    }

    /**
     * @returns {Promise<string>}
     */
    async getCardTitle() {
        return this.cardTitle.getText();
    }
}

export default new ForgotPasswordPage();
