/* * @Author: zhang dajia * @Date: 2018-11-05 14:16:25 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-11-09 11:41:22
* @Last  description: undefined */
const React =require('react');
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
const router = require('koa-router')();
import fs from 'fs';
import PageComponent from './pageInit';//初始化ssr页面入口文件导入配置
/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}      
 */
function render( pagename ) {
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
router.get('/hmbird/:pagename', async (ctx, next) => {
    let pagename = ctx.params.pagename;
    let App = PageComponent[pagename];
    let Html = '';
    try {
        Html = ReactDOMServer.renderToString(<App/>);
    } catch (error) {
        console.log('服务端渲染异常，降级使用客户端渲染！');
    }
    // 加载 index.html 的内容
    let data = await render( pagename )
    // 把渲染后的 React HTML 插入到 div 中
    let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
    // 把响应传回给客户端
    ctx.response.body = document; 
});
router.get('/hmbird_router/:pagename',async(ctx,next)=>{
    const context = {}
    var pagename = ctx.params.pagename;
    let App = PageComponent[pagename];
    let Html = '';
    try {
        Html = ReactDOMServer.renderToString(
            <StaticRouter
            location={ctx.request.url}
            context={context}
            >
            <App/>
            </StaticRouter>
        );
    } catch (error) {
        console.log('服务端渲染异常，降级使用客户端渲染！');
    }
    if (context.url) {
        ctx.response.writeHead(301, {
        Location: context.url
        })
        ctx.response.end()
    } else {
        // 加载 index.html 的内容
        let data = await render( pagename )
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
        // 把响应传回给客户端
        ctx.response.body = document; 
    }
});

module.exports = router;