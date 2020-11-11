const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('mini-css-extract-plugin'); //css单独打包
const moment = require('moment');
const srcPath = path.join(process.cwd() + '/src');
const { getEntry } = require('./getEntry');
const { getPlugin } = require('./get-plugin');
const { prefixCDN, cssModule, lessModule, scssModule } = require('../utils').getConfig();
const clientPath = path.join(process.cwd() + '/dist/client');
const combineConfig = require('./combineConfig');
const dev = process.env.NODE_ENV !== 'production';

function getBaseconfig(pageName, isServer = false, hotReload = false) {
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

    const possLoader = {
        loader: 'postcss-loader',
        options: {
            postcssOptions: {
                plugins: [
                    require('autoprefixer')({ overrideBrowserslist: ['last 2 versions'] }),
                    !dev ? require('cssnano') : null
                ]
            }
        }
    };

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
                    test: /.js$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /.jsx$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /.ts$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /.tsx$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                modules: cssModule
                            }
                        },
                        possLoader,
                        {
                            loader: 'sass-loader' // 兼容历史方案，老版本css和scss一样的配置
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                modules: scssModule
                            }
                        },
                        possLoader,
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
                                modules: lessModule
                            }
                        },
                        possLoader,
                        {
                            loader: 'less-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: '[hash:8].[name].[ext]',
                                limit: 8192,
                                outputPath: 'images/'
                            }
                        }
                    ]
                }
            ]
        },
        devServer: {
            contentBase: srcPath, //本地服务器所加载的页面所在的目录
            port: 8080,
            hot: true
            // open:true,
            // openPage:"_home/_home.html"
        },
        plugins: pluginsObj,
        externals: {
            'isomorphic-fetch': {
                root: 'isomorphic-fetch',
                commonjs2: 'isomorphic-fetch',
                commonjs: 'isomorphic-fetch',
                amd: 'isomorphic-fetch'
            }
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.less'],
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
    return combineConfig(config);
}
module.exports = {
    getBaseconfig
};
