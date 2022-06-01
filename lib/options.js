const fs = require("fs");
const { getRcPath } = require("./util/rcPath");
const cloneDeep = require("lodash.clonedeep");
const { error } = require("@vue/cli-shared-utils/lib/logger");
const {
  createSchema,
  validate,
} = require("@vue/cli-shared-utils/lib/validate");

// 这个应该是预设的缓存位置
const rcPath = (exports.rcPath = getRcPath(".wjyrc"));

const presetSchema = createSchema((joi) =>
  joi.object().keys({
    bare: joi.boolean(),
    useConfigFiles: joi.boolean(),
    router: joi.boolean(),
    routerHistoryMode: joi.boolean(),
    vuex: joi.boolean(),
    // TODO: remove 'sass' or make it equivalent to 'dart-sass' in v4
    cssPreprocessor: joi
      .string()
      .only(["sass", "dart-sass", "node-sass", "less", "stylus"]),
    plugins: joi.object().required(),
    configs: joi.object(),
  })
);

exports.validatePreset = (preset) =>
  validate(preset, presetSchema, (msg) => {
    error(`invalid preset options: ${msg}`);
  });

// 验证保存的预设是否正确
const schema = createSchema((joi) =>
  joi.object().keys({
    latestVersion: joi.string().regex(/^\d+\.\d+\.\d+$/),
    lastChecked: joi.date().timestamp(),
    packageManager: joi.string().only(["yarn", "npm", "pnpm"]),
    useTaobaoRegistry: joi.boolean(),
    presets: joi.object().pattern(/^/, presetSchema),
  })
);

// 默认预设
exports.defaultPreset = {
  router: false,
  vuex: false,
  useConfigFiles: false,
  cssPreprocessor: undefined,
  plugins: {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      config: "base",
      lintOn: ["save"],
    },
  },
};

exports.defaults = {
  lastChecked: undefined,
  latestVersion: undefined,

  packageManager: undefined,
  useTaobaoRegistry: undefined,
  presets: {
    default: exports.defaultPreset,
  },
};

let cachedOptions;
exports.loadOptions = () => {
  // 如果有缓存
  if (cachedOptions) {
    return cachedOptions;
  }
  if (fs.existsSync(rcPath)) {
    try {
      cachedOptions = JSON.parse(fs.readFileSync(rcPath, "utf8"));
    } catch (e) {
      error(
        `Error loading saved preferences: ` +
          `~/.wjyrc may be corrupted or have syntax errors. ` +
          `Please fix/delete it and re-run wjy-cli in manual mode.\n` +
          `(${e.message})`
      );
      exit(1);
    }
    validate(cachedOptions, schema, () => {
      error(
        `~/.wjyrc may be outdated. ` +
          `Please delete it and re-run wjy-cli in manual mode.`
      );
    });

    return cachedOptions;
  } else {
    return {};
  }
};

exports.saveOptions = (toSave) => {
  const options = Object.assign(cloneDeep(exports.loadOptions()), toSave);
  for (const key in options) {
    if (!(key in exports.defaults)) {
      delete options[key];
    }
  }
  cachedOptions = options;
  try {
    fs.writeFileSync(rcPath, JSON.stringify(options, null, 2));
  } catch (e) {
    error(
      `Error saving preferences: ` +
        `make sure you have write access to ${rcPath}.\n` +
        `(${e.message})`
    );
  }
};

exports.savePreset = (name, preset) => {
  const presets = cloneDeep(exports.loadOptions().presets || {});
  presets[name] = preset;
  exports.saveOptions({ presets });
};
