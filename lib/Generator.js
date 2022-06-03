const isObject = (val) => val && typeof val === "object";
const path = require("path");
const { isBinaryFileSync } = require("isbinaryfile");
const ejs = require("ejs");
const sortObject = require("./utils/sortObject");
const fs = require("fs");
const writeFileTree = require("./utils/writeFileTree");
const { runTransformation } = require("vue-codemod");
const normalizeFilePaths = require("./utils/normalizeFilePaths");

class Generator {
  // pkg 文件， context 文件路径
  constructor(pkg, context) {
    this.pkg = pkg;
    this.context = context;
    this.rootOptions = {}; // main.js 文件中的new Vue中的内容
    this.files = {};
    this.imports = {};
    this.fileMiddlewares = [];
    this.configTransforms = {};
    this.entryFile = `src/main.js`; // 文件入口
  }

  extendPackage(fields) {
    const pkg = this.pkg;
    for (const key in fields) {
      const value = fields[key];
      const existing = pkg[key];
      if (
        isObject(value) &&
        (key === "dependencies" ||
          key === "devDependencies" ||
          key === "scripts")
      ) {
        pkg[key] = Object.assign(existing || {}, value);
      } else {
        pkg[key] = value;
      }
    }
  }

  async generate() {
    console.log(this.pkg);
    // 解析文件
    await this.resolveFiles();

    // 给 pkg 文件排序
    this.sortPkg();

    // 加入到files
    this.files["package.json"] = JSON.stringify(this.pkg, null, 2) + "\n";

    // 写入到目标目录
    await writeFileTree(this.context, this.files);
  }

  // 按照下面的顺序对 package.json 中的 key 进行排序
  sortPkg() {
    // ensure package.json keys has readable order
    this.pkg.dependencies = sortObject(this.pkg.dependencies);
    this.pkg.devDependencies = sortObject(this.pkg.devDependencies);
    this.pkg.scripts = sortObject(this.pkg.scripts, [
      "dev",
      "build",
      "test:unit",
      "test:e2e",
      "lint",
      "deploy",
    ]);

    this.pkg = sortObject(this.pkg, [
      "name",
      "version",
      "private",
      "description",
      "author",
      "scripts",
      "husky",
      "lint-staged",
      "main",
      "module",
      "browser",
      "jsDelivr",
      "unpkg",
      "files",
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "vue",
      "babel",
      "eslintConfig",
      "prettier",
      "postcss",
      "browserslist",
      "jest",
    ]);
  }
  render(source, additionalData = {}, ejsOptions = {}) {
    // 获取 函数文件的父目录路径
    const baseDir = extractCallDir();
    source = path.resolve(baseDir, source);
    this._injectFileMiddleware(async (files) => {
      const data = this._resolveData(additionalData);
      const globby = require("globby");
      const _files = await globby(["**/*"], { cwd: source, dot: true });
      for (const rawPath of _files) {
        const sourcePath = path.resolve(source, rawPath);
        const content = this.renderFile(sourcePath, data, ejsOptions);
        // only set file if it's not all whitespace, or is a Buffer (binary files)
        if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
          files[rawPath] = content;
        }
      }
    });
  }

  async resolveFiles() {
    const files = this.files;
    for (const middleware of this.fileMiddlewares) {
      await middleware(files);
    }

    // normalize file paths on windows
    // all paths are converted to use / instead of \
    // 将反斜杠 \ 转换为正斜杠 /
    normalizeFilePaths(files);

    // 处理 import 语句的导入和 new Vue() 选项的注入
    // vue-codemod 库，对代码进行解析得到 AST，再将 import 语句和根选项注入
    Object.keys(files).forEach((file) => {
      let imports = this.imports[file];
      imports = imports instanceof Set ? Array.from(imports) : imports;
      if (imports && imports.length > 0) {
        files[file] = runTransformation(
          { path: file, source: files[file] },
          require("./utils/codemods/injectImports"),
          { imports }
        );
      }

      let injections = this.rootOptions[file];
      injections =
        injections instanceof Set ? Array.from(injections) : injections;
      if (injections && injections.length > 0) {
        files[file] = runTransformation(
          { path: file, source: files[file] },
          require("./utils/codemods/injectOptions"),
          { injections }
        );
      }
    });
  }

  _injectFileMiddleware(middleware) {
    this.fileMiddlewares.push(middleware);
  }

  _resolveData(additionalData) {
    return {
      options: this.options,
      rootOptions: this.rootOptions,
      ...additionalData,
    };
  }

  renderFile(name, data, ejsOptions) {
    // 如果是二进制文件，直接将读取结果返回
    if (isBinaryFileSync(name)) {
      return fs.readFileSync(name); // return buffer
    }

    // 返回文件内容
    const template = fs.readFileSync(name, "utf-8");
    return ejs.render(template, data, ejsOptions);
  }

  injectImports(file, imports) {
    const _imports = this.imports[file] || (this.imports[file] = new Set());
    (Array.isArray(imports) ? imports : [imports]).forEach((imp) => {
      _imports.add(imp);
    });
  }

  injectRootOptions(file, options) {
    const _options =
      this.rootOptions[file] || (this.rootOptions[file] = new Set());
    (Array.isArray(options) ? options : [options]).forEach((opt) => {
      _options.add(opt);
    });
  }
}

// 获取调用栈信息
function extractCallDir() {
  const obj = {};
  Error.captureStackTrace(obj);
  // console.log("ad", obj.stack); // Error
  const callSite = obj.stack.split("\n")[3];

  // the regexp for the stack when called inside a named function
  const namedStackRegExp = /\s\((.*):\d+:\d+\)$/;
  // the regexp for the stack when called inside an anonymous
  const anonymousStackRegExp = /at (.*):\d+:\d+$/;

  let matchResult = callSite.match(namedStackRegExp);
  if (!matchResult) {
    matchResult = callSite.match(anonymousStackRegExp);
  }

  const fileName = matchResult[1];
  // 获取对应文件的目录
  return path.dirname(fileName);
}

module.exports = Generator;
