>  **mini-next现在已经升级成[srejs](https://github.com/dazjean/srejs)**,Server rendering engine 缩写为 **sre** 即服务器端渲染引擎，为React，Vue提供轻量级封装的服务端渲染骨架。mini-next也将继续维护，强烈建议迁移到[srejs](https://github.com/dazjean/srejs)。

# srejs和mini-next区别
- 包名升级`@srejs/react`
- 默认不采用文件路由格式
- 配置项命只保留了：`ssr,cache,rootDir,rootNode`
- 不再支持`staticPages，ssrIngor`e配置
- 客户端根元素节点可配置
- 不再依赖根目录下的`.babelrc`



# 简介
mini-next是一个基于react v16.0+,react-router-dom v4.0+,koa2.0搭建的一个服务端渲染框架。可近乎零成本使历史项目工程具备服务端渲染能力，并支持导出静态资源功能。

# 初衷
- 统一团队React工程配置，无需单独额外配置，开箱即用
- 统一管理React,webpack,babel版本
- 更好的用户体验，SEO支持
- 相比业内实现，快速支持已有项目进行服务端渲染

# 使用
##  脚手架安装
框架提供mini-next-cli脚手架快速初始化模板工程
```
 npm  install mini-next-cli -g
```
初始化新项目
```
mini-next-cli init name
```

## 安装
```
yarn add mini-next 
or
npm install -S mini-next
```

## app.js
```
const Koa = require('koa');
const miniNext = require('mini-next');
const app = new Koa();
new miniNext(app); // mini-next服务端渲染基于koa封装，开启ssr时需传入koa实例对象
app.listen(8001);

```

## package.json
```
"scripts": {
    "start":"node app.js", // 启动
    "build":"npx mini-next build" // 生产环境部署前预编译构建
    "output":"npx mini-next output" // 导出静态资源
  },

```

## 工程目录
框架默认配置属性`rootDir`默认为根目录下`src`，pages目录下必须为项目文件夹，项目名不能命名为`index`
```
└── src
    └── pages
        └── demo
            ├── index.js 
            └── demo.scss
```

## 开发预览
mini-next采用多入口配置，src/pages下按照文件夹项目进行项目代码隔离，无论客户端还是服务端渲染均使用项目文件夹名称进行路由匹配。`eg:localhost:8001/index` 访问项目`index`. 


# 服务端渲染预取数据
> 服务端渲染预初始化数据，通过静态方法**getInitialProps**函数调用接口返回。
```js
APP.getInitialProps = async (ctx,query,pathname) => {
        //...
        return { count: 1 }
    }
```

客户端通过组件的props获取服务端数据,**getInitialProps**函数返回的属性会被初始化昨晚props传递到页面组件中

```js
let APP = props => {
    const [count, setCount] = useState(props.count);
    return (
        <div>
            <span>Coweunt: {count}</span>
        </div>
    );
};
```
props除了挂载我们getInitialProps的返回值外，还会挂载url中的的pathname和query，可通过全局对象`window.__SSR_DATA__`访问服务端预渲染返回的初始化数据。


# 高级配置

## `ssr.config.js`
可在config/ssr.config.js下对我们的项目进行相关配置。
```
module.exports = {
    ssr: true, // 全局开启服务端渲染
    cache: true, // 全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    staticPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    rootDir:'src', // 配置客户端根目录
    prefixCDN:'/', // 构建后静态资源CDN地址前缀
    prefixRouter: '', // 页面路由前缀
    ssrIngore: null or new RegExp() // 指定某一个或者多个page项目不采用服务端渲染
}
```

# 更多
- [入口文件和路由](./doc/page-router.md)
- [自定义页面模板](./doc/htmlTemplate.md)
- [自定义webpack](./doc/webpackconfig.md)
- [typescript](./doc/typescript.md)
- [SEO自定义TDK](./doc/seo.md)
