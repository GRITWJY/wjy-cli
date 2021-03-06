const execa = require("execa");
const EventEmitter = require("events");

const packageManagerConfig = {
  npm: {
    installPackage: ["install", "--loglevel", "error"],
  },
};

class InstallProgress extends EventEmitter {
  constructor() {
    super();
    this._progress = -1;
  }

  get progress() {
    return this._progress;
  }

  set progress(value) {
    this._progress = value;
    this.emit("progress", value);
  }

  get enabled() {
    return this._progress !== -1;
  }

  set enabled(value) {
    this.progress = value ? 0 : -1;
  }

  log(value) {
    this.emit("log", value);
  }
}

const progress = (exports.progress = new InstallProgress());

function executeCommand(command, args, targetDir) {
  return new Promise((resolve, reject) => {
    progress.enabled = false;

    const child = execa(command, args, {
      cwd: targetDir,
      stdio: ["inherit", "inherit", "inherit"],
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(" ")}`);
        return;
      }
      resolve();
    });
  });
}

exports.installPackages = async function installPackages(targetDir, command) {
  // 检查包是否合格
  // command 是npm 不用管了

  // 之后执行的参数
  const args = packageManagerConfig[command].installPackage;

  // 执行命令
  await executeCommand(command, args, targetDir);
};
