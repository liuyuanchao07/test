document.addEventListener("DOMContentLoaded", function() {
  (function(){
    var slider = document.querySelector(".sliderFirst");
    var container = slider.querySelector(".container");
    var pagination = slider.querySelector(".pagination");
    var buttonPrev= slider.querySelector(".prev");
    var buttonNext = slider.querySelector(".next");
    var step = 0;
    var autoTimer = null;
    var fadeTimer = null;
    var interval = 3000;

    // 1. ajax请求数据
    var timeStamp = new Date();
    var jsonData = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/slider/data/data.json?" + timeStamp.getTime(), false);
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4 && /^2\d{2}$/.test(xhr.status)) {
        jsonData = JSON.parse(xhr.responseText);
      }
    };
    xhr.send();

    // 2. 绑定数据
    var slideStr = "";
    var paginationStr = "";
    jsonData.forEach(function(item, index) {
      slideStr += "<div class='slide'><img src='' data-src='" + item["src"] + "' alt='" + item["description"] + "'></div>";
      if(index === 0) {
        paginationStr += "<span class='current'></span>";
      } else {
        paginationStr += "<span></span>";
      };
    });
    container.innerHTML = slideStr;
    pagination.innerHTML = paginationStr;
    slideStr = null;
    paginationStr = null;

    var sliderItem = container.querySelectorAll(".slide");
    var sliderImage = container.querySelectorAll("img");
    var paginationItem = pagination.querySelectorAll("span");

    function fadeIn(curEle, target, duration, interval) {
      var begin = parseFloat(window.getComputedStyle(curEle, null)["opacity"]);
      var step = (target - begin) / duration * interval;
      fadeTimer = window.setInterval(function() {
        if(begin + step >= target) {
          begin = target;
          window.clearInterval(fadeTimer);
          sliderItem.forEach(function(item, index){
            if(curEle !== item) {
              item.style.opacity = 0;
            }
          })
        } else {
          begin += step;
        }
        curEle.style.opacity = begin;
      }, interval);
    };

    // 3. 延迟加载
    sliderImage.forEach(function(item, index) {
      var tempImg = new Image();
      tempImg.src = item.dataset.src;
      tempImg.onload = function() {
        item.src = tempImg.src;
        item.style.display = "block";
        item.removeAttribute("data-src");
        tempImg = null;
      };
    });
    sliderItem[0].style.zIndex = 1;
    fadeIn(sliderItem[0], 1, 500, 10);

    // 4. 自动轮播
    function slideModule() {
      sliderItem.forEach(function(item, index) {
        item.style.zIndex = 0;
        paginationItem[index].classList.remove("current");
      });
      sliderItem[step].style.zIndex = 1;
      paginationItem[step].classList.add("current");
      fadeIn(sliderItem[step], 1, 500, 10);
    }

    function autoMove() {
      if(step === sliderItem.length - 1) {
        step = -1;
      }
      step++;
      slideModule();
    }
    autoTimer = window.setInterval(autoMove, interval);

    // 5. 鼠标经过停止定时器并显示左右按钮,离开重新开启定时器并隐藏左右按钮
    slider.onmouseenter = function() {
      window.clearInterval(autoTimer);
      buttonPrev.style.display = "block";
      buttonNext.style.display = "block";
    };

    slider.onmouseleave = function() {
      autoTimer = window.setInterval(autoMove, interval);
      buttonPrev.style.display = "none";
      buttonNext.style.display = "none";
    };

    // 6. 点击分页轮播
    paginationItem.forEach(function(item, index) {
      item.onclick = function() {
        step = index;
        slideModule();
      }
    })

    // 7. 左右按钮切换
    buttonNext.onclick = function() {
      autoMove();
    };

    buttonPrev.onclick = function() {
      if(step === 0) {
        step = sliderItem.length;
      };
      step--;
      slideModule();
    }
  })();
})