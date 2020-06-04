// var HTMLWebpackPlugin = require('html-webpack-plugin');
// var fs = require('fs');
var { getBaseconfig } = require('./baseconfig');

function getDevconfig(pageName, isServer) {
    let config = getBaseconfig(pageName, isServer);
    return config;
}

module.exports = {
    getDevconfig
};
