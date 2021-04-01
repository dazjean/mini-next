import chokidar from 'chokidar';
import path from 'path';
import { readEntryPages } from './pageInit';
import webPack from './webpack/run';
import Logger from './log';

const { getEntryDir } = require('./utils');

const entryDir = getEntryDir();

export default class WatchPages {
    constructor(app) {
        this.app = app;
        this.startWathc();
    }
    async startWathc() {
        let listOfDirectories = [];
        let Directories = await readEntryPages();
        Directories.forEach(cateName => {
            let pageMain = entryDir + '/' + cateName;
            listOfDirectories.push(pageMain);
        });
        const watcher = chokidar.watch(listOfDirectories, {
            ignored: './node_modules', // ignore dotfiles
            persistent: true
        });
        watcher.on('change', async fileName => {
            let beginTime = new Date().getTime();
            let pageName = '/' + path.relative(entryDir, fileName).replace(/\\+/g, '/');
            Logger.warn(
                `[miniNext]:Listen to ${pageName} file change, will recompile webpack........`
            );
            pageName = pageName.replace(/^\//, '').split('/')[0];
            if (fileName.endsWith('.html')) {
                //html改动，重新编译client
                await new webPack(pageName, true, false).run(); // 更新client
            } else {
                await new webPack(pageName, true, true).run(); // 更新server
            }
            Logger.warn(
                '[miniNext]:webpack recompile success in ' +
                    (new Date().getTime() - beginTime) +
                    'ms'
            );
        });
    }
}
