'use strict';
var HTMLWebpackPlugin = require('html-webpack-plugin');
var fs = require('fs');
var {config,entryObj} = require('./webpack.config.base');
var pages = Object.keys(entryObj);
pages.forEach(function(pathname) {
    var htmlName = entryObj[pathname];
    var template_local = htmlName.replace('.js',".html");
    var entryName = pathname.split("/")[0];
    var conf = {
        filename: 'page/'+entryName+'/' + entryName + '.html', //生成的html存放路径，相对于path
        title:entryName,
        template: template_local, //html模板路径
        inject: true, //js插入的位置，true/'head'/'body'/false
        hash: true, //为静态资源生成hash值
        favicon: 'src/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
        chunks: [pathname],//需要引入的chunk，不配置就会引入所有页面的资源
        minify: { //压缩HTML文件    
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false //删除空白符与换行符
        }
    };
    var defineConf = Object.assign({},conf,{template:'src/template.html'});
    var exists = fs.existsSync(template_local);
    if(exists){
        config.plugins.push(new HTMLWebpackPlugin(conf));
    }else{
        config.plugins.push(new HTMLWebpackPlugin(defineConf));
    }
    
});
 module.exports = config;