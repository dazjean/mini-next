import webpack from 'webpack';
import path from 'path';
import { getProconfig } from './proconfig';
import { getDevconfig } from './devconfig';
import serverConfig from './serverconfig';

const clientPath = path.join(process.cwd() + '/dist/client');

class Webpack {
    constructor(pages, dev = true, buildserver = false) {
        this.pageName = pages;
        this.config = buildserver
            ? serverConfig(this.pageName)
            : this.getWebpackConfig(this.pageName, dev);
        this.Compiler = webpack(this.config);
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
            this.Compiler.run((err, stats) => {
                if (err) {
                    if (err.details) {
                        console.error(err.details);
                    }
                    reject(err.stack || err);
                }

                console.info(
                    stats.toString({
                        chunks: false, // 使构建过程更静默无输出
                        entrypoints: true,
                        publicPath: true,
                        performance: true,
                        env: true,
                        depth: true,
                        colors: true // 在控制台展示颜色
                    })
                );

                const info = stats.toJson();
                if (stats.hasErrors()) {
                    console.error('[miniNext]:编译错误!!!', info.errors.join());
                    reject(info.errors);
                    return;
                }
                //处理代码编译中产生的warning
                if (stats.hasWarnings()) {
                    console.warn('[miniNext]:编译警告!!!', info.warnings.join());
                }

                resove(true);
            });
        });
    }
    webpackCallback(err, stats) {
        console.info(
            stats.toString({
                chunks: false,
                colors: true
            })
        );
        console.info('[miniNext]:compiler....ok!');
    }
    clearRequireCache(moduleFilename) {
        delete require.cache[moduleFilename];
    }
}

module.exports = Webpack;
