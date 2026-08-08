import Page from "./BasePage.js";

class EmployeeListPage extends Page {
  open() {
    return super.open("pim/viewEmployeeList");
  }

  get employeeNameTbx() {
    return $("//label[text()='Employee Name']/../following-sibling::div//input");
  }

  get submitBtn() {
    return $("//button[@type='submit']");
  }

  get employeeRows() {
    return $$("//div[@class='oxd-table-body']//div[@role='row']");
  }

  async searchEmployeeByName(name) {
    await this.employeeNameTbx.setValue(name);
    await this.submitBtn.click();
  }

  async getCurrentEmployeeRecords() {
    return this.employeeRows.length;
  }
}

export default new EmployeeListPage();
