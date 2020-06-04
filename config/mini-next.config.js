module.exports = {
    prefixCDN: '/',
    prefixUrl: '',
    ssr: true, // 是否全局关闭服务端渲染
    ssrCache: false, // 是否全局使用服务端渲染缓存 第一次ssr,再次采用缓存，适用与存静态资源或者所有人访问的页面都是一样的工程
    statiPages: ['with-react'] // 纯静态页面 执行一次服务端渲染，之后采用缓存html
    // ssrIngore: null // 指定某一个或者多个page项目不采用服务端渲染
};
