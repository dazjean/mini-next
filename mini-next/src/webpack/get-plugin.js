import help from '../utils';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'mini-css-extract-plugin';
import AutoDllPlugin from 'autodll-webpack-plugin';
import moment from 'moment';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

const entryDir = help.getOptions('rootDir');
function getPlugin(entryObj) {
    var pages = Object.keys(entryObj);
    let webpackPlugin = [];
    pages.forEach(function (pathname) {
        var htmlName = entryObj[pathname];
        var entryName = pathname.split('/')[0];
        var template_local = (htmlName + '.html').replace(
            '.mini-next',
            `${entryDir}/pages/${entryName}`
        );
        var conf = {
            filename: entryName + '/' + entryName + '.html', //生成的html存放路径，相对于path
            template: template_local, //html模板路径
            title: entryName,
            inject: true, //js插入的位置，true/'head'/'body'/false
            hash: help.isDev() ? true : false, //为静态资源生成hash值
            chunks: [pathname], //需要引入的chunk，不配置就会引入所有页面的资源
            minify: {
                //压缩HTML文件
                removeComments: true, //移除HTML中的注释
                collapseWhitespace: false //删除空白符与换行符
            }
        };
        const templateHtml = `${entryDir}/template.html`;
        var defineConf = Object.assign({}, conf, { template: templateHtml });
        var exists = fs.existsSync(template_local);
        var existsTemplate = fs.existsSync(templateHtml);
        if (exists) {
            webpackPlugin.push(new HTMLWebpackPlugin(conf));
        } else if (existsTemplate) {
            webpackPlugin.push(new HTMLWebpackPlugin(defineConf));
        } else {
            webpackPlugin.push(
                new HTMLWebpackPlugin(
                    Object.assign({}, conf, {
                        template: path.join(__dirname, './template.html')
                    })
                )
            );
        }
        webpackPlugin.push(
            new AutoDllPlugin({
                inject: true,
                filename: '[name]_[hash].js',
                entry: {
                    dll_react: ['react'],
                    dll_react_dom: ['react-dom']
                }
            })
        );
    });
    // isServer &&
    // webpackPlugin.push(
    //     new OpenBrowserPlugin({
    //         url: 'http://localhost:8001/'
    //     })
    // );
    // !isServer && webpackPlugin.push(new webpack.HotModuleReplacementPlugin()),
    webpackPlugin.push(
        new ExtractTextPlugin({
            filename: help.isDev()
                ? '[name].css'
                : `[name].css?v=${moment().format('YYYYMMDDHHmmss')}`
        })
    );
    webpackPlugin.push(
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(help.isDev() ? 'development' : 'production')
            }
        })
    );
    return webpackPlugin;
}
module.exports = {
    getPlugin
};
