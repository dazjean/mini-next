var fs = require('fs');
const path = require('path');
const entryPath = path.join(process.cwd() + '/src/pages/');
const outputPath = path.join(process.cwd() + '/.mini-next/');

function getEntry(cateName) {
    var entryObj = {};
    if (cateName == true || cateName == 0) {
        fs.readdirSync(entryPath).forEach(function(cateName) {
            //cateName/cateName指定输出路径为entryname
            if (cateName != 'index.html' && cateName != '.DS_Store')
                entryObj[cateName + '/' + cateName] = serverPropsInject(cateName)
                    ? outputPath + cateName + '.js'
                    : entryPath + cateName + '/' + cateName + '.js';
        });
    } else {
        //一次打包多个入口文件以逗号分隔
        var cateNameArray = cateName.split(',');
        for (var i = 0; i < cateNameArray.length; i++) {
            entryObj[cateNameArray[i] + '/' + cateNameArray[i]] = serverPropsInject(
                cateNameArray[i]
            )
                ? outputPath + cateNameArray[i] + '.js'
                : entryPath + cateNameArray[i] + '/' + cateNameArray[i] + '.js';
        }
    }

    return entryObj;
}
function serverPropsInject(cateName) {
    try {
        //创建临时文件
        let data = fs.readFileSync(path.join(__dirname, '..', 'template.js'), 'utf8');
        data = data.replace('$injectApp$', `require('../src/pages/${cateName}/${cateName}.js')`);
        data = data.replace('__miniNext_DATA__pathname', cateName);
        let exists = fs.existsSync(outputPath);
        if (!exists) {
            fs.mkdirSync(outputPath);
        }
        if (!fs.existsSync(outputPath + cateName + '.js')) {
            fs.writeFileSync(outputPath + cateName + '.js', data);
        }
        return true;
    } catch (e) {
        console.log(cateName + '--客户端脱水失败');
        return false;
    }
}
module.exports = {
    getEntry
};
