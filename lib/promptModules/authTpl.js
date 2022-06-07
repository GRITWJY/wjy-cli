module.exports = (api) => {
  api.injectFeature({
    name: "权限认证登录模板",
    value: "authTpl",
    short: "authTpl",
    description: "权限认证登录模板， 已经封装好动态路由添加、登录功能",
    checked: false,
  });
};
