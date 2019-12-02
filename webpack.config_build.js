'use strict';
process.env.NODE_ENV = 'production'; //设置当前环境
var optimist = require('optimist');
var cateName = optimist.argv.cate || 0; //0 来源entry构建
let { getProconfig } = require('./hmbird/lib/webpack/proconfig');

let config = getProconfig(cateName);
module.exports = config;
