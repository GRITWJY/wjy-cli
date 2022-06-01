const chalk = require("chalk");
const path = require("path");
const semver = require("semver");
const execa = require("execa");
const { installDeps } = require("./util/installDeps");
const Generator = require("./Generator");
const EventEmitter = require("events");
const writeFileTree = require("./util/writeFileTree");
const sortObject = require("./util/sortObject");

const { formatFeatures } = require("./util/features");
const { clearConsole } = require("./util/clearConsole");
const getVersions = require("./util/getVersions");
const cloneDeep = require("lodash.clonedeep");
const inquirer = require("inquirer");
const {
  defaults,
  loadOptions,
  validatePreset,
  savePreset,
} = require("./options");
const PromptModuleAPI = require("./PromptModuleAPI");
const {
  log,
  logWithSpinner,
  exit,
  stopSpinner,
  loadModule,
} = require("@vue/cli-shared-utils");

const isManualMode = (answers) => answers.preset === "__manual__";

class Creator extends EventEmitter {
  // 项目名称/项目路径/预设
  constructor(name, context, promptModules) {
    super();
    this.name = name;
    this.context = context;
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    this.presetPrompt = presetPrompt;
    this.featurePrompt = featurePrompt;
    this.outroPrompt = this.resolveOutroPrompts();
    this.createCompleteCbs = [];
    this.promptCompleteCbs = [];
    this.injectedPrompts = [];

    this.run = this.run.bind(this);

    const promptAPI = new PromptModuleAPI(this);
    promptModules.forEach((m) => m(promptAPI));
  }

