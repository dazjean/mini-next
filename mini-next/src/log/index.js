const Logger = require('@umajs/logger');
const path = require('path');
const { logger } = require('./../utils').getConfig();
const dir = path.join(process.cwd() + '/logs');
if (logger) {
    Logger.default.init({
        level: 'ALL', //日志输出级别
        dir: dir, //日志输出目录
        file: `${dir}/mininext.log`,
        encoding: 'utf-8', //日志编码格式
        outputJSON: true, //是否格式化输出携带pid等信息 false仅输出msg
        consoleLevel: 'ALL', //终端日志输出级别
        allowDebugAtProd: true, //生产环境是否允许打印debug日志
        replaceConsole: false //是否重写系统console日志
    });
}

module.exports = logger ? Logger.default : console;
