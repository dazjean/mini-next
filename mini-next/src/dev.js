const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
import { getDevconfig } from './webpack/devconfig';
export const dev = (page = true) => {
    let webpackConfig = getDevconfig(page);
    const compiler = Webpack(webpackConfig);
    const devServerOptions = Object.assign(
        {},
        {
            port: '8080',
            stats: {
                colors: true
            }
        },
        webpackConfig.devServer
    );
    const server = new WebpackDevServer(compiler, devServerOptions);

    server.listen(devServerOptions.port, '127.0.0.1', () => {
        console.log('Starting server on http://localhost:' + devServerOptions.port);
    });
};
