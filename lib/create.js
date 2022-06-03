const path = require("path");
const Creator = require("./Creator");
const PromptModuleAPI = require("./PromptModuleAPI");
const clearConsole = require("./utils/clearConsole");
const inquirer = require("inquirer");
const Generator = require("./Generator");
const { installPackages } = require("./utils/executeCommand");
const run = require("./utils/runCommand");

async function create(name) {
  const creator = new Creator();
  // 获取提示语
  const promptModules = getPromptModules();
  // 获取API，获取PromptModuleAPI,并把creator() 传入
  const promptAPI = new PromptModuleAPI(creator);
  // 执行模板里面的一些函数，执行 提示语，使其都注入
  promptModules.forEach((m) => m(promptAPI));

  // 清空控制台
  clearConsole();

  // 弹出提示语进行交互,获取最终prompt
  const answers = await inquirer.prompt(creator.getFinalPrompts());
  /*
  {
    features: [ 'babel', 'css-preprocessor', 'linter', 'router', 'vuex' ],
    cssPreprocessor: 'node-sass',
    eslintConfig: 'prettier',
    lintOn: [ 'save', 'commit' ],
    historyMode: false
   }
  * */

  // 创建package.json 文件内容， 这里我就用vue-cli的了，之后运行项目，打包都是直接用的vue-cli-service的服务
  const pkg = {
    name,
    version: "0.1.0",
    dependencies: {},
    devDependencies: {
      "@vue/cli-service": "~4.5.13",
    },
  };
  // 创建构造器，构造器主要是实现文件的写入和模板的创建
  const generator = new Generator(pkg, path.join(process.cwd(), name));

  // 处理 交互结果
  answers.features.unshift("vue");

  // 根据用户选择的选项加载相应的模块，在 package.json 写入对应的依赖项
  // 并且将对应的 template 模块渲染
  answers.features.forEach((feature) => {
    require(`./generator/${feature}`)(generator, answers);
  });

  // 执行构造器
  await generator.generate();
  // 进行依赖下载，即执行npm install就行了，因为我们已经把package.json文件内容都补充完整了

  console.log("正咋初始化仓库");
  run("git init", path.join(process.cwd(), name));
  console.log("\n正在下载依赖...\n");
  await installPackages(path.join(process.cwd(), name), "npm");
  console.log("\n依赖下载完成! 执行下列命令开始开发：\n");
  console.log(`cd ${name}`);
  console.log(`npm run serve`);
  process.exit(1);
}

// 获取提示语，通过获取文件内容
function getPromptModules() {
  return ["babel", "linter", "router", "vuex"].map((file) =>
    require(`./promptModules/${file}`)
  );
}

module.exports = create;
