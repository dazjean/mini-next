mini-next是一个基于React16+   ReactRouter4.0  koa2.0搭建的一个服务端渲染框架。可近乎零成本使历史项目工程具备服务端渲染能力，并支持导出静态资源功能。

# 初衷
- 统一团队React工程配置，无需单独额外配置，开箱即用
- 统一管理React,webpack,bable版本
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


# 项目目录结构
```
├── app.js  // ssr node启动文件
├── package.json
└── src
    └── pages
        └── demo
            ├── demo.js // 入口文件
            └── demo.scss

```

## 安装
```
yarn add mini-next 
or
npm install -S mini-next
```

## package.json
```
"scripts": {
    "start":"node app.js", // 服务端渲染模式【推荐】
    "dev":"npx mini-next dev",  // 客户端渲染预览开发【不建议】
    "build":"npx mini-next build" // 服务端渲染模式时提前编译
    "output":"npx mini-next output" // 导出静态资源
  },

```

## app.js
```
const Koa = require('koa');
const miniNext = require('mini-next');
const app = new Koa();
new miniNext(app); // mini-next服务端渲染基于koa封装，开启ssr时需传入koa实例对象
app.listen(8001);

```

## 开发预览
mini-next采用多入口配置，src/pages下按照文件夹项目进行项目代码隔离，无论客户端还是服务端渲染均使用项目文件夹名称进行路由匹配。`eg:localhost:8001/index` 访问项目`index`. 


# entry
-  entry.js文件需使用`export default`导出组件。

```js
export default class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="demo">
                hello mini-next
            </div>
        );
    }
}

```

- 项目如果使用路由，暴露组件为` <Switch>`包裹的`<Route>`
```js
export default class APP extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/about" component={About} />
                <Route exact path="/about/:msg" component={About} />
                <Route component={Home} />
            </Switch>
        );
    }
}
```

- 无需使用ReactDOM.render进行渲染（这一步由mini-next框架完成，可在.mini-next目录下根据页面名称查看对应的js）

# Html

## 默认模板
框架内置`HTMLWebpackPlugin`提供了默认的构建输出的html模板`template.html`
```
<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width">
    <meta name="format-detection" content="telephone=no">
    <meta name="format-detection" content="email=no">
    <meta name="format-detection" content="address=no;">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="keywords" content="">
    <title>mini-next-webapp-<%= htmlWebpackPlugin.options.title %></title>
</head>

<body>
    <div id="app"></div>
    <script type="text/javascript">
         window.onload = function() {
            function t() {
                n.style.fontSize = 16 * e().width / 375 + "px"
            }

            function e() {
                return {
                    width: document.documentElement.clientWidth || document.body.clientWidth,
                    height: document.documentElement.clientHeight || document.body.clientHeight
                }
            }
            var n = document.querySelector("html");
            t();
            var i = 375;
            window.onresize = function() {
                window.outerWidth != i && (i = e().width,
                    n.style.fontSize = 16 * i / 375 + "px")
            }   
        };
    </script>
    </body>

</html>
```

## 自定义模板
为满足业务引入第三方脚本也提供了以下方式自定义template模板。
- `src/pages/xxx/xxx.html`
- `src/template.html`

## 优先级
 `src/pages/xxx/xxx.html` > `src/template.html`


# Pages
pages目录下必须为项目文件夹，项目名不能命名为`index`
```
└── src
    └── pages
        └── demo
            ├── demo.js // 入口文件
            └── demo.scss
```

## home路由
默认`_home` 为项目首页,也可通过localhost:port//_home访问预览。


## layout (待开发)
layout为项目公共部分的代码，比如页头，页脚。文件位于pages目录下新建的`_layout.js` 或者 `_layout.jsx`


# webpack
mini-next基于webpack@4.0+,Bable@7.0+进行项目编译,默认集成配置项如下
## loader
- babel-loader
- less-loader
- css-loader
- sass-loader
- postcss-loader
- url-loader

## extensions
` ['.js', '.css', '.scss', '.jsx']`

## alias

