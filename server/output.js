/*
 * @Author: zhang dajia 
 * @Date: 2018-12-22 16:42:09 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-12-25 17:00:58
 * 服务端渲染静态资源页面导出入口
 */
const path = require('path');
const fs =require('fs');
const optimist = require("optimist");
let cateName = optimist.argv.cate;
console.log(`构建静态资源页面：${cateName}`);
let OutputPath = path.join(process.cwd()+'/_output');
const targetDistPath = path.join(process.cwd()+'/dist');
const RenderServer = require('./renderServer');
const writeFile = (name,Content)=>{
    fs.writeFile(OutputPath+"/"+name+".html", Content,function(err){
        if(err) console.log('写文件操作失败');
        else console.log(`${name}.html构建成功！`);
    });
}
const writeFileHander = (name,Content)=>{
    fs.exists(OutputPath,(exists)=>{
        if(exists){
            writeFile(name,Content);
        }else{
            fs.mkdir(OutputPath,(err)=>{
                if(err){
                    console.log('创建文件夹失败！')
                }else{
                    writeFile(name,Content);
                }
            })
        }
    })
    
}
const init = async()=>{
    if(cateName==true){ //构建导出当前项目所有页面
        const PageComponent = await require('./pageInit').getPageComponent();//初始化ssr页面入口文件导入配置
        for (const pageName in PageComponent) {
            console.log(`开始编译文件:${pageName}`)
            if (PageComponent.hasOwnProperty(pageName)) {
                const pageInstance = PageComponent[pageName];
                let Content =  await RenderServer.renderServerDynamic(pageName,pageInstance)
                writeFileHander(pageName,Content);
            }
        }
    }else{
        //const pageInstance = PageComponent[cateName];
        const pageInstance = require(targetDistPath+'/'+cateName+'/'+cateName+'.js');
        let Content =  await RenderServer.renderServerDynamic(cateName,pageInstance)
        writeFileHander(cateName,Content);
    }
    
    console.log('..................初始化')
}
init();
