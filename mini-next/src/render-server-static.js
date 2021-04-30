import React from 'react';
import fs from 'fs';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import path from 'path';
import { loadGetInitialProps } from './get-static-props';
import { EntryList } from './webpack/get-entry';
import webPack from './webpack/run';
import help, { clientDir, serverDir, cacheDir } from './utils';
import Logger from './log';
const entryDir = help.getOptions('rootDir');
const TDKPath = path.join(process.cwd() + `/${entryDir}`);

/**
 * 写入文件,存在则覆盖
 * @param {*} path 文件名称
 * @param {*} Content 内容
 */
const writeFile = async (path, Content) => {
    return new Promise((resolve) => {
        fs.writeFile(path, Content, { encoding: 'utf8' }, function (err) {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
                Logger.info(
                    `[miniNext]:Page component ${path} successfully writes the server rendering cache`
                );
            }
        });
    });
};

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
export const render = (page) => {
    return new Promise((resolve, reject) => {
        let viewUrl = `${clientDir}/${page}/${page}.html`;
        fs.readFile(viewUrl, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const filterXss = (str) => {
    var s = '';
    s = str.replace(/&/g, '&amp;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/ /g, '&nbsp;');
    s = s.replace("'", '&#39;');
    s = s.replace('"', '&quot;');
    return s;
};

const writeFileHander = (name, Content) => {
    fs.exists(cacheDir, (exists) => {
        if (exists) {
            writeFile(name, Content);
        } else {
            fs.mkdir(cacheDir, (err) => {
                if (err) {
                    Logger.error(`[miniNext]:${err.stack}`);
                } else {
                    writeFile(name, Content);
                }
            });
        }
    });
};

export const checkDistJsmodules = async (page) => {
    let jspath = `${serverDir}/${page}/${page}.js`;
    let jsClientdir = `${clientDir}/${page}`;
    if (!fs.existsSync(jspath)) {
        //服务端代码打包
        let compiler = new webPack(page, help.isDev(), true);
        await compiler.run();
    }
    if (!fs.existsSync(jsClientdir)) {
        //客户端代码打包
        let compiler = new webPack(page, help.isDev());
        await compiler.run();
    }
    return jspath;
};
/**
 * Router类型页面渲染解析
 * @param {*} ctx
 * @param {*} next
 */
export const renderServerDynamic = async (ctx, initProps) => {
    const context = {};
    var { page, query } = ctx._miniNext;
    if (!EntryList.has(page)) {
        return false;
    }
    let App = {};
    let jspath = await checkDistJsmodules(page);
    try {
        // eslint-disable-next-line no-undef
        if (help.isDev()) {
            delete require.cache[require.resolve(jspath)];
        }
        App = require(jspath);
    } catch (error) {
        // eslint-disable-next-line no-console
        Logger.error('place move  windows/location object into React componentDidMount(){} ', page);
        Logger.error(error.stack);
    }
    let props = await loadGetInitialProps(App, ctx);
    if (typeof initProps === 'object') {
        props = Object.assign(props, initProps);
    }
    let Html = '';
    let location = ctx.url.split(page)[1];
    try {
        Html = ReactDOMServer.renderToString(
            <StaticRouter location={location || '/'} context={context}>
                <App page={page} path={ctx._miniNext.path} query={query} {...props} />
            </StaticRouter>
        );
    } catch (error) {
        Logger.warn('服务端渲染异常，降级使用客户端渲染！' + error.stack);
    }
    if (context.url) {
        ctx.response.writeHead(301, {
            Location: context.url
        });
        ctx.response.end();
    } else {
        // 加载 index.html 的内容
        let data = await render(page);
        //进行xss过滤
        for (let key in query) {
            if (query[key] instanceof Array) {
                query[key] = query[key].map((item) => {
                    return filterXss(item);
                });
            } else {
                query[key] = filterXss(query[key]);
            }
        }
        let rootNode = ctx._miniNextOptions.rootNode;
        let replaceReg = new RegExp(`<div id="${rootNode}"><\/div>`);
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(
            replaceReg,
            `<div id="${rootNode}">${Html}</div>
             <script>var __miniNext_DATA__ = 
                {
                    initProps:${JSON.stringify(props)},
                    page: "${page}",
                    path:"${ctx._miniNext.path}",
                    query:${JSON.stringify(query || {})},
                    config:${JSON.stringify(ctx._miniNextConfig || {})},
                    options:${JSON.stringify(ctx._miniNextOptions || {})}
                }
             </script>`
        );
        return await renderTDK(document, page, ctx, App);
    }
};

/**
 * 获取服务端渲染直出资源
 * @param {*} ctx
 */
export const renderServerStatic = async (ctx, initProps) => {
    let page = ctx._miniNext.page;
    let { cache, ssrIngore, ssr, staticPages } = ctx._miniNextOptions;
    return new Promise(async (resolve) => {
        if (!ssr || (ssrIngore && ssrIngore.test(page))) {
            // 客户端渲染模式
            return resolve(await render(page));
        }

        let viewUrl = `${cacheDir}/${page}.html`;
        if (help.isDev() || (!cache && staticPages.indexOf(page) == -1)) {
            // ssr无缓存模式，适用每次请求都是动态渲染页面场景
            // Logger.info(`[miniNext]: ${ctx.path} route uses SSR mode to access.`);
            resolve(await renderServerDynamic(ctx, initProps));
        } else {
            if (fs.existsSync(viewUrl)) {
                // ssr缓存模式，执行一次ssr 第二次直接返回缓存后的html静态资源
                // Logger.info(`[miniNext]: ${ctx.path} route is accessed by SSR cache mode.`);
                let rs = fs.createReadStream(viewUrl, 'utf-8');
                resolve(rs);
            } else {
                // ssr缓存模式,首次执行
                // Logger.info(`[miniNext]: ${ctx.path} route uses SSR mode for the first time.`);
                let document = await renderServerDynamic(ctx, initProps);
                resolve(document);
                process.nextTick(() => {
                    writeFileHander(cacheDir + '/' + page + '.html', document); //异步写入服务器缓存目录
                });
            }
        }
    });
};
/**
 * TDK解析 seo优化
 * @param {*} document
 * @param {*} page
 * @param {*} ctx
 */
export const renderTDK = async (document, page, ctx, App) => {
    let pageTDKPath = TDKPath + '/pages/' + page + '/' + 'TDK.js';
    let defaultTDKPath = TDKPath + '/' + 'TDK.js';
    let getInitialTDK = null;
    try {
        //获取getInitialTDK函数
        if (App.getInitialTDK) {
            getInitialTDK = App.getInitialTDK;
        } else if (fs.existsSync(pageTDKPath)) {
            if (help.isDev()) {
                delete require.cache[require.resolve(pageTDKPath)];
            }
            getInitialTDK = require(pageTDKPath);
        } else if (fs.existsSync(defaultTDKPath)) {
            if (help.isDev()) {
                delete require.cache[require.resolve(defaultTDKPath)];
            }
            getInitialTDK = require(defaultTDKPath);
        } else {
            return document;
        }
        //执行getInitialTDK拿到结果
        if (typeof getInitialTDK == 'function') {
            let res = await getInitialTDK(
                ctx,
                (ctx._miniNext && ctx._miniNext.query) || null,
                (ctx._miniNext && ctx._miniNext.path) || null
            );
            //解析结果拿到最终模板
            if (res.headContent) {
                document = document.replace(
                    /<head>[\s\S]*<\/title>/,
                    `<head>
                        ${res.headContent}
                    `
                );
            } else {
                let resStr = '';
                for (let key in res) {
                    if (key == 'title') {
                        resStr = `<title>${res[key]}</title>`;
                        document = document.replace(/<title>.*<\/title>/, resStr);
                    } else {
                        let reg = new RegExp(`<meta\\s*name\\s*=\\s*["']\\s*${key}.*`);
                        resStr = `<meta name="${key}" content="${res[key]}">`;
                        if (document.match(reg)) {
                            //替换
                            document = document.replace(reg, resStr);
                        } else {
                            //添加
                            document = document.replace(
                                '<title>',
                                `<meta name="${key}" content="${res[key]}">\r\n    <title>`
                            );
                        }
                    }
                }
            }
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        Logger.error(
            `please check getInitialTDK in /${entryDir}/${page}/${page}.js or TDK.js in/${entryDir}`
        );
        Logger.error(error.stack);
    }
    return document;
};
