import React from 'react';
import fs from 'fs';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
// import getStream from 'get-stream';
import path from 'path';
import { loadGetInitialProps } from './get-static-props';
import webPack from './webpack/run';
import help from './utils';
import Logger from './log';
const outputPath = path.join(process.cwd() + '/.mini-next');
const clientPath = path.join(process.cwd() + '/dist');
const TDKPath = path.join(process.cwd() + '/src');
/**
 * 写入文件,存在则覆盖
 * @param {*} path 文件名称
 * @param {*} Content 内容
 */
const writeFile = async (path, Content) => {
    return new Promise(resolve => {
        fs.writeFile(path, Content, { encoding: 'utf8' }, function(err) {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
                Logger.info(`[miniNext]:${path} SSR static resource HTML cache successful.`);
            }
        });
    });
};

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
export const render = pagename => {
    return new Promise((resolve, reject) => {
        let viewUrl = `${clientPath}/client/${pagename}/${pagename}.html`;
        fs.readFile(viewUrl, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const filterXss = str => {
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
    fs.exists(outputPath, exists => {
        if (exists) {
            writeFile(name, Content);
        } else {
            fs.mkdir(outputPath, err => {
                if (err) {
                    Logger.error(`[miniNext]:${err.stack}`);
                } else {
                    writeFile(name, Content);
                }
            });
        }
    });
};
/**
 *
 * @param {*} pagename
 */
export const checkDistJsmodules = async pagename => {
    let jspath = clientPath + '/server/' + pagename + '/' + pagename + '.js';
    let jsClientdir = clientPath + '/client/' + pagename;
    if (!fs.existsSync(jspath)) {
        //服务端代码打包
        let compiler = new webPack(pagename, help.isDev(), true);
        await compiler.run();
    }
    if (!fs.existsSync(jsClientdir)) {
        //客户端代码打包
        let compiler = new webPack(pagename, help.isDev());
        await compiler.run();
    }
    return jspath;
};
/**
 * Router类型页面渲染解析
 * @param {*} ctx
 * @param {*} next
 */
export const renderServerDynamic = async ctx => {
    const context = {};
    var { pagename, pathname, query } = ctx.params;
    let App = {};
    let jspath = await checkDistJsmodules(pagename);
    try {
        // eslint-disable-next-line no-undef
        if (help.isDev()) {
            delete require.cache[require.resolve(jspath)];
        }
        App = require(jspath);
    } catch (error) {
        // eslint-disable-next-line no-console
        Logger.error(
            'place move  windows/location object into React componentDidMount(){} ',
            pagename
        );
        Logger.error(error.stack);
    }
    let props = await loadGetInitialProps(App, ctx);
    let Html = '';
    // let Htmlstream = ''; 使用renderToNodeStream暂时没有多大的效益 当前方案得修改替换基础模板 后续通过stream替换基础模板内容？
    let locationUrl = ctx.request.url.split(pagename)[1];
    try {
        Html = ReactDOMServer.renderToString(
            <StaticRouter location={locationUrl || '/'} context={context}>
                <App pageName={pagename} pathName={pathname} query={query} {...props} />
            </StaticRouter>
        );
    } catch (error) {
        Logger.warn('服务端渲染异常，降级使用客户端渲染！' + error);
    }
    if (context.url) {
        ctx.response.writeHead(301, {
            Location: context.url
        });
        ctx.response.end();
    } else {
        // 加载 index.html 的内容
        let data = await render(pagename);
        //进行xss过滤
        for (let key in query) {
            if (query[key] instanceof Array) {
                query[key] = query[key].map(item => {
                    return filterXss(item);
                });
            } else {
                query[key] = filterXss(query[key]);
            }
        }
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(
            /<div id="app"><\/div>/,
            `<div id="app">${Html}</div>
             <script>var __miniNext_DATA__ = 
                {
                    serverProps:${JSON.stringify(props)},
                    pageName: "${pagename}",
                    pathName:"${pathname}",
                    query:${JSON.stringify(query)},
                    config:${JSON.stringify(ctx.otherConfig)},
                    miniNextConfig:${JSON.stringify(ctx.miniNextConfig)}
                }
             </script>`
        );
        return await renderTDK(document, pagename, ctx, App);
    }
};

/**
 * 获取服务端渲染直出资源
 * @param {*} ctx
 */
export const renderServerStatic = async ctx => {
    let pageName = ctx.params.pagename;
    let { ssrCache, ssrIngore, ssr, statiPages } = ctx.miniNextConfig;
    return new Promise(async resolve => {
        if (!ssr || (ssrIngore && ssrIngore.test(pageName))) {
            // 客户端渲染模式
            return resolve(await render(pageName));
        }

        let viewUrl = `${outputPath}/${pageName}.html`;
        if (help.isDev() || (!ssrCache && statiPages.indexOf(pageName) == -1)) {
            // ssr无缓存模式，适用每次请求都是动态渲染页面场景
            Logger.info(`[miniNext]: ${ctx.path} route uses SSR mode to access.`);
            resolve(await renderServerDynamic(ctx));
        } else {
            if (fs.existsSync(viewUrl)) {
                // ssr缓存模式，执行一次ssr 第二次直接返回缓存后的html静态资源
                Logger.info(`[miniNext]: ${ctx.path} route is accessed by SSR cache mode.`);
                let rs = fs.createReadStream(viewUrl, 'utf-8');
                resolve(rs);
            } else {
                // ssr缓存模式,首次执行
                Logger.info(`[miniNext]: ${ctx.path} route uses SSR mode for the first time.`);
                let document = await renderServerDynamic(ctx);
                resolve(document);
                process.nextTick(() => {
                    writeFileHander(outputPath + '/' + pageName + '.html', document); //异步写入服务器缓存目录
                });
            }
        }
    });
};
/**
 * TDK解析 seo优化
 * @param {*} document
 * @param {*} pagename
 * @param {*} ctx
 */
export const renderTDK = async (document, pagename, ctx, App) => {
    let pageTDKPath = TDKPath + '/pages/' + pagename + '/' + 'TDK.js';
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
                (ctx.params && ctx.params.query) || null,
                (ctx.params && ctx.params.pathname) || null
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
            `please check getInitialTDK in /src/${pagename}/${pagename}.js or TDK.js in/src or /src/`
        );
        Logger.error(error.stack);
    }
    return document;
};
