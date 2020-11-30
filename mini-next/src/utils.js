import fs from 'fs';
import path from 'path';
const configPath = path.resolve(process.cwd(), './config/mini-next.config.js');
const otherConfigPath = path.resolve(process.cwd(), './config/config.js');
const defaultConfig = {
    logger: true, // 是否开启日志记录 默认路径根目录下logs
    cssModule: false,
    lessModule: false,
    scssModule: false,
    prefixCDN: '/', // 构建后静态资源CDN地址前缀
    prefixRouter: '', // 页面路由前缀 默认/pagename  添加后前缀后访问方式为 /prefixUrl/pagename
    ssr: true, // 是否采用服务端渲染
    ssrCache: true, // 是否全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    statiPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    ssrIngore: null // 指定某一个或者多个page项目不采用服务端渲染  正则
};
export function isResSent(res) {
    return res.finished || res.headersSent;
}

function normalizeConfig(App, config) {
    if (typeof config === 'function') {
        config = config(App, { defaultConfig });

        if (typeof config.then === 'function') {
            throw new Error('> Promise returned in mini-next config');
        }
    }
    return config;
}
/**
 * 获取项目mini-next.config.js配置
 * @param {*} App
 */
export function getConfig(App) {
    if (fs.existsSync(configPath)) {
        let configModule = require(configPath);
        let useConfig = normalizeConfig(App, configModule);
        return Object.assign({}, defaultConfig, useConfig);
    } else {
        return defaultConfig;
    }
}
/**
 * 获取额外的config.js配置
 */
export function getOtherConfig() {
    if (fs.existsSync(otherConfigPath)) {
        let configModule = require(otherConfigPath);
        return configModule;
    } else {
        return {};
    }
}

export default {
    isDev: function() {
        const NODE_ENV = (process.env && process.env.NODE_ENV) || 'development';

        return NODE_ENV.trim() !== 'production';
    }
};
