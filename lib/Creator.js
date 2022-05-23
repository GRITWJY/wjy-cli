const {getZhuRongRepo, getTagsByRepo} = require("./api")
const inquirer = require("inquirer")
const {loading} = require("./util")
const path = require("path")
const util = require("util")
const chalk = require("chalk");
const downloadGitRepo = require("download-git-repo")


class Creator {
    // 项目名称及项目路径
    constructor(name, target) {
        this.name = name
        this.target = target
        this.downloadGitRepo = util.promisify(downloadGitRepo)
    }

    // 创建项目部分
    async create() {
        // console.log(this.name, this.target)
        // 仓库信息 - 模板信息
        let repo = await this.getRepoInfo();

        // 标签信息 - 版本信息
        let tag = await this.getTagInfo(repo);

        await this.download(repo,tag)
        console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`);
        console.log(`\r\n  cd ${chalk.cyan(this.name)}`);
        console.log("  npm install");
        console.log("  npm run serve\r\n");
    }

    // 获取模板信息及用户选择的模板
    async getRepoInfo() {
        // 获取组织下的仓库信息
        let repoList = await loading(
            "waiting for fetching template",
            getZhuRongRepo
        );

        // 提取仓库名
        const repos = repoList.map((item) => item.name)
        // 选取模板信息
        let {repo} = await new inquirer.prompt([
            {
                name: "repo",
                type: "list",
                message: "Please choose a template",
                choices: repos
            }
        ])
        return repo
    }

    // 获取版本信息及用户选择的版本
    async getTagInfo(repo) {
        let tagList = await loading(
            "waiting for fetching version",
            getTagsByRepo,
            repo
        );
        const tags = tagList.map((item) => item.name);
        // 选取模板信息
        let {tag} = await new inquirer.prompt([
            {
                name: "tag",
                type: "list",
                message: "Please choose a version",
                choices: tags
            }
        ])
        return tag;
    }

    async download(repo,tag) {
        // 模板下载地址
        const templateUrl = `zhurong-cli/${repo}${tag ? "#" + tag : ""}`;
        // 调用 downloadGitRepo 方法将对应模板下载到指定目录
        await loading(
            "downloading template, please wait",
            this.downloadGitRepo,
            templateUrl,
            path.resolve(process.cwd(),this.target)
        )
    }
}

module.exports = Creator;

