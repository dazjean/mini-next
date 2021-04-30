import webpack from 'webpack';
import { getProconfig } from './proconfig';
import { getDevconfig } from './devconfig';
import serverConfig from './serverconfig';

class Webpack {
    constructor(pages, dev = true, buildserver = false) {
        this.page = pages;
        this.config = buildserver ? serverConfig(this.page) : this.getWebpackConfig(this.page, dev);
        this.Compiler = webpack(this.config);
    }
    getWebpackConfig(page, dev) {
        if (dev) {
            return getDevconfig(page, true);
        } else {
            return getProconfig(page, true);
        }
    }
    async run() {
        return await this.compilerRun();
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
                    console.error('react-ssr:编译错误!!!', info.errors.join());
                    reject(info.errors);
                    return;
                }
                //处理代码编译中产生的warning
                if (stats.hasWarnings()) {
                    console.warn('react-ssr:编译警告!!!', info.warnings.join());
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
        console.info('react-ssr:compiler....ok!');
    }
    clearRequireCache(moduleFilename) {
        delete require.cache[moduleFilename];
    }
}

module.exports = Webpack;
