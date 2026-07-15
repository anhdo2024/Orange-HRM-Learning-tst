import { $ } from '@wdio/globals'
import Page from './BasePage.js';

class DashboardPage extends Page {
    open() {
        return super.open('dashboard/index');
    }

    get dashboardTag() {
        return $('//h6[text()="Dashboard"]');
    }
}

export default new DashboardPage();
