/* * @Author: zhang dajia * @Date: 2018-11-05 14:58:28
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-12-10 11:06:08
 * @Last  description: 服务端启动时初始化page入口文件 */
const fs = require('fs');
const path = require('path');
// const clientPath = path.join(process.cwd() + '/dist/server');
const pagePath = path.join(process.cwd() + '/src/pages');
const { getConfig } = require('./utils');
let pageComponent = [];
/**
 * 读取build目录下入口文件夹路径 require引入存放到PageCompoent中
 */
const pageInit = async () => {
    let { ssrIngore } = getConfig();
    let files = await readClientPages();
    for (const cateName of files) {
        if (!ssrIngore || !ssrIngore.test(cateName)) {
            pageComponent.push(cateName);
        }
    }
    return pageComponent;
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
