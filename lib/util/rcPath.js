const os = require("os");
const path = require("path");

// 这个应该是在不同环境下获取不同的路径吧，

exports.getRcPath = (file) => {
  return path.join(os.homedir(), file);
};
