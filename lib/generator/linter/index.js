module.exports = (generator, { lintOn }) => {
  // 渲染模板
  generator.render("./template", {});

  // 扩展pkg文件,默认添加prettier
  generator.extendPackage({
    scripts: {
      lint: "vue-cli-service lint",
    },
    devDependencies: {
      "@vue/cli-plugin-eslint": "^3.12.0",
      "@vue/eslint-config-prettier": "^5.0.0",
      eslint: "^5.16.0",
      "eslint-plugin-prettier": "^3.1.0",
      "eslint-plugin-vue": "^5.0.0",
      "lint-staged": "^8.1.5",
      prettier: "^1.18.2",
    },
  });

  if (lintOn.includes("commit")) {
    generator.extendPackage({
      gitHooks: {
        "pre-commit": "lint-staged",
      },
      "lint-staged": {
        "*.{js,vue}": ["vue-cli-service lint", "git add"],
      },
    });
  }
};
