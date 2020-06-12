const path = require('path');
const webpack = require('webpack');
var ExtractTextPlugin = require('mini-css-extract-plugin'); //css单独打包
const moment = require('moment');
var srcPath = path.join(process.cwd() + '/src');
var { getEntry } = require('./getEntry');
var { getPlugin } = require('./get-plugin');
var { prefixCDN } = require('../utils').getConfig();
const clientPath = path.join(process.cwd() + '/dist/client');
function getBaseconfig(pageName, isServer = false, hotReload = false) {
    var dev = process.env.NODE_ENV !== 'production';
    let entryObj = getEntry(pageName);
    let tempObj = {};
    let pluginsObj = [];
    if (hotReload) {
        for (let key in entryObj) {
            tempObj[key] = [
                'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=10000&reload=true',
                entryObj[key]
            ];
        }
        pluginsObj = [...getPlugin(entryObj, isServer), new webpack.HotModuleReplacementPlugin()];
    } else {
        tempObj = entryObj;
        pluginsObj = [...getPlugin(entryObj, isServer)];
    }
    let config = {
        devtool: dev ? 'cheap-module-eval-source-map' : false,
        mode: dev ? 'development' : 'production',
        entry: {
            ...tempObj
        }, //类别入口文件
        output: {
            publicPath: !dev ? prefixCDN : '/',
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            filename: dev ? '[name].js' : `[name].js?v=${moment().format('YYYYMMDDHHmmss')}`, //打包后输出文件的文件名
            path: clientPath //打包后的文件存放的地方
        },
        module: {
            rules: [
                {
                    test: /js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /jsx$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /(\.scss|\.css)$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                minimize: false
                            }
                        },
                        {
                            loader: 'postcss-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                minimize: false
                            }
                        },
                        {
                            loader: 'less-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    loader: 'url-loader',
                    options: {
                        name: '[hash:8].[name].[ext]',
                        limit: 8192,
                        outputPath: 'images/'
                    }
                }
            ]
        },
        devServer: {
            contentBase: srcPath, //本地服务器所加载的页面所在的目录
            port: 8080,
            hot: true
        },
        plugins: pluginsObj,
        // optimization: {
        //     splitChunks: {
        //         cacheGroups: {
        //             commons: {
        //                 test: /[\\/]node_modules[\\/]/,
        //                 name: 'vendors',
        //                 filename: '[name]',
        //                 chunks: 'all'
        //             }
        //         }
        //     }
        // },
        externals: {
            'isomorphic-fetch': {
                root: 'isomorphic-fetch',
                commonjs2: 'isomorphic-fetch',
                commonjs: 'isomorphic-fetch',
                amd: 'isomorphic-fetch'
            }
        },
        resolve: {
            extensions: ['.js', '.css', '.scss', '.jsx'],
            alias: {
                components: srcPath + '/components',
                images: srcPath + '/images',
                mock: srcPath + '/mock',
                skin: srcPath + '/skin',
                utils: srcPath + '/utils',
                config: srcPath + '/config'
            }
        }
    };
    return config;
}
module.exports = {
    getBaseconfig
};
