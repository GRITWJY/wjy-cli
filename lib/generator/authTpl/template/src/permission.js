import router from "@/router";
import store from "@/store";
import { getToken } from "@/utils/auth";

/**
 * 鉴权功能
 * 第一次跳转，把路由动态加载上
 * 之后的每次跳转都是自己权限内的
 * */
router.beforeEach(async (to, from, next) => {
  // 如果是登录界面，就不用做权限认证了
  if (to.path === "/login" || to.path === "/") {
    next();
    return;
  }
  // 获取token
  const hasToken = getToken();
  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
    } else {
      // 跳转到其他页面，判断是否已经添加过路由
      const hasRoles =
        store.getters.permission_routes &&
        store.getters.permission_routes.length > 0;
      if (hasRoles) {
        next();
      } else {
        // 调用鉴权接口验证token真实性，并返回角色
        const { roles } = await store.dispatch("user/getInfo");
        // 获取对应路由
        const accessRoutes = await store.dispatch(
          "permission/generateRoutes",
          roles
        );
        // 添加路由
        router.addRoutes(accessRoutes);
        // 允许跳转
        next({ ...to, replace: true }); // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
      }
    }
  }
});
