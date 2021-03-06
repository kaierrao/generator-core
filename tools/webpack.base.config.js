/*
* @Author: wujunchuan
* @Date:   2017-09-22 09:43:35
* @Last Modified by:   JohnTrump
* @Last Modified time: 2017-10-23 13:51:53
*/

// 基本的webpack配置

/* import plugins && libs */
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');

/* import config file */
const config  = require("./config.js");
const baseRoot = config.baseRoot;

const joinBaseRoot = file => path.join(baseRoot, file);
// 打包后的资源文件根目录(本地物理文件路径)
const ASSETS_BUILD_PATH = joinBaseRoot("./dist");
// 指向资源文件根目录
const ASSETS_PUBLIC_PATH = config.publicPath;
const SRC_PATH = joinBaseRoot('./client');

const webpackConfig = {
  context: SRC_PATH,

  // entry - 入口
  // NOTICE: 命名规则按以下来
  // key: {String} [moduleName]/[subModuleName]
  // value: {String} [filepath]
  entry: {

    'vendor': [
      './common/javascripts/jquery.js',
    ],

    'home/index': ['./home/javascripts/index.js'],
    'home/haha': ['./home/javascripts/haha.js'],

    'sub-home/index': ['./sub-home/javascripts/index.js'],
    'sub-home/haha': ['./sub-home/javascripts/haha.js'],

    'sub-sub-home/index': ['./sub-sub-home/javascripts/index.js'],
    'sub-sub-home/haha': ['./sub-sub-home/javascripts/haha.js']
  },

  // output - 输出
  output: {
    // 输出
    publicPath: ASSETS_PUBLIC_PATH,
    path: ASSETS_BUILD_PATH,
    filename: process.env.NODE_ENV === 'dev' ? '[name].js' : '[name].[chunkhash].js',
    // 为按需加载的文件命名 -- chunkFilename
    chunkFilename: "async/[name].[chunkhash].js",
  },

  // resolve - 解析
  resolve:{
    //配置别名，在项目中可缩减引用路径,确保模块引入变得简单
    alias: {
      "@": baseRoot
    }
  },

  // module - 模块
  module: {
    rules: [
      // handle picture
      {
        test: /\.(png|gif|jpe?g|icon?)$/,
        // exclude: /node_modules/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: process.env.NODE_ENV === 'dev' ? '[path][name].[ext]' : 'static/images/[name]-[hash].[ext]',
              publicPath: ASSETS_PUBLIC_PATH
            }
          }
        ]
      },
      // handle fonts
      {
        test: /\.(eot|svg|ttf|woff)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: process.env.NODE_ENV === 'dev' ? '/static/fonts/[name].[ext]' : '/static/fonts/[name]-[hash].[ext]',
            }
          }
        ]
      },
    ]
  },

  // 外部扩展
  // ref: https://doc.webpack-china.org/configuration/externals/
  // 从输出的bundle中排除掉依赖,在运行时再从外部去获取依赖
  // 从 CDN 引入 jQuery，而不是把它打包
  // NOTE: 在这个项目中我们还是将其打包到vendor中
  // externals: {
  //   jquery: 'jQuery'
  // }

  plugins: [
    // 官方文档推荐使用下面的插件来定义NODE_ENV
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),
    // A webpack plugin to remove/clean your build folder(s) before building
    // NOTE: 可以配置只删除模块下的dist
    // https://www.npmjs.com/package/clean-webpack-plugin
    new CleanWebpackPlugin(
      [ASSETS_BUILD_PATH], {
        // print log
        // verbose: true,
        verbose: process.env.NODE_ENV === 'dev' ? false : true,
        // delete files
        dry: process.env.NODE_ENV === 'dev' ? true : false,
        allowExternal: true,
      }
    ),
    // 抽离公共模块
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor'],
      // 生成后的文件名，虽说用了[name]，但实际上就是'vendor.bundle.js'了
      filename: process.env.NODE_ENV === 'dev' ? '[name].js' : '[name].[chunkhash].js',
      // 防止将其他代码打包进来,这里需要设置minChunks: Infinity
      minChunks: Infinity
    }),
    // Webpack在使用CommonsChunkPlugin会自动生成一段runtime代码(主要用来处理代码模块的映射关系)
    // 这个映射关系会随着打包变化并且打入vendor中导致vendor文件的hash发生变化。解决方案就是将这部分的代码也淡出抽离出来成独立的文件--runtime.js
    // 如此一来,即便是改变了业务代码,vendor的值也不会随意改变了。
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
      filename: process.env.NODE_ENV === 'dev' ? '[name].js' : '[name].[chunkhash].js',
    }),
  ],
};

module.exports = webpackConfig;
