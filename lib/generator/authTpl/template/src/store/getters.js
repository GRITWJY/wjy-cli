// 这里是把每个功能模块中需要全局用到的变量拿出来
const getters = {
  permission_routes: state => state.permission.routes,
  roles: state => state.user.roles
};

export default getters;
