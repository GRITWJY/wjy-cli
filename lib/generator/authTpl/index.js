module.exports = (generator) => {
  generator.render("./template");

  generator.extendPackage({
    scripts: {
      build: "vue-cli-service build",
      lint: "vue-cli-service lint",
      serve: "vue-cli-service serve",
    },
    "lint-staged": {
      "*.{js,vue}": ["vue-cli-service lint", "git add"],
    },
    dependencies: {
      vue: "^2.6.14",
      "vue-router": "3.0.2",
      vuex: "^3.0.1",
      "element-ui": "^2.15.7",
      "js-cookie": "^3.0.1",
    },
    devDependencies: {
      "@vue/cli-plugin-babel": "^3.12.0",
      "@vue/cli-plugin-eslint": "^3.12.0",
      "@vue/cli-service": "^3.12.0",
      "@vue/eslint-config-prettier": "^5.0.0",
      "babel-eslint": "^10.0.1",
      eslint: "^5.16.0",
      "eslint-plugin-prettier": "^3.1.0",
      "eslint-plugin-vue": "^5.0.0",
      "lint-staged": "^8.1.5",
      "node-sass": "^4.12.0",
      prettier: "^1.18.2",
      "sass-loader": "^8.0.0",
      "vue-template-compiler": "^2.6.14",
    },
    postcss: {
      plugins: {
        autoprefixer: {},
      },
    },
    browserslist: ["> 1%", "last 2 versions"],
    gitHooks: {
      "pre-commit": "lint-staged",
    },
  });
};