  async create() {
    const { run, name, context, createCompleteCbs } = this;
    let preset = await this.promptAndResolvePreset();

    // 处理前先深克隆一遍
    preset = cloneDeep(preset);

    // 注入核心服务
    preset.plugins["@vue/cli-service"] = Object.assign(
      {
        projectName: name,
      },
      preset
    );

    const packageManager = "npm";

    await clearConsole();
    logWithSpinner(`✨`, `Creating project in ${chalk.yellow(context)}`);
    this.emit("creation", { event: "creating" });

    // 这里的版本我就统一为4.15的了，等之后升级到vue3后再改
    const { current } = await getVersions();

    /*******************初始化插件*********************/
    // 1.0.0
    const currentMinor = `${semver.major(current)}.${semver.minor(current)}.0`;
    const pkg = {
      name,
      version: "0.1.0",
      private: true,
      devDependencies: {},
    };

    // [ '@vue/cli-plugin-eslint', '@vue/cli-service' ]
    const deps = Object.keys(preset.plugins);

    deps.forEach((dep) => {
      if (preset.plugins[dep]._isPreset) {
        return;
      }
      pkg.devDependencies[dep] =
        preset.plugins[dep].version ||
        (/^@vue/.test(dep) ? `^${currentMinor}` : `latest`);
    });
    await writeFileTree(context, {
      "package.json": JSON.stringify(pkg, null, 2),
    });

    /*******************初始化git仓库*********************/
    logWithSpinner(`🗃`, `Initializing git repository...`);
    this.emit("creation", { event: "git-init" });
    await run("git init");
    stopSpinner();

    log(`⚙  Installing CLI plugins. This might take a while...`);
    log();
    this.emit("creation", { event: "plugins-install" });

    /**
     * context: 文件路径
     * packageManager: npm
     * register:undefined
     */
    //todo
    // await installDeps(context, packageManager);

    // 以上是生成 cli-plugin-eslint 和 cli-service 这两个插件

    /**run generators，这里应该就是生成文件的时候了*/
    this.emit("creation", { event: "invoking-generators" });
    const plugins = await this.resolvePlugins(preset.plugins);

    // 所有的内容都在 cli-service里的 options中了，接下来是一个重大板块， generator， 这里应该就是生成文件目录和其他依赖的功能函数
    const generator = new Generator(context, {
      pkg,
      plugins,
      completeCbs: createCompleteCbs,
    });

    await generator.generate({
      extractConfigFiles: preset.useConfigFiles,
    });

    exit(1);
  }

  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    return execa(command, args, { cwd: this.context });
  }

  getPresets() {
    const savedOptions = loadOptions();
    // 一个是自己保存的预设，一个是默认的预设
    return Object.assign({}, savedOptions.presets, defaults.presets);
  }

  // 获取了 presetPrompt list，在初始化项目的时候提供选择
  resolveIntroPrompts() {
    const presets = this.getPresets(); // 获取预设
    const presetChoices = Object.keys(presets).map((name) => {
      return {
        name: `${name}(${formatFeatures(presets[name])})`,
        value: name,
      };
    });

    const presetPrompt = {
      name: "preset",
      type: "list",
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: "Manually select features",
          value: "__manual__",
        },
      ],
    };
    const featurePrompt = {
      name: "features",
      when: isManualMode,
      type: "checkbox",
      message: "Check the features needed for your project:",
      choices: [],
      pageSize: 10,
    };
    return {
      presetPrompt,
      featurePrompt,
    };
  }

  // 外部的选择
  resolveOutroPrompts() {
    const outroPromtps = [
      {
        name: "useConfigFiles",
        when: isManualMode,
        type: "list",
        message:
          "Where do you prefer placing config for Babel, PostCSS, ESLint, etc.?",
        choices: [
          {
            name: "In dedicated config files",
            value: "files",
          },
          {
            name: "In package.json",
            value: "pkg",
          },
        ],
      },

      {
        name: "save",
        when: isManualMode,
        type: "confirm",
        message: "Save this as a preset for future projects?",
        default: false,
      },
      {
        name: "saveName",
        when: (answers) => answers.save,
        type: "input",
        message: "Save preset as:",
      },
    ];

    return outroPromtps;
  }

  async promptAndResolvePreset(answers = null) {
    if (!answers) {
      // 清楚控制台内容，并放置当前版本和更新信息
      clearConsole(true);
      answers = await inquirer.prompt(this.resolveFinalPrompts());
    }
    let preset;
    if (answers.preset && answers.preset !== "__manual__") {
      // 默认预设或者自己指定的预设
      preset = await this.resolvePreset(answers.preset);
    } else {
      preset = {
        useConfigFiles: answers.useConfigFiles === "files",
        plugins: {},
      };

      answers.features = answers.features || [];
      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
    }

    validatePreset(preset);

    // 保存预设
    if (answers.save && answers.saveName) {
      savePreset(answers.saveName, preset);
    }
    return preset;
  }

  // 解析已经存在的预设
  async resolvePreset(name) {
    let preset;
    // 获取自己保存的预设
    const savedPresets = loadOptions().presets || {};

    if (name in savedPresets) {
      preset = savedPresets[name];
    }

    if (name === "default" && !preset) {
      preset = defaults.presets.default;
    }
    if (!preset) {
      error(`preset "${name}" not found.`);
      const presets = Object.keys(savedPresets);
      if (presets.length) {
        log();
        log(`available presets:\n${presets.join(`\n`)}`);
      } else {
        log(`you don't seem to have any saved preset.`);
        log(`run vue-cli in manual mode to create a preset.`);
      }
      exit(1);
    }

    return preset;
  }

  async resolvePlugins(rawPlugins) {
    rawPlugins = sortObject(rawPlugins, ["@vue/cli-service"], true);
    const plugins = [];
    for (const id of Object.keys(rawPlugins)) {
      const apply = loadModule(`${id}/generator`, this.context) || (() => {});
      let options = rawPlugins[id] || {};
      if (options.prompts) {
        const prompts = loadModule(`${id}/prompts`, this.context);
        if (prompts) {
          log();
          log(`${chalk.cyan(options._isPreset ? `Preset options:` : id)}`);
          options = await inquirer.prompt(prompts);
        }
      }
      plugins.push({ id, apply, options });
    }
    return plugins;
  }

  // 解析最终的选项
  resolveFinalPrompts() {
    // 注意：这里的featurePrompts和presetPrompt

    // 这个是给router啊，等选择插件后的一些其他操作
    // 因为默认值预设里没有router，但这里调用时 answers.features....
    // 控制台就会报错
    // 这里就把原来的when保存下来，没有的给个默认值
    // 最后判断是否是manual，对了，是因为在router.js中没有isManualMode
    this.injectedPrompts.forEach((prompt) => {
      const originalWhen = prompt.when || (() => true);
      prompt.when = (answers) => {
        return isManualMode(answers) && originalWhen(answers);
      };
    });

    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompt,
    ];
    return prompts;
  }
}

module.exports = Creator;
