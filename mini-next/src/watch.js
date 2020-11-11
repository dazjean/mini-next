import chokidar from 'chokidar';
import path from 'path';
import { readClientPages } from './pageInit';
import webPack from './webpack/run';

const pagesDir = path.join(process.cwd() + '/src/pages');

export default class WatchPages {
    constructor(app) {
        this.app = app;
        this.startWathc();
    }
    async startWathc() {
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
            console.log('webpack server building......');
            let beginTime = new Date().getTime();
            let pageName = '/' + path.relative(pagesDir, fileName).replace(/\\+/g, '/');
            pageName = pageName.replace(/^\//, '').split('/')[0];
            new webPack(pageName, true, true).run(); // 更新服务端入口文件
            console.log('webpack built success in ' + (new Date().getTime() - beginTime) + 'ms');
        });
    }
}