```js
alias: {
        components: srcPath + '/components',
        images: srcPath + '/images',
        mock: srcPath + '/mock',
        skin: srcPath + '/skin',
        utils: srcPath + '/utils',
        config: srcPath + '/config'
    }
```

## DefinePlugin
开发者在js中通过`process.env.NODE_ENV`可以进行环境的区分。
```
'process.env': NODE_ENV: JSON.stringify(dev ? 'development' : 'production')
```

## devServer
- `port:8080`
- `hot:true`
- `contentBase: ${srcPath}`

# 自定义webpack
mini-next支持自定义webpack中的指定配置项 

## 支持的配置项
```
// config/mini-next.config.js
module.exports = {
    webpack: {
        loader: {
            js: [],
            jsx: [],
            css: [],
            scss: [],
            less: [],
            img: []
        },
        externals: {
        },
        extensions: [],
        alias: {
            images: path.join(process.cwd() + '/src/images')
        },
        plugins: []
    }
 };
```

# SEO优化 

### 1.在入口js为App添加方法getInitialTDK
```
static async getInitialTDK({ req }) {
        return {
             title: "getInitialTDK"
        };
    }
```
### 2.在src或者src/pagename下创建TDK.js文件用于动态配置html的header
```
module.exports = async(ctx) =>{
    return {
        title: "测试title",  //页面标题
        keywords: "测试，key，words",  //对应meta中的name和content
        description: "描述",
        headContent: ``  //优先级最高，直接覆盖head（headContent会直接覆盖title前面的部分包括title，所以引用的外部资源需注意）
    }
}
```
### 3.优先级
getInitialTDK函数 > `src/[pageName]/TDK.js` > `src/TDK.js`


# getInitProps
## 服务端&客户端数据统一 
1.服务端渲染预初始化数据，**getInitialProps**函数，参数接受`ctx`对象
``` 
APP.getInitialProps = async (ctx,query,pathname) => {
        //...
        return { count: 1 }
    }
```
return返回的属性会挂载到组件的props上

2.客户端通过组件的props获取服务端数据
```
let APP = props => {
    const [count, setCount] = useState(props.count);
    return (
        <div>
            <span>Coweunt: {count}</span>
        </div>
    );
};
```
props除了挂载我们getInitialProps的返回值外，还会挂载url中的的pathname和query，可通过全局对象`window.__miniNext_DATA__`访问服务端预渲染返回的初始化数据。

# 搭配typescript
mini-next 默认使用`babel-loader`搭配插件`@babel/preset-typescript`进行ts编译,但不做类型校验，类型校验可以使用ts或者`vs code`编辑器工具


## 新增tsconfig.json

```
{
    "compilerOptions": {
      "jsx": "react",
      // Target latest version of ECMAScript.
      "target": "esnext",
      // Search under node_modules for non-relative imports.
      "moduleResolution": "node",
      // Process & infer types from .js files.
      "allowJs": true,
      // Don't emit; allow Babel to transform files.
      "noEmit": true,
      // Enable strictest settings like strictNullChecks & noImplicitAny.
      "strict": true,
      // Disallow features that require cross-file information for emit.
      "isolatedModules": true,
      // Import non-ES modules as default imports.
      "esModuleInterop": true
    },
    "include": ["src"]
  }

```


## babelrc

```
{
  "presets":["@babel/react",[
    "@babel/env",
    {
      "targets": {
        "browsers": ["last 2 versions", "ie >= 7"]
      }
    }
  ],"@babel/preset-typescript"],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      { "helpers": false, "regenerator": true }
    ],
    "@babel/plugin-transform-modules-commonjs",
    "@babel/plugin-proposal-class-properties"
  ]
}

```

`enjoy！`

# 高级配置项

## `mini-next.config`
可在config/mini-next.config.js下对我们的项目进行相关配置。
```
module.exports = {
    prefixCDN:'/', //构建后静态资源CDN地址前缀
    prefixRouter: '', //页面路由前缀 默认/pagename  添加后前缀后访问方式为 /${prefixRouter}/pagename
    ssr: true, // 是否全局开启服务端渲染
    ssrCache: true, // 是否全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    statiPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    ssrIngore: null or new RegExp() // 指定某一个或者多个page项目不采用服务端渲染 
}
```
