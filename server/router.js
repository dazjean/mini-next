/* * @Author: zhang dajia * @Date: 2018-11-05 14:16:25 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-12-26 17:45:49
* @Last  description: undefined */
const React =require('react');
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
const Router = require('koa-router');
const router_static = new Router();
const router_dynamic = new Router();
const forums = new Router();
import fs from 'fs';
const getStream = require('get-stream');
import {pageComponent as PageComponent} from './pageInit';//初始化ssr页面入口文件导入配置
//const PageComponent = (async ()=>{return await require('./pageInit')})();//初始化ssr页面入口文件导入配置
const RenderServer = require('./renderServer');

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
const renderServerStatic = async(ctx,next)=>{
    let pagename = ctx.params.pagename;
    console.log('匹配到页面'+pagename)
    let App = PageComponent[pagename];
    let document =  await RenderServer.renderServerStatic(pagename,App)
    return document;
    // 把响应传回给客户端
    
}
/**
 * Router类型页面渲染解析
 * @param {*} ctx 
 * @param {*} next 
 */
const renderServerDynamic = async(ctx,next)=>{
    const context = {}
    var pagename = ctx.params.pagename;
    let App = PageComponent[pagename];
    let Html = '';
    let Htmlstream = '';
    let locationUrl = ctx.request.url.split(pagename)[1];
    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(
            <StaticRouter
            location={locationUrl||'/'}
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
        let data = await render( pagename );
        try {
            Html = await getStream(Htmlstream);
        } catch (error) {
            console.log('流转化字符串异常，降级使用客户端渲染！');
        }
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
        // 把响应传回给客户端
        //let document = await RenderServer.renderServerDynamic(pagename,App)
        return document;
    }
}
//主入口文件路由
router_static.get('/', async (ctx, next) => {
   let document = await renderServerStatic(ctx,next);
   ctx.response.body = document; 
});
//router主入口文件路由
router_dynamic.get('/',async(ctx,next)=>{
    console.log('匹配到页面'+ctx.params.pagename)
    let document = await renderServerDynamic(ctx,next);
    ctx.response.body = document; 
});
//router页面router路由 防止刷新路由页面404
router_dynamic.get('/:pagepath',async(ctx,next)=>{
    console.log('匹配到页面路由'+ctx.params.pagepath)
    let document = await renderServerDynamic(ctx,next);
    ctx.response.body = document; });
forums.use('/hmbird/:pagename',router_static.routes(),router_static.allowedMethods());
forums.use('/hmbird_router/:pagename',router_dynamic.routes(),router_dynamic.allowedMethods());
//forums.use('/:pagename',router_dynamic.routes(),router_dynamic.allowedMethods());
module.exports = forums;
