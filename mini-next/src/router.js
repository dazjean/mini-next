/*
 * @Author: zhang dajia * @Date: 2018-11-05 14:16:25
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2020-12-01 19:53:25
 * @Last  description: mini-next-router
 */
import Router from 'koa-router';
import { readClientPages } from './pageInit';
import fs from 'fs';
import path from 'path';
import send from 'koa-send';
import { sendHTML } from './send-html';
import { parseQuery } from './parse-query';
import { renderServerStatic } from './render-server-static';
import HotReload from './webpack/hot-reload';
import WatchPage from './watch';
const publicPath = path.join(process.cwd() + '/dist/client');
const pagePath = path.join(process.cwd() + '/src/pages');

import Logger from './log';
import help, { getConfig, getOtherConfig } from './utils';
function normalizePagePath(page) {
    // If the page is `/` we need to append `/index`, otherwise the returned directory root will be bundles instead of pages
    // Resolve on anything that doesn't start with `/`
    if (page[0] !== '/') {
        page = `/${page}`;
    }
    // Throw when using ../ etc in the pathname
    const resolvedPage = path.posix.normalize(page);
    if (page !== resolvedPage) {
        throw new Error('Requested and resolved page mismatch');
    }
    return page;
}
class RegisterClientPages {
    constructor(app, dev = true) {
        this.router = new Router();
        this.app = app;
        this.dev = dev && help.isDev();
        this.config = getConfig(app);
        this.otherConfig = getOtherConfig();
        this.hotReload();
        this.registerPages();
        this.serverStatic();
    }
    async registerPages() {
        let pages = await readClientPages();
        let hasHome = false;
        pages.forEach(page => {
            let pageMain1 = path.join(pagePath, normalizePagePath(`${page}/${page}.js`));
            let pageMain2 = path.join(pagePath, normalizePagePath(`${page}/${page}.jsx`));
            let pageMain3 = path.join(pagePath, normalizePagePath(`${page}/${page}.tsx`));
            let pageMain4 = path.join(pagePath, normalizePagePath(`${page}/${page}.ts`));
            if (
                fs.existsSync(pageMain1) ||
                fs.existsSync(pageMain2) ||
                fs.existsSync(pageMain3) ||
                fs.existsSync(pageMain4) //是否存在入口文件
            ) {
                if (this.dev && page == 'index') {
                    Logger.warn(
                        'Pagename is best not to call index, Otherwise, there will be unexpected situations'
                    );
                }
                this.pushRouter(page);
                if (page === '_home') {
                    this.homeRouter(page);
                    hasHome = true;
                }
            }
        });
        this.app.use(this.router.routes());
        this.app.use(this.router.allowedMethods());
    }
    serverStatic() {
        this.app.use(async (ctx, next) => {
            let staticStatus;
            try {
                staticStatus = await send(ctx, ctx.path, {
                    root: publicPath,
                    setHeaders: function(res) {
                        res.setHeader('Cache-Control', ['max-age=2592000']);
                    }
                });
            } catch (err) {
                return next();
            }
            if (staticStatus == undefined) {
                await next();
            }
        });
    }
    homeRouter(homePage) {
        this.app.use(async (ctx, next) => {
            if (ctx.path === '/') {
                let parseQ = parseQuery(ctx);
                ctx.miniNextConfig = this.config;
                ctx.otherConfig = this.otherConfig;
                if (!ctx.params) {
                    ctx.params = {};
                }
                ctx.params.pagename = homePage;
                ctx.params.query = parseQ.query;
                ctx.params.pathname = '/';
                let document = await renderServerStatic(ctx);
                this.renderHtml(ctx, document);
            } else {
                await next();
            }
        });
    }
    pushRouter(page) {
        var rePath = new RegExp('^/' + page + '(/?.*)'); // re为/^\d+bl$
        let { prefixRouter } = this.config;
        if (prefixRouter != '') {
            rePath = new RegExp('^/' + prefixRouter + '/' + page + '(/?.*)'); // re为/^\d+bl$
        }
        Logger.info(`[miniNext]: ${rePath}---->/${page}/${page}`);
        this.router.get(rePath, async (ctx, next) => {
            let parseQ = parseQuery(ctx);
            let pageName = parseQ.pathname
                .replace('/' + prefixRouter, '')
                .replace(/^\//, '')
                .split('/')[0];
            ctx.miniNextConfig = this.config;
            ctx.otherConfig = this.otherConfig;
            if (pageName == page) {
                ctx.params.pagename = page;
                ctx.params.query = parseQ.query;
                ctx.params.pathname = parseQ.pathname.replace(
                    new RegExp('^/' + pageName + '(/?)'),
                    ''
                );
                let document = await renderServerStatic(ctx);
                this.renderHtml(ctx, document);
            } else {
                await next();
            }
        });
    }
    renderPage() {}
    render404(ctx, path) {
        ctx.body = 'not found:' + path.pathname;
    }
    renderError(ctx, path, err) {
        ctx.body = 'service error:' + path.pathname + '\n' + err;
    }
    renderHtml(ctx, html) {
        sendHTML(ctx, html, { generateEtags: true });
    }
    hotReload() {
        if (this.dev) {
            new HotReload(this.app);
            new WatchPage(this.app);
        }
    }
}
module.exports = RegisterClientPages;
