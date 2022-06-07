const Creator = require("./Creator");
class tplCreator extends Creator {
  constructor() {
    super();
    this.featurePrompt = {
      name: "features",
      message: "选择一个模板创建项目:",
      type: "list",
      choices: [],
    };

    this.injectedPrompts = [];
  }
}

module.exports = tplCreator;
