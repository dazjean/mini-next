## 更新记录：
### 2018-11-29 

- 解决页面进入router之后 刷新页面事路由页面404问题;
- 服务端项目可构建编译npm run build:server


>hmbird-ssr是一个基于React16+   ReactRouter4.0  koa2.0搭建的一个node服务端渲染框架；目前已经在二手车业务线中进行项目开发和部署上线，支持SEO，提升首屏加载速度

## 框架特性：

    1、静态单页面应用无配置支持ssr方式

    2、路由搭配React-Router4.0自由选择服务端渲染和客户端渲染

    3、静态资源（js,css,images）版本号更新,部署方式支持内置cdn和服务端部署 （默认服务端）

    4、导出静态页面(构建服务端渲染后的模板)     
    
    5、css编译支持less,scss,postcss自动补全autoprefixer
    
    6、搭配eslint pre-commit格式化校验代码
    
    7、服务端渲染启动预加载 && 异常降级客户端渲染
    
    8、服务端渲染模板缓存  
    
<!-- more -->
## 服务端渲染原理
> react服务端为了支持服务端渲染，在react-dom模块中发布了server模块，其中主要api是：renderToString和renderToStaticMarkup
- renderToString:将一个react组件渲染成html字符串，react@15版本中html中会输出data-reactid标识组件
- renderToStaticMarkup 功能和前者类似，不带data-reactid标识，节省服务端流量

在react@15版本ssr方案中，renderToStaticMarkup因为不带data-reactid标识，实际上在客户端渲染的时候，react是没法diff组件虚拟dom;react是会重新通过客户端渲染的dom覆盖掉服务端吐出来的html,会闪一下。
 
 
### 16版本推出新的ssr方法。
> react@16+向下兼容，之前ssr项目在15上能运行，使用react@16后可以直接使用.
 
- renderToNodeStream 对标 renderToString   
- renderToStaticNodeStream 对标 renderToStaticMarkup  ，此方法无论服务端有没有渲染，客户端都会重新渲染,在存静态页面时使用可得到好的渲染速度
 
这两个新的api返回值是utf-8编码的字节流
 
### 服务端
```js
// use koa
const getStream = require('get-stream');
import ReactDOMServer from 'react-dom/server';
let Html = '';
let Htmlstream = ReactDOMServer.renderToNodeStream(<App/>);
try {
        Html = await getStream(Htmlstream);
    } catch (error) {
        console.log('流转化字符串异常，降级使用客户端渲染！');
    }
// 把渲染后的 React HTML 插入到 div 中
let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
// 把响应传回给客户端
ctx.response.body = document; 
```
 
 ### 客户端
React 16现在有两种不同的客户端渲染方法：在客户端呈现内容时，使用`render() `方法，如果你在服务端渲染结果之上再次渲染则使用`hydrate()`方法。
因为向下兼容，可以在16中继续使用render,但如果服务端渲染后再次调用客户端渲染时会出现警告⚠️
`react-dom.development.js:10376 Warning: render(): Calling ReactDOM.render() to hydrate server-rendered markup will stop working in React v17. Replace the ReactDOM.render() call with ReactDOM.hydrate() if you want React to attach to the server HTML.`

所以在服务端渲染时我们使用hydrate代替render

```js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReactDom from 'react-dom';
import App from './app';

let inBrowser = typeof window !== 'undefined';//服务端渲染时node环境不支持window document等浏览器宿主环境全局变量
let ReactRender = process.env.NODE_ENV == 'development' ? ReactDom.render : ReactDom.hydrate;
inBrowser &&
    ReactRender(
        <Router basename="/hmbird_router/with-react-router">
            <App />
        </Router>,
        document.getElementById('app')
    );
module.exports = App;

```

