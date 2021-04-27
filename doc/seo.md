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
