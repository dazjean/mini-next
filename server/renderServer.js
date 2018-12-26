/*
 * @Author: zhang dajia 
 * @Date: 2018-12-22 17:10:16 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-12-25 15:29:30
 * 服务端渲染解析工具类
 */
const React =require('react');
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import fs from 'fs';
const getStream = require('get-stream');
/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}      
 */
const render = ( pagename )=> {
    return new Promise(( resolve, reject ) => {
      let viewUrl = `./dist/${pagename}/${pagename}.html`
      fs.readFile(viewUrl, "utf8", ( err, data ) => {
        if ( err ) {
          reject( err )
        } else {
          resolve( data )
        }
      })
    })
}
/**
 * 静态资源类型页面渲染解析
 * @param {*} ctx 
 * @param {*} next 
 */
const renderServerStatic = async(pagename,App)=>{
    let Htmlstream = '';
    let Html = '';
    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(<App/>);
    } catch (error) {
        console.log(`${pagename}服务端渲染异常，降级使用客户端渲染！`);
    }
    // 加载 index.html 的内容
    let data = await render( pagename );
    try {
        Html = await getStream(Htmlstream);
    } catch (error) {
        console.log(`${pagename}------流转化字符串异常!`);
    }
    // 把渲染后的 React HTML 插入到 div 中
    let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
    return document;
    // 把响应传回给客户端
    
}
/**
 * Router类型页面渲染解析
 * @param {*} ctx 
 * @param {*} next 
 */
const renderServerDynamic = async(pagename,App)=>{
    const context = {}
    let Html = '';
    let Htmlstream = '';
    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(
            <StaticRouter
            context={context}
            >
            <App/>
            </StaticRouter>
        );
    } catch (error) {
        console.log(`${pagename}服务端渲染异常，降级使用客户端渲染！`);
    }
    // 加载 index.html 的内容
    let data = await render( pagename );
    try {
        Html = await getStream(Htmlstream);
    } catch (error) {
        console.log(`${pagename}------流转化字符串异常!`);
    }
    // 把渲染后的 React HTML 插入到 div 中
    let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
    // 把响应传回给客户端
    return document;
    
}

module.exports = {
    render,renderServerDynamic,renderServerStatic
}