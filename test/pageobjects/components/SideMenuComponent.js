class SideMenuComponent {
  get menuAdmin() {
    return $("a*=Admin");
  }
  get menuPim() {
    return $("a*=PIM");
  }
  get menuLeave() {
    return $("a*=Leave");
  }
  get menuRecruitment() {
    return $("a*=Recruitment");
  }
  get searchMenuInput() {
    return $('input[placeholder="Search"]');
  }

  async goTo(moduleName) {
    await this.searchMenuInput.setValue(moduleName);
    await $(`a*=${moduleName}`).click();
  }
}

export default new SideMenuComponent();
