var flag = "getComputedStyle" in window;
utils = {
    listToArray: function(listAry) {
        if(flag) {
            return Array.prototype.slice.call(listAry, 0);
        };
        var ary = [];
        for(var i = 0; i < listAry.length; i++) {
            ary[ary.length] = listAry[i];
        }
        return ary;
    },
    getCss: function(ele, attr, pseudo) {
        var val = null;
        var reg = null;
        if(flag) {
            if(pseudo) {
                val = window.getComputedStyle(ele, pseudo)[attr];
            } else {
                val = window.getComputedStyle(ele, null)[attr];
            };
        } else {
            if(attr === "opacity") {
                val = ele.currentStyle["filter"];
                reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
                val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
            } else {
                val = ele.currentStyle[attr];
            };
        }
        reg = /^(-?\d+(\.\d+)?)(em|rem|pt|px)?$/i;
        val = reg.test(val) ? parseFloat(val) : val;
        return val;
    },
    offset: function(ele) {
        var totalLeft = ele.offsetLeft;
        var totalTop = ele.offsetTop;
        var parent = ele.offsetParent;
        while(parent) {
            if(navigator.userAgent.indexOf("MSIE 8.0" === -1)) {
                totalLeft += parent.clientLeft;
                totalTop += parent.clientTop;
            };
            totalLeft += parent.offsetLeft;
            totalTop += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return {left: totalLeft, top: totalTop};
    },
    win: function(attr, value) {
        if(typeof value === "undefined") {
            return document.documentElement[attr] || document.body[attr];
        }
        document.documentElement[attr] = value;
        document.body[attr] = value;
    },
    children: function(curEle, tagName) {
        var ary = [];
        if(!flag) {
            var nodeList = curEle.childNodes;
            for(var i = 0; i < nodeList.length; i++) {
                if(nodeList[i].nodeType === 1) {
                    ary[ary.length] = nodeList[i];
                }
            };
            nodeList = null;
        } else {
            ary = Array.prototype.slice.call(curEle.children);
        }

        if(typeof tagName === "string") {
            for(var i = 0; i < ary.length; i++) {
                if(ary[i].nodeName.toLowerCase() !== tagName.toLowerCase()) {
                    ary.splice(i, 1);
                    i--;
                }
            }
        }
        return ary;
    }
}