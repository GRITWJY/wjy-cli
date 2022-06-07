import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

/**
 * 不需要权限
 * */
export const constantRoutes = [
  {
    path: "/",
    component: () => import("@/views/login/index")
  }
];

/**
 * 需要权限的
 * */
export const asyncRoutes = [
  {
    path: "/async",
    name: "asyncView",
    component: () => import("@/views/asyncViews/index"),
    meta: { roles: ["admin"] }
  }
];

const createRoute = () =>
  new VueRouter({
    routes: constantRoutes
  });

const router = createRoute();

export function resetRouter() {
  const newRouter = createRoute();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
