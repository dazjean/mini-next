'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./baseconfig'),
    getBaseconfig = _require.getBaseconfig;

var _require2 = require('./get-plugin'),
    getPlugin = _require2.getPlugin;

function getProconfig(pageName, isServer) {
    var config = getBaseconfig(pageName);

    var buildConfig = (0, _assign2.default)({}, config, {
        devtool: false,
        plugins: [].concat((0, _toConsumableArray3.default)(getPlugin(config.entry, isServer)))
    });
    return buildConfig;
}

module.exports = {
    getProconfig: getProconfig
};