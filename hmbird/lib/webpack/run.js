import webpack from 'webpack';
import { getProconfig } from './proconfig';
import { getDevconfig } from './devconfig';
import HotReload from './hot-reload';
import path from 'path';
const clientPath = path.join(process.cwd() + '/dist/client');

class Webpack {
    constructor(pages, app) {
        let pageName = pages.join(',');
        this.app = app;
        this.config = this.getWebpackConfig(pageName, true);
        this.Compiler = webpack(this.config);
        this.run(pageName);
        //this.hotReload();
    }
    getWebpackConfig(pageName, dev) {
        if (dev) {
            return getDevconfig(pageName, true);
        } else {
            return getProconfig(pageName, true);
        }
    }
    async run(pagename) {
        let callback = await this.compilerRun(pagename);
        if (callback === true) {
            let pagefile = clientPath + '/' + pagename + '/' + pagename + '.js';
            this.clearRequireCache(pagefile);
        }
    }

    compilerRun() {
        return new Promise((resove, reject) => {
            //this.hotReload(Compiler);
            this.Compiler.run((err, stats) => {
                if (err) {
                    reject(err.stack);
                }
                const info = stats.toJson();
                if (stats.hasErrors()) {
                    console.error(info.errors);
                    reject(info.errors);
                    return;
                }
                //处理代码编译中产生的warning
                if (stats.hasWarnings()) {
                    console.warn(info.warnings);
                }
                resove(true);
            });
        });
    }
    webpackCallback(err, stats) {
        console.log(
            stats.toString({
                chunks: false,
                colors: true
            })
        );
        console.log('compiler....ok!');
    }
    hotReload(compiler) {
        new HotReload(this.app, compiler || this.Compiler);
    }
    clearRequireCache(moduleFilename) {
        delete require.cache[moduleFilename];
    }
}

module.exports = Webpack;
