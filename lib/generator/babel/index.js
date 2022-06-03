// 这个是注入到package.json文件的内容

module.exports = (generator) => {
  generator.extendPackage({
    devDependencies: {
      "@vue/cli-plugin-babel": "^3.12.0",
      "babel-eslint": "^10.0.1",
    },
  });
};
