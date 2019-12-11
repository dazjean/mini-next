var fs = require('fs');
const path = require('path');
var entryObj = {};
const entryPath = path.join(process.cwd() + '/src/pages/');

function getEntry(cateName) {
    if (cateName == true) {
        fs.readdirSync(entryPath).forEach(function(cateName) {
            //cateName/cateName指定输出路径为entryname
            if (cateName != 'index.html' && cateName != '.DS_Store')
                entryObj[cateName + '/' + cateName] = entryPath + cateName + '/' + cateName + '.js';
        });
    } else if (cateName.indexOf(',')) {
        //一次打包多个入口文件以逗号分隔
        var cateNameArray = cateName.split(',');
        for (var i = 0; i < cateNameArray.length; i++) {
            entryObj[cateNameArray[i] + '/' + cateNameArray[i]] =
                entryPath + cateNameArray[i] + '/' + cateNameArray[i] + '.js';
        }
    } else {
        //打包单个入口文件
        entryObj[cateName + '/' + cateName] = entryPath + cateName + '/' + cateName + '.js';
    }

    return entryObj;
}

module.exports = {
    getEntry
};
