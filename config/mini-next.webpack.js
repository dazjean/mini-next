const path = require("path");
module.exports = {
    loader: {
        js: [],
        jsx: [],
        css: [],
        scss: [
            {
                loader: 'css-loader',
                options: {
                    url: true,
                    minimize: false,
                    modules: true
                }
            },
            {
                loader: 'sass-loader'
            }
        ],
        less: [
            {
                loader: 'css-loader',
                options: {
                    url: true,
                    minimize: false,
                    mudules: true
                }
            },
            {
                loader: 'less-loader'
            }
        ],
        img: [{
            loader: 'url-loader',
            options: {
                name: '[hash:5].[name].[ext]',
                limit: 8192,
                outputPath: 'publicImages/'
            }
        }]
    },
    externals: {

    },
    extensions: [],
    alias: {
        images: path.join(process.cwd() + '/src/images')
    }
    // plugins
}