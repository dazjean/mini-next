import webPack from './webpack/run';
import { getConfig } from './utils';
const dev = process.env.NODE_ENV !== 'production';

export const build = (pageName = true) => {
    const config = getConfig();
    new webPack(pageName, dev, false).run(); // 客户端代码编译
    config.ssr && new webPack(pageName, dev, true).run(); // 服务端代码编译
};
