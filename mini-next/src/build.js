import webPack from './webpack/run';
import help, { getConfig } from './utils';

export const build = async (pageName = true) => {
    const dev = help.isDev();
    const config = getConfig();
    await new webPack(pageName, dev, false).run(); // 客户端代码编译
    config.ssr && (await new webPack(pageName, dev, true).run()); // 服务端代码编译
};
