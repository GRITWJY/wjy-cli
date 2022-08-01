module.exports = {
  // @babel/preset-env: 使用最新的js
  // @babel/preset-react: 编译jsx
  // @babel/preset-ts: 编译ts
  presets: [
    [
      "@babel/preset-env",
      { useBuiltIns: "usage", corejs: { version: "3", proposals: true } },
    ],
  ],
};
