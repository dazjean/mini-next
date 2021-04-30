/* eslint-disable no-console */
/*
 * @Author: zhang dajia
 * @Date: 2018-12-22 16:42:09
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2020-11-30 11:21:57
 * 服务端渲染静态资源页面导出入口
 */
import fs from 'fs';
import { outPutDir } from './tools';
import { EntryList as Directories } from './webpack/get-entry';
const RenderServer = require('./renderServer');
const writeFile = (name, Content) => {
    fs.writeFile(outPutDir + '/' + name + '.html', Content, function (err) {
        if (err) console.log('umajs-react-ssr:写文件操作失败');
        else console.log(`umajs-react-ssr:${name}.html构建成功！`);
    });
};
const writeFileHander = (name, Content) => {
    fs.exists(outPutDir, (exists) => {
        if (exists) {
            writeFile(name, Content);
        } else {
            fs.mkdir(outPutDir, (err) => {
                if (err) {
                    console.log('umajs-react-ssr:创建文件夹失败！');
                } else {
                    writeFile(name, Content);
                }
            });
        }
    });
};
export const output = async (cateName) => {
    if (cateName == true || !cateName) {
        //构建导出当前项目所有页面
        for (const page of Directories) {
            console.log(`umajs-react-ssr:开始编译文件:${page}`);
            let Content = await RenderServer.renderServerDynamic(page);
            writeFileHander(page, Content);
        }
    } else {
        let Content = await RenderServer.renderServerDynamic(cateName);
        writeFileHander(cateName, Content);
    }
    console.log('umajs-react-ssr:..................初始化');
};
