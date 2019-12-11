'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HTMLWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin'); //css单独打包
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var webpack = require('webpack');
var dev = process.env.NODE_ENV !== 'production';

var fs = require('fs');
function getPlugin(entryObj) {
    var isServer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var pages = (0, _keys2.default)(entryObj);
    var webpackPlugin = [];
    pages.forEach(function (pathname) {
        var htmlName = entryObj[pathname];
        var template_local = htmlName.replace('.js', '.html');
        var entryName = pathname.split('/')[0];
        var conf = {
            filename: entryName + '/' + entryName + '.html', //生成的html存放路径，相对于path
            template: template_local, //html模板路径
            title: entryName,
            inject: true, //js插入的位置，true/'head'/'body'/false
            hash: true, //为静态资源生成hash值
            favicon: 'src/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
            chunks: [pathname], //需要引入的chunk，不配置就会引入所有页面的资源
            minify: {
                //压缩HTML文件
                removeComments: true, //移除HTML中的注释
                collapseWhitespace: false //删除空白符与换行符
            }
        };
        var defineConf = (0, _assign2.default)({}, conf, { template: 'src/template.html' });
        var exists = fs.existsSync(template_local);
        if (exists) {
            webpackPlugin.push(new HTMLWebpackPlugin(conf));
        } else {
            webpackPlugin.push(new HTMLWebpackPlugin(defineConf));
        }
    });
    !isServer && webpackPlugin.push(new OpenBrowserPlugin({
        url: 'http://localhost:8080'
    }));
    !isServer && webpackPlugin.push(new webpack.HotModuleReplacementPlugin()), webpackPlugin.push(new ExtractTextPlugin('[name].css'));
    webpackPlugin.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: (0, _stringify2.default)(dev ? 'development' : 'production')
        }
    }));
    return webpackPlugin;
}
module.exports = {
    getPlugin: getPlugin
};