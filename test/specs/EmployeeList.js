import EmployeeListPage from "../pageobjects/EmployeeListPage.js";
import LoginPage from "../pageobjects/LoginPage.js";

describe("Employee List", () => {
  before(async () => {
    await LoginPage.open();
    await LoginPage.login("Admin", "admin123");
  });

  it("TC01: Search employee by name", async () => {
    await EmployeeListPage.open();
    await EmployeeListPage.searchEmployeeByName("John Doe");

    await expect(EmployeeListPage.employeeRows).toBeElementsArrayOfSize(1);
  });
});
