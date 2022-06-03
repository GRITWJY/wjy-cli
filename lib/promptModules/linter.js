module.exports = (api) => {
  api.injectFeature({
    name: "Linter / Formatter",
    value: "linter",
    short: "Linter",
    description: "Check and enforce code quality with ESLint or Prettier",
    link: "https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint",
    plugins: ["eslint"],
    checked: true,
  });

  // 注入选项
  api.injectPrompt({
    name: "eslintConfig",
    when: (answers) => answers.features.includes("linter"),
    type: "list",
    message: "Pick a linter / formatter config:",
    description: "这里就先只给prettier了，之后研究了其他格式化的再添加",
    choices: () => [
      {
        name: "ESLint + Prettier",
        value: "prettier",
        short: "Prettier",
      },
    ],
  });

  api.injectPrompt({
    name: "lintOn",
    message: "Pick additional lint features:",
    when: (answers) => answers.features.includes("linter"),
    type: "checkbox",
    choices: [
      {
        name: "Lint on save",
        value: "save",
        checked: true,
      },
      {
        name: "Lint and fix on commit",
        value: "commit",
      },
    ],
  });
};
