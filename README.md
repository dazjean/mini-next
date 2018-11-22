# 基于React+ReactRouter4.0、koa2.0的一款轻量级ssr
> 一款基于React16+   ReactRouter4.0  koa2.0搭建的一个node服务端渲染框架

## 框架特点：
- 静态单页面应用无配置支持ssr方式
- React-Router4.0支持自由选择服务端渲染和客户端渲染
- 静态资源版本号更新,部署方式支持cdn和服务端部署 （默认服务端）
- 导出静态页面(构建服务端渲染后的模板 ) 【待办】

## 安装
    git clone .......git
    npm install

## 开发启动
    npm run dev 

## 打包
    npm run build //打包所有
    npm run build pageXXX //打包某个page入口
    
## 服务端启动
    npm start

## 服务端访问
- 静态页面   localhost:8001/hmbird/pagexxx
- 路由      localhost:8001/hmbird_router/pagexxx

## *更新记录
    