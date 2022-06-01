module.exports = class PromptModuleAPI {
  constructor(creator) {
    this.creator = creator;
  }

  // 注入功能
  injectFeature(feature) {
    this.creator.featurePrompt.choices.push(feature);
  }

  // 注入插件
  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt);
  }

  // 注入选项
  injectOptionForPrompt(name, option) {
    this.creator.injectedPrompts
      .find((f) => {
        return f.name === name;
      })
      .choices.push(option);
  }

  onPromptComplete(cb) {
    this.creator.promptCompleteCbs.push(cb);
  }
};
