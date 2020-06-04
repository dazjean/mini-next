#!/usr/bin/env node
var commander = require('commander'); //可以自动的解析命令和参数，用于处理用户输入的命令
const { output } = require('../lib/output');
const { build } = require('../lib/build');
const { dev } = require('../lib/dev');

commander
    .version('0.0.1')
    .option('-d, --dev [page]', '启动客户端渲染，会启动一个webpack-dev-server')
    .option('-b, --build [page]', '执行生成环境编译，输出目录默认dist/client')
    .option('-s, --start', '默认启动一个koaServer')
    .option('-0, --output [page]', '导出静态资源，before run mini-next build');

// 静态资源导出
commander.command('output [page]').action((page = true) => {
    process.env.NODE_ENV = 'production';
    output(page);
});

// 生成环境构建
commander.command('build [page]').action((page = true) => {
    process.env.NODE_ENV = 'production';
    build(page);
});

// 开发环境启动
commander.command('dev [page]').action((page = true) => {
    dev(page);
});

commander.parse(process.argv);
