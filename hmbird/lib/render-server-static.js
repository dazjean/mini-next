import React from 'react';
import fs from 'fs';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import getStream from 'get-stream';
import path from 'path';
import { loadGetInitialProps } from './get-static-props';
const outputPath = path.join(process.cwd() + '/_output');
const clientPath = path.join(process.cwd() + '/dist/client');

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
                console.log(`${path}----Cache in server`);
            }
        });
    });
};

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
const render = pagename => {
    return new Promise((resolve, reject) => {
        let viewUrl = `${clientPath}/${pagename}/${pagename}.html`;
        fs.readFile(viewUrl, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const writeFileHander = (name, Content) => {
    fs.exists(outputPath, exists => {
        if (exists) {
            writeFile(name, Content);
        } else {
            fs.mkdir(outputPath, err => {
                if (err) {
                    console.log(err.stack);
                } else {
                    writeFile(name, Content);
                }
            });
        }
    });
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
    let pagefile = clientPath + '/' + pagename + '/' + pagename + '.js';
    try {
        // eslint-disable-next-line no-undef
        App = require(pagefile);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
            'place move  windows/location object into React componentDidMount(){} ',
            pagename
        );
        console.warn(error.stack);
    }
    let props = await loadGetInitialProps(App, ctx);
    let Html = '';
    let Htmlstream = '';
    let locationUrl = ctx.request.url.split(pagename)[1];
    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(
            <StaticRouter location={locationUrl || '/'} context={context}>
                <App pathname={pathname} query={query} {...props} />
            </StaticRouter>
        );
    } catch (error) {
        console.warn('服务端渲染异常，降级使用客户端渲染！');
    }
    if (context.url) {
        ctx.response.writeHead(301, {
            Location: context.url
        });
        ctx.response.end();
    } else {
        // 加载 index.html 的内容
        let data = await render(pagename);
        try {
            Html = await getStream(Htmlstream);
        } catch (error) {
            console.warn('流转化字符串异常，降级使用客户端渲染！');
        }
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
        writeFileHander(outputPath + '/' + pagename + '.html', document); //缓存本地
        return document;
    }
};

/**
 * 获取服务端渲染直出资源
 * @param {*} ctx
 */
export const renderServerStatic = async ctx => {
    let pageName = ctx.params.pagename;
    let { ssrCache, ssrIngore } = ctx.hmbirdconfig;
    return new Promise(async resolve => {
        if (ssrIngore.test(pageName)) {
            return resolve(await render(pageName));
        }

        let viewUrl = `${outputPath}/${pageName}.html`;
        if (!ssrCache) {
            resolve(await renderServerDynamic(ctx));
        } else {
            fs.readFile(viewUrl, 'utf8', async (err, data) => {
                if (err) {
                    console.log('Immediate preparation static.....' + pageName);
                    resolve(await renderServerDynamic(ctx));
                } else {
                    console.log('ssrCache.....' + pageName);
                    resolve(data);
                }
            });
        }
    });
};
