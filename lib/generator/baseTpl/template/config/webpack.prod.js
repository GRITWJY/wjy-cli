const path = require("path");
const os = require("os");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");

const threads = os.cpus().length;

// 获取处理样式的Loader
function getStyleLoader(pre) {
  return [
    MiniCssExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"],
        },
      },
    },
    pre,
  ].filter(Boolean);
}

module.exports = {
  entry: "./src/main.js", // 相对路径

  output: {
    // dirname 代表当前文件的文件夹目录
    path: path.resolve(__dirname, "../dist"), // 绝对路径
    filename: "static/js/[name].[contenthash:10].js",
    chunkFilename: "static/js/[name].[contenthash:10].chunk.js",
    // 图片,字体,通过:type:asset
    assetModuleFilename: "static/media/[hash:10][ext][query]",
    clean: true,
  },

  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            use: getStyleLoader(),
          },
          {
            test: /\.less$/,
            use: getStyleLoader("less-loader"),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoader("sass-loader"),
          },
          {
            test: /\.styl$/,
            use: getStyleLoader("stylus-loader"),
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
          },
          {
            // 在这里加后缀即可
            test: /\.(woff|woff2?|eot|ttf|otf)$/,
            type: "asset/resource",
          },
          {
            test: /\.js$/,
            // exclude: /node_modules/, // 排除node_modules中的js文件不处理
            include: path.resolve(__dirname, "../src"),
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
      threads, // 开启多进程和进程数量
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename: "static/css/[name].chunk.[contenthash:10].css",
    }),
    new PreloadWebpackPlugin({
      // rel: "preload",
      // as: "script",
      rel: "prefetch",
    }),
  ],

  // 压缩
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin({
        parallel: threads,
      }),
      // 压缩图片
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    runtimeChunk: { name: (entrypoint) => `runtime~${entrypoint.name}.js` },
  },

  mode: "production",
  devtool: "source-map",
};
