'use strict';

// var HTMLWebpackPlugin = require('html-webpack-plugin');
// var fs = require('fs');
var _require = require('./baseconfig'),
    getBaseconfig = _require.getBaseconfig;

function getDevconfig(pageName, isServer) {
    var config = getBaseconfig(pageName, isServer);
    return config;
}

module.exports = {
    getDevconfig: getDevconfig
};