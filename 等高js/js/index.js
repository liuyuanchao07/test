window.onload = function () {
  // 获取所有元素并转化成数组
  const likeAry = Array.prototype.slice.call(document.getElementsByTagName("*"));

  // 需要匹配的目标class名
  const targetClass = "arrageHeight-";

  // 筛选出来的目标元素
  const eleAry = [];

  // 筛选出来的目标元素的class名称
  const sortAry = [];

  function isSP () {
    if (document.documentElement.clientWidth <= 767 || document.body.clientWidth <= 767) {
      return true;
    } else {
      return false;
    }
  }

  for (let i = 0; i < likeAry.length; i++) {
    if (likeAry[i].className) {
      const classAry = likeAry[i].className.trim().split(/\s+/);
      for (let j = 0; j < classAry.length; j++) {
        if (classAry[j].indexOf(targetClass) !== -1) {
          if (!sortAry.indexOf(classAry[j]) !== -1) {
            sortAry.push(classAry[j]);
          }
          eleAry.push(likeAry[i]);
        }
      }
    }
  }
  
  function matchHeight () {
    clearHeight()
    for (let i = 0; i < sortAry.length; i++) {
      let arrageAry = [];
      for (let j = 0; j < eleAry.length; j++) {
        if (eleAry[j].className.indexOf(sortAry[i]) !== -1) {
          arrageAry.push(parseFloat(window.getComputedStyle(eleAry[j])["height"]));
        }
      };
      for (let j = 0; j < eleAry.length; j++) {
        if (eleAry[j].className.indexOf(sortAry[i]) !== -1) {
          eleAry[j].style.height = Math.max.apply(null, arrageAry) + "px";
        }
      }
    }
  }

  function clearHeight () {
    for (let i = 0; i < eleAry.length; i++) {
      eleAry[i].style.height = "auto";
    }
  }

  if (isSP()) {
    clearHeight();
  } else {
    matchHeight();
  }

  window.onresize = function () {
    if (isSP()) {
      clearHeight();
    } else {
      matchHeight();
    }
  }
}