const axios = require("axios")

// 拦截全局请求响应
axios.interceptors.response.use(res => {
    return res.data
})

/*
* 获取模板
* */
async function getZhuRongRepo() {
    return axios.get("https://api.github.com/orgs/zhurong-cli/repos")
}

/**
 * 获取仓库下的版本
 */

async function getTagsByRepo(repo) {
    return axios.get(`https://api.github.com/repos/zhurong-cli/${repo}/tags`);
}

module.exports = {
    getZhuRongRepo,
    getTagsByRepo
}