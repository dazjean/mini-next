import { getBaseconfig } from './baseconfig';

function getDevconfig(pageName, isServer) {
    let config = getBaseconfig(pageName, isServer);
    return config;
}

module.exports = {
    getDevconfig
};
