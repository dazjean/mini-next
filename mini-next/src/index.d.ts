/// <reference types="node" />
import * as Koa from 'koa';

type TssrOptions = {
    ssr:boolean, 
    cache:boolean 
}

declare  class MiniNext {

    /**
     * 
     * @param app koa实例
     * @param dev 默认true,将改写process.env.NODE_ENV为development
     * @param useRouter 使用默认路由 默认true
     */
    constructor(app:Koa, dev:boolean, useRouter:boolean);

    /**
     * 
     * @param ctx 
     * @param viewName 页面组件名称 
     * @param initProps 初始化props
     * @param options 局部属性
     */
    render(ctx:Koa.Context, viewName:string, initProps?:object, options?:TssrOptions):void;
}

export default MiniNext;