const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const Inquirer = require("inquirer");
const Creator = require("./Creator");
const validateProjectName = require("validate-npm-package-name");
const { getPromptModules } = require("./util/createTool");

module.exports = async function (name, options) {
  // 获取当前工作目录
  const cwd = process.cwd();

  // 拼接得到项目目录
  const targetDir = path.join(cwd, name);
  // 验证项目名称，这个也加上吧
  const result = validateProjectName(name);

  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    result.errors &&
      result.errors.forEach((err) => {
        console.error(chalk.red.dim("Error: " + err));
      });
    result.warnings &&
      result.warnings.forEach((warn) => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
    process.exit(1);
  }

  // 判断目录是否存在，这里就给用户选择，不给强制选项了
  if (fs.existsSync(targetDir)) {
    let { isOverwrite } = await new Inquirer.prompt([
      // 返回值为promise
      {
        name: "isOverwrite",
        type: "list",
        message: "Target directory exists, Please choose an action",
        choices: [
          { name: "Overwrite", value: true },
          { name: "Cancel", value: false },
        ],
      },
    ]);

    if (!isOverwrite) {
      console.log("cancel");
      return;
    } else {
      console.log("\r\nRemoving");
      await fs.remove(targetDir);
    }
  }

  // 创建项目,传入项目名称，项目路径，项目需要安装的插件的选项
  // todo: 之后的步骤是
  // 1. 询问是选择模板还是 单个依赖
  // 2. 选择模板，则从github中拉取下来，方法按照第一次的提交来弄
  // 3. 选择单个依赖，先给出几个预设，然后再就是自定义了
  const creator = new Creator(name, targetDir, getPromptModules());

  // 这里就不给选项了
  await creator.create();
};
