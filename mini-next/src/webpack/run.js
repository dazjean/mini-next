import webpack from 'webpack';
import { getProconfig } from './proconfig';
import { getDevconfig } from './devconfig';
import serverConfig from './serverconfig';
import HotReload from './hot-reload';
import path from 'path';
const clientPath = path.join(process.cwd() + '/dist/client');

class Webpack {
    constructor(pages, app, buildserver = false) {
        this.pageName = pages;
        this.app = app;
        this.config = buildserver
            ? serverConfig(this.pageName)
            : this.getWebpackConfig(this.pageName, true);
        this.Compiler = webpack(this.config);
        //this.run(pageName);
        //this.hotReload();
    }
    getWebpackConfig(pageName, dev) {
        if (dev) {
            return getDevconfig(pageName, true);
        } else {
            return getProconfig(pageName, true);
        }
    }
    async run() {
        let pagename = this.pageName;
        let callback = await this.compilerRun();
        if (callback === true) {
            let pagefile = clientPath + '/' + pagename + '/' + pagename + '.js';
            this.clearRequireCache(pagefile);
        }
        return true;
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
