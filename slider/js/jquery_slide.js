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
  slideStr += "<div class='slide'><img src='' data-src='" + jsonData[0]["src"] + "' alt='" + jsonData[0]["description"] + "'></div>";
  $container.append(slideStr);
  $pagination.append(paginationStr);
  slideStr = null;
  paginationStr = null;
  
  var $sliderItem = $container.children(".slide");
  var $sliderImage = $container.find("img");
  var $paginationItem = $pagination.children("span");

  $container.css({"width": $sliderItem.length * 1000});

  // 3. 延迟加载
  $sliderImage.each(function(index, item) {
    var _this = $(this);
    var $tempImg = $("<img src=''>");
    $tempImg.attr("src", _this.attr("data-src"));
    $tempImg.on("load", function() {
      _this.attr("src", $tempImg.attr("src"))
      .css({"display":"block"})
      .animate({"opacity":1}, 300)
      .removeAttr("data-src");
      $tempImg = null;
    });
  });

  // 4. 自动轮播
  function slideModule() {
    $container.stop().animate({"left": -step * 1000}, 500);
    if(step === $sliderItem.length - 1) {
      $paginationItem.eq(0).addClass("current").siblings().removeClass("current"); 
    } else {
      $paginationItem.eq(step).addClass("current").siblings().removeClass("current");
    }
  }

  function autoMove() {
    if(step === $sliderItem.length - 1) {
      $container.css({"left": 0});
      step = 0;
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
      $container.css({"left": -($sliderItem.length - 1) * 1000});
      step = $sliderItem.length - 1;
    };
    step--;
    slideModule();
  });
}) 