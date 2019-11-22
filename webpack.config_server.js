'use strict';
process.env.NODE_ENV = 'production'; //设置当前环境
var webpack = require('webpack');
var path = require('path');
const nodeExternals = require('webpack-node-externals');
let serverConfig = {};
let buildConfig = Object.assign(
    serverConfig,
    {},
    {
        entry: __dirname + '/server/start.js', //类别入口文件
        output: {
            path: path.join(__dirname, 'build_server'),
            filename: 'server.bundle.js',
            libraryTarget: 'commonjs2' //设置导出类型，web端默认是var，node需要module.exports = xxx的形式
        },
        module: {
            loaders: [
                {
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        //node端的babel编译配置可以简化很多
                        babelrc: 'false',
                        presets: ['react'],
                        plugins: [
                            'transform-decorators-legacy',
                            'transform-es2015-modules-commonjs' //如果不转换成require，import 'xxx.styl'会报错
                        ]
                    }
                },
                {
                    test: /\.(styl|css)$/, //node端不能 require('xx.css')，会报错
                    loader: 'null'
                }
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                React: 'react',
                ReactDOM: 'react-dom',
                fetch: 'isomorphic-fetch',
                promise: 'promise'
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV':
                    JSON.stringify(process.env.NODE_ENV) || JSON.stringify('server')
            })
        ],
        target: 'node',
        externals: [nodeExternals()] //不把node_modules中的文件打包
    }
);

module.exports = buildConfig;
