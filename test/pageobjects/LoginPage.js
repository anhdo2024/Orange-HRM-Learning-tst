import { $ } from '@wdio/globals'
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

    open() {
        return super.open('auth/login');
    }

    async login(username, password) {
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(password);
        await this.btnSubmit.click();
    }
}

export default new LoginPage();
