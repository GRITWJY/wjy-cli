module.exports = (api) => {
  api.injectFeature({
    name: "基本vue-webpack配置项目",
    value: "vueTpl",
    short: "vueTpl",
    description:
      "vue 项目的webpack配置, 没有使用官方create-app, 完整的 vue + router + webpack 功能",
    checked: false,
  });
};
