import { devMiddleware, hotMiddleware } from 'koa-webpack-middleware';
import webpack from 'webpack';
const { getBaseconfig } = require('./baseconfig.js');
const webpackConfig = getBaseconfig(0, true, true);
class HotReload {
    constructor(app) {
        this.app = app;
        this.complier = webpack(webpackConfig);
        this.webpackDevMiddleware();
        this.webpackHotMiddleware();
    }
    webpackHotMiddleware() {
        let _hotMiddleware = hotMiddleware(this.complier, {
            log: console.warn,
            heartbeat: 2000
        });
        this.app.use(_hotMiddleware);
    }
    webpackDevMiddleware() {
        let _devMiddleware = devMiddleware(this.complier, {
            publicPath: webpackConfig.output.publicPath,
            quiet: true //向控制台显示任何内容
        });
        this.app.use(_devMiddleware);
    }
}

module.exports = HotReload;
