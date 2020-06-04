const webpack = require('webpack');
import { getProconfig } from './webpack/proconfig';
// import { getDevconfig } from './devconfig';

export const build = (pageName = true) => {
    let config = getProconfig(pageName, true);
    webpack(config).run((err, stats) => {
        if (err) {
            console.error(err);
        }
        const info = stats.toJson();
        if (stats.hasErrors()) {
            console.error(info.errors);
        }
        //处理代码编译中产生的warning
        if (stats.hasWarnings()) {
            console.warn(info.warnings);
        }
    });
};
