// 这个是进行选择的单个选项，这里根据我自己平常用的情况，就删除一些列呃
exports.getPromptModules = () => {
  return ["babel", "router", "vuex", "cssPreprocessors", "linter"].map((file) =>
    require(`../promptModules/${file}`)
  );
};
