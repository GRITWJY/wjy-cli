import { asyncRoutes, constantRoutes } from "@/router";

/**
 * 判断这个路由是不是自己权限范围内的
 * @param roles
 * @param route
 * @returns {boolean|*}
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role));
  } else {
    return true;
  }
}

/**
 *
 * 从路由表中获取哪些路由是自己权限范围内的
 * @param routes
 * @param roles
 * @returns {[]}
 */
export function filterAsyncRoutes(routes, roles) {
  const res = [];
  routes.forEach(route => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });
  return res;
}

const state = {
  routes: [], // 所有可用的路由
  addRoutes: [] // 额外添加的路由
};

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes;
    state.routes = constantRoutes.concat(routes);
  }
};

const actions = {
  // 动态生成路由
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes;
      // 筛选出符合的路由
      accessedRoutes = filterAsyncRoutes(asyncRoutes, roles);
      commit("SET_ROUTES", accessedRoutes);
      resolve(accessedRoutes);
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
