const { clearConsole } = require("@vue/cli-shared-utils");
const chalk = require("chalk");

exports.clearConsole = function clearConsoleWithTitle(checkUpdate) {
  let title = chalk.bold.blue(`Vue CLI v3`);
  clearConsole(title);
};
