require('babel-register')({
    presets: ['env']
});
var optimist = require('optimist');
var cateName = optimist.argv.cate || ''; //0 来源entry构建
module.exports = require('./output.js').output(cateName);
