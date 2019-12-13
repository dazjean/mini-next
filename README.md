## 如何使用
```
npm -i hmbird -g
hmbird init yourprojectName
cd yourprojectName
npm install 
npm start
```

### 基于koa
```js
// app.js
import Hmbird from 'hmbird';
import koa from 'koa';
const app = new koa();
new Hmbird(app);
app.listen(8001);
```

### cli 命令
```sh  
  hmbird dev [page]  // 客户端启动
  hmbird build [page] // 生成环境代码构建
  hmbird output [page] // 静态资源导出 默认输出目录_output 
```


## 高级配置
```js
// config/hmbird.config.js
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
 - 服务端渲染开发环境热启动
 - 服务端渲染模式初始化props如何在客户端渲染时保持 数据注水？
 - 客户端渲染时query参数作为props如何实现？ 