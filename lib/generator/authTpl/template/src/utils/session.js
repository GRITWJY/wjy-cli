const USER_KEY = "user";
const USER_TERM = "term";
export default {
  setItem(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
  },
  // 获取某一个模块下面的属性user下面的userName
  getItem(key) {
    return JSON.parse(sessionStorage.getItem(key) || "{}");
  },
  remove(key) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  },

  setUserInfo(data) {
    this.setItem(USER_KEY, data);
  },
  getUserInfo() {
    return this.getItem(USER_KEY);
  },

  setTerm(data) {
    this.setItem(USER_TERM, data);
  },
  removeTERM() {
    this.remove(USER_TERM);
  }
};
