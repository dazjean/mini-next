/*
 * @Author: zhang dajia * @Date: 2018-11-05 14:16:25
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2020-12-01 19:53:25
 * @Last  description: mini-next-core
 */
import fs from 'fs';
import path from 'path';
import send from 'koa-send';
import { sendHTML } from './send-html';
import { parseQuery } from './parse-query';
import { renderServerStatic } from './render-server-static';
import HotReload from './webpack/hot-reload';
import WatchPage from './watch';
import Logger from './log';
import { readEntryPages } from './pageInit';
import help, { getCoreConfig, getIndexConfig, getEntryDir, clientDir } from './utils';

const entryDir = getEntryDir();

export default class MiniNext {
    constructor(app, dev = true, useRouter = true, options = {}) {
        this.routes = [];
        this.app = app;
        this.dev = dev && help.isDev();
        this.options = Object.assign(getCoreConfig(app), options);
        this.config = getIndexConfig();
        this.hotReload();
        useRouter && this.usePageRouter();
        this.serverStatic();
    }

    async usePageRouter() {
        let pages = await readEntryPages();
        const EntryTypes = ['.js', '.jsx', '.ts', '.tsx'];
        pages.forEach((page) => {
            const exists = EntryTypes.some((suffix) => {
                const entryjs = path.join(entryDir, `${page}/${page}${suffix}`);
                if (fs.existsSync(entryjs)) {
                    return true; // 存在任意一个返回true
                }
            });

            if (exists) {
                if (this.dev && page == 'index') {
                    Logger.warn(
                        'Pagename is best not to call index, Otherwise, there will be unexpected situations'
                    );
                }
                if (page === '_home') {
                    this.rootMiddleware(page);
                } else {
                    this.addRouter(page);
                }
            }
        });
        this.app.use(this.middleware());
    }

    serverStatic() {
        this.app.use(async (ctx, next) => {
            let staticStatus;
            try {
                staticStatus = await send(ctx, ctx.path, {
                    root: clientDir,
                    setHeaders: function (res) {
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

    rootMiddleware(homePage) {
        this.app.use(async (ctx, next) => {
            if (ctx.path === '/') {
                let parseQ = parseQuery(ctx);
                ctx._miniNextOptions = this.options;
                ctx._miniNextConfig = this.config;
                if (!ctx._miniNext) {
                    ctx._miniNext = {};
                }
                ctx._miniNext.pagename = homePage;
                ctx._miniNext.query = parseQ.query;
                ctx._miniNext.pathname = '/';
                let document = await renderServerStatic(ctx);
                this.renderHtml(ctx, document);
            } else {
                await next();
            }
        });
    }

    addRouter(page) {
        var rePath = new RegExp('^/' + page + '(/?.*)'); // re为/^\d+bl$
        let { prefixRouter } = this.options;
        if (prefixRouter != '') {
            rePath = new RegExp('^/' + prefixRouter + '/' + page + '(/?.*)'); // re为/^\d+bl$
        }
        Logger.info(`[miniNext]: ${rePath}---->/${page}/${page}`);
        this.routes.push(rePath);
    }

    middleware() {
        const self = this;
        return async (ctx, next) => {
            ctx._miniNextOptions = this.options;
            ctx._miniNextConfig = this.config;

            for (let i = 0; i < self.routes.length; i++) {
                const regRouter = self.routes[i];
                if (regRouter.test(ctx.path)) {
                    self.setContext(ctx);
                    const document = await renderServerStatic(ctx);
                    this.renderHtml(ctx, document);
                    break;
                }
            }
            await next();
        };
    }

    setContext(ctx, viewName) {
        let { prefixRouter } = this.options;
        ctx._miniNext = ctx._miniNext || {};
        const parseQ = parseQuery(ctx);
        const pageName = parseQ.pathname
            .replace('/' + prefixRouter, '')
            .replace(/^\//, '')
            .split('/')[0];
        ctx._miniNext.pagename = viewName || pageName;
        ctx._miniNext.query = parseQ.query;
        ctx._miniNext.pathname = parseQ.pathname.replace(
            new RegExp('^/' + viewName || pageName + '(/?)'),
            ''
        );
    }

    /**
     *
     * @param {*} ctx
     * @param {*} viewName  模板名称
     * @param {*} initProps 服务端初始化数据
     * @param {*} options
     */
    async render(ctx, viewName, initProps, options) {
        ctx._miniNextOptions = Object.assign({}, this.options, options);
        this.setContext(ctx, viewName);
        const document = await renderServerStatic(ctx, initProps);
        this.renderHtml(ctx, document);
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
