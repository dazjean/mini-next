var fs = require('fs');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin"); //css单独打包
var optimist = require("optimist");
var cateName = optimist.argv.cate;
var entryObj = {};
var srcPath = __dirname + '/src';
var entryPath = srcPath+'/page/';
if (cateName == true) {
    fs.readdirSync(entryPath).forEach(function(cateName, index) {
        //cateName/cateName指定输出路径为entryname
        if (cateName != "index.html"&&cateName!=".DS_Store") entryObj[cateName + '/' + cateName] = entryPath + cateName + '/' + cateName + '.js';
    });
} else if(cateName.indexOf(",")) {//一次打包多个入口文件以逗号分隔
    var cateNameArray = cateName.split(",");
    for(var i =0;i<cateNameArray.length;i++){
        entryObj[cateNameArray[i] + '/' + cateNameArray[i]] = entryPath + cateNameArray[i] + '/' + cateNameArray[i] + '.js';
    }
}else{ //打包单个入口文件
    entryObj[cateName+"/"+cateName] = entryPath + cateName + '/' + cateName + '.js';
}
let config = {
    //devtool: 'eval-source-map',// 开发环境使用
    //devtool: 'cheap-module-source-map',
    devtool:'#eval-source-map',
    debug:true,
    cache:true,
    entry: entryObj, //类别入口文件
    output: {
        publicPath:"/", 
        libraryTarget: 'umd',
        path: __dirname + '/dist/', //打包后的文件存放的地方
        filename:'[name].js' //打包后输出文件的文件名
    },
    module: {
        preLoaders: [
            // 配置 eslint-loader
            {test: /\.(js|jsx)$/, loader: "eslint-loader",include:srcPath, exclude: /node_modules/}
        ],
        loaders: [
            { test: /\.js$/, loader: "jsx!babel", include: srcPath ,exclude: /node_modules/},
            { test: /\.css$/, loader: ExtractTextPlugin.extract("css", "css!postcss") },
            { test: /\.scss$/, loader: ExtractTextPlugin.extract("css", "css!postcss!sass") },
            { test: /\.(png|jpg)$/, loader: 'url?limit=8192&name=images/[hash:8].[name].[ext]' },
            {test: /\.less$/, loader: 'css!postcss!less'}
        ]
    },
    postcss: [
        require('autoprefixer') //调用autoprefixer插件,css3自动补全
    ],

    devServer: {
        contentBase: srcPath, //本地服务器所加载的页面所在的目录
        port: 9991,
        colors: true, //终端中输出结果为彩色
        open: true, //自动打开首页
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新,hot
        noInfo: false,
        hotOnly: true
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        })
    ],
     externals: {
        'react-router': {
            amd: 'react-router',
            root: 'ReactRouter',
            commonjs: 'react-router',
            commonjs2: 'react-router'
        },
        "react": {
            amd: 'react',
            root: 'React',
            commonjs: 'react',
            commonjs2: 'react'
        },
        'react-dom': {
            amd: 'react-dom',
            root: 'ReactDOM',
            commonjs: 'react-dom',
            commonjs2: 'react-dom'
        }
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
          components: srcPath+'/components',
          images: srcPath+'/images',
          mock: srcPath+'/mock',
          skin:srcPath+'/skin',
          utils:srcPath+'/utils',
        }
      }    

}

module.exports = {
    entryObj:entryObj,
    config:config
};