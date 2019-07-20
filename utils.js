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
    getCss: function(curEle, attr, pseudo) {
        var val = null;
        var reg = null;
        if(flag) {
            if(pseudo) {
                val = window.getComputedStyle(curEle, pseudo)[attr];
            } else {
                val = window.getComputedStyle(curEle, null)[attr];
            };
        } else {
            if(attr === "opacity") {
                val = curEle.currentStyle["filter"];
                reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
                val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
            } else {
                val = curEle.currentStyle[attr];
            };
        }
        reg = /^(-?\d+(\.\d+)?)(em|rem|pt|px)?$/i;
        val = reg.test(val) ? parseFloat(val) : val;
        return val;
    },
    setCss: function(curEle, attr, value) {
        var reg = /^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
        if(reg.test(attr)) {
            if(!isNaN(value)) {
                value += "px";
            }
        }
        curEle["style"][attr] = value;
    },
    offset: function(curEle) {
        var totalLeft = curEle.offsetLeft;
        var totalTop = curEle.offsetTop;
        var parent = curEle.offsetParent;
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
    formatJSON: function(jsonStr) {
        return "JSON" in window ? JSON.parse(jsonStr) : eval("(" + jsonStr + ")");
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
    },
    prev: function(curEle) {
        if(flag) {
            return curEle.previousElementSibling;
        }
        var prev = curEle.previousSibling;
        while(prev && prev.nodeType !== 1) {
            prev = prev.previousSibling;
        };
        return prev;
    },
    prevAll: function(curEle) {
        var ary = [];
        var prev = this.prev(curEle);
        while(prev) {
            ary.unshift(prev);
            prev = this.prev(prev);
        }
        return ary;
    },
    next: function(curEle) {
        if(flag) {
            return curEle.nextElementSibling;
        }
        var next = curEle.nextSibling;
        while(next && next.nodeType !== 1) {
            next = next.nextSibling;
        };
        return next;
    },
    nextAll: function(curEle) {
        var ary = [];
        var next = this.next(curEle);
        while(next) {
            ary.push(next);
            next = this.next(next);
        }
        return ary;
    },
    sibling: function(curEle) {
        var ary =[];
        var prev = this.prev(curEle);
        var next = this.next(curEle);
        prev ? ary.unshift(prev) : null;
        next ? ary.push(next) : null;
        return ary;
    },
    siblings: function(curEle) {
        return this.prevAll(curEle).concat(this.nextAll(curEle));
    },
    index: function(curEle) {
        return this.prevAll(curEle).length;
    },
    firstChild: function(curEle) {
        var children = this.children(curEle);
        return children.length > 0 ? children[0] : null;
    },
    lastChild: function(curEle) {
        var children = this.children(curEle);
        return children.length > 0 ? children[children.length - 1] : null;
    },
    append: function(newEle, container) {
        container.appendChild(newEle);
    },
    prepend: function(newEle, container) {
        var firstChild = this.firstChild(container);
        if(firstChild) {
            container.insertBefore(newEle, firstChild);
            return;
        }
        container.appendChild(newEle);
    },
    insertBefore: function(newEle, oldEle) {
        oldEle.parentNode.insertBefore(newEle, oldEle);
    },
    insertAfter: function(newEle, oldEle) {
        var next = this.next(oldEle);
        if(next) {
            oldEle.parentNode.insertBefore(newEle, next);
            return;
        }
        oldEle.parentNode.appendChild(newEle);
    },
    hasClass: function(curEle, className) {
        var classList = curEle.className;
        var reg = new RegExp("(^| +)" + className + "( +|$)");
        return reg.test(classList);
    },
    addClass: function(curEle, className) {
        var ary = className.replace(/(^ +| +$)/g, "").split(/ +/g);
        for(var i = 0; i < ary.length; i++) {
            if(!this.hasClass(curEle, ary[i])) {
                curEle.className += " " + ary[i];
            }
        }
    },
    removeClass: function(curEle, className) {
        var ary = className.replace(/(^ +| +$)/g, "").split(/ +/g);
        for(var i = 0; i < ary.length; i++) {
            if(this.hasClass(curEle, ary[i])) {
                var reg = new RegExp("(^| +)" + ary[i] + "( +|$)");
                curEle.className = curEle.className.replace(reg, " ");
            }
        }
    }
} 