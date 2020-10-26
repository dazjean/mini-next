const fs = require('fs');
const path = require('path');
const entryPath = path.join(process.cwd() + '/src/pages/');
const outputPath = path.join(process.cwd() + '/.mini-next');

function getEntry(cateName) {
    var entryObj = {};
    let hasHomeEntry = false;
    const setEntry = function(pageName) {
        if (pageName === '_home') hasHomeEntry = true;
        entryObj[`${pageName}/${pageName}`] = `${outputPath}/${pageName}`;
    };
    if (cateName == true || cateName == 0) {
        fs.readdirSync(entryPath).forEach(function(cateName) {
            //cateName/cateName指定输出路径为entryname
            if (cateName != 'index.html' && cateName != '.DS_Store' && serverPropsInject(cateName))
                setEntry(cateName);
        });
    } else {
        //一次打包多个入口文件以逗号分隔
        var cateNameArray = cateName.split(',');
        for (var i = 0; i < cateNameArray.length; i++) {
            let fileName = cateNameArray[i];
            if (serverPropsInject(cateNameArray[i])) setEntry(fileName);
        }
    }
    if (!hasHomeEntry) {
        entryObj['_home/home'] = path.resolve(__dirname, './_home.js');
    }
    return entryObj;
}
function serverPropsInject(cateName) {
    try {
        //创建临时文件
        let data = fs.readFileSync(path.join(__dirname, '..', 'template.js'), 'utf8');
        data = data.replace('$injectApp$', `require('../src/pages/${cateName}/${cateName}')`);
        data = data.replace('__miniNext_DATA__pathname', cateName);
        let exists = fs.existsSync(outputPath);
        if (!exists) {
            fs.mkdirSync(outputPath);
        }
        if (!fs.existsSync(`${outputPath}/${cateName}.js`)) {
            fs.writeFileSync(`${outputPath}/${cateName}.js`, data);
        }
        return true;
    } catch (err) {
        console.error(`${cateName} Entry file creation failed in. Mini next cache folder`, err);
        return false;
    }
}

module.exports = {
    getEntry
};
