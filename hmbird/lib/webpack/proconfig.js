var { getBaseconfig } = require('./baseconfig');
var { getPlugin } = require('./get-plugin');

const path = require('path');
const clientPath = path.join(process.cwd() + '/dist/client');

function getProconfig(pageName, isServer) {
    let config = getBaseconfig(pageName);

    let buildConfig = Object.assign({}, config, {
        devtool: false,
        output: {
            publicPath: '/', //生产环境脚本代码则设置cdn地址 https://j1.58cdn.com.cn/escstatic/hmbird/
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            path: clientPath, //打包后的文件存放的地方
            filename: '[name].js' //打包后输出文件的文件名
        },
        plugins: [...getPlugin(config.entry, isServer)]
    });
    return buildConfig;
}

module.exports = {
    getProconfig
};
