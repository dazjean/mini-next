'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.isResSent = isResSent;
exports.getConfig = getConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configPath = _path2.default.resolve(process.cwd(), './config/hmbird.config.js');
var defaultConfig = {
    prefixCDN: '/', // 构建后静态资源CDN地址前缀
    prefixRouter: '', // 页面路由前缀 默认/pagename  添加后前缀后访问方式为 /prefixUrl/pagename
    ssr: true, // 是否采用服务端渲染
    ssrCache: true, // 是否全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    statiPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    ssrIngore: null // 指定某一个或者多个page项目不采用服务端渲染  正则
};
function isResSent(res) {
    return res.finished || res.headersSent;
}

function normalizeConfig(App, config) {
    if (typeof config === 'function') {
        config = config(App, { defaultConfig: defaultConfig });

        if (typeof config.then === 'function') {
            throw new Error('> Promise returned in hmbird config');
        }
    }
    return config;
}

function getConfig(App) {
    if (_fs2.default.existsSync(configPath)) {
        var configModule = require(configPath);
        var useConfig = normalizeConfig(App, configModule);
        return (0, _assign2.default)({}, defaultConfig, useConfig);
    } else {
        return defaultConfig;
    }
}