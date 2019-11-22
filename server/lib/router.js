/*
 * @Author: zhang dajia * @Date: 2018-11-05 14:16:25
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-11-22 18:49:42
 * @Last  description: hmbird-router
 */
import Router from 'koa-router';
import { readClientPages } from '../pageInit';
import fs from 'fs';
import path from 'path';
import { parse as parseUrl } from 'url';
import send from 'koa-send';
import { sendHTML } from './send-html';
import { parseQuery } from './parse-query';
import { renderServerStatic } from './render-server-static';
const clientPath = path.join(process.cwd() + '/dist/client');
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
    constructor(app) {
        this.router = new Router();
        this.app = app;
        this.config = getConfig(app);
        this.registerPages();
        this.serverStatic();
    }
    async registerPages() {
        let pages = await readClientPages();
        pages.forEach(page => {
            let pageMain = path.join(clientPath, normalizePagePath(`${page}/${page}.js`));
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
            let { req, res } = ctx;
            try {
                await send(ctx, ctx.path, { root: clientPath });
            } catch (err) {
                if (err.statusCode === 404 || err.code == 'ENOENT') {
                    this.render404(ctx, parseUrl(req.url));
                } else if (err.statusCode === 412) {
                    res.statusCode = 412;
                    return this.renderError(ctx, parseUrl(req.url), err);
                } else {
                    throw err;
                }
            }

            await next();
        });
    }
    pushRouter(page) {
        var rePath = new RegExp('^/' + page + '(/?.*)'); // re为/^\d+bl$
        console.log('register router:' + rePath);
        this.router.get(rePath, async (ctx, next) => {
            let parseQ = parseQuery(ctx);
            let pageName = parseQ.pathname.replace(/^\//, '').split('/')[0];
            ctx.hmbirdconfig = this.config;
            console.log(this.config);
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
}
module.exports = RegisterClientPages;
