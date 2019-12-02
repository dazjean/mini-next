import Watchpack from 'watchpack';
import path from 'path';
import { readClientPages } from '../pageInit';
const pagesDir = path.join(process.cwd() + '/src/pages');
import webPack from './webpack/run';

var wp = new Watchpack({
    // options:
    aggregateTimeout: 1000,
    // fire "aggregated" event when after a change for 1000ms no additional change occurred
    // aggregated defaults to undefined, which doesn't fire an "aggregated" event

    poll: true,
    // poll: true - use polling with the default interval
    // poll: 10000 - use polling with an interval of 10s
    // poll defaults to undefined, which prefer native watching methods
    // Note: enable polling when watching on a network path

    ignored: /node_modules/
    // anymatch-compatible definition of files/paths to be ignored
    // see https://github.com/paulmillr/chokidar#path-filtering
});

class WatchPages {
    constructor(app) {
        this.watchPages = wp;
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
        wp.watch([], listOfDirectories, Date.now() - 10000);
        wp.on('aggregated', function(knownFiles) {
            // changes: an array of all changed files
            let dynamicRoutedPages = [];
            for (const fileName of knownFiles) {
                let pageName = '/' + path.relative(pagesDir, fileName).replace(/\\+/g, '/');
                pageName = pageName.replace(/^\//, '');

                dynamicRoutedPages.push(pageName);
            }
            console.log('watch ....');
            new webPack(dynamicRoutedPages, App);
        });
    }
    stopWatch() {
        wp.close();
    }
}

module.exports = WatchPages;
