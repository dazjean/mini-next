/**
 * 工具类
 * cookie 操作
 */
define([], function() {
	var	cookie = {  
    get: function (name, encode) {  
        var arg = name + "=";  
        var alen = arg.length;  
        var clen = document.cookie.length;  
        var i = 0;  
        var j = 0;  
        while (i < clen) {  
            j = i + alen;  
            if (document.cookie.substring(i, j) == arg)  
                return this.getCookieVal(j, encode);  
            i = document.cookie.indexOf(" ", i) + 1;  
            if (i == 0)  
                break;  
        }  
        return null;  
    },  
    set: function (name, value, expires, path, domain, secure) {  
        var argv = arguments;  
        var argc = arguments.length;  
        //        var expires = (argc > 2) ? argv[2] : null;  
        var now = new Date();  
        var expires = (argc > 2) ? argv[2] : new Date(now.getFullYear(), now.getMonth() + 1, now.getUTCDate());  
        var path = (argc > 3) ? argv[3] : '/';  
        var domain = (argc > 4) ? argv[4] : '.58.com';  
        var secure = (argc > 5) ? argv[5] : false;  
        document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");  
    },
    set_noencode: function (name, value, expires, path, domain, secure) {  
        var argv = arguments;  
        var argc = arguments.length;  
        var now = new Date();  
        var expires = (argc > 2) ? argv[2] : new Date(now.getFullYear(), now.getMonth() + 1, now.getUTCDate());  
        var path = (argc > 3) ? argv[3]||'/' : '/';  
        var domain = (argc > 4) ? argv[4]||'.58.com' : '.58.com';  
        var secure = (argc > 5) ? argv[5] : false;  
        document.cookie = name + "=" + value + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");  
    },  
    remove: function (name) {  
        //if (this.get(name))   
        //    document.cookie = name + "=" + "; expires=Thu, 01-Jan-70 00:00:01 GMT";  
        if (this.get(name)) this.set(name, "", new Date(1970, 1, 1));  
    },  
      
    getCookieVal : function(offset, encode){  
        var endstr = document.cookie.indexOf(";", offset);  
        if (endstr == -1) {  
            endstr = document.cookie.length;  
        }  
        if (encode == false) return document.cookie.substring(offset, endstr);  
        else return unescape(document.cookie.substring(offset, endstr));  
    } 
	}
	return cookie;
});