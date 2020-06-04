const path = require('path');
var srcPath = path.join(process.cwd() + '/src');
var { getEntry } = require('./getEntry');
const clientPath = path.join(process.cwd() + '/dist/server');
function getServerconfig(pageName) {
    let entryObj = getEntry(pageName);
    let config = {
        devtool: false,
        mode: 'production',
        entry: {
            ...entryObj
        }, //类别入口文件
        output: {
            publicPath: '/',
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            filename: '[name].js', //打包后输出文件的文件名
            path: clientPath //打包后的文件存放的地方
        },
        plugins: [],
        module: {
            rules: [
                {
                    test: /js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /jsx$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /(\.scss|\.css)$/,
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
                    test: /\.(png|jpg|jpeg|gif)$/,
                    loader: 'url-loader',
                    options: {
                        name: '[hash:8].[name].[ext]',
                        limit: 8192,
                        outputPath: 'images/'
                    }
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
            'isomorphic-fetch': {
                root: 'isomorphic-fetch',
                commonjs2: 'isomorphic-fetch',
                commonjs: 'isomorphic-fetch',
                amd: 'isomorphic-fetch'
            }
        },
        resolve: {
            extensions: ['.js', '.css', '.scss', '.jsx'],
            alias: {
                components: srcPath + '/components',
                images: srcPath + '/images',
                mock: srcPath + '/mock',
                skin: srcPath + '/skin',
                utils: srcPath + '/utils',
                config: srcPath + '/config'
            }
        }
    };
    return config;
}
module.exports = getServerconfig;
