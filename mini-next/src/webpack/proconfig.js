import { getBaseconfig } from './baseconfig';
import { getPlugin } from './get-plugin';

function getProconfig(page, isServer) {
    let config = getBaseconfig(page);

    let buildConfig = Object.assign({}, config, {
        devtool: false,
        plugins: [...getPlugin(config.entry, isServer)]
    });
    return buildConfig;
}

module.exports = {
    getProconfig
};
