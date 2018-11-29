/* * @Author: zhang dajia * @Date: 2018-11-05 14:58:28 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-11-29 18:23:46
* @Last  description: 服务端启动时初始化page入口文件 */
const fs = require('fs');
const path = require('path');
const targetDistPath = path.join(process.cwd()+'/dist');
const {ssrPageFilter} = require('./config_ssr');
let pageComponent = {};
/**
 * 读取dist目录下入口文件夹路径 require引入存放到PageCompoent中
 */
let pageInit = ()=>{
    return new Promise((resolve,reject)=>{
        try {
            console.log("初始化导入项目"+targetDistPath)
            fs.readdir(targetDistPath,function(err,files){
                if(err){
                    reject(err);  
                }else{
                    for (const cateName of files) {
                        console.log(`初始化导入${cateName}`);
                        if (cateName != "index.html"&&cateName!=".DS_Store"&&ssrPageFilter.indexOf(cateName)=="-1"){
                            var component= require(targetDistPath+"/"+cateName+"/"+cateName+".js");
                           pageComponent[cateName] = component;
                           console.log(`import导入模块${cateName}`);
                        }else{
                            console.log("过滤页面---"+cateName);
                        }
                    }
                    console.log('end...'); 
                    resolve(pageComponent);
                }
            }) 
        } catch (error) {
            reject(error);
        }
        
    })
}
(async function(){
    pageComponent = await pageInit();
    console.log(`初始化服务端dist目录下所有的入口文件:${JSON.stringify(pageComponent)}`);
}());
module.exports = pageComponent;