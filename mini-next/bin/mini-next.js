#!/usr/bin/env node
var commander = require('commander'); //可以自动的解析命令和参数，用于处理用户输入的命令

commander
    .version('0.0.1')
    .option('-d, --dev [page]', '启动客户端渲染，会启动一个webpack-dev-server')
    .option('-b, --build [page]', '执行生成环境编译，输出目录默认dist/client')
    // .option('-s, --start', '默认启动一个koaServer')
    .option('-0, --output [page]', '导出静态资源，before run mini-next build');

// 静态资源导出
commander.command('output [page]').action((page = true) => {
    const { output } = require('../lib/output');
    if (page == 'true') {
        process.env.NODE_ENV = 'production';
    } else if (page == 'false') {
        process.env.NODE_ENV = 'development';
    }
    output(page);
});

// 生成环境构建
commander.command('build [page]').action((page = true) => {
    const { build } = require('../lib/build');
    if (page == 'true') {
        process.env.NODE_ENV = 'production';
        page = JSON.parse(page);
    } else if (page == 'false') {
        process.env.NODE_ENV = 'development';
        page = JSON.parse(page);
    }
    build(page);
});

// 开发环境启动
commander.command('dev [page]').action((page = true) => {
    const { dev } = require('../lib/dev');
    if (page == 'true') {
        process.env.NODE_ENV = 'production';
    } else if (page == 'false') {
        process.env.NODE_ENV = 'development';
    }
    dev(page);
});

commander.parse(process.argv);
