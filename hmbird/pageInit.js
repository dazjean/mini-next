/* * @Author: zhang dajia * @Date: 2018-11-05 14:58:28
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-11-27 10:09:31
 * @Last  description: 服务端启动时初始化page入口文件 */
const fs = require('fs');
const path = require('path');
const clientPath = path.join(process.cwd() + '/dist/client');
const pagePath = path.join(process.cwd() + '/src/pages');
const { getConfig } = require('./lib/utils');
let pageComponent = {};
/**
 * 读取build目录下入口文件夹路径 require引入存放到PageCompoent中
 */
const pageInit = async () => {
    let { ssrIngore } = getConfig();
    let files = await readClientPages();
    for (const cateName of files) {
        let pageMain = clientPath + '/' + cateName + '/' + cateName + '.js';
        if (fs.existsSync(pageMain) && !ssrIngore.test(cateName)) {
            var component = require(pageMain);
            pageComponent[cateName] = component;
            console.log(`import module:${cateName}`);
        }
    }
};

const readClientPages = () => {
    return new Promise((resolve, reject) => {
        try {
            fs.readdir(pagePath, function(err, files) {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getPageComponent = async () => {
    pageComponent = await pageInit();
    return pageComponent;
};
module.exports = {
    readClientPages,
    getPageComponent
};
