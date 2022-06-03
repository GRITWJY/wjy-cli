module.exports = (api) => {
  // 注入功能
  api.injectFeature({
    name: "Babel",
    value: "babel",
    short: "Babel",
    description:
      "Transpile modern JavaScript to older versions (for compatibility)",
    link: "https://babeljs.io/",
    checked: true, // 默认为需要
  });
};
