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