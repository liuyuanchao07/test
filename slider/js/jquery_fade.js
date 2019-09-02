$(function() {
  var $slider = $(".sliderFirst");
  var $container = $slider.children(".container");
  var $pagination = $slider.children(".pagination");
  var $buttonPrev = $slider.children(".prev");
  var $buttonNext = $slider.children(".next");
  var step = 0;
  var autoTimer = null;
  var interval = 3000;

  // 1. ajax请求数据
  var timeStamp = new Date();
  var jsonData = null;
  $.ajax({
    url: "/slider/data/data.json?" + timeStamp.getTime(),
    type: "get",
    dataType: "json",
    async: false,
    success: function(data) {
      jsonData = data;
    }
  });

  // 2. 绑定数据
  var slideStr = "";
  var paginationStr = "";
  $.each(jsonData, function(index, item) {
    slideStr += "<div class='slide'><img src='' data-src='" + item["src"] + "' alt='" + item["description"] + "'></div>";
    if(index === 0) {
      paginationStr += "<span class='current'></span>";
    } else {
      paginationStr += "<span></span>";
    }
  });
  $container.append(slideStr);
  $pagination.append(paginationStr);
  slideStr = null;
  paginationStr = null;
  
  var $sliderItem = $container.children(".slide");
  var $sliderImage = $container.find("img");
  var $paginationItem = $pagination.children("span");

  // 3. 延迟加载
  $sliderImage.each(function(index, item) {
    var _this = $(this);
    var $tempImg = $("<img src=''>");
    $tempImg.attr("src", _this.attr("data-src"));
    $tempImg.on("load", function() {
      _this.attr("src", $tempImg.attr("src"))
      .css({"display":"block"})
      .removeAttr("data-src");
      $tempImg = null;
    });
  });
  $sliderItem.eq(0).css({"zIndex":1}).animate({"opacity":1}, 300);

  // 4. 自动轮播
  function slideModule() {
    var $curItem = $sliderItem.eq(step);
    $curItem.css({"zIndex":1}).siblings().css({"zIndex":0});
    $curItem.animate({"opacity":1}, 300, function() {
      $(this).siblings().css({"opacity":0});
    });
    $paginationItem.eq(step).addClass("current").siblings().removeClass("current");
  }

  function autoMove() {
    if(step === $sliderItem.length - 1) {
      step = -1;
    };
    step++;
    slideModule();
  }
  autoTimer = window.setInterval(autoMove, interval);

  // 5. 鼠标经过停止定时器并显示左右按钮,离开重新开启定时器并隐藏左右按钮
  $slider.on("mouseenter", function() {
    window.clearInterval(autoTimer);
    $buttonPrev.css({"display":"block"});
    $buttonNext.css({"display":"block"});
  });

  $slider.on("mouseleave", function() {
    autoTimer = window.setInterval(autoMove, interval);
    $buttonPrev.css({"display":"none"});
    $buttonNext.css({"display":"none"});
  })

  // 6. 点击分页轮播
  $paginationItem.on("click", function() {
    step = $(this).index();
    slideModule();
  });

  // 7. 左右按钮切换
  $buttonNext.on("click", function() {
    autoMove();
  });

  $buttonPrev.on("click", function() {
    if(step === 0) {
      step = $sliderItem.length;
    };
    step--;
    slideModule();
  });
}) 