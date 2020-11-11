var { getBaseconfig } = require('./baseconfig');
var { getPlugin } = require('./get-plugin');

function getProconfig(pageName, isServer) {
    let config = getBaseconfig(pageName);

    let buildConfig = Object.assign({}, config, {
        devtool: false,
        plugins: [...getPlugin(config.entry, isServer)]
    });
    return buildConfig;
}

module.exports = {
    getProconfig
};
