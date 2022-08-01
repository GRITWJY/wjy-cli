module.exports = {
  // 解析选项
  parserOptions: {
    ecmaVersion: 11, // ES语法版本,11版本
    sourceType: "module", // ES 模块化
    ecmaFeatures: {
      jsx: true, // react项目
    },
  },
  parser: "@babel/eslint-parser", // 支持最新的最终 ECMAScript 标准

  // 具体规则
  rules: {
    semi: 1,
    "array-callback-return": 1,
    "default-case": "warn",
    eqeqeq: 1,
    "no-var": "error",
    "no-undef": 0,
  },
  // 继承现有规则
  // react: react-app
  // vue: plugin:vue/essential
  // eslint: eslint:recommended
  extends: ["eslint:recommended"],
  // 我们的规则会覆盖掉继承的
  plugins: ["import"],
};
