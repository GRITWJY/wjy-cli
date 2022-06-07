import { md5 } from "@/utils/util";
import { getToken, setToken } from "@/utils/auth";
import session from "@/utils/session";

const state = {
  token: getToken(), // token用cookie存储，这样发请求时会自带token
  info: session.getUserInfo().user && session.getUserInfo().user[0], // 用户信息用session存储，浏览器关闭后信息自动删除
  roles: []
};

const mutations = {
  // 设置用户信息
  SET_INFO: (state, info) => {
    state.info = { ...info };
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  }
};

const actions = {
  // 登录接口
  login({ commit }, userInfo) {
    let { user_num, user_pwd } = userInfo;
    // 去空格+ 加密
    user_num = user_num.trim(); // 去空格
    user_pwd = md5(user_pwd + "wjygrit"); // 加密

    // 返回一个promise请求
    return new Promise(resolve => {
      // 这里我就不用mock的测试了，大家自己写逻辑
      // 设置信息
      commit("SET_INFO", {});
      commit("SET_TOKEN", "12456");
      // 存储token
      setToken("123456");
      // 存储用户信息
      session.setUserInfo({});
      // 将角色传给登录页，做路由跳转判断，当然也可以在这里做，都行
      resolve("admin");
    });
  },

  // 这个是鉴权的接口， 这个是用在登录成功后的跳转时，获取角色信息，然后动态渲染路由
  // 原理是这样，因为我们登录后就要跳转，但刚登陆完路由肯定是还没渲染好的，
  // 当然也可以登陆完后就直接渲染，但token的真实性有待考验
  // 所以，登录就只判断信息是否正确， 再加一个路由跳转拦截器，
  // 跳转时判断路由是否已分配，没有分配就去验证token有效性，并动态渲染路由
  // 已分配，就直接跳转
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      // const { roles, name, avatar, introduction } = data;
      const roles = ["admin"];

      // roles must be a non-empty array
      if (!roles || roles.length <= 0) {
        reject("getInfo: roles must be a non-null array!");
      }

      commit("SET_ROLES", roles);
      resolve({ roles });
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
