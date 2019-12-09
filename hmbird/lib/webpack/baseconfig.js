const path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin'); //css单独打包
var srcPath = path.join(process.cwd() + '/src');
var { getEntry } = require('./getEntry');
var { getPlugin } = require('./get-plugin');
const clientPath = path.join(process.cwd() + '/dist/client');
var dev = process.env.NODE_ENV !== 'production';
function getBaseconfig(pageName, isServer = false) {
    let entryObj = getEntry(pageName);
    let config = {
        devtool: dev ? 'cheap-module-eval-source-map' : false,
        mode: 'development',
        entry: {
            ...entryObj
        }, //类别入口文件
        output: {
            publicPath: '/',
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            filename: '[name].js', //打包后输出文件的文件名
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
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
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
                    })
                },
                {
                    test: /\.less$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
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
                    })
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
            port: 9990,
            hot: true
        },
        plugins: [...getPlugin(entryObj, isServer)],
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
            react: {
                amd: 'react',
                root: 'React',
                commonjs: 'react',
                commonjs2: 'react'
            },
            'react-dom': {
                amd: 'react-dom',
                root: 'ReactDOM',
                commonjs: 'react-dom',
                commonjs2: 'react-dom'
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
