const Creator = require("./Creator");
class promptCreator extends Creator {
  constructor() {
    super();
    this.featurePrompt = {
      name: "features",
      message: "选择功能创建项目:",
      pageSize: 10,
      type: "checkbox",
      choices: [],
    };

    this.injectedPrompts = [];
  }
}
module.exports = promptCreator;
