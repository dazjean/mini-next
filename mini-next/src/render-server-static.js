import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { loadGetInitialProps } from './get-static-props';
import { EntryList } from './webpack/get-entry';
import webPack from './webpack/run';
import tools, { clientDir, serverDir, cacheDir, SSRKEY } from './tools';
import Logger from './log';
// const entryDir = tools.getOptions('rootDir');
// const TDKPath = path.join(process.cwd() + `/${entryDir}`);

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
                    `react-ssr:Page component ${path} successfully writes the server rendering cache`
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

const writeFileHander = (cacheDir, cacheUrl, Content) => {
    fs.exists(cacheUrl, (exists) => {
        if (exists) {
            writeFile(cacheUrl, Content);
        } else {
            fs.mkdir(cacheDir, { recursive: true }, (err) => {
                if (err) {
                    Logger.error(`react-ssr:${err.stack}`);
                } else {
                    writeFile(cacheUrl, Content);
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
        let compiler = new webPack(page, tools.isDev(), true);
        await compiler.run();
    }
    if (!fs.existsSync(jsClientdir)) {
        //客户端代码打包
        let compiler = new webPack(page, tools.isDev());
        await compiler.run();
    }
    return jspath;
};
/**
 * Router类型页面渲染解析
 * @param {*} ctx
 * @param {*} next
 */
export const renderServerDynamic = async (ctx, initProps, ssr = true) => {
    const context = {};
    var { page, query } = ctx[SSRKEY];
    if (!EntryList.has(page)) {
        return false;
    }
    let App = {};
    let jspath = await checkDistJsmodules(page);
    try {
        // eslint-disable-next-line no-undef
        if (tools.isDev()) {
            delete require.cache[require.resolve(jspath)];
        }
        App = require(jspath);
    } catch (error) {
        // eslint-disable-next-line no-console
        Logger.error(
            `react-ssr: ${page} Remove browser feature keywords such as windows/location from the react component, 
            or move into the real component didmount lifecycle for use`
        );
        Logger.error(error.stack);
    }
    let props = ssr && (await loadGetInitialProps(App, ctx));
    if (typeof initProps === 'object') {
        props = Object.assign(props || {}, initProps);
    }
    let Html = '';
    let location = ctx.url.split(page)[1];
    if (ssr) {
        try {
            Html = ReactDOMServer.renderToString(
                <StaticRouter location={location || '/'} context={context}>
                    <App page={page} path={ctx[SSRKEY].path} query={query} {...props} />
                </StaticRouter>
            );
        } catch (error) {
            Logger.warn('react-ssr:服务端渲染异常，降级使用客户端渲染！' + error.stack);
            Logger.warn(
                `react-ssr: ${page} Remove browser feature keywords such as windows/location from the react component, 
                or move into the real component didmount lifecycle for use`
            );
        }
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
        let rootNode = ctx[SSRKEY].options.rootNode;
        let replaceReg = new RegExp(`<div id="${rootNode}"><\/div>`);
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(
            replaceReg,
            `<div id="${rootNode}">${Html}</div>
             <script>var __SSR_DATA__ = 
                {
                    initProps:${JSON.stringify(props || {})},
                    page: "${page}",
                    path:"${ctx[SSRKEY].path}",
                    query:${JSON.stringify(query || {})},
                    config:${JSON.stringify(ctx[SSRKEY].config || {})},
                    options:${JSON.stringify(ctx[SSRKEY].options || {})}
                }
             </script>`
        );
        return document;
    }
};

/**
 * 获取服务端渲染直出资源
 * @param {*} ctx
 */
export const renderServerStatic = async (ctx, initProps) => {
    let page = ctx[SSRKEY].page;
    let { cache, ssrIngore, ssr, staticPages } = ctx[SSRKEY].options;
    return new Promise(async (resolve) => {
        if (!ssr || (ssrIngore && ssrIngore.test(page))) {
            // 客户端渲染模式
            resolve(await renderServerDynamic(ctx, initProps, false));
            // return resolve(await render(page));
        }

        let ssrCacheDir = `${cacheDir}${ctx.url}/`;
        let ssrCacheUrl = `${cacheDir}${ctx.url}/${page}.html`;
        if (tools.isDev() || (!cache && staticPages.indexOf(page) == -1)) {
            // ssr无缓存模式，适用每次请求都是动态渲染页面场景
            resolve(await renderServerDynamic(ctx, initProps, true));
        } else {
            if (fs.existsSync(ssrCacheUrl)) {
                // ssr缓存模式，执行一次ssr 第二次直接返回缓存后的html静态资源
                let rs = fs.createReadStream(ssrCacheUrl, 'utf-8');
                resolve(rs);
            } else {
                // ssr缓存模式,首次执行
                let document = await renderServerDynamic(ctx, initProps, true);
                resolve(document);
                process.nextTick(() => {
                    writeFileHander(ssrCacheDir, ssrCacheUrl, document); //异步写入服务器缓存目录
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
// export const renderTDK = async (document, page, ctx, App) => {
//     let pageTDKPath = TDKPath + '/pages/' + page + '/' + 'TDK.js';
//     let defaultTDKPath = TDKPath + '/' + 'TDK.js';
//     let getInitialTDK = null;
//     try {
//         //获取getInitialTDK函数
//         if (App.getInitialTDK) {
//             getInitialTDK = App.getInitialTDK;
//         } else if (fs.existsSync(pageTDKPath)) {
//             if (tools.isDev()) {
//                 delete require.cache[require.resolve(pageTDKPath)];
//             }
//             getInitialTDK = require(pageTDKPath);
//         } else if (fs.existsSync(defaultTDKPath)) {
//             if (tools.isDev()) {
//                 delete require.cache[require.resolve(defaultTDKPath)];
//             }
//             getInitialTDK = require(defaultTDKPath);
//         } else {
//             return document;
//         }
//         //执行getInitialTDK拿到结果
//         if (typeof getInitialTDK == 'function') {
//             let res = await getInitialTDK(
//                 ctx,
//                 (ctx[SSRKEY] && ctx[SSRKEY].query) || null,
//                 (ctx[SSRKEY] && ctx[SSRKEY].path) || null
//             );
//             //解析结果拿到最终模板
//             if (res.headContent) {
//                 document = document.replace(
//                     /<head>[\s\S]*<\/title>/,
//                     `<head>
//                         ${res.headContent}
//                     `
//                 );
//             } else {
//                 let resStr = '';
//                 for (let key in res) {
//                     if (key == 'title') {
//                         resStr = `<title>${res[key]}</title>`;
//                         document = document.replace(/<title>.*<\/title>/, resStr);
//                     } else {
//                         let reg = new RegExp(`<meta\\s*name\\s*=\\s*["']\\s*${key}.*`);
//                         resStr = `<meta name="${key}" content="${res[key]}">`;
//                         if (document.match(reg)) {
//                             //替换
//                             document = document.replace(reg, resStr);
//                         } else {
//                             //添加
//                             document = document.replace(
//                                 '<title>',
//                                 `<meta name="${key}" content="${res[key]}">\r\n    <title>`
//                             );
//                         }
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         // eslint-disable-next-line no-console
//         Logger.error(
//             `please check getInitialTDK in /${entryDir}/${page}/${page}.js or TDK.js in/${entryDir}`
//         );
//         Logger.error(error.stack);
//     }
//     return document;
// };
