/*
 * @Author: zhang dajia * @Date: 2018-11-05 14:16:25
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2020-12-01 19:53:25
 * @Last  description: mini-next-core
 */
import send from 'koa-send';
import { sendHTML } from './send-html';
import { parseQuery } from './parse-query';
import { renderServerStatic } from './render-server-static';
import HotReload from './webpack/hot-reload';
import WatchPage from './watch';
import Logger from './log';
import { EntryList } from './webpack/get-entry';
import tools, { getCoreConfig, getIndexConfig, clientDir, SSRKEY } from './tools';

export default class MiniNext {
    /**
     *
     * @param {*} app koa实例对象
     * @param {*} dev 是否开发环境
     * @param {*} defaultRouter 是否使用默认文件路由
     */
    constructor(app, dev = true, defaultRouter = true) {
        this.routes = [];
        this.app = app;
        if (dev) {
            process.env.NODE_ENV = 'development';
        } else {
            process.env.NODE_ENV = 'production';
        }
        this.dev = dev && tools.isDev();
        this.options = Object.assign(getCoreConfig(app));
        this.config = getIndexConfig();
        this.hotReload();
        this.serverStatic();
        defaultRouter && this.usePageRouter();
    }

    async usePageRouter() {
        EntryList.forEach((page) => {
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
            } catch (_err) {
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
                ctx[SSRKEY] = ctx[SSRKEY] || {};
                ctx[SSRKEY].options = this.options;
                ctx[SSRKEY].config = this.config;
                ctx[SSRKEY].page = homePage;
                ctx[SSRKEY].query = parseQ.query;
                ctx[SSRKEY].path = '/';
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
        Logger.info(`umajs-react-ssr: ${rePath}---->/${page}/${page}`);
        this.routes.push(rePath);
    }

    middleware() {
        const self = this;
        return async (ctx, next) => {
            for (let i = 0; i < self.routes.length; i++) {
                const regRouter = self.routes[i];
                if (regRouter.test(ctx.path)) {
                    self.setContext(ctx);
                    const document = await renderServerStatic(ctx);
                    if (!document) {
                        return next();
                    }
                    this.renderHtml(ctx, document);
                    break;
                }
            }
            await next();
        };
    }

    setContext(ctx, viewName) {
        let { prefixRouter } = this.options;
        ctx[SSRKEY] = ctx[SSRKEY] || {};
        ctx[SSRKEY].options = this.options;
        ctx[SSRKEY].config = this.config;
        const parseQ = parseQuery(ctx);
        const page = parseQ.pathname
            .replace('/' + prefixRouter, '')
            .replace(/^\//, '')
            .split('/')[0];
        ctx[SSRKEY].page = viewName || page;
        ctx[SSRKEY].query = parseQ.query;
        ctx[SSRKEY].path = parseQ.pathname.replace(
            new RegExp('^/' + viewName || page + '(/?)'),
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
        ctx[SSRKEY].options = Object.assign({}, this.options, options);
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