在客户端我们通过NODE_ENV控制使用render和hydrate，因为在和路由搭配的过程中，使用hydrate出现了一个警告`Warning: Expected server HTML to contain a matching<div>in<div>`
 



 ⚠️ ：使用hydrate时，需要保证服务端渲染和客户端渲染的内容保持一致，详情可参考[React填坑记(四）：render !== hydrate](https://zhuanlan.zhihu.com/p/33887159)
 



## 同构方案
 >  同构方案下，我们编写的js代码将会在服务端和客服端两种环境下运行，即在通过服务端渲染优化打开首屏的速度，然后再将交互，路由交给客户端控制，这和之前用jsp、php、Velocity类似，不同的是我们只需要维护一套js代码，不用单独编写供服务端渲染的模板。
 
### 关键点：
 
 
#### 在node环境server端使用import等es6语法
> 在最新版node版本中，基本实现了大部分es6的语法，但对于import这样的引入模块方式依然是没有得到支持的。
解决方案：
- 使用node-bable代替node命令
- 引入babel-regisiter 忽略掉css,image等
- 先构建代码 然后执行服务端渲染
 
 
#### 静态资源处理方案 
> 代码中我们import了图片,svg,css等非js资源，在客户端webpack的各种loader帮我们处理了这些资源，在node环境中单纯的依靠babel-regisiter是不行的，执行renderToString()会报错，非js资源没法处理

webpack编译方案：
 

 ```js
 1、通过extract-text-webpack-plugin插件单独打包css，
 2、通过url-loader处理image,图片小于8k的直接编译成base64,大于8k则构建生成路径方式
 3、通过HTMLWebpackPlugin自动生成原始模板
 最后我们得到一个目录结构：
├── dist //构建编译目录
│   ├── favicon.ico 
│   ├── images
│   │   └── fd4f415c.addressIcon.jpg
│   ├── vendor //copy form src
│   │   ├── 15
│   │   ├── 16.0.0
│   │   ├── 16.6.0
│   ├── with-react //编译后项目 可直接静态部署
│   │   ├── with-react.css
│   │   ├── with-react.html
│   │   └── with-react.js
├── offline  //node沙箱环境配置
├── online //node线上环境配置
├── package.json
├── server
│   ├── app.js //项目基础信息
│   ├── config_ssr.js //服务端渲染相关配置
│   ├── pageInit.js //服务端入口文件
│   ├── router.js //路由
│   └── start.js  // 服务端启动文件
├── src
│   ├── components  //组件
│   ├── favicon.ico
│   ├── images  //图片静态资源
│   │   └── with-react
│   ├── index.html //首页
│   ├── mock
│   │   └── test.json 
│   ├── page //多入口项目文件
│   │   ├── with-react  //项目1
│   │   └── with-react-router  //项目2
│   ├── skin //基础样式
│   │   ├── base.scss
│   │   └── mixins.scss
│   ├── template.html //html模板 如果项目文件夹中没有找到项目同名html则使用默认模板
│   ├── utils //一些工具类
│   │   ├── cookie.js
│   │   └── util.js
│   └── vendor
│       ├── 15
│       ├── 16.0.0
│       ├── 16.6.0
├── webpack.config.base.js
├── webpack.config.js //开发环境配置
└── webpack.config_build.js //服务端渲染&&生产环境配置
 
 
 ```
 
#### 如何打造前后端渲染使用同一个入口文件
> 在入口文件中，通过判断当前环境选择渲染方式

```js
//客户端 with-react
'use strict';
import './with-react.scss';
import React from 'react';
import ReactDom from 'react-dom';
import App from './app';

var inBrowser = typeof window !== 'undefined';//node环境中没有window对象
inBrowser && ReactDom.hydrate(<App />, document.getElementById('app'));
module.exports = App;

//构建后，在dist目录下生成构建后的with-react项目文件
--dist
   --with-react
        --with-react.js
        --with-react.html
        --with-react.css
//服务端
import WithReact from '.dist/with-react/with-react.js';//初始化ssr页面入口文件导入配置
import ReactDOMServer from 'react-dom/server';
let  SsrHtml = ReactDOMServer.renderToString(<WithReact/>);
//读取with-react.html
let data = await render( 'with-react.html' )
// 将SsrHtml注入到data中 模板中路径
let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${SsrHtml}</div>`);
// 返回客户端
ctx.response.body = document; 

```

- 服务端渲染路由自动分配
> 构建每一个项目入口文件夹都统一命名，所以可以通过读取dist文件夹自动分配路由


```js
//pageInit.js  
/* * @Author: zhang dajia * @Date: 2018-11-05 14:58:28 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-11-06 16:13:34
* @Last  description: 服务端启动时初始化page入口文件 */
const fs = require('fs');
const path = require('path');
const targetDistPath = path.join(__dirname+'./../dist');
const {ssrPageFilter} = require('./config_ssr');
let pageComponent = {};
/**
 * 读取dist目录下入口文件夹路径 require引入存放到PageCompoent中
 */
let pageInit = ()=>{
    return new Promise((resolve,reject)=>{
        try {
            fs.readdir(targetDistPath,function(err,files){
                if(err){
                    reject(error);  
                }else{
                    for (const cateName of files) {
                        console.log(`初始化导入${cateName}`);
                        if (cateName != "index.html"&&cateName!=".DS_Store"&&ssrPageFilter.indexOf(cateName)=="-1"){
                            var component= require(targetDistPath+"/"+cateName+"/"+cateName);
                           pageComponent[cateName] = component;
                           console.log(`import导入模块${cateName}`);
                        }else{
                            console.log("过滤页面---"+cateName);
                        }
                    }
                    console.log('end...'); 
                    resolve(pageComponent);
                }
            }) 
        } catch (error) {
            reject(error);
        }
        
    })
}
(async function(){
    pageComponent = await pageInit();
    console.log(`初始化服务端dist目录下所有的入口文件:${JSON.stringify(pageComponent)}`);
}());
module.exports = pageComponent;

//router.js

/* * @Author: zhang dajia * @Date: 2018-11-05 14:16:25 
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2018-11-23 14:00:37
* @Last  description: undefined */
const React =require('react');
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
const router = require('koa-router')();
import fs from 'fs';
const getStream = require('get-stream');
import PageComponent from './pageInit';//初始化ssr页面入口文件导入配置 node启动时执行
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
    let Htmlstream = '';
    let Html = '';
    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(<App/>);
    } catch (error) {
        console.log('服务端渲染异常，降级使用客户端渲染！');
    }
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
    ctx.response.body = document; 
});
module.exports = router;

