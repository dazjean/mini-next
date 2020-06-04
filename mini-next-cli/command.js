#!/usr/bin/env node
const fs = require('fs');
var commander = require('commander'); //可以自动的解析命令和参数，用于处理用户输入的命令
const download = require('download-git-repo'); //下载并提取 git 仓库，用于下载项目模板。
const handlebars = require('handlebars'); //模板引擎，将用户提交的信息动态填充到文件中
const inquirer = require('inquirer'); //通用的命令行用户界面集合，用于和用户进行交互。
const ora = require('ora'); //下载过程久的话，可以用于显示下载中的动画效果。
const chalk = require('chalk'); //可以给终端的字体加上颜色
const symbols = require('log-symbols'); //可以在终端上显示出 √ 或 × 等的图标。

commander
    .version('2.0.0')
    .option('-i, --init [name]', '初始化项目工程,会创建一个[name]项目')
    .option(
        '-u, --update',
        '升级脚手架,请cd到项目跟目录下执行 mini-next update命令;注意！！！升级会导致项目package.json文件夹重置,请提前备份！'
    )
if (commander.init) {
    console.log('初始化项目,在当前文件夹下将会创建一个mini-next工程', commander.init);
}
if (commander.update) {
    console.log('升级脚手架,请cd到项目跟目录下执行 mini-next update命令');
}
// 初始化 <name>工程
commander.command('init <name>').action(name => {
    console.log('初始化项目文件夹名称是:', name);
    if (!fs.existsSync(name)) {
        inquirer
            .prompt([
                {
                    name: 'description',
                    message: '请输入项目描述:'
                },
                {
                    name: 'author',
                    message: '请输入作者名称:'
                },
                {
                    name: 'url',
                    message: '请输入git地址:'
                }
            ])
            .then(answers => {
                const spinner = ora('正在下载模板...');
                spinner.start();
                download(
                    'direct:https://github.com/dazjean/mini-next-template.git#master',
                    name,
                    { clone: true },
                    err => {
                        if (err) {
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            spinner.succeed();
                            const fileName = `${name}/package.json`;
                            const meta = {
                                name,
                                description: answers.description,
                                author: answers.author,
                                url: answers.url
                            };
                            if (fs.existsSync(fileName)) {
                                console.log(symbols.success, chalk.green('更新package.json...'));
                                const content = fs.readFileSync(fileName).toString();
                                // let config = JSON.parse(content);
                                // let newConfig = Object.assign({},config,meta);
                                //const result = JSON.stringify(newConfig);
                                const result = handlebars.compile(content)(meta);
                                fs.writeFileSync(fileName, result);
                                console.log(
                                    symbols.success,
                                    chalk.green('package.json更新完成...')
                                );
                            } else {
                                console.log('没有更新package.json');
                            }
                            console.log(symbols.success, chalk.green('项目初始化完成'));
                        }
                    }
                );
            });
    } else {
        // 错误提示项目已存在，避免覆盖原有项目
        console.log(symbols.error, chalk.red('项目已存在'));
    }
});
// 升级已有mini-next项目
commander.command('update').action(() => {
    console.log(
        '升级当前项目会覆盖原来项目原始配置,如果项目有改变原始文件请做好备份！！！建议切换到一个新分支进行升级~'
    );
    var name = './';
    inquirer
        .prompt([
            {
                name: 'description',
                message: '请输入项目描述:'
            },
            {
                name: 'author',
                message: '请输入作者名称:'
            },
            {
                name: 'url',
                message: '请输入git地址:'
            }
        ])
        .then(answers => {
            const spinner = ora('正在更新模板...');
            spinner.start();
            download(
                'direct:https://github.com/dazjean/mini-next-template/-/archive/master/mini-next-template-master.zip',
                name,
                err => {
                    if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    } else {
                        spinner.succeed();
                        const fileName = `package.json`;
                        const meta = {
                            name: answers.name,
                            description: answers.description,
                            author: answers.author,
                            url: answers.url
                        };
                        if (fs.existsSync(fileName)) {
                            console.log(chalk.green('开始更新package.json！'));
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                            console.log(chalk.green('package.json更新完成！'));
                        }
                        console.log(symbols.success, chalk.green('项目更新完成！'));
                    }
                }
            );
        });
});


commander.parse(process.argv);
