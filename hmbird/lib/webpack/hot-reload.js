const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

class HotReload {
    constructor(app, complier) {
        this.app = app;
        this.complier = complier;
        this.webpackDevMiddleware();
        this.webpackHotMiddleware();
    }
    webpackHotMiddleware() {
        let hotMiddleware = webpackHotMiddleware(this.complier, {
            log: false,
            heartbeat: 2000
        });
        this.app.use(hotMiddleware);
    }
    webpackDevMiddleware() {
        let devMiddleware = webpackDevMiddleware(this.complier, {
            publicPath: '/',
            serverSideRender: false,
            quiet: true //向控制台显示任何内容
        });
        this.app.use(devMiddleware);
    }
}

module.exports = HotReload;
