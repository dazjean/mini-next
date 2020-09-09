/*
 * @Author: zhang dajia * @Date: 2018-11-05 14:16:25
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-12-10 11:11:08
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

import { getConfig } from './utils';
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
        this.dev = dev && process.env.NODE_ENV !== 'production';
        this.config = getConfig(app);
        this.redirect();
        this.hotReload();
        this.registerPages();
        this.serverStatic();
    }

    redirect(){
        if(this.dev) {
            this.app.use(async (ctx, next) => {
                if(ctx.path == '/index'){
                    return ctx.redirect('/index/index');
                }
                await next();
            });
        }
    }

    async registerPages() {
        let pages = await readClientPages();
        pages.forEach(page => {
            let pageMain = path.join(pagePath, normalizePagePath(`${page}/${page}.js`));
            if (
                fs.existsSync(pageMain) //是否存在入口文件
            ) {
                this.pushRouter(page);
            }
        });
        this.app.use(this.router.routes());
        this.app.use(this.router.allowedMethods());
    }
    serverStatic() {
        this.app.use(async (ctx, next) => {
            let staticStatus;
            try {
                staticStatus = await send(ctx, ctx.path, { root: publicPath });
            } catch (err) {
                return next();
            }
            if (staticStatus == undefined) {
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
        console.log('register router:' + rePath);
        this.router.get(rePath, async (ctx, next) => {
            let parseQ = parseQuery(ctx);
            let pageName = parseQ.pathname
                .replace('/' + prefixRouter, '')
                .replace(/^\//, '')
                .split('/')[0];
            ctx.miniNextConfig = this.config;
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
