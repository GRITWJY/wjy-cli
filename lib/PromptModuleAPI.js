module.exports = class PromptModuleAPI {
  constructor(creator) {
    this.creator = creator;
  }

  // 功能选项注入
  injectFeature(feature) {
    this.creator.featurePrompt.choices.push(feature);
  }

  // 选项注入
  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt);
  }
};
