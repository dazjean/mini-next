define(function() {
	var Util = {};
    /**
     * 判断对象类型
     */
    // 'String Function Object Array Number Null Undefined Boolean'.split(' ').forEach(function(obj, index) {
    //     Util['is' + obj] = function(typeObj) {
    //         var type = Object.prototype.toString.call(typeObj);
    //         if (type === '[object ' + obj + ']') {
    //             return true;
    //         }
    //         return false;
    //     }
    // });
    (function(Util){
        var typeList = ['String', 'Function', 'Object', 'Array', 'Number', 'Null', 'Undefined', 'Boolean'];
        for(var i=0; i<typeList.length; i++) {
            var typeStr = typeList[i];
            (function(typeStr){
                Util['is' + typeStr] = function(typeObj) {
                    var type = Object.prototype.toString.call(typeObj);
                    if (type === '[object ' + typeStr + ']') {
                        return true;
                    }
                    return false;
                }
            })(typeStr);
        }
    })(Util);
    /**
     * 借鉴underscore.js
     * http://www.css88.com/doc/underscore/docs/underscore.html
     * @param obj
     * @returns {*|boolean}
     */
    Util.isNaN = function(obj) {
        return Util.isNumber(obj) && obj !== +obj;
    };
    /*
    * 获取url参数值
    * @param paramName
    * */
    Util.getUrlParam=function(nameData) {
        var reg = new RegExp("(^|&)"+ nameData +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) {
            //return unescape(r[2]);
            return r[2];
        }
        return null;
    }
    Util.mixin = function(b, e) {
        for (var k in e) {
            e.hasOwnProperty(k) && (b[k] = e[k])
        }
        return b
    };
    Util.stripHtml=function(html) {
        html = html || "";
        var scriptregex = "<scr" + "ipt[^>.]*>[sS]*?</sc" + "ript>";
        var scripts = new RegExp(scriptregex, "gim");
        html = html.replace(scripts, " ");

        //Stripts the <style> tags from the html
        var styleregex = "<style[^>.]*>[sS]*?</style>";
        var styles = new RegExp(styleregex, "gim");
        html = html.replace(styles, " ");

        //Strips the HTML tags from the html
        var objRegExp = new RegExp("<(.| )+?>", "gim");
        var strOutput = html.replace(objRegExp, " ");

        //Replace all < and > with &lt; and &gt;
        strOutput = strOutput.replace(/</, "&lt;");
        strOutput = strOutput.replace(/>/, "&gt;");

        objRegExp = null;
        return strOutput;
    };
    /*日期格式化*/
	 Util.format= function(format){	  
     }
     Date.prototype.format = function(format){ 
        var o = { 
            "M+" : this.getMonth()+1, //month 
            "d+" : this.getDate(), //day 
            "h+" : this.getHours(), //hour 
            "m+" : this.getMinutes(), //minute 
            "s+" : this.getSeconds(), //second 
            "q+" : Math.floor((this.getMonth()+3)/3), //quarter 
            "S" : this.getMilliseconds() //millisecond 
            } 

            if(/(y+)/.test(format)) { 
            format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
            } 

            for(var k in o) { 
            if(new RegExp("("+ k +")").test(format)) { 
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
            } 
            } 
        return format; 
    }
    // 数字千分位转化
     Util.toThousands = function(num) {
        var num = (num || 0).toString(), result = '';
        var intAndfloat = num.split('.');
        num = intAndfloat[0];//num有可能是小数类型 52.8
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) { result = num + result; }
        if(intAndfloat.length>1){
            result = result+"."+intAndfloat[1];
        }
        return result;
    }

    /**
     * @param num 处理数字
     * @param len 小数点后保留位数
    */
    Util.toFixed = function(num,len){
        var numArr = ((num || 0).toString()).split(".");
        if(numArr.length == 1){
            return num;
        }
        var numFloat = numArr[1];
        if(numFloat.length < len){
            return num;
        }else{
            numArr[1] = numFloat.substr(0,2);
            return numArr.join(".")
        }
    }

    return Util;
});