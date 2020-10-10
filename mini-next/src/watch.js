import chokidar from 'chokidar';
import path from 'path';
import { readClientPages } from './pageInit';
const pagesDir = path.join(process.cwd() + '/src/pages');
import webPack from './webpack/run';

class WatchPages {
    constructor(app) {
        this.app = app;
        this.startWathc();
    }
    async startWathc() {
        let App = this.app;
        let listOfDirectories = [];
        let Directories = await readClientPages();
        Directories.forEach(cateName => {
            let pageMain = pagesDir + '/' + cateName;
            listOfDirectories.push(pageMain);
        });
        const watcher = chokidar.watch(listOfDirectories, {
            ignored: './node_modules', // ignore dotfiles
            persistent: true
        });
        watcher.on('change', fileName => {
            let pageName = '/' + path.relative(pagesDir, fileName).replace(/\\+/g, '/');
            pageName = pageName.replace(/^\//, '').split('/')[0];
            new webPack(pageName, App).run(); // 更新客户端入口文件
            new webPack(pageName, null, true).run(); // 更新服务端入口文件
        });
    }
}

module.exports = WatchPages;
