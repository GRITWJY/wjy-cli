const ConfigTransform = require("./ConfigTransform");

const defaultConfigTransforms = {
  babel: new ConfigTransform({
    file: {
      js: ["babel.config.js"],
    },
  }),
  postcss: new ConfigTransform({
    file: {
      js: ["postcss.config.js"],
      json: [".postcssrc.json", ".postcssrc"],
      yaml: [".postcssrc.yaml", ".postcssrc.yml"],
    },
  }),
  eslintConfig: new ConfigTransform({
    file: {
      js: [".eslintrc.js"],
      json: [".eslintrc", ".eslintrc.json"],
      yaml: [".eslintrc.yaml", ".eslintrc.yml"],
    },
  }),
  jest: new ConfigTransform({
    file: {
      js: ["jest.config.js"],
    },
  }),
  browserslist: new ConfigTransform({
    file: {
      lines: [".browserslistrc"],
    },
  }),
};

const reservedConfigTransforms = {
  vue: new ConfigTransform({
    file: {
      js: ["vue.config.js"],
    },
  }),
};

module.exports = class Generator {
  constructor(
    context,
    {
      pkg = {},
      plugins = [],
      completeCbs = [],
      files = {},
      invoking = false,
    } = {}
  ) {
    this.context = context;
    this.plugins = plugins;
    this.originalPkg = pkg;
    this.pkg = Object.assign({}, pkg);
    this.completeCbs = completeCbs;
    this.invoking = invoking;
    this.files = files;

    const cliService = plugins.find((p) => p.id === "@vue/cli-service");

    // 这里是根据pkg文件来得出options，但我们现在基本上没用到
    const rootOptions = cliService ? cliService.options : inferRootOptions(pkg);
    // plugins.forEach(({ id, apply, options }) => {
    //   const api = new GeneratorAPI(id, this, options, rootOptions);
    // });
  }

  async generate({ extractConfigFiles = false, checkExisting = false } = {}) {
    const initialFiles = Object.assign({}, this);

    // 从包中提取配置json转换为专用文件,先把包中的配置转成文件
    this.extractConfigFiles(extractConfigFiles, checkExisting);
  }

  extractConfigFiles(extractAll, checkExisting) {
    const configTransforms = Object.assign(
      {},
      defaultConfigTransforms,
      this.configTransforms,
      reservedConfigTransforms
    );
    // todo
  }
};
