## 使用
### 安装
```
    npm install -g mini-next-cli
    
    mini-next init yourproject
```

### 服务端渲染开发
```
    npm start [page]    // 客户端代码修改后自动编译，自动刷新，多个页面以逗号分隔
```

### 生成环境构建
```
    npm run build  // 服务端渲染部署时先执行编译 dist目录下将创建client目录
```

### 开发调试  
- 客户端渲染   localhost:9990/with-react
- 服务端渲染  localhost:8001/with-react


## 高级配置
```
    prefixCDN:'/', // cdn部署时配置你的cdn域名路径 
    prefixRouter: '', // 页面路由前缀 默认/pagename  添加后前缀后访问方式为 /${prefixRouter}/pagename
    ssr: true, // 是否全局关闭服务端渲染
    ssrCache: true, // 是否全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    statiPages: [], // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    ssrIngore: null or new RegExp() // 指定某一个或者多个page项目不采用服务端渲染

```

## 项目静态资源导出
```
npm run build with-react // 必须先执行构建输出 静态资源目录存放于 dist/client/with-react目录下
npm run output with-react   // 最终输出的html资源存放于 .mini-next目录下
```

## SEO优化
在src或者src/pagename下创建TDK.js文件用于动态配置html的header
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