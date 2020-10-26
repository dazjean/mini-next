const path = require('path');
const clientPath = path.join(process.cwd() + '/dist/server');
const { getBaseconfig } = require('./baseconfig');
const combineConfig = require('./combineConfig');

function getServerconfig(pageName) {
    let baseConfig = getBaseconfig(pageName, true);
    let config = {
        devtool: false,
        mode: 'production',
        entry: baseConfig.entry, //类别入口文件
        output: {
            publicPath: '/',
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            filename: '[name].js', //打包后输出文件的文件名
            path: clientPath //打包后的文件存放的地方
        },
        module: baseConfig.module,
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
        resolve: baseConfig.resolve
    };
    return combineConfig(config, true);
}
module.exports = getServerconfig;