```

- 服务端渲染入口文件过滤
> dist目录下生成的images,vendor等静态资源不需要导入到PageComponent中，通过配置文件进行过滤

```js
// config_ssr.js
module.exports = {
    ssrPageFilter:['favicon.ico','vendor','images'] // 过滤掉不需要服务端渲染的页面 默认favicon.ico vendor images不要动  
}

```


## 搭配React-Router4.0 
> 服务端渲染与客户端渲染的不同之处在于其路由是没有状态的，所以我们需要通过一个无状态的router组件 来包裹APP，通过服务端请求的url来匹配到具体的路由数组和其相关属性。
所以我们在客户端使用 BrowserRouter，服务端则使用无状态的 StaticRouter

推荐一篇基础讲解RP4的博客文章[初探 React Router 4.0](https://www.jianshu.com/p/e3adc9b5f75c/)

```js
const React =require('react');
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
const router = require('koa-router')();
import fs from 'fs';
const getStream = require('get-stream');
import PageComponent from './pageInit';//初始化ssr页面入口文件导入配置
router.get('/hmbird_router/:pagename',async(ctx,next)=>{
    const context = {}
    var pagename = ctx.params.pagename;
    let App = PageComponent[pagename];
    let Html = '';
    let Htmlstream = '';
    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(
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
        let data = await render( pagename );
        try {
            Html = await getStream(Htmlstream);
        } catch (error) {
            console.log('流转化字符串异常，降级使用客户端渲染！');
        }
        // 把渲染后的 React HTML 插入到 div 中
        let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
        // 把响应传回给客户端
        ctx.response.body = document; 
    }
});
```

### 使用BrowserRouter还是HashRouter

#### 两者区别：
- BrowserRouter使用HTML5 history API，保证UI界面和URL保存同步
> 采用这种方式需要后端或者Nginx配置通配路由,比如在某个路径下重定向到模板首页 否则路由刷新页面时会404
- HashRouter使用URL（即window.location.hash）的哈希部分来保持UI与URL同步的。哈希历史记录不支持location.key和location.state   用来支持旧版浏览器，官方不建议使用
   
  [详见React-router V4 中BrowserRouter和HashRouter的区别](http://zhangdajia.com/2018/11/30/React-router-v4%E4%B8%ADBrowserRouter%E5%92%8CHashRouter%E7%9A%84%E5%8C%BA%E5%88%AB/)

  
#### 服务端配合BrowserRouter配置动态路由
服务端渲染，建议采用BrowserRouter，当然这需要服务端或者运维Nginx进行配合，否则页面路由刷新后会访问真正的服务端请求，会直接404;我们使用koa-router路由嵌套方案。

```js
const Router = require('koa-router');
const router_static = new Router();
const router_dynamic = new Router();
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
forums.use('/hmbird/:pagename',router_static.routes(),router_static.allowedMethods());//可以匹配到hmbird/xxx请求
forums.use('/hmbird_router/:pagename',router_dynamic.routes(),router_dynamic.allowedMethods());//可以匹配到hmbird_router/xxx 或者 hmbird_router/xxx/sss
//如果项目有更深层目录 再进行调整router_dynamic
```

## 服务端渲染开发注意事项
#### DOM保持一致性
> 保持客户端渲染和服务端渲染输出一致的DOM结构


#### 服务端渲染组件生命周期差异
> 服务端上 Component 生命周期只会到 componentWillMount，客户端则是完整的。如果项目中使用到window,location等node不支持的属性放到componentDidMount时间中通过state更新组件
## 浏览器支持支持 
IE11 和所有的现代浏览器使用了@babel/preset-env。为了支持 IE11，需要全局添加Promise的 polyfill。有时你的代码或引入的其他 NPM 包的部分功能现代浏览器不支持，则需要用 polyfills 去实现。


## 效果

![image](https://img.58cdn.com.cn/escstatic/fecar/pmuse/hmbirdssr/ssrdiff.png)
> 可以看见使用服务的渲染后，首屏加载速度得到了很大的提升。


## 后续优化
- 服务端渲染缓存（目前因为把客户端渲染执行时机放到了服务端，加重了服务端的压力。但不同于客户端多样性，服务端是统一的，所以给了我们利用缓存的机会，每一个服务端渲染项目可只执行一遍，后面都走缓存）
- 服务端渲染静态资源导出 （目前项目可直接部署到服务器，但有的线上项目入口文件多，需要直接把静态资源发给RD覆盖已有模板）
- node to java and more... 



## 如何使用

### 安装
    npm install -g hmbird-cli
    
    hmbird-cli init yourproject

### 开发启动
    npm run dev 

### 打包
    npm run build //打包所有
    npm run build pageXXX //打包某个page入口
    
### 服务端启动
    npm start

### 服务端访问  （路由一级路径可自行替换）
- 普通静态页面   localhost:8001/hmbird/pagexxx
- router页面  localhost:8001/hmbird_router/pagexxx

欢迎各位试用和交流 附上项目地址[hmbird-ssr](https://github.com/dazjean/hmbird-ssr)

## 参考资料
- [React16中的服务端渲染（译）](https://cloud.tencent.com/developer/article/1015976)
- [ReactDOMServer(官方)](https://reactjs.org/docs/react-dom-server.html#rendertostring)
- [基于create-react-app 和 koa2 快速搭建react同构渲染项目总结](https://zhuanlan.zhihu.com/p/33155278)