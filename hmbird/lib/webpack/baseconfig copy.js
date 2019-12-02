const path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin'); //css单独打包
var srcPath = path.join(process.cwd() + '/src');
var { getEntry } = require('./getEntry');
var { getHtmlPlugin } = require('./html-plugin');

function getBaseconfig(pageName) {
    let entryObj = getEntry(pageName);

    let config = {
        devtool: 'cheap-module-eval-source-map',
        debug: true,
        cache: true,
        entry: ['webpack-hot-middleware/client?noInfo=true&reload=true', ...entryObj], //类别入口文件
        output: {
            publicPath: '/',
            libraryTarget: 'umd',
            filename: '[name].js' //打包后输出文件的文件名
        },
        module: {
            preLoaders: [
                // 配置 eslint-loader
                {
                    test: /\.(js|jsx)$/,
                    loader: 'eslint-loader',
                    include: /src/,
                    exclude: /node_modules/
                }
            ],
            loaders: [
                { test: /\.(js|jsx)$/, loader: 'jsx!babel', exclude: /node_modules/ },
                { test: /\.css$/, loader: ExtractTextPlugin.extract('css', 'css!postcss') },
                { test: /\.scss$/, loader: ExtractTextPlugin.extract('css', 'css!postcss!sass') },
                { test: /\.less$/, loader: ExtractTextPlugin.extract('css', 'css!postcss!less') },
                {
                    test: /\.(png|jpg|ico|jpeg|gif)$/,
                    loader: 'url?limit=8192&name=images/[hash:8].[name].[ext]'
                }
            ]
        },
        devServer: {
            contentBase: srcPath, //本地服务器所加载的页面所在的目录
            port: 9991,
            colors: true, //终端中输出结果为彩色
            open: true, //自动打开首页
            historyApiFallback: true, //不跳转
            inline: true, //实时刷新,hot
            noInfo: false,
            hotOnly: true
        },
        postcss: [
            autoprefixer({ browsers: ['last 10 versions'] }) //调用autoprefixer插件,css3自动补全
        ],
        plugins: [
            new ExtractTextPlugin('[name].css'),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('development')
                }
            }),
            new webpack.HotModuleReplacementPlugin(),
            ...getHtmlPlugin(entryObj)
        ],
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
            },
            'isomorphic-fetch': {
                root: 'isomorphic-fetch',
                commonjs2: 'isomorphic-fetch',
                commonjs: 'isomorphic-fetch',
                amd: 'isomorphic-fetch'
            }
        },
        resolve: {
            extensions: ['', '.js', '.jsx'],
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
