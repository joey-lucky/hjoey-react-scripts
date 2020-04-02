'use strict';
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const merge = require("webpack-merge");

const isEnvDev = process.env.NODE_ENV === 'development';
const isEnvProd = !isEnvDev;

let {publicPath, buildPath, cdnHost, srcPath, alias, resolveApp} = require("./paths");
let cdnPublicPath = publicPath = !!cdnHost ? cdnHost : publicPath;// 开启cdn

let config = {
    mode: isEnvDev ? "development" : "production",
    devtool: isEnvDev ? "source-map" : false,
    bail: !isEnvDev,
    context: resolveApp(),
    target: "web",
    entry: resolveApp("src/index.js"),
    resolve: {
        alias: alias,
        modules: [resolveApp("node_modules")],
    },
    output: {
        path: isEnvDev ? undefined : buildPath,
        pathinfo: isEnvDev,
        filename: isEnvDev ? 'static/js/[name].bundle.js' : 'static/js/[name].[hash].js',
        chunkFilename: isEnvDev ? 'static/js/[name].bundle.js' : 'static/js/[name].[contenthash].js',
        publicPath: cdnPublicPath
    },
    module: {
        rules: [
            {
                test: /.js(x)?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [require.resolve("@babel/preset-env"), require.resolve("@babel/preset-react")],
                    plugins: [
                        [require.resolve("@babel/plugin-proposal-decorators"), {"legacy": true}],
                        [require.resolve("@babel/plugin-proposal-class-properties")],
                        [require.resolve("@babel/plugin-transform-runtime")],
                        [require.resolve("babel-plugin-import"),
                            {
                                "libraryName": "antd",
                                "libraryDirectory": "es",
                            }
                        ],
                    ]
                },
            },
            {
                oneOf: [
                    // loader的执行顺序是至上而下，因此这里的顺序不能换
                    {
                        test: /\.module\.(less|css)$/,
                        // include: srcPath,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                // options: {
                                //     hmr: isEnvDevelopment
                                // },
                            },
                            {loader: "css-loader", options: {modules: true}},
                            {loader: "less-loader", options: {javascriptEnabled: true}},
                        ],
                    },
                    {
                        test: /\.(less|css)$/,
                        // include: srcPath,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    hmr: isEnvDev
                                },
                            },
                            {loader: "css-loader"},
                            {loader: "less-loader", options: {javascriptEnabled: true}},
                        ],
                    },
                ]
            },
            {
                test: /.(jpe?g|png|gif|svg)$/,
                exclude: /node_modules/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: 'static/media/[name].[hash].[ext]'
                    }
                }
            },
        ]
    },
    optimization: {
        minimize: isEnvProd,
        namedModules: isEnvDev,
    },
    performance: false,
    plugins: [
        isEnvProd && new CleanWebpackPlugin(),
        isEnvProd && new BundleAnalyzerPlugin(),
        isEnvDev && new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({ // contenthash 支持持久缓存
            chunkFilename: isEnvDev ? "static/css/[name].[id].css" : "static/css/[name].[id].[contenthash].css",
            filename: isEnvDev ? "static/css/[name].[id].css" : "static/css/[name].[id].[contenthash].css",
        }),
        new webpack.DefinePlugin({// 全局变量
            "process.env": {
                NODE_ENV: JSON.stringify("production"),
                PUBLIC_PATH: JSON.stringify(publicPath)
            }
        }),
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            /zh-cn/,
        ),
        new HtmlWebpackPlugin(Object.assign(
            {
                PUBLIC_PATH: publicPath,
                inject: true,
                filename: "index.html",
                template: resolveApp("public/index.html"),
            },
            isEnvProd && {
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                },
            }
        )),
        isEnvProd && new CompressionPlugin(),
    ].filter(Boolean),
    watchOptions: {
        ignored: /node_modules/
    },
};

if (isEnvProd) {
    config = merge(config, {
        optimization: {
            // CSS压缩需要用到OptimizeCSSAssetsPlugin，被迫替换minimizer成TerserJSPlugin，
            minimizer: [
                new TerserJSPlugin({
                    extractComments: false,
                    sourceMap: false,
                }),
                new OptimizeCSSAssetsPlugin({})
            ],
            splitChunks: {
                chunks: 'all',
                maxSize: 250000,
                cacheGroups: {
                    react: {
                        test: /[\\/]node_modules[\\/]react/,
                        name: 'react',
                        chunks: 'all',
                        enforce: true
                    },
                    mobx: {
                        test: /[\\/]node_modules[\\/]mobx/,
                        name: 'mobx',
                        chunks: 'all',
                        enforce: true
                    },
                    ant: {
                        test: /[\\/]node_modules[\\/]@?ant/,
                        name: 'ant',
                        chunks: 'all',
                        enforce: true
                    },
                    src: {
                        test: /[\\/]src[\\/]/,
                        name: 'src',
                        chunks: 'all',
                        enforce: true
                    }
                }
            },
        },
    });
}

module.exports = config;
