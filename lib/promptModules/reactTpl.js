module.exports = (api) => {
  api.injectFeature({
    name: "基本react-webpack配置项目",
    value: "reactTpl",
    short: "reactTpl",
    description:
      "react 项目的webpack配置, 没有使用官方create-app, 完整的 react + router + webpack 功能",
    checked: false,
  });
};
