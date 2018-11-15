/* * @Author: zhang dajia * @Date: 2018-11-05 14:16:55 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-11-07 18:47:28
* @Last  description: undefined 
*/
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
// static静态资源文件中间件
const KoaStatic = require('koa-static');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const router = require('./router');
//兼容第三方模块使用window document navigator.userAgent 
// const jsdom = require("jsdom");
// 创建一个Koa对象表示web app本身:
const app = new Koa();
app.use(bodyParser()); //post请求实例化ctx获取body
// 配置静态web服务的中间件
app.use(KoaStatic(path.join(__dirname+'./../dist')));
app.use(async (ctx, next) => {
    console.log(`接收请求:${ctx.request.method} ${ctx.request.url}`); // 打印URL
    await next(); // 调用下一个middleware
});

app.use(async (ctx, next) => {
    const start = new Date().getTime(); // 当前时间
    await next(); // 调用下一个middleware
    const ms = new Date().getTime() - start; // 耗费时间
    console.log(`接口耗时Time: ${ms}ms`); // 打印耗费时间
});

// 对于任何请求，app将调用该异步函数处理请求 可做为登录过滤器
app.use(async (ctx, next) => {
    if (ctx.request.path === '/test') {
        ctx.response.body = 'TEST page';
    } else {
        await next();
    }
});
//监听服务器异常日志
app.on('error',(err)=>{
   console.log(`服务器异常:${err}`);
})
// add router middleware:
app.use(router.routes());
// 在端口8001监听:
app.listen(8001);
console.log('app started at port 8001...');