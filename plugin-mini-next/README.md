# `@umajs/plugin-mini-next`

> umajs框架服务端渲染插件。

## Usage

```
npm install @umajs/plugin-mini-next --save

```
## mini-next插件配置
```
//app/src/config/plugin.config.ts
export default {
    'mini-next': true
};
```

## 使用
```
1.在 app/src/pages目录下添加对应的页面目录（mini-next使用文档：http://doc.58corp.com/hmbird/）
2. 添加对应的.babelrc & postcss.config.js 配置文件
3. 在package.json中添加script脚本
  "start": "ts-node src/app.ts"
4. 命令行启动
   npm start [page]
```



