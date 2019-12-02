'use strict';
process.env.NODE_ENV = 'development'; //设置当前环境
var optimist = require('optimist');
var cateName = optimist.argv.cate || 0; //0 来源entry构建
let { getDevconfig } = require('./hmbird/lib/webpack/devconfig');

let config = getDevconfig(cateName);
module.exports = config;
