import Vue from "vue";
import Vuex from "vuex";
import getters from "@/store/getters";

Vue.use(Vuex);

// 获取 modules 下的文件，每一个文件就是 一个独立功能模块
const modulesFiles = require.context("./modules", true, /\.js$/);

// 遍历每个文件，把他们注入到modules中，命名以文件名命名
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // 从文件名中获取模块名称，即把后面的 .js 去掉
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
  // 获取文件内容
  const value = modulesFiles(modulePath);
  // 获取到 default内容
  modules[moduleName] = value.default;
  // 返回 modules
  return modules;
}, {});
// 注意这里是对象哦

const store = new Vuex.Store({
  modules, // 所有的功能模块
  getters // 全局变量，可以用 ...mapGetters(["question"])获取
});

export default store;
