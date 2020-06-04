/* eslint-disable no-console */
/*
 * @Author: zhang dajia
 * @Date: 2018-12-22 16:42:09
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-12-10 16:23:38
 * 服务端渲染静态资源页面导出入口
 */
const path = require('path');
const fs = require('fs');
let OutputPath = path.join(process.cwd() + '/.mini-next');
const clientPath = path.join(process.cwd() + '/dist/client');

const RenderServer = require('./renderServer');
const writeFile = (name, Content) => {
    fs.writeFile(OutputPath + '/' + name + '.html', Content, function(err) {
        if (err) console.log('写文件操作失败');
        else console.log(`${name}.html构建成功！`);
    });
};
const writeFileHander = (name, Content) => {
    fs.exists(OutputPath, exists => {
        if (exists) {
            writeFile(name, Content);
        } else {
            fs.mkdir(OutputPath, err => {
                if (err) {
                    console.log('创建文件夹失败！');
                } else {
                    writeFile(name, Content);
                }
            });
        }
    });
};
export const output = async cateName => {
    if (cateName == true || !cateName) {
        //构建导出当前项目所有页面
        const PageComponent = await require('./pageInit').getPageComponent(); //初始化ssr页面入口文件导入配置
        for (const pageName of PageComponent) {
            console.log(`开始编译文件:${pageName}`);
            let Content = await RenderServer.renderServerDynamic(pageName);
            writeFileHander(pageName, Content);
        }
    } else {
        let Content = await RenderServer.renderServerDynamic(cateName);
        writeFileHander(cateName, Content);
    }
    console.log('..................初始化');
};
