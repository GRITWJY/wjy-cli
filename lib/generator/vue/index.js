module.exports = (generator) => {
  generator.render("./template");

  generator.extendPackage({
    scripts: {
      serve: "vue-cli-service serve",
      build: "vue-cli-service build",
    },
    dependencies: {
      vue: "^2.6.14",
    },
    postcss: {
      plugins: {
        autoprefixer: {},
      },
    },
    devDependencies: {
      "vue-template-compiler": "^2.6.14",
      "node-sass": "^4.12.0",
      "@vue/cli-service": "^3.12.0",
      "sass-loader": "^8.0.0",
    },
  });

  generator.extendPackage({
    browserslist: ["> 1%", "last 2 versions"],
  });
};
