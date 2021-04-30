import { serverDir } from '../tools';
import { getBaseconfig } from './baseconfig';
import combine from './combine';

function getServerconfig(page) {
    let baseConfig = getBaseconfig(page, true);
    let config = {
        devtool: false,
        mode: 'production',
        entry: baseConfig.entry, //类别入口文件
        output: {
            publicPath: '/',
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            filename: '[name].js', //打包后输出文件的文件名
            path: serverDir //打包后的文件存放的地方
        },
        module: {
            rules: [
                {
                    test: /js$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /jsx$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /ts$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /tsx$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'css-loader'
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'less-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: '[hash:8].[name].[ext]',
                                limit: 8192,
                                outputPath: 'images/'
                            }
                        }
                    ]
                }
            ]
        },
        externals: {
            react: {
                amd: 'react',
                root: 'React',
                commonjs: 'react',
                commonjs2: 'react'
            },
            'react-dom': {
                amd: 'react-dom',
                root: 'ReactDOM',
                commonjs: 'react-dom',
                commonjs2: 'react-dom'
            },
            'react-router-dom': {
                amd: 'react-router-dom',
                root: 'ReactRouterDom',
                commonjs: 'react-router-dom',
                commonjs2: 'react-router-dom'
            }
        },
        resolve: baseConfig.resolve,
        plugins: []
    };
    return combine(config, true);
}
module.exports = getServerconfig;
