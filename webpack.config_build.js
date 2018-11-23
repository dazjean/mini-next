'use strict';
process.env.NODE_ENV = 'production';//设置当前环境
var webpack = require('webpack');
var path = require('path');
var copyfiles = require('copyfiles');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin"); //css单独打包
var fs = require('fs');
var {config,entryObj} = require('./webpack.config.base');
const copyHtmlImgAction = function(cateName){
    console.log("开始处理html 图片copy:"+cateName)
    //html copy 
    var catepath = __dirname + '/src/page/' + cateName 
    copyfiles([catepath+'/*.html','dist/'+cateName],true ,function (err) {
        if(err){
            console.log('copy html error!!!!!!!!!!')
        }
        else{
            console.log('copy html success!');
        }
    });
    //图片 copy 
    copyfiles([catepath+'/img/*','images/'+cateName+'/img'], true,function (err) {
        if(err){
            console.log('copy img error!!!!!!!!!!')
        }
        else{
            console.log('copy img success!');
        }
    });
}

var copyFile = function(srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath)
    rs.on('error', function(err) {
      if (err) {
        console.log('read error', srcPath)
      }
      cb && cb(err)
    })
  
    var ws = fs.createWriteStream(tarPath)
    ws.on('error', function(err) {
      if (err) {
        console.log('write error', tarPath)
      }
      cb && cb(err)
    })
    ws.on('close', function(ex) {
      cb && cb(ex)
    })
  
    rs.pipe(ws)
  }
var copyFolder = function(srcDir, tarDir, cb) {
fs.readdir(srcDir, function(err, files) {
    var count = 0
    var checkEnd = function() {
    ++count == files.length && cb && cb()
    }

    if (err) {
    checkEnd()
    return
    }

    files.forEach(function(file) {
    var srcPath = path.join(srcDir, file)
    var tarPath = path.join(tarDir, file)

    fs.stat(srcPath, function(err, stats) {
        if (stats.isDirectory()) {
        console.log('mkdir', tarPath)
        fs.mkdir(tarPath, function(err) {
            if (err) {
            console.log(err)
            return
            }

            copyFolder(srcPath, tarPath, checkEnd)
        })
        } else {
        copyFile(srcPath, tarPath, checkEnd)
        }
    })
    })

    //为空时直接回调
    files.length === 0 && cb && cb()
})
}
const copyVendorAction = function(){
    var vendorPath = __dirname + '/src/vendor';
    var vendorDistPath = __dirname+"/dist/vendor"
    fs.mkdir( __dirname+"/dist",function(err){
        if(err){
            console.log("创建dist目录文件夹错误"+err);
        }else{
            fs.exists(vendorDistPath, function(exists) {
                console.log(exists ? "vendor存在无需更新" : "创建vendor");
                if(!exists){
                    fs.mkdir(vendorDistPath, function(err) {
                        if (err) {
                          console.log(err)
                          return
                        }else{
                            copyFolder(vendorPath,vendorDistPath,function (err) {
                                if(err){
                                    console.log('copy vendor error!!!!!!!!!!')
                                }
                                else{
                                    console.log('copy vendor success!');
                                }
                            });
                        }
                    })
                }
            });
        }
    }); 
}
Array.prototype.slice.call(entryObj).forEach(function(cateName, index) {
    copyHtmlImgAction(cateName.split("/")[0]);
});
copyVendorAction();//copy 第三方库到dist目录
let buildConfig = Object.assign({}, config, {
    devtool: false,
    output: {
        publicPath:"/", //生产环境脚本代码则设置cdn地址 https://j1.58cdn.com.cn/escstatic/hmbird/
        libraryTarget: 'umd',
        path: __dirname + '/dist/', //打包后的文件存放的地方
        filename:'[name].js' //打包后输出文件的文件名
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false }
        }),
        new ExtractTextPlugin('[name].css'),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]

})
var pages = Object.keys(entryObj);
pages.forEach(function(pathname) {
    var htmlName = entryObj[pathname];
    var template_local = htmlName.replace('.js',".html");
    var entryName = pathname.split("/")[0];
    var conf = {
        filename: entryName+'/' + entryName + '.html', //生成的html存放路径，相对于path
        template: template_local, //html模板路径
        title:entryName,
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
        buildConfig.plugins.push(new HTMLWebpackPlugin(conf));
    }else{
        buildConfig.plugins.push(new HTMLWebpackPlugin(defineConf));
    }
    
});

module.exports = buildConfig;