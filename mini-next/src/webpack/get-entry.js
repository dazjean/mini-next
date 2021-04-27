import path from 'path';
import fs from 'fs';
import help, { getEntryDir, tempDir } from '../utils';

const entryDir = getEntryDir();
function getEntry(cateName) {
    var entryObj = {};
    const setEntry = function (pageName) {
        entryObj[`${pageName}/${pageName}`] = `${tempDir}/${pageName}`;
    };
    if (cateName == true || cateName == 0 || typeof cateName == 'boolean') {
        fs.readdirSync(entryDir).forEach(function (cateName) {
            //cateName/cateName指定输出路径为entryname
            if (cateName != 'index.html' && cateName != '.DS_Store' && initPropsInject(cateName))
                setEntry(cateName);
        });
    } else {
        //一次打包多个入口文件以逗号分隔
        var cateNameArray = cateName.split(',');
        for (var i = 0; i < cateNameArray.length; i++) {
            let fileName = cateNameArray[i];
            if (initPropsInject(cateNameArray[i])) setEntry(fileName);
        }
    }
    return entryObj;
}
function initPropsInject(cateName) {
    try {
        //创建临时文件
        let entryFile = help.getOptions('rootDir');
        let data = fs.readFileSync(path.join(__dirname, '..', 'webpack-entry.js'), 'utf8');
        data = data.replace(
            '$injectApp$',
            `require('../${entryFile}/pages/${cateName}/${cateName}')`
        );
        data = data.replace('__miniNext_DATA__pathname', cateName);
        let exists = fs.existsSync(tempDir);
        if (!exists) {
            fs.mkdirSync(tempDir);
        }
        if (!fs.existsSync(`${tempDir}/${cateName}.js`)) {
            fs.writeFileSync(`${tempDir}/${cateName}.js`, data);
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
