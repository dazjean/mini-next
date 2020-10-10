const fs = require('fs');
const path = require('path');
const userWebpackConfigPath = path.join(process.cwd() + '/config/mini-next.webpack.js');
var ExtractTextPlugin = require('mini-css-extract-plugin'); //css单独打包
function mergeLoader(before, item, cssLoader = false, server = false) {
    if (item && item.length) {
        if (cssLoader && !server) {
            before.use = ['css-hot-loader', ExtractTextPlugin.loader, ...item];
        } else {
            before.use = item;
        }
    }
}
module.exports = function(config, server) {
    if (!fs.existsSync(userWebpackConfigPath)) {
        return config;
    }
    let res = JSON.parse(JSON.stringify(config));
    delete require.cache[require.resolve(userWebpackConfigPath)];
    const userConfig = require(userWebpackConfigPath);
    let defaultLoader = config.module.rules;
    //添加loader
    Object.entries(userConfig.loader).map(([key, item]) => {
        switch (key) {
            case 'js':
                mergeLoader(defaultLoader[0], item);
                break;
            case 'jsx':
                mergeLoader(defaultLoader[1], item);
                break;
            case 'css':
                mergeLoader(defaultLoader[2], item, true, server);
                break;
            case 'scss':
                mergeLoader(defaultLoader[3], item, true, server);
                break;
            case 'less':
                mergeLoader(defaultLoader[4], item, true, server);
                break;
            case 'img':
                mergeLoader(defaultLoader[5], item);
                break;
            default:
        }
    });
    //添加externals 合并
    config.externals = userConfig.externals
        ? Object.assign(config.externals, userConfig.externals)
        : config.externals;
    //添加extensions 合并去重
    config.resolve.extensions =
        userConfig.extensions && userConfig.extensions.length
            ? Array.from(new Set([...config.resolve.extensions, ...userConfig.extensions]))
            : config.resolve.extensions;
    //添加alias 覆盖
    config.resolve.alias = userConfig.alias || config.resolve.alias;
    //添加devServer 覆盖
    config.devServer = userConfig.devServer || config.devServer;
    //添加plugin 合并
    config.plugins = userConfig.plugins
        ? config.plugins.concat(userConfig.plugins)
        : config.plugins;
    return config;
};
