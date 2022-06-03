const execa = require("execa");

module.exports = function run(command, cwd, args) {
  if (!args) {
    [command, ...args] = command.split(/\s+/);
  }
  return execa(command, args, { cwd });
};
