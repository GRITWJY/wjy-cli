const path = require("path");
const os = require("os");

const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const threads = os.cpus().length;
module.exports = {
  entry: "./src/main.js", // 相对路径

  output: {
    //  开发模式没有输出
    path: undefined,
    filename: "static/js/main.js",
  },

  module: {
    rules: [
      {
        oneOf: [
          {
            test: /.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"], // 顺序是从右到左
          },
          {
            test: /\.less$/i,
            exclude: /node_modules/, // 排除node_modules中的js文件不处理
            use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              // 将 JS 字符串生成为 style 节点
              MiniCssExtractPlugin.loader,
              // 将 CSS 转化成 CommonJS 模块
              "css-loader",
              // 将 Sass 编译成 CSS
              "sass-loader",
            ],
          },
          {
            test: /\.styl$/,
            loader: "stylus-loader", // 将 Stylus 文件编译为 CSS
          },
          {
            test: /\.(png|jpe?g|gif|webp|svg)$/,
            type: "asset",
            parser: {
              dataUrlCondition: {
                // 小于10kb的图片转base64
                // 优点：减少请求数量  缺点：体积会更大
                maxSize: 10 * 1024, // 10kb
              },
            },
            generator: {
              filename: "static/images/[hash:10][ext][query]",
            },
          },
          {
            // 在这里加后缀即可
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: "asset/resource",
            generator: {
              filename: "static/media/[hash:10][ext][query]",
            },
          },
          {
            test: /\.m?js$/,
            exclude: /node_modules/, // 排除node_modules中的js文件不处理
            // include: path.resolve(__dirname,'../src'),
            use: [
              {
                loader: "thread-loader",
                options: {
                  works: threads,
                },
              },
              {
                loader: "babel-loader",
                options: {
                  cacheDirectory: true, // 开启 babel 缓存
                  cacheCompression: false, // 关闭缓存文件压缩
                  plugins: ["@babel/plugin-transform-runtime"],
                },
              },
            ],
          },
        ],
      },
    ],
  },

  plugins: [
    new ESLintPlugin({
      // 检查src下的文件
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules", // 默认值
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/eslintcache"
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
  ],

  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin({
        parallel: threads,
      }),
    ],
  },

  devServer: {
    host: "localhost",
    port: "3000",
    open: true,
    hot: true,
  },

  mode: "development",
  devtool: "cheap-module-source-map",
};
