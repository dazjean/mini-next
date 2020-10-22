## 如何使用
```
npm -i mini-next-cli -g
mini-next init yourprojectName
cd yourprojectName
npm install 
npm start [page] //多个页面以逗号分隔
```

### 基于koa
```js
// app.js
import miniNext from 'mini-next';
import koa from 'koa';
const app = new koa();
new miniNext(app);
app.listen(8001);
```

### cli 命令
```sh  
  mini-next dev [page]  // 客户端启动
  mini-next build [page] // 生成环境代码构建
  mini-next output [page] // 静态资源导出 默认输出目录.mini-next
```


## 高级配置
```js
// config/mini-next.config.js
module.exports = {
    prefixCDN:'/',
    prefixRouter: '', //页面路由前缀 默认/pagename  添加后前缀后访问方式为 /${prefixRouter}/pagename
    ssr: true, // 是否全局关闭服务端渲染
    ssrCache: true, // 是否全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    statiPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    ssrIngore: null or new RegExp() // 指定某一个或者多个page项目不采用服务端渲染 
}
```

## 服务端渲染预初始化数据
> 和next类似，ssr之前调用页面组件静态方法`getInitialProps`,参数接受`ctx`对象
```js
import React, { Component } from 'react';
require('es6-promise').polyfill();
require('isomorphic-fetch');
class App extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = { userAgent: props.userAgent };
    }
    static async getInitialProps({ req }) {
        const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
        const res = await fetch('http://localhost:8001/test.json');
        const json = await res.json();
        return { text: json.text, userAgent: userAgent };
    }
    render() {
        return (
            <div className="demo">
                state:{this.state.userAgent}
                propts:{JSON.stringify(this.props)}
            </div>
        );
    }
}
module.exports = App;
```

## 组件pops默认接收请求中query参数
> 服务端渲染时，默认会将url请求中的参数作为props传递给组件



##  待办
 - 服务端渲染模式初始化props如何在客户端渲染时保持 数据注水 【完成】
 - 客户端渲染时query参数作为props实现 【完成】
 - 服务端渲染开发环境热启动 【完成，热加载客户端代码】
 - dll公共模块构建，代码切割 【完成】
 - index.d.ts支持ts中使用 && wf-node集成例子 【未开始】
 - 云平台环境hmbrid 命令提示找不到【未开始】

 ## 细节
 - 有缓存页面的控制流量，第一个请求来之后，后续请求等待第一个请求完成。将写文件放入子进程，不适用主进程
 - 监听页面变化还需要吗？进行ssr 并且将所有html的页面写入缓存
 - 只执行页面的全局变量更改 __mini-next__
 - 按需加载
 - webapck打包缓存
