utils = {
    /* description: 实现将类数组转化为数组
     * parameter:
     * listAry: 类数组集合
     */ 
    listToArray: function(listAry) {
        var ary = [];
        try {
            ary = Array.prototype.slice.call(listAry);
        } catch (e) {
            
        }
        return ary;
    },

    /* description: 获取css属性值
     * parameter:
     * ele: 标签元素
     * attr: css属性名
     */ 
    getCss: function(ele, attr, pseudo) {
        var val = null;
        var reg = null;
								var reg2 = null;
        if("getComputedStyle" in window) {
										if(pseudo) {
												val = window.getComputedStyle(ele, pseudo)[attr];
										} else {
												val = window.getComputedStyle(ele, null)[attr];
										}
        } else {
										if(attr === "opacity") {
												/*val = ele.currentStyle["filter"];*/
												val = "alpha(opacity=60)";
												reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
												val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
										} else {
												val = ele.currentStyle[attr];
										}
        }
        reg = /^(-?\d+(\.\d+)?)(em|rem|pt|px)?$/i;
        val = reg.test(val) ? parseFloat(val) : val;
        return val;
    }
}