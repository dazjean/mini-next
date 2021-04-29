import fs from 'fs';
import path from 'path';
export const webpackConfigPath = path.join(process.cwd() + './webpack.config.js');
export const tempDir = path.join(process.cwd() + '/.mini-next');
export const serverDir = path.join(process.cwd() + '/dist/server');
export const clientDir = path.join(process.cwd() + '/dist/client');

const oldOptionsPath = path.resolve(process.cwd(), './config/mini-next.config.js');
const newOptionsPath = path.resolve(process.cwd(), './config/ssr.config.js');
const configPath = path.resolve(process.cwd(), './config/index.config.js');
let coreOptions = null;
const defaultOptions = {
    ssr: true, // 开启服务端渲染
    cache: true, // 开启缓存
    ssrCache: true, // 全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程  3.0废弃
    statiPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html 3.0废弃
    staticPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    ssrIngore: null, // 指定某一个或者多个page项目不采用服务端渲染  正则
    rootDir: 'src', // 工程根文件夹目录名称
    rootNode: 'app', // 客户端渲染挂载根元素ID
    logger: false, // 开启日志记录 默认路径根目录下logs
    prefixCDN: '/', // 构建后静态资源CDN地址前缀
    prefixRouter: '', // 页面路由前缀 默认/page  添加后前缀后访问方式为 /prefixUrl/page
    cssModule: false, // 暂不支持
    lessModule: false, // 暂不支持
    scssModule: false // 暂不支持
};
export function isResSent(res) {
    return res.finished || res.headersSent;
}

/**
 * 兼容@umajs/plugin-react-ssr配置文件模式
 * @returns
 */
function umajs_plugin_options() {
    let opt = {};
    try {
        let { Uma } = require('@umajs/core');
        Uma.instance({ ROOT: './app' }).loadConfig();
        opt = Uma.config?.ssr || {}; // ssr.config.ts
        const reactSsrPlugin = Uma.config?.plugin['react-ssr'];
        if (reactSsrPlugin?.options) {
            opt = reactSsrPlugin.options;
        }
    } catch (_error) {}
    return opt;
}

function loadConfig(path) {
    let configModule = require(path);
    let options = normalizeConfig(configModule);
    // 兼容2.0配置
    if (options && options.hasOwnProperty('statiPages')) {
        options.staticPages = options.statiPages;
    }
    if (options && options.hasOwnProperty('ssrCache')) {
        options.cache = options.ssrCache;
    }
    return Object.assign({}, defaultOptions, options, umajs_plugin_options());
}

function normalizeConfig(config) {
    if (typeof config === 'function') {
        config = config(defaultOptions);

        if (typeof config.then === 'function') {
            throw new Error('> Promise returned in mini-next config');
        }
    }
    return config;
}
/**
 * 获取项目ssr.config.js配置
 * @param {*} App
 */
export function getCoreConfig() {
    if (coreOptions) return coreOptions;

    if (fs.existsSync(oldOptionsPath)) {
        coreOptions = loadConfig(oldOptionsPath);
    } else if (fs.existsSync(newOptionsPath)) {
        coreOptions = loadConfig(newOptionsPath);
    } else {
        coreOptions = Object.assign({}, defaultOptions, umajs_plugin_options());
    }
    return coreOptions;
}
/**
 * 获取index.config.js配置
 */
export function getIndexConfig() {
    if (fs.existsSync(configPath)) {
        let configModule = require(configPath);
        return configModule;
    } else {
        return {};
    }
}

export function getEntryDir() {
    const options = getCoreConfig();
    const { rootDir } = options;
    return path.join(process.cwd() + `/${rootDir}/pages/`);
}

export default {
    isDev: function () {
        const NODE_ENV = (process.env && process.env.NODE_ENV) || 'development';

        return NODE_ENV.trim() !== 'production';
    },
    getOptions: function (name) {
        let options = null;
        return (() => {
            options = options || getCoreConfig();
            return options[name] || null;
        })();
    }
};
