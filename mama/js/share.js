(function ($) {
'use strict';

$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

/* ----------------------------------------
  ユーティリティ
---------------------------------------- */

/**
 * constant
 */
var BREAKPOINT = 768;
var MAX_WIDTH = BREAKPOINT - 1;

/**
 * 何もしない関数
 */
var noop = function () {};

/** 常に true を返す関数 */
var yes = function () { return true; };

/**
 * ウィンドウ幅が指定した幅よりも小さいかどうかを確認する関数を作る。
 * @param {number} width - ブレイクポイントとする幅
 * @return {function(): boolean}
 */
function createLessThanBreakpoint (width) {
  return function lessThanBreakpoint () {
    return window.matchMedia(("screen and (max-width: " + width + "px)")).matches
  }
}

/**
 * 現在 SP レイアウト（ウィンドウ幅がブレークポイント未満）かどうか
 * @type {function(): boolean}
 */
var isSP = createLessThanBreakpoint(MAX_WIDTH);

/**
 * PC, SP レイアウト切り替わりの時にコールバックを実行する
 * @param {{ pc: function, sp: function }} options
 * @return {function(): void} 監視を止める関数
 */
var onChangeLayout = (function () {
  var cbs = [];

  window.matchMedia(("screen and (max-width: " + MAX_WIDTH + "px)")).addListener(function () {
    if (window.matchMedia(("screen and (max-width: " + MAX_WIDTH + "px)")).matches) {
      cbs.forEach(function (cb) { return cb.sp(); });
    } else {
      cbs.forEach(function (cb) { return cb.pc(); });
    }
  });

  return function (ref) {
    var pc = ref.pc; if ( pc === void 0 ) pc = noop;
    var sp = ref.sp; if ( sp === void 0 ) sp = noop;

    var listeners = { pc: pc, sp: sp };

    cbs.push(listeners);
    if (window.matchMedia(("screen and (max-width: " + MAX_WIDTH + "px)")).matches) {
      sp();
    } else {
      pc();
    }

    return function () {
      var index = cbs.indexOf(listeners);
      if (index >= 0) {
        cbs.splice(index, 1);
      }
    }
  }
})();

/**
 * viewport 内に $el が入っているかどうか
 */
function inViewport ($el) {
  var $window = $(window);
  var viewport = {
    left: $window.scrollLeft(),
    top: $window.scrollTop()
  };
  viewport.right = viewport.left + $window.width();
  viewport.bottom = viewport.top + $window.height();

  var el = $el.offset();
  el.right = el.left + $el.width();
  el.bottom = el.top + $el.height();

  return viewport.left <= el.left &&
    viewport.top <= el.top &&
    viewport.right >= el.right &&
    viewport.bottom >= el.bottom
}

/**
 * 渡した URL を新しいタブとして開く
 * @param {string} url
 */
function openAsNewTab (url) {
  window.open(url);
}

/**
 * 軽量データ変更監視 (shallow)
 * obj のプロパティ key が更新されたときに fn を実行する
 */
function watch (obj, key, fn) {
  var value = obj[key];

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && !property.configurable) {
    return
  }

  // 前の getter, setter を保持する
  var getter = property && property.get;
  var setter = property && property.set;

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,

    get: function get () {
      return getter ? getter.call(obj) : value
    },

    set: function set (newValue) {
      var oldValue = getter ? getter.call(obj) : value;
      if (oldValue === newValue) { return }

      if (setter) {
        setter.call(obj, newValue);
      } else {
        value = newValue;
      }

      fn(newValue, oldValue);
    }
  });
}

/**
 * obj の値を fn で変換したオブジェクトを返す
 * @param {Object} obj
 * @param {function(value: any, key: string): any} fn
 * @return {Object} 変換後のオブジェクト
 */


/**
 * fn を ms ミリ秒に一度だけ実行する関数を返す
 * @param {function} fn
 * @param {number} ms
 */
function debounce (fn, ms) {
  var timer = null;

  return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    clearTimeout(timer);
    timer = setTimeout(function () { return fn.apply(void 0, args); }, ms);
  }
}

/**
 * 与えられた関数のすべてについて
 * ms ミリ秒に一度だけ実行されるようにする
 * @param {Object} obj - 値が関数のオブジェクト
 * @param {number} ms
 * @return {Object} - obj と同じ構造を持つオブジェクト
 */


/**
 * URL のクエリ文字列をパースしてオブジェクトを返す
 * @param {string} qs - クエリ文字列
 * @return {object} - パースされたクエリ文字列のオブジェクト
 */


/**
 * Object.assign Ponyfill
 * @param {...object} args
 * @return {object}
 */

/**
 * DOM の描画を待って処理を行う
 * アニメーションの開始地点に DOM が描画されるのを待つために使う
 */
function nextFrame (fn) {
  var raf = window.requestAnimationFrame.bind(window);
  raf(function () { return raf(fn); });
}

/**
 * CSS アニメーション
 * ハンドラ: beforeStart, start, end
 */
function animateCSS (
  $el,
  ref
) {
  var beforeStart = ref.beforeStart; if ( beforeStart === void 0 ) beforeStart = noop;
  var start = ref.start; if ( start === void 0 ) start = noop;
  var end = ref.end; if ( end === void 0 ) end = noop;

  // 前回のアニメーションを強制的に終了させる
  var prevCb = $el.data('animate-css-cb');
  if (prevCb) {
    prevCb();
  }

  var cb = function cb (event) {
    if (event && $el[0] !== event.target) { return }
    $el.off('transitionend', cb);
    $el.data('animate-css-cb', null);
    end($el);
  };

  $el
    .data('animate-css-cb', cb)
    .css('transition-duration', '0s')
    .on('transitionend', cb);

  beforeStart($el);
  nextFrame(function () {
    $el.css('transition-duration', '');
    start($el);
  });
}

/**
 * CSS アコーディオンアニメーション
 * transition-property に height 指定必須
 */
function animateAccordion (
  $target,
  isOpen,
  ref
) {
  if ( ref === void 0 ) ref = {};
  var before = ref.before; if ( before === void 0 ) before = noop;
  var after = ref.after; if ( after === void 0 ) after = noop;

  if (isOpen) {
    var height;
    animateCSS($target, {
      beforeStart: function ($el) {
        before();
        $el.css('height', '');
        height = $el.height();
        $el.height(0);
      },
      start: function ($el) { return $el.height(height); },
      end: function ($el) {
        // Safari 対策で height の値を外すのは transition-duration を無効化してから
        // height を外すと 0 とみなしてアニメーションするような挙動をするため
        $el
          .css('transition-duration', '0s')
          .css('height', '');
        after();

        setTimeout(function () {
          $el.css('transition-duration', '');
        }, 0);
      }
    });
  } else {
    animateCSS($target, {
      beforeStart: function ($el) {
        before();
        $el.css('height', '');
        $el.height($el.height());
      },
      start: function ($el) { return $el.height(0); },
      end: function ($el) {
        $el.css('height', '');
        after();
      }
    });
  }
}

/**
 * CSS フェードアニメーション
 * $target の要素の transition-property に opacity 指定必須
 *
 * @param {jQuery} $target - フェードさせる対象の要素
 * @param {boolean} isFadeIn - フェードインか否か
 * @param {object} options
 * @param {function} options.before - アニメーションの直前に実行されるコールバック
 * @param {function} options.after - アニメーションの直後に実行されるコールバック
 */
function animateFade (
  $target,
  isFadeIn,
  ref
) {
  if ( ref === void 0 ) ref = {};
  var before = ref.before; if ( before === void 0 ) before = noop;
  var after = ref.after; if ( after === void 0 ) after = noop;

  if (isFadeIn) {
    animateCSS($target, {
      beforeStart: function ($el) {
        before();
        $el.css('opacity', '0');
      },
      start: function ($el) { return $el.css('opacity', ''); },
      end: function () { return after(); }
    });
  } else {
    animateCSS($target, {
      beforeStart: function () { return before(); },
      start: function ($el) { return $el.css('opacity', '0'); },
      end: function ($el) {
        $el.css('opacity', '');
        after();
      }
    });
  }
}

/**
 * 表示 / 非表示トランジションをするユーティリティ
 * コールバック内で CSS トランジションをトリガするような処理 (例えばクラスの追加) を行い、
 * そのトランジションの前、もしくは、後に要素の display プロパティを自動的に変える
 *
 * @param {JQuery} $target - トランジションの対象
 * @param {boolean} isShow - 表示するか非表示するか
 * @param {function} fn - CSS トランジションを実行する関数。この中でクラスを変えるなどの処理を行う
 */

/**
 * 軽量 EventEmitter、継承して使う
 */
var EventEmitter = function EventEmitter () {
  this._listeners = {};
};

/**
 * イベントリスナを登録する。
 * @param {string} name - event name
 * @param {function(data: *): void} fn - listener function
 */
EventEmitter.prototype.on = function on (name, fn) {
  var list = this._listeners[name] = this._listeners[name] || [];
  list.push(fn);
};

/**
 * on で登録したリスナに対してイベントを飛ばす。
 * @param {string} name - event name
 * @param {*} data - data to emit event listeners
 */
EventEmitter.prototype.trigger = function trigger (name, data) {
  var fns = this._listeners[name] || [];
  fns.forEach(function (fn) { return fn(data); });
};

/**
 * イベントリスナを削除する。
 * @param {string} name - event name
 */
EventEmitter.prototype.off = function off (name) {
  delete this._listeners[name];
};

// 後方互換のために残す

/**
 * constant
 */
var DURATION = 600;
var EASING = 'easeInOutCubic';

/**
 * ブラウザデフォルトのスクロールターゲットの jQuery オブジェクトを取得
 */
function getDefaultScrollTarget () {
  return $(document.scrollingElement || document.documentElement)
}

/**
 * 指定した jQuery オブジェクトに対応する要素へスムーススクロールする
 * 初期値はページトップ
 */
function scrollToSmoothly ($to, duration) {
  if ( duration === void 0 ) duration = DURATION;

  var pos = (!$to || $to.length === 0) ? 0 : getPos($to);

  // Fixed な header の高さを考慮する
  var fixedPos = pos - (parseInt($('#js-main_wrapper').css('padding-top'), 0) || 0);

  getDefaultScrollTarget().animate({
    scrollTop: fixedPos
  }, {
    duration: duration,
    easing: EASING
  });
}

/**
 * アニメーションなしでスクロール位置を移動する
 */


/**
 * アンカーリンクのスムーススクロールを有効にする
 * href が
 * 1. '#' ならページトップへスクロール
 * 2. '#xxx' で該当IDが存在すればその要素へスクロール
 * 3. '#top' ならページトップへスクロール
 * 4. それ以外なら何もしない
 */
function enableSmoothScroll (selector) {
  if ( selector === void 0 ) selector = 'a[href^="#"]';

  $(document).on('click', selector, function (event) {
    var to = event.currentTarget.getAttribute('href');

    if (to === '#') {
      event.preventDefault();
      scrollToSmoothly();
      return
    }

    var $to = $(to);
    if ($to.length > 0) {
      event.preventDefault();
      window.history.pushState(null, '', to);
      scrollToSmoothly($to);
      return
    }

    if (to === '#top') {
      event.preventDefault();
      scrollToSmoothly();
    }
  });
}

/**
 * jQuery オブジェクトの位置情報を返す
 * $obj に jQuery オブジェクト指定必須
 */
function getPos ($obj) {
  var pos = $obj.offset().top;
  return pos
}

/**
 * スクロール監視
 */
var ScrollVM = (function (EventEmitter) {
  function ScrollVM ($target) {
    EventEmitter.call(this);

    this.data = {
      offset: {
        top: $target.scrollTop(),
        left: $target.scrollLeft()
      }
    };

    this.bind(this.data, $target);
  }

  if ( EventEmitter ) ScrollVM.__proto__ = EventEmitter;
  ScrollVM.prototype = Object.create( EventEmitter && EventEmitter.prototype );
  ScrollVM.prototype.constructor = ScrollVM;

  /** @private */
  ScrollVM.prototype.bind = function bind (data, $target) {
    var this$1 = this;

    $target.on('scroll', function () {
      this$1.set($target.scrollLeft(), $target.scrollTop());
    });

    watch(data, 'offset', function (newValue) {
      this$1.trigger('scroll', newValue);
    });
  };

  /** @private */
  ScrollVM.prototype.set = function set (left, top) {
    this.data.offset = {
      top: top,
      left: left
    };
  };

  ScrollVM.prototype.get = function get () {
    return this.data.offset
  };

  return ScrollVM;
}(EventEmitter));

/**
 * 排他的に開くアコーディオン。開いた地点が画面外に移動したらスクロール。ほとんどのケースで {@link accordion} を使用すると良い。
 *
 * Accordion that opens exclusively. They scroll the browser if the accordion leave out of viewport.
 * In most cases, you should use {@link accordion} function.
 *
 * 以下のイベントを発火する
 * - select アコーディオンが選択された時。index が渡される
 * - deselect アコーディオンの選択が解除された時
 * - beforeOpen アコーディオンが開かれる直前
 * - opened アコーディオンが開かれた時
 * - beforeClose アコーディオンが閉じられる直前
 * - closed アコーディオンが閉じられた時
 *
 * @example
 * // wrapper element of accordion
 * const $nav = $('#js-nav')
 *
 * const vm = new AccordionVM($nav, {
 *   // link or button element that toggles an accordion
 *   anchor: '.js-accordion_anchor',
 *   // content of accordion
 *   content: '.js-accordion_content'
 * })
 *
 * vm.on('select', index => vm.select(index))
 * vm.on('deselect', () => vm.select(null))
 *
 * @example
 * // pug の例。アコーディオンを開閉するボタンと、コンテンツのラッパーに js から参照するためのクラス名を付与する。
 * // Here is the example of pug. You need to add class attributes that are referred from js -
 * // buttons to open/close accordion and wrappers of accordion contents.
 *
 * #js-nav
 *   ul.foo
 *     li.foo_item
 *       a.foo_anchor.js-accordion_anchor(aria-selected="false") Toggle accordion
 *       ul.bar.js-accordion_content(aria-expanded="false")
 *         li.bar_item ...
 *
 * @example
 * // scss の例。コンテンツに対して height を対象とした transition を設定する。また、各属性の値が変わった時のスタイルも指定する。
 * // Here is the example of scss. You need to define transition property for height. In addition,
 * // it is needed to define the style when each attribute value is changed.
 *
 * .foo_anchor[aria-selected="true"] {
 *   color: $color-sub;
 * }
 *
 * .bar {
 *   transition: height $transition-accordion;
 *
 *   &[aria-expanded="false"] {
 *     display: none;
 *   }
 * }
 */
var AccordionVM = (function (EventEmitter) {
  function AccordionVM ($wrapper, options) {
    EventEmitter.call(this);

    /** @private */
    this.data = {
      openedIndex: null,
      disabled: false
    };

    this.bind(this.data, $wrapper, options);
    this.isAnimating = false;
  }

  if ( EventEmitter ) AccordionVM.__proto__ = EventEmitter;
  AccordionVM.prototype = Object.create( EventEmitter && EventEmitter.prototype );
  AccordionVM.prototype.constructor = AccordionVM;

  /** @private */
  AccordionVM.prototype.bind = function bind (data, $wrapper, options) {
    var this$1 = this;

    var content = options.content;
    var anchor = options.anchor;
    var disableScroll = options.disableScroll; if ( disableScroll === void 0 ) disableScroll = false;
    var scrollTarget = options.scrollTarget;
    var scrollOffset = options.scrollOffset; if ( scrollOffset === void 0 ) scrollOffset = 0;
    var selectedAttr = options.selectedAttr; if ( selectedAttr === void 0 ) selectedAttr = 'aria-selected';
    var expandedAttr = options.expandedAttr; if ( expandedAttr === void 0 ) expandedAttr = 'aria-expanded';
    var filterClick = options.filterClick; if ( filterClick === void 0 ) filterClick = yes;

    // selectedAttr の値を見て初期状態を判別し、実際の値に反映させる
    // また、DOM に選択状態が書かれていない時は選択していないものとして属性を書き込む
    this._syncInitialState(
      $wrapper.find(anchor),
      $wrapper.find(content),
      selectedAttr,
      expandedAttr
    );

    this.$scrollTarget = scrollTarget
      ? $wrapper.find(scrollTarget)
      : getDefaultScrollTarget();
    this.scrollOffset = scrollOffset;

    // アコーディオンのトリガをクリックした時
    $wrapper.on('click', anchor, function (event) {
      if (data.disabled || !filterClick()) { return }

      if (event.button !== 0) { return } // 左クリック以外は処理しない
      event.preventDefault();

      var $anchor = $(event.currentTarget);
      var isSelected = $anchor.attr(selectedAttr) === 'true';

      if (isSelected) {
        // 選択されていたら解除
        this$1.trigger('deselect');
      } else {
        // 選択したアコーディオンを開く
        var $anchorList = $wrapper.find(anchor);
        var index = $anchorList.index($anchor);
        this$1.trigger('select', index);
      }
    });

    watch(data, 'disabled', function (disabled) {
      var $contents = $wrapper.find(content);

      if (disabled) {
        $contents.attr(expandedAttr, 'true');
      } else {
        $contents.attr(expandedAttr, 'false');

        var index = this$1.data.openedIndex;
        if (index != null && !isNaN(index)) {
          $contents
            .eq(this$1.data.openedIndex)
            .attr(expandedAttr, 'true');
        }
      }
    });

    watch(data, 'openedIndex', function (newIndex, oldIndex) {
      var $anchors = $wrapper.find(anchor);
      var $contents = $wrapper.find(content);

      // 表示されているものを非表示にする
      if (oldIndex != null && !isNaN(oldIndex)) {
        // アコーディオンを閉じることでスクロール位置が不自然な位置にならないように、
        // スクロール位置の調整
        if (!disableScroll) {
          var $targetAnchor = newIndex != null
            ? $anchors.eq(newIndex)
            : $anchors.eq(oldIndex);
          var $prevContent = $contents.eq(oldIndex);
          var $nextContent = newIndex != null ? $contents.eq(newIndex) : $();
          this$1._adjustScroll($targetAnchor, $nextContent, $prevContent);
        }
        this$1._hideContent(oldIndex, $anchors, $contents, selectedAttr, expandedAttr);
      }

      // インデックスが指定されている時は
      // 対応するドロップダウンを表示する
      if (newIndex != null && !isNaN(newIndex)) {
        this$1._showContent(newIndex, oldIndex, $anchors, $contents, selectedAttr, expandedAttr, disableScroll);
      }
    });
  };

  /**
   * index 番目のアコーディオンを開く。index = null の時は選択を解除する
   * disabled の時は何もしない
   * @param {?number} index - アコーディオンのインデックス (index of accordion)
   */
  AccordionVM.prototype.select = function select (index) {
    if (this.data.disabled) { return }
    this.data.openedIndex = index;
  };

  /**
   * アコーディオンを無効化し、すべてのコンテンツを開く
   */
  AccordionVM.prototype.disable = function disable () {
    this.data.disabled = true;
  };

  /**
   * アコーディオンを有効化する
   */
  AccordionVM.prototype.enable = function enable () {
    this.data.disabled = false;
  };

  /**
   * アコーディオンのアンカーの属性を読み、初期値として選択されているインデックスを値に反映する。
   * また、選択状態が DOM にかかれていない時は選択されていないものとして属性をセットする
   * @param {JQuery} $anchors - すべてのアンカー
   * @param {JQuery} $contents - 全てのコンテンツ
   * @param {string} selectedAttr - アンカーの選択状態を反映させる属性
   * @param {string} expandedAttr - コンテンツの開閉状態を反映させる属性
   */
  AccordionVM.prototype._syncInitialState = function _syncInitialState ($anchors, $contents, selectedAttr, expandedAttr) {
    var $selectedAnchor = $anchors.filter(("[" + selectedAttr + "=\"true\"]"));
    var selected = $anchors.index($selectedAnchor);
    $anchors.attr(selectedAttr, 'false');
    $contents.attr(expandedAttr, 'false');

    if (selected >= 0) {
      $anchors.eq(selected).attr(selectedAttr, 'true');
      $contents.eq(selected).attr(expandedAttr, 'true');
      this.data.openedIndex = selected;
    }
  };

  /**
   * コンテンツ部分を隠す
   * @param {number} index - 非表示にするコンテンツのインデックス
   * @param {JQuery} $anchors - すべてのアコーディオンのアンカー
   * @param {JQuery} $contents - すべてのコンテンツ
   * @param {string} selectedAttr - アンカーの選択状態を反映させる属性
   * @param {string} expandedAttr - コンテンツの開閉状態を反映させる属性
   */
  AccordionVM.prototype._hideContent = function _hideContent (index, $anchors, $contents, selectedAttr, expandedAttr) {
    var this$1 = this;

    var $anchor = $anchors.eq(index);
    var $content = $contents.eq(index);

    animateAccordion($content, false, {
      before: function () {
        this$1.trigger('beforeClose', index);
        $anchor.attr(selectedAttr, 'false');

        this$1.isAnimating = true;
        this$1.animating();
      },
      after: function () {
        $content.attr(expandedAttr, 'false');

        // 不整合を防ぐため、アニメーション後にも状態をセットする
        $anchor.attr(selectedAttr, 'false');

        this$1.trigger('closed', index);

        this$1.isAnimating = false;
      }
    });
  };

  /**
   * コンテンツ部分を表示する
   * @param {number} index - 表示するコンテンツのインデックス
   * @param {number} prevIndex - 一つ前に表示されていたコンテンツのインデックス
   * @param {JQuery} $anchors - すべてのアコーディオンのアンカー
   * @param {JQuery} $contents - すべてのコンテンツ
   * @param {string} selectedAttr - アンカーの選択状態を反映させる属性
   * @param {string} expandedAttr - コンテンツの開閉状態を反映させる属性
   * @param {boolean} disableScroll - アンカーが画面外に収まるようにスクロールさせるか否か
   */
  AccordionVM.prototype._showContent = function _showContent (index, prevIndex, $anchors, $contents, selectedAttr, expandedAttr, disableScroll) {
    var this$1 = this;

    var $anchor = $anchors.eq(index);
    var $content = $contents.eq(index);

    animateAccordion($content, true, {
      before: function () {
        this$1.trigger('beforeOpen', index);
        $content
          .css('z-index', 1) // 新しく表示される方を上にする
          .attr(expandedAttr, 'true');
        $anchor.attr(selectedAttr, 'true');

        this$1.isAnimating = true;
        this$1.animating();
      },
      after: function () {
        $content.css('z-index', '');
        this$1.trigger('opened', index);

        this$1.isAnimating = false;
      }
    });
  };

  /**
   * クリックしたアンカーが画面外へアニメーションしてしまう場合は、
   * スクロールさせて画面内へ入るようにする
   * @param {jQuery} $nextAnchor - 次に開くアコーディオンに対応するアンカー
   * @param {jQuery} $nextContent - 次に開くアコーディオンに対応するコンテンツ
   * @param {jQuery} $prevContent - 以前開いていたアコーディオンに対応するコンテンツ
   */
  AccordionVM.prototype._adjustScroll = function _adjustScroll ($nextAnchor, $nextContent, $prevContent) {
    var this$1 = this;

    this._timeTravel($prevContent, $nextContent, function () {
      if (inViewport($nextAnchor, this$1.$scrollTarget)) { return }

      // スクロールする要素から比較した座標を取得する
      var anchorTop = $nextAnchor.offset().top - this$1.$scrollTarget.offset().top;

      if (this$1.$scrollTarget[0] !== getDefaultScrollTarget()[0]) {
        // ネストされたスクロール要素の時、その要素がスクロールされている座標の値だけ、
        // スクロール先の要素の座標に値を加える必要がある
        anchorTop += this$1.$scrollTarget.scrollTop();
      }

      // scrollOffset が関数の時、実行して値を取り出す
      var offset = this$1.scrollOffset;
      if (typeof offset === 'function') {
        offset = offset();
      }

      var scrollTop = anchorTop + offset;

      // CSS Transition の duration, easing に合わせる
      this$1.$scrollTarget.animate({
        scrollTop: scrollTop
      }, 500, $.bez([0.44, 0.03, 0.14, 0.98]));
    });
  };

  /**
   * アニメーション後の状態に強制的にした状態で fn を実行する
   * アコーディオンが開いた後に自然にスクロールさせるために用いる
   */
  AccordionVM.prototype._timeTravel = function _timeTravel ($prevContent, $nextContent, fn) {
    $prevContent.css('display', 'none');
    $nextContent.css('display', 'block');

    fn();

    $prevContent.add($nextContent)
      .css('display', '');
  };

  /**
   * アコーディオンを動かした際、サイドナビの固定表示が崩れることがある。その対策。 #823
   */
  AccordionVM.prototype.animating = function animating () {
    var this$1 = this;

    $(document).trigger('scroll');
    if (this.isAnimating) {
      window.requestAnimationFrame(function () { return this$1.animating(); });
    }
  };

  return AccordionVM;
}(EventEmitter));

/**
 * AccordionVM の簡易版。特に特別なことはせず、排他的に動くアコーディオンがほしい時はこちらを使う。詳細な説明は {@link AccordionVM}
 *
 * Simplified version of AccordionVM. If you want just an accordion that does not do special thing. Details {@link AccordionVM}
 *
 * @example
 * // wrapper element of accordion
 * const $nav = $('#js-nav')
 *
 * accordion($nav, {
 *   // link or button element that toggles an accordion
 *   anchor: '.js-accordion_anchor',
 *   // content of accordion
 *   content: '.js-accordion_content'
 * })
 */


/**
 * アコーディオン有効化
 *
 * @param {jQuery} $el
 * @param {Object} options
 * @return {AccordionVM}
 */


/**
 * アコーディオン有効化（全要素）
 *
 * @param {jQuery} $context
 */

/* ----------------------------------------
  DOM 操作
---------------------------------------- */

/**
 * forEach が使える elements を取得する
 * @param {string} selector - カンマで区切られたひとつ以上の CSS セレクタグループ文字列 (querySelectorAll の引数と同じ)
 * @param {Element} context - この element の中の要素だけを対象とする
 * @return {Element[]} `selector` にマッチした element の配列
 */


/**
 * jQuery から DOM に変換
 * @param {JQuery} $els
 * @return {Element[]}
 */


/**
 * DOM から jQuery に変換
 * @param {Element[]} els
 * @return {JQuery}
 */


/**
 * jQuery オブジェクトかどうかを判別する
 * http://api.jquery.com/jquery-2/
 * @param {any} el
 * @return {boolean} jQuery オブジェクトなら true
 */

/**
 * 高さを揃えるためのオブジェクト
 */
var HeightArranger = function HeightArranger ($els) {
  this.els = $els.get().map(function (el) { return $(el); });
};

/**
 * 高さ揃えをリセットする
 */
HeightArranger.prototype.reset = function reset () {
  this._toJQuery(this.els).css('height', '');
};

/**
 * 高さを揃える対象の要素を差し替える
 * @params {Element[]} els
 */
HeightArranger.prototype.replaceElements = function replaceElements (els) {
  this.els = els.map(function (el) { return $(el); });
};

/**
 * 高さ揃えを再計算する
 */
HeightArranger.prototype.arrange = function arrange () {
  this.reset();
  this._arrangeImpl(this.els);
};

HeightArranger.prototype._arrangeImpl = function _arrangeImpl (els) {
  if (els.length === 0) { return }

  els = this._sortByTop(els);

  var acc = [els[0]];
  var top = acc[0].offset().top;

  for (var i = 1; i < els.length; ++i) {
    var $next = els[i];
    if (top !== $next.offset().top) { break }

    acc.push($next);
  }

  // 要素が2つ以上の時は高さを指定する
  if (acc.length > 1) {
    var heights = acc.map(function ($el) { return parseFloat($el.css('height'), 10); });
    var maxHeight = Math.max.apply(Math, heights);
    this._toJQuery(acc).css('height', maxHeight + 'px');
  }

  this._arrangeImpl(els.slice(acc.length));
};

HeightArranger.prototype._sortByTop = function _sortByTop (els) {
  return els
    .map(function ($el) { return ({
      $el: $el,
      top: $el.offset().top
    }); })
    .sort(function (a, b) { return a.top - b.top; })
    .map(function (item) { return item.$el; })
};

HeightArranger.prototype._toJQuery = function _toJQuery (arr) {
  return arr.reduce(function (acc, el) { return acc.add(el); }, $())
};

/**
 * 指定した selector から取得できる要素について
 * 0. top の低い順に要素をソート
 * 1. 要素の前の方から top が同じ Y 軸座標の要素を取り出す
 * 2. グループ G 内で最も高い要素の高さ H を取得する
 * 3. G 内のすべての要素の高さを H にする
 * 4. 0-3 を要素がなくなるまで繰り返す
 *
 * resizeVm が渡されている時はリサイズの監視を行う
 *
 * @param {string|Element[]|JQuery} selectorOrEls - 高さを揃えたい要素のセレクター、または、DOM 要素
 * @param {ResizeVM} [resizeVm]
 */

/**
 * モーダル
 *
 * @example
 * const modal = new ModalVM($body)
 *
 * modal.show(id) // id をテンプレートとしてモーダルを開く
 * modal.hide() // 表示されているモーダルを非表示にする。
 */
var ModalVM = function ModalVM ($body) {
  /** @private */
  this.$body = $body;

  var $backdrop = $(
    '<div class="modal_backdrop" aria-hidden="true"></div>'
  ).appendTo($body);

  var $modal = $("\n    <div class=\"js-modal modal\">\n      <div class=\"js-modal_content modal_content\"></div>\n    </div>\n   ");

  var $close = $(
    '<button class="js-modal_close modal_close" aria-label="閉じる"></button>'
  );

  /** @private */
  this.data = {
    showingId: null,
    classList: []
  };

  this.bind(this.data, $backdrop, $modal, $close);
};

/**
 * データと DOM を結びつける
 * @private
 */
ModalVM.prototype.bind = function bind (data, $backdrop, $modal, $close) {
    var this$1 = this;

  var $content = $modal.find('.js-modal_content');
  var templateClass = 'js-modal_template';
  var basicContentClass = ['js-modal_content', 'modal_content'];

  $(document).on('click', '.js-modal', function (event) {
    if (event.target !== $modal[0]) { return }
    this$1.hide();
  });

  $(document).on('click', '.js-modal_close', function () {
    this$1.hide();
  });

  /**
   * 指定した ID の要素からテンプレートを取得し、モーダルのコンテンツにする
   * フェードインでモーダルを表示する。
   * また、テンプレートの要素に追加のクラスが指定されている場合、
   * それをモーダルのコンテンツ要素にマージする。
   * ID が指定されなかった場合、モーダルを隠す。
   */
  watch(data, 'showingId', function (id) {
    // モーダルを閉じた時
    if (id === null) {
      this$1.fadeOut($backdrop, $modal);
      return
    }

    var $template = $('#' + id);
    if ($template.length === 0) { return }

    // テンプレートの追加クラスを抽出する
    var classList = $template
      .attr('class').split(' ')
      .filter(function (value) { return value !== templateClass; });
    this$1.setClassList(classList);

    // 前のモーダルのコンテンツを削除
    $content.children().remove();

    // 指定された ID のコンテンツをクローンしてモーダルに追加
    $content
      .append($close)
      .append($template.clone().children());

    // 表示
    this$1.fadeIn($backdrop, $modal);
  });

  /**
   * モーダルのコンテンツ部分にクラスを追加する
   */
  watch(data, 'classList', function (list) {
    var classList = basicContentClass.concat(list);
    $content.attr('class', classList.join(' '));
  });
};

/** @private */
ModalVM.prototype.fadeIn = function fadeIn ($backdrop, $modal) {
    var this$1 = this;

  animateFade($backdrop, true, {
    before: function () { return $backdrop.attr('aria-hidden', 'false'); }
  });
  animateFade($modal, true, {
    before: function () {
      this$1.preventScroll();
      this$1.$body.append($modal);
    }
  });
};

/** @private */
ModalVM.prototype.fadeOut = function fadeOut ($backdrop, $modal) {
    var this$1 = this;

  animateFade($backdrop, false, {
    after: function () { return $backdrop.attr('aria-hidden', 'true'); }
  });
  animateFade($modal, false, {
    after: function () {
      this$1.allowScroll();
      $modal.remove();
    }
  });
};

/**
 * html 本文のスクロールを抑制する
 * スクロールバーが消えた分横にずれるため、padding-right を追加する
 * @private
 */
ModalVM.prototype.preventScroll = function preventScroll () {
  var $html = $('#js-html');
  var scrollbarWidth = window.innerWidth - $html.width();
  $html.addClass('o-modal_opened')
    .css('padding-right', scrollbarWidth);
};

/** @private */
ModalVM.prototype.allowScroll = function allowScroll () {
  $('#js-html')
    .removeClass('o-modal_opened')
    .css('padding-right', '');
};

/** @private */
ModalVM.prototype.setClassList = function setClassList (list) {
  this.data.classList = list;
};

/**
 * id に相当する要素をテンプレートとして、モーダルを表示する。
 * その時、そのテンプレートに付与された class を modal_content に追加する
 * @param {string} id - モーダルのテンプレートの ID
 */
ModalVM.prototype.show = function show (id) {
  // data-modal-sp-url に値があり、SP の時、
  // モーダルの代わりにその値の URL を新規タブで開く
  if (isSP()) {
    var $template = $('#' + id);
    var spURL = $template.attr('data-modal-sp-url');
    if (spURL) {
      openAsNewTab(spURL);
      return
    }
  }
  this.data.showingId = id;
};

/**
 * 表示されているモーダルを非表示にする。
 */
ModalVM.prototype.hide = function hide () {
  this.data.showingId = null;
};

/**
 * HTML 内に存在するすべてのモーダルを有効化する
 * `.js-modal_trigger` が付与されている要素が対象
 */

/**
 * リサイズの監視を行う
 */
var ResizeVM = (function (EventEmitter) {
  function ResizeVM (debounceMs) {
    var this$1 = this;

    EventEmitter.call(this);

    var onResize = function () {
      this$1.trigger('resize');
    };

    this.listener = debounceMs ? debounce(onResize, debounceMs) : onResize;

    window.addEventListener('resize', this.listener);
  }

  if ( EventEmitter ) ResizeVM.__proto__ = EventEmitter;
  ResizeVM.prototype = Object.create( EventEmitter && EventEmitter.prototype );
  ResizeVM.prototype.constructor = ResizeVM;

  /**
   * リサイズの監視をやめる
   */
  ResizeVM.prototype.destroy = function destroy () {
    window.removeEventListener('resize', this.listener);
  };

  return ResizeVM;
}(EventEmitter));

/* ----------------------------------------
  pointer event
---------------------------------------- */

/**
 * event の起きた点の、クライアント内での X, Y 座標を取得する
 * @param {Event} e - event object
 * @return {{x: number, y: number}}
 */

/**
 * KeyboardEvent.keyCode の値
 * @type {Object}
 * @property {number} KEY_CODE.LEFT - →
 * @property {number} KEY_CODE.UP - ↑
 * @property {number} KEY_CODE.RIGHT - ←
 * @property {number} KEY_CODE.DOWN - ↓
 */

/* ========================================
 * Document Ready
 * ========================================= */
$(function () {
  // スムーススクロール
  enableSmoothScroll();

  // ヘッダー accordion メニュー
  var $globalNav = $('.js-global_nav');
  var transitionDelay = 200;
  var $hamburgerButton = $('.js-header_accordion');

  var activateAccordion = function () {
    $globalNav.addClass('o-activating');
    $('body').addClass('o-body_modal');
    $hamburgerButton.addClass('o-activated');
    $hamburgerButton.find('.js-button_text').html('close');

    setTimeout(function () {
      $globalNav.addClass('o-activated');
    }, 0);
  };

  var deactivateAccordion = function () {
    $globalNav.removeClass('o-activated');
    $('body').removeClass('o-body_modal');
    $hamburgerButton.removeClass('o-activated');
    $hamburgerButton.find('.js-button_text').html('menu');

    setTimeout(function () {
      $globalNav.removeClass('o-activating');
    }, transitionDelay);
  };

  var toggleAccordion = function () {
    if ($globalNav.hasClass('o-activated')) {
      deactivateAccordion();
    } else {
      activateAccordion();
    }
  };

  $hamburgerButton.on('click', function (event) {
    toggleAccordion();
  });

  $('.js-global_nav').on('click', function (event) {
    if (event.target.classList.contains('js-global_nav')) {
      toggleAccordion();
    }
  });

  // ヘッダー サイト内検索エリアの開閉
  var $searchArea = $('.js-header_search');

  var toggleSearchArea = function () {
    if ($searchArea.hasClass('o-activated')) {
      $('.js-header_search_accordion').removeClass('o-activated');
      $searchArea.removeClass('o-activated');
      setTimeout(function () {
        $searchArea.removeClass('o-activating');
      }, transitionDelay);
    } else {
      $('.js-header_search_accordion').addClass('o-activated');
      $searchArea.addClass('o-activating');
      setTimeout(function () {
        $searchArea.addClass('o-activated');
      }, 0);
    }
  };

  $('.js-header_search_accordion').on('click', function (event) {
    toggleSearchArea();
  });

  $('.js-search_film').on('click', function (event) {
    toggleSearchArea();
  });

  $('.js-search_hide').on('click', function (event) {
    toggleSearchArea();
  });

  // トップへ戻るボタンの制御

  var $window = $(window);
  var hideFlag = true;
  var toTopButton = $('.page_top');
  var scrollThreshold = 500;
  var bodyHeight;
  var fixedThreshold = window.innerWidth > 768 ? 116 : 216;

  $(window).on('load', function () {
    bodyHeight = document.body.offsetHeight;
    fixedThreshold = window.innerWidth > 768 ? 116 : 216;
  });

  $window.on('resize', function () {
    bodyHeight = document.body.offsetHeight;
    fixedThreshold = window.innerWidth > 768 ? 116 : 216;
  });

  $window.on('scroll', function () {
    var scrollTop = $window.scrollTop();
    // IE で レシピ一覧ページでの不具合を消す
    bodyHeight = document.body.offsetHeight;

    var distanceToBottom = bodyHeight - scrollTop - window.innerHeight;

    if (hideFlag && scrollTop > scrollThreshold) {
      toTopButton.css('transform', 'scale(1)');
      hideFlag = false;
    }

    if (!hideFlag && scrollTop < scrollThreshold) {
      toTopButton.css('transform', 'scale(0)');
      hideFlag = true;
    }

    if (distanceToBottom < fixedThreshold) {
      toTopButton.css('position', 'absolute');
      toTopButton.css('bottom', ((fixedThreshold + 30) + "px"));
    } else {
      toTopButton.css('position', 'fixed');
      toTopButton.css('bottom', '30px');
    }
  });

  // .js-new_picker に新しい文書であるかどうか検出して o-new_article をつける
  var dateNow = new Date();
  var dateMilliseconds = dateNow.getTime();
  var oneWeekMilliseconds = 604800000;

  $('.js-new_picker').each(function (key, item) {
    var articleIOSDate = $(item).attr('data-date');

    // 正しい日つけじゃなかったら return
    if (!articleIOSDate) {
      return
    }
    var articleTime = new Date(articleIOSDate);
    if (dateMilliseconds - articleTime < oneWeekMilliseconds) {
      $(item).addClass('o-new_article');
    }
  });
});

}(jQuery));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMvc2hhcmUuanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9Ab3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMvX2pzL191dGlsaXR5LmpzIiwibm9kZV9tb2R1bGVzL0Bvcm8vc3RhdGljLXNpdGUtbW9kdWxlcy9fanMvX2FuaW1hdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9Ab3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMvX2pzL19ldmVudF9lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL0Bvcm8vc3RhdGljLXNpdGUtbW9kdWxlcy9fanMvX21vZHVsZS5qcyIsIm5vZGVfbW9kdWxlcy9Ab3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMvX2pzL19zY3JvbGwuanMiLCJub2RlX21vZHVsZXMvQG9yby9zdGF0aWMtc2l0ZS1tb2R1bGVzL19qcy9fYWNjb3JkaW9uLmpzIiwibm9kZV9tb2R1bGVzL0Bvcm8vc3RhdGljLXNpdGUtbW9kdWxlcy9fanMvX2RvbS5qcyIsIm5vZGVfbW9kdWxlcy9Ab3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMvX2pzL19hcnJhbmdlX2hlaWdodC5qcyIsIm5vZGVfbW9kdWxlcy9Ab3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMvX2pzL19tb2RhbC5qcyIsIm5vZGVfbW9kdWxlcy9Ab3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMvX2pzL19yZXNpemUuanMiLCJub2RlX21vZHVsZXMvQG9yby9zdGF0aWMtc2l0ZS1tb2R1bGVzL19qcy9fZXZlbnQuanMiLCJub2RlX21vZHVsZXMvQG9yby9zdGF0aWMtc2l0ZS1tb2R1bGVzL19qcy9fa2V5Y29kZS5qcyIsInNyYy9qcy9zaGFyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJCBmcm9tICdqcXVlcnknXG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAg44Om44O844OG44Kj44Oq44OG44KjXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbi8qKlxuICogY29uc3RhbnRcbiAqL1xuY29uc3QgQlJFQUtQT0lOVCA9IDc2OFxuY29uc3QgTUFYX1dJRFRIID0gQlJFQUtQT0lOVCAtIDFcblxuLyoqXG4gKiDkvZXjgoLjgZfjgarjgYTplqLmlbBcbiAqL1xuZXhwb3J0IGNvbnN0IG5vb3AgPSAoKSA9PiB7fVxuXG4vKiog5bi444GrIHRydWUg44KS6L+U44GZ6Zai5pWwICovXG5leHBvcnQgY29uc3QgeWVzID0gKCkgPT4gdHJ1ZVxuXG4vKipcbiAqIOOCpuOCo+ODs+ODieOCpuW5heOBjOaMh+WumuOBl+OBn+W5heOCiOOCiuOCguWwj+OBleOBhOOBi+OBqeOBhuOBi+OCkueiuuiqjeOBmeOCi+mWouaVsOOCkuS9nOOCi+OAglxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0g44OW44Os44Kk44Kv44Od44Kk44Oz44OI44Go44GZ44KL5bmFXG4gKiBAcmV0dXJuIHtmdW5jdGlvbigpOiBib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTGVzc1RoYW5CcmVha3BvaW50ICh3aWR0aCkge1xuICByZXR1cm4gZnVuY3Rpb24gbGVzc1RoYW5CcmVha3BvaW50ICgpIHtcbiAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoYHNjcmVlbiBhbmQgKG1heC13aWR0aDogJHt3aWR0aH1weClgKS5tYXRjaGVzXG4gIH1cbn1cblxuLyoqXG4gKiDnj77lnKggU1Ag44Os44Kk44Ki44Km44OI77yI44Km44Kj44Oz44OJ44Km5bmF44GM44OW44Os44O844Kv44Od44Kk44Oz44OI5pyq5rqA77yJ44GL44Gp44GG44GLXG4gKiBAdHlwZSB7ZnVuY3Rpb24oKTogYm9vbGVhbn1cbiAqL1xuZXhwb3J0IGNvbnN0IGlzU1AgPSBjcmVhdGVMZXNzVGhhbkJyZWFrcG9pbnQoTUFYX1dJRFRIKVxuXG4vKipcbiAqIFBDLCBTUCDjg6zjgqTjgqLjgqbjg4jliIfjgormm7/jgo/jgorjga7mmYLjgavjgrPjg7zjg6vjg5Djg4Pjgq/jgpLlrp/ooYzjgZnjgotcbiAqIEBwYXJhbSB7eyBwYzogZnVuY3Rpb24sIHNwOiBmdW5jdGlvbiB9fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtmdW5jdGlvbigpOiB2b2lkfSDnm6PoppbjgpLmraLjgoHjgovplqLmlbBcbiAqL1xuZXhwb3J0IGNvbnN0IG9uQ2hhbmdlTGF5b3V0ID0gKCgpID0+IHtcbiAgY29uc3QgY2JzID0gW11cblxuICB3aW5kb3cubWF0Y2hNZWRpYShgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAke01BWF9XSURUSH1weClgKS5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKGBzY3JlZW4gYW5kIChtYXgtd2lkdGg6ICR7TUFYX1dJRFRIfXB4KWApLm1hdGNoZXMpIHtcbiAgICAgIGNicy5mb3JFYWNoKGNiID0+IGNiLnNwKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNicy5mb3JFYWNoKGNiID0+IGNiLnBjKCkpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiAoeyBwYyA9IG5vb3AsIHNwID0gbm9vcCB9KSA9PiB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0geyBwYywgc3AgfVxuXG4gICAgY2JzLnB1c2gobGlzdGVuZXJzKVxuICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAke01BWF9XSURUSH1weClgKS5tYXRjaGVzKSB7XG4gICAgICBzcCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBjKClcbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSBjYnMuaW5kZXhPZihsaXN0ZW5lcnMpXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBjYnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSkoKVxuXG4vKipcbiAqIHZpZXdwb3J0IOWGheOBqyAkZWwg44GM5YWl44Gj44Gm44GE44KL44GL44Gp44GG44GLXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpblZpZXdwb3J0ICgkZWwpIHtcbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KVxuICBjb25zdCB2aWV3cG9ydCA9IHtcbiAgICBsZWZ0OiAkd2luZG93LnNjcm9sbExlZnQoKSxcbiAgICB0b3A6ICR3aW5kb3cuc2Nyb2xsVG9wKClcbiAgfVxuICB2aWV3cG9ydC5yaWdodCA9IHZpZXdwb3J0LmxlZnQgKyAkd2luZG93LndpZHRoKClcbiAgdmlld3BvcnQuYm90dG9tID0gdmlld3BvcnQudG9wICsgJHdpbmRvdy5oZWlnaHQoKVxuXG4gIGNvbnN0IGVsID0gJGVsLm9mZnNldCgpXG4gIGVsLnJpZ2h0ID0gZWwubGVmdCArICRlbC53aWR0aCgpXG4gIGVsLmJvdHRvbSA9IGVsLnRvcCArICRlbC5oZWlnaHQoKVxuXG4gIHJldHVybiB2aWV3cG9ydC5sZWZ0IDw9IGVsLmxlZnQgJiZcbiAgICB2aWV3cG9ydC50b3AgPD0gZWwudG9wICYmXG4gICAgdmlld3BvcnQucmlnaHQgPj0gZWwucmlnaHQgJiZcbiAgICB2aWV3cG9ydC5ib3R0b20gPj0gZWwuYm90dG9tXG59XG5cbi8qKlxuICog5rih44GX44GfIFVSTCDjgpLmlrDjgZfjgYTjgr/jg5bjgajjgZfjgabplovjgY9cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Bc05ld1RhYiAodXJsKSB7XG4gIHdpbmRvdy5vcGVuKHVybClcbn1cblxuLyoqXG4gKiDou73ph4/jg4fjg7zjgr/lpInmm7Tnm6PoppYgKHNoYWxsb3cpXG4gKiBvYmog44Gu44OX44Ot44OR44OG44KjIGtleSDjgYzmm7TmlrDjgZXjgozjgZ/jgajjgY3jgasgZm4g44KS5a6f6KGM44GZ44KLXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3YXRjaCAob2JqLCBrZXksIGZuKSB7XG4gIGxldCB2YWx1ZSA9IG9ialtrZXldXG5cbiAgY29uc3QgcHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KVxuICBpZiAocHJvcGVydHkgJiYgIXByb3BlcnR5LmNvbmZpZ3VyYWJsZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8g5YmN44GuIGdldHRlciwgc2V0dGVyIOOCkuS/neaMgeOBmeOCi1xuICBjb25zdCBnZXR0ZXIgPSBwcm9wZXJ0eSAmJiBwcm9wZXJ0eS5nZXRcbiAgY29uc3Qgc2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuc2V0XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG5cbiAgICBnZXQgKCkge1xuICAgICAgcmV0dXJuIGdldHRlciA/IGdldHRlci5jYWxsKG9iaikgOiB2YWx1ZVxuICAgIH0sXG5cbiAgICBzZXQgKG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IGdldHRlciA/IGdldHRlci5jYWxsKG9iaikgOiB2YWx1ZVxuICAgICAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuXG5cbiAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgc2V0dGVyLmNhbGwob2JqLCBuZXdWYWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gbmV3VmFsdWVcbiAgICAgIH1cblxuICAgICAgZm4obmV3VmFsdWUsIG9sZFZhbHVlKVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBvYmog44Gu5YCk44KSIGZuIOOBp+WkieaPm+OBl+OBn+OCquODluOCuOOCp+OCr+ODiOOCkui/lOOBmVxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZTogYW55LCBrZXk6IHN0cmluZyk6IGFueX0gZm5cbiAqIEByZXR1cm4ge09iamVjdH0g5aSJ5o+b5b6M44Gu44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBWYWx1ZXMgKG9iaiwgZm4pIHtcbiAgY29uc3QgcmVzID0ge31cbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgcmVzW2tleV0gPSBmbihvYmpba2V5XSwga2V5KVxuICB9KVxuICByZXR1cm4gcmVzXG59XG5cbi8qKlxuICogZm4g44KSIG1zIOODn+ODquenkuOBq+S4gOW6puOBoOOBkeWun+ihjOOBmeOCi+mWouaVsOOCkui/lOOBmVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7bnVtYmVyfSBtc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVib3VuY2UgKGZuLCBtcykge1xuICBsZXQgdGltZXIgPSBudWxsXG5cbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBmbiguLi5hcmdzKSwgbXMpXG4gIH1cbn1cblxuLyoqXG4gKiDkuI7jgYjjgonjgozjgZ/plqLmlbDjga7jgZnjgbnjgabjgavjgaTjgYTjgaZcbiAqIG1zIOODn+ODquenkuOBq+S4gOW6puOBoOOBkeWun+ihjOOBleOCjOOCi+OCiOOBhuOBq+OBmeOCi1xuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIOWApOOBjOmWouaVsOOBruOCquODluOCuOOCp+OCr+ODiFxuICogQHBhcmFtIHtudW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gb2JqIOOBqOWQjOOBmOani+mAoOOCkuaMgeOBpOOCquODluOCuOOCp+OCr+ODiFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVib3VuY2VHcm91cCAob2JqLCBtcykge1xuICBsZXQgdGltZXIgPSBudWxsXG5cbiAgcmV0dXJuIG1hcFZhbHVlcyhvYmosIGZuID0+IHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBmbiguLi5hcmdzKSwgbXMpXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIFVSTCDjga7jgq/jgqjjg6rmloflrZfliJfjgpLjg5Hjg7zjgrnjgZfjgabjgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TjgZlcbiAqIEBwYXJhbSB7c3RyaW5nfSBxcyAtIOOCr+OCqOODquaWh+Wtl+WIl1xuICogQHJldHVybiB7b2JqZWN0fSAtIOODkeODvOOCueOBleOCjOOBn+OCr+OCqOODquaWh+Wtl+WIl+OBruOCquODluOCuOOCp+OCr+ODiFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQYXJhbSAocXMpIHtcbiAgcXMgPSBxcy5yZXBsYWNlKC9eXFw/LywgJycpXG4gIHJldHVybiBxcy5zcGxpdCgnJicpLnJlZHVjZSgoYWNjLCBpdGVtKSA9PiB7XG4gICAgY29uc3QgcGFpciA9IGl0ZW0uc3BsaXQoJz0nKVxuICAgIGlmIChwYWlyLmxlbmd0aCA9PT0gMSkge1xuICAgICAgYWNjW3BhaXJbMF1dID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICBhY2NbcGFpclswXV0gPSBwYWlyWzFdXG4gICAgfVxuICAgIHJldHVybiBhY2NcbiAgfSwge30pXG59XG5cbi8qKlxuICogT2JqZWN0LmFzc2lnbiBQb255ZmlsbFxuICogQHBhcmFtIHsuLi5vYmplY3R9IGFyZ3NcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuZXhwb3J0IGNvbnN0IGFzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgY29uc3QgcmVzID0gYXJnc1swXVxuICBhcmdzLnNsaWNlKDEpLmZvckVhY2goYXJnID0+IHtcbiAgICBPYmplY3Qua2V5cyhhcmcpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHJlc1trZXldID0gYXJnW2tleV1cbiAgICB9KVxuICB9KVxuICByZXR1cm4gcmVzXG59XG4iLCJpbXBvcnQgeyBub29wIH0gZnJvbSAnLi9fdXRpbGl0eSdcblxuLyoqXG4gKiBET00g44Gu5o+P55S744KS5b6F44Gj44Gm5Yem55CG44KS6KGM44GGXG4gKiDjgqLjg4vjg6Hjg7zjgrfjg6fjg7Pjga7plovlp4vlnLDngrnjgasgRE9NIOOBjOaPj+eUu+OBleOCjOOCi+OBruOCkuW+heOBpOOBn+OCgeOBq+S9v+OBhlxuICovXG5mdW5jdGlvbiBuZXh0RnJhbWUgKGZuKSB7XG4gIGNvbnN0IHJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpXG4gIHJhZigoKSA9PiByYWYoZm4pKVxufVxuXG4vKipcbiAqIENTUyDjgqLjg4vjg6Hjg7zjgrfjg6fjg7NcbiAqIOODj+ODs+ODieODqTogYmVmb3JlU3RhcnQsIHN0YXJ0LCBlbmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVDU1MgKFxuICAkZWwsXG4gIHtcbiAgICBiZWZvcmVTdGFydCA9IG5vb3AsXG4gICAgc3RhcnQgPSBub29wLFxuICAgIGVuZCA9IG5vb3BcbiAgfVxuKSB7XG4gIC8vIOWJjeWbnuOBruOCouODi+ODoeODvOOCt+ODp+ODs+OCkuW8t+WItueahOOBq+e1guS6huOBleOBm+OCi1xuICBjb25zdCBwcmV2Q2IgPSAkZWwuZGF0YSgnYW5pbWF0ZS1jc3MtY2InKVxuICBpZiAocHJldkNiKSB7XG4gICAgcHJldkNiKClcbiAgfVxuXG4gIGNvbnN0IGNiID0gZnVuY3Rpb24gY2IgKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50ICYmICRlbFswXSAhPT0gZXZlbnQudGFyZ2V0KSByZXR1cm5cbiAgICAkZWwub2ZmKCd0cmFuc2l0aW9uZW5kJywgY2IpXG4gICAgJGVsLmRhdGEoJ2FuaW1hdGUtY3NzLWNiJywgbnVsbClcbiAgICBlbmQoJGVsKVxuICB9XG5cbiAgJGVsXG4gICAgLmRhdGEoJ2FuaW1hdGUtY3NzLWNiJywgY2IpXG4gICAgLmNzcygndHJhbnNpdGlvbi1kdXJhdGlvbicsICcwcycpXG4gICAgLm9uKCd0cmFuc2l0aW9uZW5kJywgY2IpXG5cbiAgYmVmb3JlU3RhcnQoJGVsKVxuICBuZXh0RnJhbWUoKCkgPT4ge1xuICAgICRlbC5jc3MoJ3RyYW5zaXRpb24tZHVyYXRpb24nLCAnJylcbiAgICBzdGFydCgkZWwpXG4gIH0pXG59XG5cbi8qKlxuICogQ1NTIOOCouOCs+ODvOODh+OCo+OCquODs+OCouODi+ODoeODvOOCt+ODp+ODs1xuICogdHJhbnNpdGlvbi1wcm9wZXJ0eSDjgasgaGVpZ2h0IOaMh+WumuW/hemgiFxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZUFjY29yZGlvbiAoXG4gICR0YXJnZXQsXG4gIGlzT3BlbixcbiAgeyBiZWZvcmUgPSBub29wLCBhZnRlciA9IG5vb3AgfSA9IHt9XG4pIHtcbiAgaWYgKGlzT3Blbikge1xuICAgIGxldCBoZWlnaHRcbiAgICBhbmltYXRlQ1NTKCR0YXJnZXQsIHtcbiAgICAgIGJlZm9yZVN0YXJ0OiAkZWwgPT4ge1xuICAgICAgICBiZWZvcmUoKVxuICAgICAgICAkZWwuY3NzKCdoZWlnaHQnLCAnJylcbiAgICAgICAgaGVpZ2h0ID0gJGVsLmhlaWdodCgpXG4gICAgICAgICRlbC5oZWlnaHQoMClcbiAgICAgIH0sXG4gICAgICBzdGFydDogJGVsID0+ICRlbC5oZWlnaHQoaGVpZ2h0KSxcbiAgICAgIGVuZDogJGVsID0+IHtcbiAgICAgICAgLy8gU2FmYXJpIOWvvuetluOBpyBoZWlnaHQg44Gu5YCk44KS5aSW44GZ44Gu44GvIHRyYW5zaXRpb24tZHVyYXRpb24g44KS54Sh5Yq55YyW44GX44Gm44GL44KJXG4gICAgICAgIC8vIGhlaWdodCDjgpLlpJbjgZnjgaggMCDjgajjgb/jgarjgZfjgabjgqLjg4vjg6Hjg7zjgrfjg6fjg7PjgZnjgovjgojjgYbjgarmjJnli5XjgpLjgZnjgovjgZ/jgoFcbiAgICAgICAgJGVsXG4gICAgICAgICAgLmNzcygndHJhbnNpdGlvbi1kdXJhdGlvbicsICcwcycpXG4gICAgICAgICAgLmNzcygnaGVpZ2h0JywgJycpXG4gICAgICAgIGFmdGVyKClcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkZWwuY3NzKCd0cmFuc2l0aW9uLWR1cmF0aW9uJywgJycpXG4gICAgICAgIH0sIDApXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBhbmltYXRlQ1NTKCR0YXJnZXQsIHtcbiAgICAgIGJlZm9yZVN0YXJ0OiAkZWwgPT4ge1xuICAgICAgICBiZWZvcmUoKVxuICAgICAgICAkZWwuY3NzKCdoZWlnaHQnLCAnJylcbiAgICAgICAgJGVsLmhlaWdodCgkZWwuaGVpZ2h0KCkpXG4gICAgICB9LFxuICAgICAgc3RhcnQ6ICRlbCA9PiAkZWwuaGVpZ2h0KDApLFxuICAgICAgZW5kOiAkZWwgPT4ge1xuICAgICAgICAkZWwuY3NzKCdoZWlnaHQnLCAnJylcbiAgICAgICAgYWZ0ZXIoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBDU1Mg44OV44Kn44O844OJ44Ki44OL44Oh44O844K344On44OzXG4gKiAkdGFyZ2V0IOOBruimgee0oOOBriB0cmFuc2l0aW9uLXByb3BlcnR5IOOBqyBvcGFjaXR5IOaMh+WumuW/hemgiFxuICpcbiAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0g44OV44Kn44O844OJ44GV44Gb44KL5a++6LGh44Gu6KaB57SgXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRmFkZUluIC0g44OV44Kn44O844OJ44Kk44Oz44GL5ZCm44GLXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0aW9ucy5iZWZvcmUgLSDjgqLjg4vjg6Hjg7zjgrfjg6fjg7Pjga7nm7TliY3jgavlrp/ooYzjgZXjgozjgovjgrPjg7zjg6vjg5Djg4Pjgq9cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMuYWZ0ZXIgLSDjgqLjg4vjg6Hjg7zjgrfjg6fjg7Pjga7nm7Tlvozjgavlrp/ooYzjgZXjgozjgovjgrPjg7zjg6vjg5Djg4Pjgq9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVGYWRlIChcbiAgJHRhcmdldCxcbiAgaXNGYWRlSW4sXG4gIHsgYmVmb3JlID0gbm9vcCwgYWZ0ZXIgPSBub29wIH0gPSB7fVxuKSB7XG4gIGlmIChpc0ZhZGVJbikge1xuICAgIGFuaW1hdGVDU1MoJHRhcmdldCwge1xuICAgICAgYmVmb3JlU3RhcnQ6ICRlbCA9PiB7XG4gICAgICAgIGJlZm9yZSgpXG4gICAgICAgICRlbC5jc3MoJ29wYWNpdHknLCAnMCcpXG4gICAgICB9LFxuICAgICAgc3RhcnQ6ICRlbCA9PiAkZWwuY3NzKCdvcGFjaXR5JywgJycpLFxuICAgICAgZW5kOiAoKSA9PiBhZnRlcigpXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBhbmltYXRlQ1NTKCR0YXJnZXQsIHtcbiAgICAgIGJlZm9yZVN0YXJ0OiAoKSA9PiBiZWZvcmUoKSxcbiAgICAgIHN0YXJ0OiAkZWwgPT4gJGVsLmNzcygnb3BhY2l0eScsICcwJyksXG4gICAgICBlbmQ6ICRlbCA9PiB7XG4gICAgICAgICRlbC5jc3MoJ29wYWNpdHknLCAnJylcbiAgICAgICAgYWZ0ZXIoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiDooajnpLogLyDpnZ7ooajnpLrjg4jjg6njg7Pjgrjjgrfjg6fjg7PjgpLjgZnjgovjg6bjg7zjg4bjgqPjg6rjg4bjgqNcbiAqIOOCs+ODvOODq+ODkOODg+OCr+WGheOBpyBDU1Mg44OI44Op44Oz44K444K344On44Oz44KS44OI44Oq44Ks44GZ44KL44KI44GG44Gq5Yem55CGICjkvovjgYjjgbDjgq/jg6njgrnjga7ov73liqApIOOCkuihjOOBhOOAgVxuICog44Gd44Gu44OI44Op44Oz44K444K344On44Oz44Gu5YmN44CB44KC44GX44GP44Gv44CB5b6M44Gr6KaB57Sg44GuIGRpc3BsYXkg44OX44Ot44OR44OG44Kj44KS6Ieq5YuV55qE44Gr5aSJ44GI44KLXG4gKlxuICogQHBhcmFtIHtKUXVlcnl9ICR0YXJnZXQgLSDjg4jjg6njg7Pjgrjjgrfjg6fjg7Pjga7lr77osaFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNTaG93IC0g6KGo56S644GZ44KL44GL6Z2e6KGo56S644GZ44KL44GLXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIENTUyDjg4jjg6njg7Pjgrjjgrfjg6fjg7PjgpLlrp/ooYzjgZnjgovplqLmlbDjgILjgZPjga7kuK3jgafjgq/jg6njgrnjgpLlpInjgYjjgovjgarjganjga7lh6bnkIbjgpLooYzjgYZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zaXRpb25TaG93ICgkdGFyZ2V0LCBpc1Nob3csIGZuKSB7XG4gIGlmIChpc1Nob3cpIHtcbiAgICBhbmltYXRlQ1NTKCR0YXJnZXQsIHtcbiAgICAgIHN0YXJ0OiBmbixcbiAgICAgIGJlZm9yZVN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQuY3NzKCdkaXNwbGF5JywgJycpXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBhbmltYXRlQ1NTKCR0YXJnZXQsIHtcbiAgICAgIHN0YXJ0OiBmbixcbiAgICAgIGVuZDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LmNzcygnZGlzcGxheScsICdub25lJylcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG4iLCIvKipcbiAqIOi7vemHjyBFdmVudEVtaXR0ZXLjgIHntpnmib/jgZfjgabkvb/jgYZcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIOOCpOODmeODs+ODiOODquOCueODiuOCkueZu+mMsuOBmeOCi+OAglxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIGV2ZW50IG5hbWVcbiAgICogQHBhcmFtIHtmdW5jdGlvbihkYXRhOiAqKTogdm9pZH0gZm4gLSBsaXN0ZW5lciBmdW5jdGlvblxuICAgKi9cbiAgb24gKG5hbWUsIGZuKSB7XG4gICAgY29uc3QgbGlzdCA9IHRoaXMuX2xpc3RlbmVyc1tuYW1lXSA9IHRoaXMuX2xpc3RlbmVyc1tuYW1lXSB8fCBbXVxuICAgIGxpc3QucHVzaChmbilcbiAgfVxuXG4gIC8qKlxuICAgKiBvbiDjgafnmbvpjLLjgZfjgZ/jg6rjgrnjg4rjgavlr77jgZfjgabjgqTjg5njg7Pjg4jjgpLpo5vjgbDjgZnjgIJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBldmVudCBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSAtIGRhdGEgdG8gZW1pdCBldmVudCBsaXN0ZW5lcnNcbiAgICovXG4gIHRyaWdnZXIgKG5hbWUsIGRhdGEpIHtcbiAgICBjb25zdCBmbnMgPSB0aGlzLl9saXN0ZW5lcnNbbmFtZV0gfHwgW11cbiAgICBmbnMuZm9yRWFjaChmbiA9PiBmbihkYXRhKSlcbiAgfVxuXG4gIC8qKlxuICAgKiDjgqTjg5njg7Pjg4jjg6rjgrnjg4rjgpLliYrpmaTjgZnjgovjgIJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBldmVudCBuYW1lXG4gICAqL1xuICBvZmYgKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW25hbWVdXG4gIH1cbn1cbiIsIi8vIOW+jOaWueS6kuaPm+OBruOBn+OCgeOBq+aui+OBmVxuZXhwb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnLi9fZXZlbnRfZW1pdHRlcidcbiIsImltcG9ydCAkIGZyb20gJ2pxdWVyeSdcblxuaW1wb3J0IHsgd2F0Y2ggfSBmcm9tICcuL191dGlsaXR5LmpzJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnLi9fbW9kdWxlLmpzJ1xuXG4vKipcbiAqIGNvbnN0YW50XG4gKi9cbmNvbnN0IERVUkFUSU9OID0gNjAwXG5jb25zdCBFQVNJTkcgPSAnZWFzZUluT3V0Q3ViaWMnXG5cbi8qKlxuICog44OW44Op44Km44K244OH44OV44Kp44Or44OI44Gu44K544Kv44Ot44O844Or44K/44O844Ky44OD44OI44GuIGpRdWVyeSDjgqrjg5bjgrjjgqfjgq/jg4jjgpLlj5blvpdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRTY3JvbGxUYXJnZXQgKCkge1xuICByZXR1cm4gJChkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClcbn1cblxuLyoqXG4gKiDmjIflrprjgZfjgZ8galF1ZXJ5IOOCquODluOCuOOCp+OCr+ODiOOBq+WvvuW/nOOBmeOCi+imgee0oOOBuOOCueODoOODvOOCueOCueOCr+ODreODvOODq+OBmeOCi1xuICog5Yid5pyf5YCk44Gv44Oa44O844K444OI44OD44OXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY3JvbGxUb1Ntb290aGx5ICgkdG8sIGR1cmF0aW9uID0gRFVSQVRJT04pIHtcbiAgY29uc3QgcG9zID0gKCEkdG8gfHwgJHRvLmxlbmd0aCA9PT0gMCkgPyAwIDogZ2V0UG9zKCR0bylcblxuICAvLyBGaXhlZCDjgaogaGVhZGVyIOOBrumrmOOBleOCkuiAg+aFruOBmeOCi1xuICBjb25zdCBmaXhlZFBvcyA9IHBvcyAtIChwYXJzZUludCgkKCcjanMtbWFpbl93cmFwcGVyJykuY3NzKCdwYWRkaW5nLXRvcCcpLCAwKSB8fCAwKVxuXG4gIGdldERlZmF1bHRTY3JvbGxUYXJnZXQoKS5hbmltYXRlKHtcbiAgICBzY3JvbGxUb3A6IGZpeGVkUG9zXG4gIH0sIHtcbiAgICBkdXJhdGlvbixcbiAgICBlYXNpbmc6IEVBU0lOR1xuICB9KVxufVxuXG4vKipcbiAqIOOCouODi+ODoeODvOOCt+ODp+ODs+OBquOBl+OBp+OCueOCr+ODreODvOODq+S9jee9ruOCkuenu+WLleOBmeOCi1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2Nyb2xsVG8gKCR0bykge1xuICBzY3JvbGxUb1Ntb290aGx5KCR0bywgMClcbn1cblxuLyoqXG4gKiDjgqLjg7Pjgqvjg7zjg6rjg7Pjgq/jga7jgrnjg6Djg7zjgrnjgrnjgq/jg63jg7zjg6vjgpLmnInlirnjgavjgZnjgotcbiAqIGhyZWYg44GMXG4gKiAxLiAnIycg44Gq44KJ44Oa44O844K444OI44OD44OX44G444K544Kv44Ot44O844OrXG4gKiAyLiAnI3h4eCcg44Gn6Kmy5b2TSUTjgYzlrZjlnKjjgZnjgozjgbDjgZ3jga7opoHntKDjgbjjgrnjgq/jg63jg7zjg6tcbiAqIDMuICcjdG9wJyDjgarjgonjg5rjg7zjgrjjg4jjg4Pjg5fjgbjjgrnjgq/jg63jg7zjg6tcbiAqIDQuIOOBneOCjOS7peWkluOBquOCieS9leOCguOBl+OBquOBhFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlU21vb3RoU2Nyb2xsIChzZWxlY3RvciA9ICdhW2hyZWZePVwiI1wiXScpIHtcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgc2VsZWN0b3IsIGV2ZW50ID0+IHtcbiAgICBjb25zdCB0byA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJylcblxuICAgIGlmICh0byA9PT0gJyMnKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBzY3JvbGxUb1Ntb290aGx5KClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0ICR0byA9ICQodG8pXG4gICAgaWYgKCR0by5sZW5ndGggPiAwKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgJycsIHRvKVxuICAgICAgc2Nyb2xsVG9TbW9vdGhseSgkdG8pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodG8gPT09ICcjdG9wJykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgc2Nyb2xsVG9TbW9vdGhseSgpXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIGpRdWVyeSDjgqrjg5bjgrjjgqfjgq/jg4jjga7kvY3nva7mg4XloLHjgpLov5TjgZlcbiAqICRvYmog44GrIGpRdWVyeSDjgqrjg5bjgrjjgqfjgq/jg4jmjIflrprlv4XpoIhcbiAqL1xuZnVuY3Rpb24gZ2V0UG9zICgkb2JqKSB7XG4gIGNvbnN0IHBvcyA9ICRvYmoub2Zmc2V0KCkudG9wXG4gIHJldHVybiBwb3Ncbn1cblxuLyoqXG4gKiDjgrnjgq/jg63jg7zjg6vnm6PoppZcbiAqL1xuZXhwb3J0IGNsYXNzIFNjcm9sbFZNIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKCR0YXJnZXQpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLmRhdGEgPSB7XG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiAkdGFyZ2V0LnNjcm9sbFRvcCgpLFxuICAgICAgICBsZWZ0OiAkdGFyZ2V0LnNjcm9sbExlZnQoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYmluZCh0aGlzLmRhdGEsICR0YXJnZXQpXG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYmluZCAoZGF0YSwgJHRhcmdldCkge1xuICAgICR0YXJnZXQub24oJ3Njcm9sbCcsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0KCR0YXJnZXQuc2Nyb2xsTGVmdCgpLCAkdGFyZ2V0LnNjcm9sbFRvcCgpKVxuICAgIH0pXG5cbiAgICB3YXRjaChkYXRhLCAnb2Zmc2V0JywgbmV3VmFsdWUgPT4ge1xuICAgICAgdGhpcy50cmlnZ2VyKCdzY3JvbGwnLCBuZXdWYWx1ZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHNldCAobGVmdCwgdG9wKSB7XG4gICAgdGhpcy5kYXRhLm9mZnNldCA9IHtcbiAgICAgIHRvcCxcbiAgICAgIGxlZnRcbiAgICB9XG4gIH1cblxuICBnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEub2Zmc2V0XG4gIH1cbn1cbiIsImltcG9ydCAkIGZyb20gJ2pxdWVyeSdcblxuaW1wb3J0IHsgeWVzLCBvbkNoYW5nZUxheW91dCwgaW5WaWV3cG9ydCwgd2F0Y2gsIGFzc2lnbiB9IGZyb20gJy4vX3V0aWxpdHknXG5pbXBvcnQgeyBhbmltYXRlQWNjb3JkaW9uIH0gZnJvbSAnLi9fYW5pbWF0aW9uJ1xuaW1wb3J0IHsgZ2V0RGVmYXVsdFNjcm9sbFRhcmdldCB9IGZyb20gJy4vX3Njcm9sbCdcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJy4vX21vZHVsZSdcblxuLyoqXG4gKiDmjpLku5bnmoTjgavplovjgY/jgqLjgrPjg7zjg4fjgqPjgqrjg7PjgILplovjgYTjgZ/lnLDngrnjgYznlLvpnaLlpJbjgavnp7vli5XjgZfjgZ/jgonjgrnjgq/jg63jg7zjg6vjgILjgbvjgajjgpPjganjga7jgrHjg7zjgrnjgacge0BsaW5rIGFjY29yZGlvbn0g44KS5L2/55So44GZ44KL44Go6Imv44GE44CCXG4gKlxuICogQWNjb3JkaW9uIHRoYXQgb3BlbnMgZXhjbHVzaXZlbHkuIFRoZXkgc2Nyb2xsIHRoZSBicm93c2VyIGlmIHRoZSBhY2NvcmRpb24gbGVhdmUgb3V0IG9mIHZpZXdwb3J0LlxuICogSW4gbW9zdCBjYXNlcywgeW91IHNob3VsZCB1c2Uge0BsaW5rIGFjY29yZGlvbn0gZnVuY3Rpb24uXG4gKlxuICog5Lul5LiL44Gu44Kk44OZ44Oz44OI44KS55m654Gr44GZ44KLXG4gKiAtIHNlbGVjdCDjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgYzpgbjmip7jgZXjgozjgZ/mmYLjgIJpbmRleCDjgYzmuKHjgZXjgozjgotcbiAqIC0gZGVzZWxlY3Qg44Ki44Kz44O844OH44Kj44Kq44Oz44Gu6YG45oqe44GM6Kej6Zmk44GV44KM44Gf5pmCXG4gKiAtIGJlZm9yZU9wZW4g44Ki44Kz44O844OH44Kj44Kq44Oz44GM6ZaL44GL44KM44KL55u05YmNXG4gKiAtIG9wZW5lZCDjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgYzplovjgYvjgozjgZ/mmYJcbiAqIC0gYmVmb3JlQ2xvc2Ug44Ki44Kz44O844OH44Kj44Kq44Oz44GM6ZaJ44GY44KJ44KM44KL55u05YmNXG4gKiAtIGNsb3NlZCDjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgYzplonjgZjjgonjgozjgZ/mmYJcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gd3JhcHBlciBlbGVtZW50IG9mIGFjY29yZGlvblxuICogY29uc3QgJG5hdiA9ICQoJyNqcy1uYXYnKVxuICpcbiAqIGNvbnN0IHZtID0gbmV3IEFjY29yZGlvblZNKCRuYXYsIHtcbiAqICAgLy8gbGluayBvciBidXR0b24gZWxlbWVudCB0aGF0IHRvZ2dsZXMgYW4gYWNjb3JkaW9uXG4gKiAgIGFuY2hvcjogJy5qcy1hY2NvcmRpb25fYW5jaG9yJyxcbiAqICAgLy8gY29udGVudCBvZiBhY2NvcmRpb25cbiAqICAgY29udGVudDogJy5qcy1hY2NvcmRpb25fY29udGVudCdcbiAqIH0pXG4gKlxuICogdm0ub24oJ3NlbGVjdCcsIGluZGV4ID0+IHZtLnNlbGVjdChpbmRleCkpXG4gKiB2bS5vbignZGVzZWxlY3QnLCAoKSA9PiB2bS5zZWxlY3QobnVsbCkpXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIHB1ZyDjga7kvovjgILjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgpLplovplonjgZnjgovjg5zjgr/jg7PjgajjgIHjgrPjg7Pjg4bjg7Pjg4Tjga7jg6njg4Pjg5Hjg7zjgasganMg44GL44KJ5Y+C54Wn44GZ44KL44Gf44KB44Gu44Kv44Op44K55ZCN44KS5LuY5LiO44GZ44KL44CCXG4gKiAvLyBIZXJlIGlzIHRoZSBleGFtcGxlIG9mIHB1Zy4gWW91IG5lZWQgdG8gYWRkIGNsYXNzIGF0dHJpYnV0ZXMgdGhhdCBhcmUgcmVmZXJyZWQgZnJvbSBqcyAtXG4gKiAvLyBidXR0b25zIHRvIG9wZW4vY2xvc2UgYWNjb3JkaW9uIGFuZCB3cmFwcGVycyBvZiBhY2NvcmRpb24gY29udGVudHMuXG4gKlxuICogI2pzLW5hdlxuICogICB1bC5mb29cbiAqICAgICBsaS5mb29faXRlbVxuICogICAgICAgYS5mb29fYW5jaG9yLmpzLWFjY29yZGlvbl9hbmNob3IoYXJpYS1zZWxlY3RlZD1cImZhbHNlXCIpIFRvZ2dsZSBhY2NvcmRpb25cbiAqICAgICAgIHVsLmJhci5qcy1hY2NvcmRpb25fY29udGVudChhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIilcbiAqICAgICAgICAgbGkuYmFyX2l0ZW0gLi4uXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIHNjc3Mg44Gu5L6L44CC44Kz44Oz44OG44Oz44OE44Gr5a++44GX44GmIGhlaWdodCDjgpLlr77osaHjgajjgZfjgZ8gdHJhbnNpdGlvbiDjgpLoqK3lrprjgZnjgovjgILjgb7jgZ/jgIHlkITlsZ7mgKfjga7lgKTjgYzlpInjgo/jgaPjgZ/mmYLjga7jgrnjgr/jgqTjg6vjgoLmjIflrprjgZnjgovjgIJcbiAqIC8vIEhlcmUgaXMgdGhlIGV4YW1wbGUgb2Ygc2Nzcy4gWW91IG5lZWQgdG8gZGVmaW5lIHRyYW5zaXRpb24gcHJvcGVydHkgZm9yIGhlaWdodC4gSW4gYWRkaXRpb24sXG4gKiAvLyBpdCBpcyBuZWVkZWQgdG8gZGVmaW5lIHRoZSBzdHlsZSB3aGVuIGVhY2ggYXR0cmlidXRlIHZhbHVlIGlzIGNoYW5nZWQuXG4gKlxuICogLmZvb19hbmNob3JbYXJpYS1zZWxlY3RlZD1cInRydWVcIl0ge1xuICogICBjb2xvcjogJGNvbG9yLXN1YjtcbiAqIH1cbiAqXG4gKiAuYmFyIHtcbiAqICAgdHJhbnNpdGlvbjogaGVpZ2h0ICR0cmFuc2l0aW9uLWFjY29yZGlvbjtcbiAqXG4gKiAgICZbYXJpYS1leHBhbmRlZD1cImZhbHNlXCJdIHtcbiAqICAgICBkaXNwbGF5OiBub25lO1xuICogICB9XG4gKiB9XG4gKi9cbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25WTSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHdyYXBwZXIgLSDjgqLjgrPjg7zjg4fjgqPjgqrjg7Pjga7jg6njg4Pjg5Hjg7zopoHntKAgKFdyYXBwZXIgZWxlbWVudCBvZiBhY2NvcmRpb24pXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbnRlbnRcbiAgICogLSDlkITjgqLjgrPjg7zjg4fjgqPjgqrjg7Pjga7jgrPjg7Pjg4bjg7Pjg4QgKGNvbnRlbnQgb2YgYWNjb3JkaW9uKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5hbmNob3JcbiAgICogLSDlkITjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgpLplovjgZHplonjgoHjgZnjgovjg6rjg7Pjgq/jg7vjg5zjgr/jg7MgKGxpbmsgb3IgYnV0dG9uIGZvciBvcGVuaW5nL2Nsb3NpbmcgYWNjb3JkaW9uKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2Nyb2xsVGFyZ2V0XVxuICAgKiAtIOOCouOCs+ODvOODh+OCo+OCquODs+mWi+mWieaZguOBq+OCueOCr+ODreODvOODq+OBmeOCi+imgee0oCAoZWxlbWVudCB0aGF0IHdpbGwgYmUgc2Nyb2xsZWQgd2hlbiB0aGUgYWNjb3JkaW9uIGlzIGNoYW5nZWQpXG4gICAqIEBwYXJhbSB7bnVtYmVyfGZ1bmN0aW9ufSBbb3B0aW9ucy5zY3JvbGxPZmZzZXQ9MF1cbiAgICogLSBzY3JvbGxUYXJnZXQg44Gu44K544Kv44Ot44O844Or5pmC44Gr5Z+65rqW44GL44KJ44Gp44KM44Gg44GR44Ga44KJ44GZ44GL44CC6Zai5pWw44KS5rih44GZ44Go44K544Kv44Ot44O844Or44Gu5bqm44Gr6KmV5L6h44GZ44KLIChvZmZzZXQgb2Ygc2Nyb2xsIGRlc3RpbmF0aW9uIHBvaW50KVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2VsZWN0ZWRBdHRyPSdhcmlhLXNlbGVjdGVkJ11cbiAgICogLSBvcHRpb25zLmFuY2hvciDjgpLpgbjmip7jgZfjgabjgYTjgovjgYvlkKbjgYvjgpLooajjgZnlsZ7mgKflkI0gKGF0dHJpYnV0ZSBuYW1lIHdoZXRoZXIgdGhlIG9wdGlvbnMuYW5jaG9yIGlzIHNlbGVjdGVkIG9yIG5vdClcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmV4cGFuZGVkQXR0cj0nYXJpYS1leHBhbmRlZCddXG4gICAqIC0gb3B0aW9ucy5jb250ZW50IOOBjOmWi+OBhOOBpuOBhOOCi+OBi+WQpuOBi+OCkuihqOOBmeWxnuaAp+WQjSAoYXR0cmlidXRlIG5hbWUgd2hldGhlciB0aGUgb3B0aW9ucy5jb250ZW50IGlzIG9wZW5lZCBvciBub3QpXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTogYm9vbGVhbn0gW29wdGlvbnMuZmlsdGVyQ2xpY2tdXG4gICAqIC0gYm9vbGVhbiDjgpLov5TjgZnplqLmlbDjgpLlrprnvqnjgZnjgovjgIJ0cnVlIOOCkui/lOOBmeOBqCBjbGljayDmmYLjgavjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgYzli5XkvZzjgZnjgovjgIJcbiAgICovXG4gIGNvbnN0cnVjdG9yICgkd3JhcHBlciwgb3B0aW9ucykge1xuICAgIHN1cGVyKClcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgIG9wZW5lZEluZGV4OiBudWxsLFxuICAgICAgZGlzYWJsZWQ6IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5iaW5kKHRoaXMuZGF0YSwgJHdyYXBwZXIsIG9wdGlvbnMpXG4gICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlXG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYmluZCAoZGF0YSwgJHdyYXBwZXIsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICBjb250ZW50LFxuICAgICAgYW5jaG9yLFxuICAgICAgZGlzYWJsZVNjcm9sbCA9IGZhbHNlLFxuICAgICAgc2Nyb2xsVGFyZ2V0LFxuICAgICAgc2Nyb2xsT2Zmc2V0ID0gMCxcbiAgICAgIHNlbGVjdGVkQXR0ciA9ICdhcmlhLXNlbGVjdGVkJyxcbiAgICAgIGV4cGFuZGVkQXR0ciA9ICdhcmlhLWV4cGFuZGVkJyxcbiAgICAgIGZpbHRlckNsaWNrID0geWVzXG4gICAgfSA9IG9wdGlvbnNcblxuICAgIC8vIHNlbGVjdGVkQXR0ciDjga7lgKTjgpLopovjgabliJ3mnJ/nirbmhYvjgpLliKTliKXjgZfjgIHlrp/pmpvjga7lgKTjgavlj43mmKDjgZXjgZvjgotcbiAgICAvLyDjgb7jgZ/jgIFET00g44Gr6YG45oqe54q25oWL44GM5pu444GL44KM44Gm44GE44Gq44GE5pmC44Gv6YG45oqe44GX44Gm44GE44Gq44GE44KC44Gu44Go44GX44Gm5bGe5oCn44KS5pu444GN6L6844KAXG4gICAgdGhpcy5fc3luY0luaXRpYWxTdGF0ZShcbiAgICAgICR3cmFwcGVyLmZpbmQoYW5jaG9yKSxcbiAgICAgICR3cmFwcGVyLmZpbmQoY29udGVudCksXG4gICAgICBzZWxlY3RlZEF0dHIsXG4gICAgICBleHBhbmRlZEF0dHJcbiAgICApXG5cbiAgICB0aGlzLiRzY3JvbGxUYXJnZXQgPSBzY3JvbGxUYXJnZXRcbiAgICAgID8gJHdyYXBwZXIuZmluZChzY3JvbGxUYXJnZXQpXG4gICAgICA6IGdldERlZmF1bHRTY3JvbGxUYXJnZXQoKVxuICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0XG5cbiAgICAvLyDjgqLjgrPjg7zjg4fjgqPjgqrjg7Pjga7jg4jjg6rjgqzjgpLjgq/jg6rjg4Pjgq/jgZfjgZ/mmYJcbiAgICAkd3JhcHBlci5vbignY2xpY2snLCBhbmNob3IsIGV2ZW50ID0+IHtcbiAgICAgIGlmIChkYXRhLmRpc2FibGVkIHx8ICFmaWx0ZXJDbGljaygpKSByZXR1cm5cblxuICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuIC8vIOW3puOCr+ODquODg+OCr+S7peWkluOBr+WHpueQhuOBl+OBquOBhFxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCAkYW5jaG9yID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuICAgICAgY29uc3QgaXNTZWxlY3RlZCA9ICRhbmNob3IuYXR0cihzZWxlY3RlZEF0dHIpID09PSAndHJ1ZSdcblxuICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgLy8g6YG45oqe44GV44KM44Gm44GE44Gf44KJ6Kej6ZmkXG4gICAgICAgIHRoaXMudHJpZ2dlcignZGVzZWxlY3QnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g6YG45oqe44GX44Gf44Ki44Kz44O844OH44Kj44Kq44Oz44KS6ZaL44GPXG4gICAgICAgIGNvbnN0ICRhbmNob3JMaXN0ID0gJHdyYXBwZXIuZmluZChhbmNob3IpXG4gICAgICAgIGNvbnN0IGluZGV4ID0gJGFuY2hvckxpc3QuaW5kZXgoJGFuY2hvcilcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdzZWxlY3QnLCBpbmRleClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgd2F0Y2goZGF0YSwgJ2Rpc2FibGVkJywgZGlzYWJsZWQgPT4ge1xuICAgICAgY29uc3QgJGNvbnRlbnRzID0gJHdyYXBwZXIuZmluZChjb250ZW50KVxuXG4gICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgJGNvbnRlbnRzLmF0dHIoZXhwYW5kZWRBdHRyLCAndHJ1ZScpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkY29udGVudHMuYXR0cihleHBhbmRlZEF0dHIsICdmYWxzZScpXG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmRhdGEub3BlbmVkSW5kZXhcbiAgICAgICAgaWYgKGluZGV4ICE9IG51bGwgJiYgIWlzTmFOKGluZGV4KSkge1xuICAgICAgICAgICRjb250ZW50c1xuICAgICAgICAgICAgLmVxKHRoaXMuZGF0YS5vcGVuZWRJbmRleClcbiAgICAgICAgICAgIC5hdHRyKGV4cGFuZGVkQXR0ciwgJ3RydWUnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHdhdGNoKGRhdGEsICdvcGVuZWRJbmRleCcsIChuZXdJbmRleCwgb2xkSW5kZXgpID0+IHtcbiAgICAgIGNvbnN0ICRhbmNob3JzID0gJHdyYXBwZXIuZmluZChhbmNob3IpXG4gICAgICBjb25zdCAkY29udGVudHMgPSAkd3JhcHBlci5maW5kKGNvbnRlbnQpXG5cbiAgICAgIC8vIOihqOekuuOBleOCjOOBpuOBhOOCi+OCguOBruOCkumdnuihqOekuuOBq+OBmeOCi1xuICAgICAgaWYgKG9sZEluZGV4ICE9IG51bGwgJiYgIWlzTmFOKG9sZEluZGV4KSkge1xuICAgICAgICAvLyDjgqLjgrPjg7zjg4fjgqPjgqrjg7PjgpLplonjgZjjgovjgZPjgajjgafjgrnjgq/jg63jg7zjg6vkvY3nva7jgYzkuI3oh6rnhLbjgarkvY3nva7jgavjgarjgonjgarjgYTjgojjgYbjgavjgIFcbiAgICAgICAgLy8g44K544Kv44Ot44O844Or5L2N572u44Gu6Kq/5pW0XG4gICAgICAgIGlmICghZGlzYWJsZVNjcm9sbCkge1xuICAgICAgICAgIGNvbnN0ICR0YXJnZXRBbmNob3IgPSBuZXdJbmRleCAhPSBudWxsXG4gICAgICAgICAgICA/ICRhbmNob3JzLmVxKG5ld0luZGV4KVxuICAgICAgICAgICAgOiAkYW5jaG9ycy5lcShvbGRJbmRleClcbiAgICAgICAgICBjb25zdCAkcHJldkNvbnRlbnQgPSAkY29udGVudHMuZXEob2xkSW5kZXgpXG4gICAgICAgICAgY29uc3QgJG5leHRDb250ZW50ID0gbmV3SW5kZXggIT0gbnVsbCA/ICRjb250ZW50cy5lcShuZXdJbmRleCkgOiAkKClcbiAgICAgICAgICB0aGlzLl9hZGp1c3RTY3JvbGwoJHRhcmdldEFuY2hvciwgJG5leHRDb250ZW50LCAkcHJldkNvbnRlbnQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGlkZUNvbnRlbnQob2xkSW5kZXgsICRhbmNob3JzLCAkY29udGVudHMsIHNlbGVjdGVkQXR0ciwgZXhwYW5kZWRBdHRyKVxuICAgICAgfVxuXG4gICAgICAvLyDjgqTjg7Pjg4fjg4Pjgq/jgrnjgYzmjIflrprjgZXjgozjgabjgYTjgovmmYLjga9cbiAgICAgIC8vIOWvvuW/nOOBmeOCi+ODieODreODg+ODl+ODgOOCpuODs+OCkuihqOekuuOBmeOCi1xuICAgICAgaWYgKG5ld0luZGV4ICE9IG51bGwgJiYgIWlzTmFOKG5ld0luZGV4KSkge1xuICAgICAgICB0aGlzLl9zaG93Q29udGVudChuZXdJbmRleCwgb2xkSW5kZXgsICRhbmNob3JzLCAkY29udGVudHMsIHNlbGVjdGVkQXR0ciwgZXhwYW5kZWRBdHRyLCBkaXNhYmxlU2Nyb2xsKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogaW5kZXgg55Wq55uu44Gu44Ki44Kz44O844OH44Kj44Kq44Oz44KS6ZaL44GP44CCaW5kZXggPSBudWxsIOOBruaZguOBr+mBuOaKnuOCkuino+mZpOOBmeOCi1xuICAgKiBkaXNhYmxlZCDjga7mmYLjga/kvZXjgoLjgZfjgarjgYRcbiAgICogQHBhcmFtIHs/bnVtYmVyfSBpbmRleCAtIOOCouOCs+ODvOODh+OCo+OCquODs+OBruOCpOODs+ODh+ODg+OCr+OCuSAoaW5kZXggb2YgYWNjb3JkaW9uKVxuICAgKi9cbiAgc2VsZWN0IChpbmRleCkge1xuICAgIGlmICh0aGlzLmRhdGEuZGlzYWJsZWQpIHJldHVyblxuICAgIHRoaXMuZGF0YS5vcGVuZWRJbmRleCA9IGluZGV4XG4gIH1cblxuICAvKipcbiAgICog44Ki44Kz44O844OH44Kj44Kq44Oz44KS54Sh5Yq55YyW44GX44CB44GZ44G544Gm44Gu44Kz44Oz44OG44Oz44OE44KS6ZaL44GPXG4gICAqL1xuICBkaXNhYmxlICgpIHtcbiAgICB0aGlzLmRhdGEuZGlzYWJsZWQgPSB0cnVlXG4gIH1cblxuICAvKipcbiAgICog44Ki44Kz44O844OH44Kj44Kq44Oz44KS5pyJ5Yq55YyW44GZ44KLXG4gICAqL1xuICBlbmFibGUgKCkge1xuICAgIHRoaXMuZGF0YS5kaXNhYmxlZCA9IGZhbHNlXG4gIH1cblxuICAvKipcbiAgICog44Ki44Kz44O844OH44Kj44Kq44Oz44Gu44Ki44Oz44Kr44O844Gu5bGe5oCn44KS6Kqt44G/44CB5Yid5pyf5YCk44Go44GX44Gm6YG45oqe44GV44KM44Gm44GE44KL44Kk44Oz44OH44OD44Kv44K544KS5YCk44Gr5Y+N5pig44GZ44KL44CCXG4gICAqIOOBvuOBn+OAgemBuOaKnueKtuaFi+OBjCBET00g44Gr44GL44GL44KM44Gm44GE44Gq44GE5pmC44Gv6YG45oqe44GV44KM44Gm44GE44Gq44GE44KC44Gu44Go44GX44Gm5bGe5oCn44KS44K744OD44OI44GZ44KLXG4gICAqIEBwYXJhbSB7SlF1ZXJ5fSAkYW5jaG9ycyAtIOOBmeOBueOBpuOBruOCouODs+OCq+ODvFxuICAgKiBAcGFyYW0ge0pRdWVyeX0gJGNvbnRlbnRzIC0g5YWo44Gm44Gu44Kz44Oz44OG44Oz44OEXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RlZEF0dHIgLSDjgqLjg7Pjgqvjg7zjga7pgbjmip7nirbmhYvjgpLlj43mmKDjgZXjgZvjgovlsZ7mgKdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4cGFuZGVkQXR0ciAtIOOCs+ODs+ODhuODs+ODhOOBrumWi+mWieeKtuaFi+OCkuWPjeaYoOOBleOBm+OCi+WxnuaAp1xuICAgKi9cbiAgX3N5bmNJbml0aWFsU3RhdGUgKCRhbmNob3JzLCAkY29udGVudHMsIHNlbGVjdGVkQXR0ciwgZXhwYW5kZWRBdHRyKSB7XG4gICAgY29uc3QgJHNlbGVjdGVkQW5jaG9yID0gJGFuY2hvcnMuZmlsdGVyKGBbJHtzZWxlY3RlZEF0dHJ9PVwidHJ1ZVwiXWApXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSAkYW5jaG9ycy5pbmRleCgkc2VsZWN0ZWRBbmNob3IpXG4gICAgJGFuY2hvcnMuYXR0cihzZWxlY3RlZEF0dHIsICdmYWxzZScpXG4gICAgJGNvbnRlbnRzLmF0dHIoZXhwYW5kZWRBdHRyLCAnZmFsc2UnKVxuXG4gICAgaWYgKHNlbGVjdGVkID49IDApIHtcbiAgICAgICRhbmNob3JzLmVxKHNlbGVjdGVkKS5hdHRyKHNlbGVjdGVkQXR0ciwgJ3RydWUnKVxuICAgICAgJGNvbnRlbnRzLmVxKHNlbGVjdGVkKS5hdHRyKGV4cGFuZGVkQXR0ciwgJ3RydWUnKVxuICAgICAgdGhpcy5kYXRhLm9wZW5lZEluZGV4ID0gc2VsZWN0ZWRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog44Kz44Oz44OG44Oz44OE6YOo5YiG44KS6Zqg44GZXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIOmdnuihqOekuuOBq+OBmeOCi+OCs+ODs+ODhuODs+ODhOOBruOCpOODs+ODh+ODg+OCr+OCuVxuICAgKiBAcGFyYW0ge0pRdWVyeX0gJGFuY2hvcnMgLSDjgZnjgbnjgabjga7jgqLjgrPjg7zjg4fjgqPjgqrjg7Pjga7jgqLjg7Pjgqvjg7xcbiAgICogQHBhcmFtIHtKUXVlcnl9ICRjb250ZW50cyAtIOOBmeOBueOBpuOBruOCs+ODs+ODhuODs+ODhFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0ZWRBdHRyIC0g44Ki44Oz44Kr44O844Gu6YG45oqe54q25oWL44KS5Y+N5pig44GV44Gb44KL5bGe5oCnXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHBhbmRlZEF0dHIgLSDjgrPjg7Pjg4bjg7Pjg4Tjga7plovplonnirbmhYvjgpLlj43mmKDjgZXjgZvjgovlsZ7mgKdcbiAgICovXG4gIF9oaWRlQ29udGVudCAoaW5kZXgsICRhbmNob3JzLCAkY29udGVudHMsIHNlbGVjdGVkQXR0ciwgZXhwYW5kZWRBdHRyKSB7XG4gICAgY29uc3QgJGFuY2hvciA9ICRhbmNob3JzLmVxKGluZGV4KVxuICAgIGNvbnN0ICRjb250ZW50ID0gJGNvbnRlbnRzLmVxKGluZGV4KVxuXG4gICAgYW5pbWF0ZUFjY29yZGlvbigkY29udGVudCwgZmFsc2UsIHtcbiAgICAgIGJlZm9yZTogKCkgPT4ge1xuICAgICAgICB0aGlzLnRyaWdnZXIoJ2JlZm9yZUNsb3NlJywgaW5kZXgpXG4gICAgICAgICRhbmNob3IuYXR0cihzZWxlY3RlZEF0dHIsICdmYWxzZScpXG5cbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IHRydWVcbiAgICAgICAgdGhpcy5hbmltYXRpbmcoKVxuICAgICAgfSxcbiAgICAgIGFmdGVyOiAoKSA9PiB7XG4gICAgICAgICRjb250ZW50LmF0dHIoZXhwYW5kZWRBdHRyLCAnZmFsc2UnKVxuXG4gICAgICAgIC8vIOS4jeaVtOWQiOOCkumYsuOBkOOBn+OCgeOAgeOCouODi+ODoeODvOOCt+ODp+ODs+W+jOOBq+OCgueKtuaFi+OCkuOCu+ODg+ODiOOBmeOCi1xuICAgICAgICAkYW5jaG9yLmF0dHIoc2VsZWN0ZWRBdHRyLCAnZmFsc2UnKVxuXG4gICAgICAgIHRoaXMudHJpZ2dlcignY2xvc2VkJywgaW5kZXgpXG5cbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiDjgrPjg7Pjg4bjg7Pjg4Tpg6jliIbjgpLooajnpLrjgZnjgotcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0g6KGo56S644GZ44KL44Kz44Oz44OG44Oz44OE44Gu44Kk44Oz44OH44OD44Kv44K5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcmV2SW5kZXggLSDkuIDjgaTliY3jgavooajnpLrjgZXjgozjgabjgYTjgZ/jgrPjg7Pjg4bjg7Pjg4Tjga7jgqTjg7Pjg4fjg4Pjgq/jgrlcbiAgICogQHBhcmFtIHtKUXVlcnl9ICRhbmNob3JzIC0g44GZ44G544Gm44Gu44Ki44Kz44O844OH44Kj44Kq44Oz44Gu44Ki44Oz44Kr44O8XG4gICAqIEBwYXJhbSB7SlF1ZXJ5fSAkY29udGVudHMgLSDjgZnjgbnjgabjga7jgrPjg7Pjg4bjg7Pjg4RcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdGVkQXR0ciAtIOOCouODs+OCq+ODvOOBrumBuOaKnueKtuaFi+OCkuWPjeaYoOOBleOBm+OCi+WxnuaAp1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwYW5kZWRBdHRyIC0g44Kz44Oz44OG44Oz44OE44Gu6ZaL6ZaJ54q25oWL44KS5Y+N5pig44GV44Gb44KL5bGe5oCnXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGlzYWJsZVNjcm9sbCAtIOOCouODs+OCq+ODvOOBjOeUu+mdouWkluOBq+WPjuOBvuOCi+OCiOOBhuOBq+OCueOCr+ODreODvOODq+OBleOBm+OCi+OBi+WQpuOBi1xuICAgKi9cbiAgX3Nob3dDb250ZW50IChpbmRleCwgcHJldkluZGV4LCAkYW5jaG9ycywgJGNvbnRlbnRzLCBzZWxlY3RlZEF0dHIsIGV4cGFuZGVkQXR0ciwgZGlzYWJsZVNjcm9sbCkge1xuICAgIGNvbnN0ICRhbmNob3IgPSAkYW5jaG9ycy5lcShpbmRleClcbiAgICBjb25zdCAkY29udGVudCA9ICRjb250ZW50cy5lcShpbmRleClcblxuICAgIGFuaW1hdGVBY2NvcmRpb24oJGNvbnRlbnQsIHRydWUsIHtcbiAgICAgIGJlZm9yZTogKCkgPT4ge1xuICAgICAgICB0aGlzLnRyaWdnZXIoJ2JlZm9yZU9wZW4nLCBpbmRleClcbiAgICAgICAgJGNvbnRlbnRcbiAgICAgICAgICAuY3NzKCd6LWluZGV4JywgMSkgLy8g5paw44GX44GP6KGo56S644GV44KM44KL5pa544KS5LiK44Gr44GZ44KLXG4gICAgICAgICAgLmF0dHIoZXhwYW5kZWRBdHRyLCAndHJ1ZScpXG4gICAgICAgICRhbmNob3IuYXR0cihzZWxlY3RlZEF0dHIsICd0cnVlJylcblxuICAgICAgICB0aGlzLmlzQW5pbWF0aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLmFuaW1hdGluZygpXG4gICAgICB9LFxuICAgICAgYWZ0ZXI6ICgpID0+IHtcbiAgICAgICAgJGNvbnRlbnQuY3NzKCd6LWluZGV4JywgJycpXG4gICAgICAgIHRoaXMudHJpZ2dlcignb3BlbmVkJywgaW5kZXgpXG5cbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiDjgq/jg6rjg4Pjgq/jgZfjgZ/jgqLjg7Pjgqvjg7zjgYznlLvpnaLlpJbjgbjjgqLjg4vjg6Hjg7zjgrfjg6fjg7PjgZfjgabjgZfjgb7jgYbloLTlkIjjga/jgIFcbiAgICog44K544Kv44Ot44O844Or44GV44Gb44Gm55S76Z2i5YaF44G45YWl44KL44KI44GG44Gr44GZ44KLXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkbmV4dEFuY2hvciAtIOasoeOBq+mWi+OBj+OCouOCs+ODvOODh+OCo+OCquODs+OBq+WvvuW/nOOBmeOCi+OCouODs+OCq+ODvFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJG5leHRDb250ZW50IC0g5qyh44Gr6ZaL44GP44Ki44Kz44O844OH44Kj44Kq44Oz44Gr5a++5b+c44GZ44KL44Kz44Oz44OG44Oz44OEXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkcHJldkNvbnRlbnQgLSDku6XliY3plovjgYTjgabjgYTjgZ/jgqLjgrPjg7zjg4fjgqPjgqrjg7Pjgavlr77lv5zjgZnjgovjgrPjg7Pjg4bjg7Pjg4RcbiAgICovXG4gIF9hZGp1c3RTY3JvbGwgKCRuZXh0QW5jaG9yLCAkbmV4dENvbnRlbnQsICRwcmV2Q29udGVudCkge1xuICAgIHRoaXMuX3RpbWVUcmF2ZWwoJHByZXZDb250ZW50LCAkbmV4dENvbnRlbnQsICgpID0+IHtcbiAgICAgIGlmIChpblZpZXdwb3J0KCRuZXh0QW5jaG9yLCB0aGlzLiRzY3JvbGxUYXJnZXQpKSByZXR1cm5cblxuICAgICAgLy8g44K544Kv44Ot44O844Or44GZ44KL6KaB57Sg44GL44KJ5q+U6LyD44GX44Gf5bqn5qiZ44KS5Y+W5b6X44GZ44KLXG4gICAgICBsZXQgYW5jaG9yVG9wID0gJG5leHRBbmNob3Iub2Zmc2V0KCkudG9wIC0gdGhpcy4kc2Nyb2xsVGFyZ2V0Lm9mZnNldCgpLnRvcFxuXG4gICAgICBpZiAodGhpcy4kc2Nyb2xsVGFyZ2V0WzBdICE9PSBnZXREZWZhdWx0U2Nyb2xsVGFyZ2V0KClbMF0pIHtcbiAgICAgICAgLy8g44ON44K544OI44GV44KM44Gf44K544Kv44Ot44O844Or6KaB57Sg44Gu5pmC44CB44Gd44Gu6KaB57Sg44GM44K544Kv44Ot44O844Or44GV44KM44Gm44GE44KL5bqn5qiZ44Gu5YCk44Gg44GR44CBXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+WFiOOBruimgee0oOOBruW6p+aomeOBq+WApOOCkuWKoOOBiOOCi+W/heimgeOBjOOBguOCi1xuICAgICAgICBhbmNob3JUb3AgKz0gdGhpcy4kc2Nyb2xsVGFyZ2V0LnNjcm9sbFRvcCgpXG4gICAgICB9XG5cbiAgICAgIC8vIHNjcm9sbE9mZnNldCDjgYzplqLmlbDjga7mmYLjgIHlrp/ooYzjgZfjgablgKTjgpLlj5bjgorlh7rjgZlcbiAgICAgIGxldCBvZmZzZXQgPSB0aGlzLnNjcm9sbE9mZnNldFxuICAgICAgaWYgKHR5cGVvZiBvZmZzZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0KClcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gYW5jaG9yVG9wICsgb2Zmc2V0XG5cbiAgICAgIC8vIENTUyBUcmFuc2l0aW9uIOOBriBkdXJhdGlvbiwgZWFzaW5nIOOBq+WQiOOCj+OBm+OCi1xuICAgICAgdGhpcy4kc2Nyb2xsVGFyZ2V0LmFuaW1hdGUoe1xuICAgICAgICBzY3JvbGxUb3BcbiAgICAgIH0sIDUwMCwgJC5iZXooWzAuNDQsIDAuMDMsIDAuMTQsIDAuOThdKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIOOCouODi+ODoeODvOOCt+ODp+ODs+W+jOOBrueKtuaFi+OBq+W8t+WItueahOOBq+OBl+OBn+eKtuaFi+OBpyBmbiDjgpLlrp/ooYzjgZnjgotcbiAgICog44Ki44Kz44O844OH44Kj44Kq44Oz44GM6ZaL44GE44Gf5b6M44Gr6Ieq54S244Gr44K544Kv44Ot44O844Or44GV44Gb44KL44Gf44KB44Gr55So44GE44KLXG4gICAqL1xuICBfdGltZVRyYXZlbCAoJHByZXZDb250ZW50LCAkbmV4dENvbnRlbnQsIGZuKSB7XG4gICAgJHByZXZDb250ZW50LmNzcygnZGlzcGxheScsICdub25lJylcbiAgICAkbmV4dENvbnRlbnQuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJylcblxuICAgIGZuKClcblxuICAgICRwcmV2Q29udGVudC5hZGQoJG5leHRDb250ZW50KVxuICAgICAgLmNzcygnZGlzcGxheScsICcnKVxuICB9XG5cbiAgLyoqXG4gICAqIOOCouOCs+ODvOODh+OCo+OCquODs+OCkuWLleOBi+OBl+OBn+mam+OAgeOCteOCpOODieODiuODk+OBruWbuuWumuihqOekuuOBjOW0qeOCjOOCi+OBk+OBqOOBjOOBguOCi+OAguOBneOBruWvvuetluOAgiAjODIzXG4gICAqL1xuICBhbmltYXRpbmcgKCkge1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3Njcm9sbCcpXG4gICAgaWYgKHRoaXMuaXNBbmltYXRpbmcpIHtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hbmltYXRpbmcoKSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NvcmRpb25WTSDjga7nsKHmmJPniYjjgILnibnjgavnibnliKXjgarjgZPjgajjga/jgZvjgZrjgIHmjpLku5bnmoTjgavli5XjgY/jgqLjgrPjg7zjg4fjgqPjgqrjg7PjgYzjgbvjgZfjgYTmmYLjga/jgZPjgaHjgonjgpLkvb/jgYbjgILoqbPntLDjgaroqqzmmI7jga8ge0BsaW5rIEFjY29yZGlvblZNfVxuICpcbiAqIFNpbXBsaWZpZWQgdmVyc2lvbiBvZiBBY2NvcmRpb25WTS4gSWYgeW91IHdhbnQganVzdCBhbiBhY2NvcmRpb24gdGhhdCBkb2VzIG5vdCBkbyBzcGVjaWFsIHRoaW5nLiBEZXRhaWxzIHtAbGluayBBY2NvcmRpb25WTX1cbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gd3JhcHBlciBlbGVtZW50IG9mIGFjY29yZGlvblxuICogY29uc3QgJG5hdiA9ICQoJyNqcy1uYXYnKVxuICpcbiAqIGFjY29yZGlvbigkbmF2LCB7XG4gKiAgIC8vIGxpbmsgb3IgYnV0dG9uIGVsZW1lbnQgdGhhdCB0b2dnbGVzIGFuIGFjY29yZGlvblxuICogICBhbmNob3I6ICcuanMtYWNjb3JkaW9uX2FuY2hvcicsXG4gKiAgIC8vIGNvbnRlbnQgb2YgYWNjb3JkaW9uXG4gKiAgIGNvbnRlbnQ6ICcuanMtYWNjb3JkaW9uX2NvbnRlbnQnXG4gKiB9KVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWNjb3JkaW9uICgkd3JhcHBlciwgb3B0aW9ucykge1xuICBjb25zdCB2bSA9IG5ldyBBY2NvcmRpb25WTSgkd3JhcHBlciwgb3B0aW9ucylcblxuICB2bS5vbignc2VsZWN0JywgaW5kZXggPT4gdm0uc2VsZWN0KGluZGV4KSlcbiAgdm0ub24oJ2Rlc2VsZWN0JywgKCkgPT4gdm0uc2VsZWN0KG51bGwpKVxuXG4gIHJldHVybiB2bVxufVxuXG4vKipcbiAqIOOCouOCs+ODvOODh+OCo+OCquODs+acieWKueWMllxuICpcbiAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtBY2NvcmRpb25WTX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZUFjY29yZGlvbiAoJGVsLCBvcHRpb25zKSB7XG4gIGNvbnN0IGZvclNQID0gJGVsLmF0dHIoJ2RhdGEtYWNjb3JkaW9uLXNwJykgPT09ICd0cnVlJ1xuICBjb25zdCBkaXNhYmxlU2Nyb2xsID0gJGVsLmF0dHIoJ2RhdGEtYWNjb3JkaW9uLWRpc2FibGUtc2Nyb2xsJykgPT09ICd0cnVlJ1xuXG4gIGNvbnN0IGZpbmFsT3B0aW9ucyA9IGFzc2lnbih7XG4gICAgY29udGVudDogJy5qcy1hY2NvcmRpb25fY29udGVudCcsXG4gICAgYW5jaG9yOiAnLmpzLWFjY29yZGlvbl9hbmNob3InLFxuICAgIG9wZW5MYWJlbEF0dHI6ICdkYXRhLWFjY29yZGlvbi1vcGVuLWxhYmVsJyxcbiAgICBjbG9zZUxhYmVsQXR0cjogJ2RhdGEtYWNjb3JkaW9uLWNsb3NlLWxhYmVsJyxcbiAgICBkaXNhYmxlU2Nyb2xsXG4gIH0sIG9wdGlvbnMgfHwge30pXG5cbiAgY29uc3Qgdm0gPSBhY2NvcmRpb24oJGVsLCBmaW5hbE9wdGlvbnMpXG5cbiAgY29uc3Qgc2V0TGFiZWwgPSAoJGFuY2hvciwgJGNvbnRlbnQsIGF0dHIpID0+IHtcbiAgICAkYW5jaG9yXG4gICAgICAuYWRkKCRjb250ZW50KVxuICAgICAgLmZpbmQoYFske2F0dHJ9XWApXG4gICAgICAuYWRkQmFjayhgWyR7YXR0cn1dYClcbiAgICAgIC5lYWNoKChpLCBsYWJlbCkgPT4ge1xuICAgICAgICBjb25zdCAkbGFiZWwgPSAkKGxhYmVsKVxuICAgICAgICBjb25zdCB0ZXh0ID0gJGxhYmVsLmF0dHIoYXR0cilcbiAgICAgICAgJGxhYmVsLnRleHQodGV4dClcbiAgICAgIH0pXG4gIH1cblxuICB2bS5vbignYmVmb3JlT3BlbicsIGluZGV4ID0+IHtcbiAgICBjb25zdCBhdHRyID0gZmluYWxPcHRpb25zLmNsb3NlTGFiZWxBdHRyXG4gICAgY29uc3QgJGFuY2hvciA9ICRlbC5maW5kKGZpbmFsT3B0aW9ucy5hbmNob3IpLmVxKGluZGV4KVxuICAgIGNvbnN0ICRjb250ZW50ID0gJGVsLmZpbmQoZmluYWxPcHRpb25zLmNvbnRlbnQpLmVxKGluZGV4KVxuXG4gICAgc2V0TGFiZWwoJGFuY2hvciwgJGNvbnRlbnQsIGF0dHIpXG4gIH0pXG5cbiAgdm0ub24oJ2JlZm9yZUNsb3NlJywgaW5kZXggPT4ge1xuICAgIGNvbnN0IGF0dHIgPSBmaW5hbE9wdGlvbnMub3BlbkxhYmVsQXR0clxuICAgIGNvbnN0ICRhbmNob3IgPSAkZWwuZmluZChmaW5hbE9wdGlvbnMuYW5jaG9yKS5lcShpbmRleClcbiAgICBjb25zdCAkY29udGVudCA9ICRlbC5maW5kKGZpbmFsT3B0aW9ucy5jb250ZW50KS5lcShpbmRleClcblxuICAgIHNldExhYmVsKCRhbmNob3IsICRjb250ZW50LCBhdHRyKVxuICB9KVxuXG4gIGlmIChmb3JTUCkge1xuICAgIG9uQ2hhbmdlTGF5b3V0KHtcbiAgICAgIHBjOiAoKSA9PiB2bS5kaXNhYmxlKCksXG4gICAgICBzcDogKCkgPT4gdm0uZW5hYmxlKClcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHZtXG59XG5cbi8qKlxuICog44Ki44Kz44O844OH44Kj44Kq44Oz5pyJ5Yq55YyW77yI5YWo6KaB57Sg77yJXG4gKlxuICogQHBhcmFtIHtqUXVlcnl9ICRjb250ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVBbGxBY2NvcmRpb24gKCRjb250ZXh0KSB7XG4gICQoJy5qcy1hY2NvcmRpb24nLCAkY29udGV4dCkuZWFjaCgoaSwgZWwpID0+IHtcbiAgICBlbmFibGVBY2NvcmRpb24oJChlbCkpXG4gIH0pXG59XG4iLCJpbXBvcnQgJCBmcm9tICdqcXVlcnknXG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgRE9NIOaTjeS9nFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4vKipcbiAqIGZvckVhY2gg44GM5L2/44GI44KLIGVsZW1lbnRzIOOCkuWPluW+l+OBmeOCi1xuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIC0g44Kr44Oz44Oe44Gn5Yy65YiH44KJ44KM44Gf44Gy44Go44Gk5Lul5LiK44GuIENTUyDjgrvjg6zjgq/jgr/jgrDjg6vjg7zjg5fmloflrZfliJcgKHF1ZXJ5U2VsZWN0b3JBbGwg44Gu5byV5pWw44Go5ZCM44GYKVxuICogQHBhcmFtIHtFbGVtZW50fSBjb250ZXh0IC0g44GT44GuIGVsZW1lbnQg44Gu5Lit44Gu6KaB57Sg44Gg44GR44KS5a++6LGh44Go44GZ44KLXG4gKiBAcmV0dXJuIHtFbGVtZW50W119IGBzZWxlY3RvcmAg44Gr44Oe44OD44OB44GX44GfIGVsZW1lbnQg44Gu6YWN5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50cyAoc2VsZWN0b3IsIGNvbnRleHQgPSBkb2N1bWVudCkge1xuICBjb25zdCBub2RlTGlzdCA9IGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgcmV0dXJuIG5vZGVMaXN0ID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZUxpc3QsIDApIDogW11cbn1cblxuLyoqXG4gKiBqUXVlcnkg44GL44KJIERPTSDjgavlpInmj5tcbiAqIEBwYXJhbSB7SlF1ZXJ5fSAkZWxzXG4gKiBAcmV0dXJuIHtFbGVtZW50W119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0RvbSAoJGVscykge1xuICByZXR1cm4gJGVscy5nZXQoKVxufVxuXG4vKipcbiAqIERPTSDjgYvjgokgalF1ZXJ5IOOBq+WkieaPm1xuICogQHBhcmFtIHtFbGVtZW50W119IGVsc1xuICogQHJldHVybiB7SlF1ZXJ5fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9KUXVlcnkgKGVscykge1xuICByZXR1cm4gZWxzLnJlZHVjZSgoYWNjLCBlbCkgPT4ge1xuICAgIHJldHVybiBhY2MuYWRkKGVsKVxuICB9LCAkKCkpXG59XG5cbi8qKlxuICogalF1ZXJ5IOOCquODluOCuOOCp+OCr+ODiOOBi+OBqeOBhuOBi+OCkuWIpOWIpeOBmeOCi1xuICogaHR0cDovL2FwaS5qcXVlcnkuY29tL2pxdWVyeS0yL1xuICogQHBhcmFtIHthbnl9IGVsXG4gKiBAcmV0dXJuIHtib29sZWFufSBqUXVlcnkg44Kq44OW44K444Kn44Kv44OI44Gq44KJIHRydWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSlF1ZXJ5IChlbCkge1xuICByZXR1cm4gdHlwZW9mIGVsLmpxdWVyeSA9PT0gJ3N0cmluZydcbn1cbiIsImltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCB7IGlzSlF1ZXJ5LCB0b0pRdWVyeSB9IGZyb20gJy4vX2RvbSdcblxuLyoqXG4gKiDpq5jjgZXjgpLmj4PjgYjjgovjgZ/jgoHjga7jgqrjg5bjgrjjgqfjgq/jg4hcbiAqL1xuZXhwb3J0IGNsYXNzIEhlaWdodEFycmFuZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxzIC0g6auY44GV44KS5o+D44GI44KL5a++6LGh44Gu6KaB57SgXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoJGVscykge1xuICAgIHRoaXMuZWxzID0gJGVscy5nZXQoKS5tYXAoZWwgPT4gJChlbCkpXG4gIH1cblxuICAvKipcbiAgICog6auY44GV5o+D44GI44KS44Oq44K744OD44OI44GZ44KLXG4gICAqL1xuICByZXNldCAoKSB7XG4gICAgdGhpcy5fdG9KUXVlcnkodGhpcy5lbHMpLmNzcygnaGVpZ2h0JywgJycpXG4gIH1cblxuICAvKipcbiAgICog6auY44GV44KS5o+D44GI44KL5a++6LGh44Gu6KaB57Sg44KS5beu44GX5pu/44GI44KLXG4gICAqIEBwYXJhbXMge0VsZW1lbnRbXX0gZWxzXG4gICAqL1xuICByZXBsYWNlRWxlbWVudHMgKGVscykge1xuICAgIHRoaXMuZWxzID0gZWxzLm1hcChlbCA9PiAkKGVsKSlcbiAgfVxuXG4gIC8qKlxuICAgKiDpq5jjgZXmj4PjgYjjgpLlho3oqIjnrpfjgZnjgotcbiAgICovXG4gIGFycmFuZ2UgKCkge1xuICAgIHRoaXMucmVzZXQoKVxuICAgIHRoaXMuX2FycmFuZ2VJbXBsKHRoaXMuZWxzKVxuICB9XG5cbiAgX2FycmFuZ2VJbXBsIChlbHMpIHtcbiAgICBpZiAoZWxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgICBlbHMgPSB0aGlzLl9zb3J0QnlUb3AoZWxzKVxuXG4gICAgY29uc3QgYWNjID0gW2Vsc1swXV1cbiAgICBjb25zdCB0b3AgPSBhY2NbMF0ub2Zmc2V0KCkudG9wXG5cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGVscy5sZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgJG5leHQgPSBlbHNbaV1cbiAgICAgIGlmICh0b3AgIT09ICRuZXh0Lm9mZnNldCgpLnRvcCkgYnJlYWtcblxuICAgICAgYWNjLnB1c2goJG5leHQpXG4gICAgfVxuXG4gICAgLy8g6KaB57Sg44GMMuOBpOS7peS4iuOBruaZguOBr+mrmOOBleOCkuaMh+WumuOBmeOCi1xuICAgIGlmIChhY2MubGVuZ3RoID4gMSkge1xuICAgICAgY29uc3QgaGVpZ2h0cyA9IGFjYy5tYXAoJGVsID0+IHBhcnNlRmxvYXQoJGVsLmNzcygnaGVpZ2h0JyksIDEwKSlcbiAgICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgubWF4KC4uLmhlaWdodHMpXG4gICAgICB0aGlzLl90b0pRdWVyeShhY2MpLmNzcygnaGVpZ2h0JywgbWF4SGVpZ2h0ICsgJ3B4JylcbiAgICB9XG5cbiAgICB0aGlzLl9hcnJhbmdlSW1wbChlbHMuc2xpY2UoYWNjLmxlbmd0aCkpXG4gIH1cblxuICBfc29ydEJ5VG9wIChlbHMpIHtcbiAgICByZXR1cm4gZWxzXG4gICAgICAubWFwKCRlbCA9PiAoe1xuICAgICAgICAkZWwsXG4gICAgICAgIHRvcDogJGVsLm9mZnNldCgpLnRvcFxuICAgICAgfSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS50b3AgLSBiLnRvcClcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0uJGVsKVxuICB9XG5cbiAgX3RvSlF1ZXJ5IChhcnIpIHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZSgoYWNjLCBlbCkgPT4gYWNjLmFkZChlbCksICQoKSlcbiAgfVxufVxuXG4vKipcbiAqIOaMh+WumuOBl+OBnyBzZWxlY3RvciDjgYvjgonlj5blvpfjgafjgY3jgovopoHntKDjgavjgaTjgYTjgaZcbiAqIDAuIHRvcCDjga7kvY7jgYTpoIbjgavopoHntKDjgpLjgr3jg7zjg4hcbiAqIDEuIOimgee0oOOBruWJjeOBruaWueOBi+OCiSB0b3Ag44GM5ZCM44GYIFkg6Lu45bqn5qiZ44Gu6KaB57Sg44KS5Y+W44KK5Ye644GZXG4gKiAyLiDjgrDjg6vjg7zjg5cgRyDlhoXjgafmnIDjgoLpq5jjgYTopoHntKDjga7pq5jjgZUgSCDjgpLlj5blvpfjgZnjgotcbiAqIDMuIEcg5YaF44Gu44GZ44G544Gm44Gu6KaB57Sg44Gu6auY44GV44KSIEgg44Gr44GZ44KLXG4gKiA0LiAwLTMg44KS6KaB57Sg44GM44Gq44GP44Gq44KL44G+44Gn57mw44KK6L+U44GZXG4gKlxuICogcmVzaXplVm0g44GM5rih44GV44KM44Gm44GE44KL5pmC44Gv44Oq44K144Kk44K644Gu55uj6KaW44KS6KGM44GGXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8RWxlbWVudFtdfEpRdWVyeX0gc2VsZWN0b3JPckVscyAtIOmrmOOBleOCkuaPg+OBiOOBn+OBhOimgee0oOOBruOCu+ODrOOCr+OCv+ODvOOAgeOBvuOBn+OBr+OAgURPTSDopoHntKBcbiAqIEBwYXJhbSB7UmVzaXplVk19IFtyZXNpemVWbV1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmFuZ2VIZWlnaHQgKHNlbGVjdG9yT3JFbHMsIHJlc2l6ZVZtKSB7XG4gIGxldCBhbGwgPSBzZWxlY3Rvck9yRWxzXG4gIGlmICh0eXBlb2YgYWxsID09PSAnc3RyaW5nJykge1xuICAgIGFsbCA9ICQoYWxsKVxuICB9IGVsc2UgaWYgKCFpc0pRdWVyeShhbGwpKSB7XG4gICAgYWxsID0gdG9KUXVlcnkoYWxsKVxuICB9XG5cbiAgY29uc3Qgdm0gPSBuZXcgSGVpZ2h0QXJyYW5nZXIoYWxsKVxuICB2bS5hcnJhbmdlKClcblxuICBpZiAocmVzaXplVm0pIHtcbiAgICByZXNpemVWbS5vbigncmVzaXplJywgKCkgPT4gdm0uYXJyYW5nZSgpKVxuICB9XG5cbiAgcmV0dXJuIHZtXG59XG4iLCJpbXBvcnQgJCBmcm9tICdqcXVlcnknXG5cbmltcG9ydCB7IHdhdGNoLCBpc1NQLCBvcGVuQXNOZXdUYWIgfSBmcm9tICcuL191dGlsaXR5J1xuaW1wb3J0IHsgYW5pbWF0ZUZhZGUgfSBmcm9tICcuL19hbmltYXRpb24nXG5cbi8qKlxuICog44Oi44O844OA44OrXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IG1vZGFsID0gbmV3IE1vZGFsVk0oJGJvZHkpXG4gKlxuICogbW9kYWwuc2hvdyhpZCkgLy8gaWQg44KS44OG44Oz44OX44Os44O844OI44Go44GX44Gm44Oi44O844OA44Or44KS6ZaL44GPXG4gKiBtb2RhbC5oaWRlKCkgLy8g6KGo56S644GV44KM44Gm44GE44KL44Oi44O844OA44Or44KS6Z2e6KGo56S644Gr44GZ44KL44CCXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2RhbFZNIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkYm9keSAtIEhUTUwg44GuIGJvZHkg6KaB57Sg44Gr57SQ44Gl44GPIGpRdWVyeSDjgqrjg5bjgrjjgqfjgq/jg4hcbiAgICovXG4gIGNvbnN0cnVjdG9yICgkYm9keSkge1xuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuJGJvZHkgPSAkYm9keVxuXG4gICAgY29uc3QgJGJhY2tkcm9wID0gJChcbiAgICAgICc8ZGl2IGNsYXNzPVwibW9kYWxfYmFja2Ryb3BcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2Rpdj4nXG4gICAgKS5hcHBlbmRUbygkYm9keSlcblxuICAgIGNvbnN0ICRtb2RhbCA9ICQoYFxuICAgIDxkaXYgY2xhc3M9XCJqcy1tb2RhbCBtb2RhbFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImpzLW1vZGFsX2NvbnRlbnQgbW9kYWxfY29udGVudFwiPjwvZGl2PlxuICAgIDwvZGl2PlxuICAgYClcblxuICAgIGNvbnN0ICRjbG9zZSA9ICQoXG4gICAgICAnPGJ1dHRvbiBjbGFzcz1cImpzLW1vZGFsX2Nsb3NlIG1vZGFsX2Nsb3NlXCIgYXJpYS1sYWJlbD1cIumWieOBmOOCi1wiPjwvYnV0dG9uPidcbiAgICApXG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICB0aGlzLmRhdGEgPSB7XG4gICAgICBzaG93aW5nSWQ6IG51bGwsXG4gICAgICBjbGFzc0xpc3Q6IFtdXG4gICAgfVxuXG4gICAgdGhpcy5iaW5kKHRoaXMuZGF0YSwgJGJhY2tkcm9wLCAkbW9kYWwsICRjbG9zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiDjg4fjg7zjgr/jgaggRE9NIOOCkue1kOOBs+OBpOOBkeOCi1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYmluZCAoZGF0YSwgJGJhY2tkcm9wLCAkbW9kYWwsICRjbG9zZSkge1xuICAgIGNvbnN0ICRjb250ZW50ID0gJG1vZGFsLmZpbmQoJy5qcy1tb2RhbF9jb250ZW50JylcbiAgICBjb25zdCB0ZW1wbGF0ZUNsYXNzID0gJ2pzLW1vZGFsX3RlbXBsYXRlJ1xuICAgIGNvbnN0IGJhc2ljQ29udGVudENsYXNzID0gWydqcy1tb2RhbF9jb250ZW50JywgJ21vZGFsX2NvbnRlbnQnXVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1tb2RhbCcsIGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT09ICRtb2RhbFswXSkgcmV0dXJuXG4gICAgICB0aGlzLmhpZGUoKVxuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzLW1vZGFsX2Nsb3NlJywgKCkgPT4ge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICog5oyH5a6a44GX44GfIElEIOOBruimgee0oOOBi+OCieODhuODs+ODl+ODrOODvOODiOOCkuWPluW+l+OBl+OAgeODouODvOODgOODq+OBruOCs+ODs+ODhuODs+ODhOOBq+OBmeOCi1xuICAgICAqIOODleOCp+ODvOODieOCpOODs+OBp+ODouODvOODgOODq+OCkuihqOekuuOBmeOCi+OAglxuICAgICAqIOOBvuOBn+OAgeODhuODs+ODl+ODrOODvOODiOOBruimgee0oOOBq+i/veWKoOOBruOCr+ODqeOCueOBjOaMh+WumuOBleOCjOOBpuOBhOOCi+WgtOWQiOOAgVxuICAgICAqIOOBneOCjOOCkuODouODvOODgOODq+OBruOCs+ODs+ODhuODs+ODhOimgee0oOOBq+ODnuODvOOCuOOBmeOCi+OAglxuICAgICAqIElEIOOBjOaMh+WumuOBleOCjOOBquOBi+OBo+OBn+WgtOWQiOOAgeODouODvOODgOODq+OCkumaoOOBmeOAglxuICAgICAqL1xuICAgIHdhdGNoKGRhdGEsICdzaG93aW5nSWQnLCBpZCA9PiB7XG4gICAgICAvLyDjg6Ljg7zjg4Djg6vjgpLplonjgZjjgZ/mmYJcbiAgICAgIGlmIChpZCA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmZhZGVPdXQoJGJhY2tkcm9wLCAkbW9kYWwpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCAkdGVtcGxhdGUgPSAkKCcjJyArIGlkKVxuICAgICAgaWYgKCR0ZW1wbGF0ZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gICAgICAvLyDjg4bjg7Pjg5fjg6zjg7zjg4jjga7ov73liqDjgq/jg6njgrnjgpLmir3lh7rjgZnjgotcbiAgICAgIGNvbnN0IGNsYXNzTGlzdCA9ICR0ZW1wbGF0ZVxuICAgICAgICAuYXR0cignY2xhc3MnKS5zcGxpdCgnICcpXG4gICAgICAgIC5maWx0ZXIodmFsdWUgPT4gdmFsdWUgIT09IHRlbXBsYXRlQ2xhc3MpXG4gICAgICB0aGlzLnNldENsYXNzTGlzdChjbGFzc0xpc3QpXG5cbiAgICAgIC8vIOWJjeOBruODouODvOODgOODq+OBruOCs+ODs+ODhuODs+ODhOOCkuWJiumZpFxuICAgICAgJGNvbnRlbnQuY2hpbGRyZW4oKS5yZW1vdmUoKVxuXG4gICAgICAvLyDmjIflrprjgZXjgozjgZ8gSUQg44Gu44Kz44Oz44OG44Oz44OE44KS44Kv44Ot44O844Oz44GX44Gm44Oi44O844OA44Or44Gr6L+95YqgXG4gICAgICAkY29udGVudFxuICAgICAgICAuYXBwZW5kKCRjbG9zZSlcbiAgICAgICAgLmFwcGVuZCgkdGVtcGxhdGUuY2xvbmUoKS5jaGlsZHJlbigpKVxuXG4gICAgICAvLyDooajnpLpcbiAgICAgIHRoaXMuZmFkZUluKCRiYWNrZHJvcCwgJG1vZGFsKVxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiDjg6Ljg7zjg4Djg6vjga7jgrPjg7Pjg4bjg7Pjg4Tpg6jliIbjgavjgq/jg6njgrnjgpLov73liqDjgZnjgotcbiAgICAgKi9cbiAgICB3YXRjaChkYXRhLCAnY2xhc3NMaXN0JywgbGlzdCA9PiB7XG4gICAgICBjb25zdCBjbGFzc0xpc3QgPSBiYXNpY0NvbnRlbnRDbGFzcy5jb25jYXQobGlzdClcbiAgICAgICRjb250ZW50LmF0dHIoJ2NsYXNzJywgY2xhc3NMaXN0LmpvaW4oJyAnKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGZhZGVJbiAoJGJhY2tkcm9wLCAkbW9kYWwpIHtcbiAgICBhbmltYXRlRmFkZSgkYmFja2Ryb3AsIHRydWUsIHtcbiAgICAgIGJlZm9yZTogKCkgPT4gJGJhY2tkcm9wLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcbiAgICB9KVxuICAgIGFuaW1hdGVGYWRlKCRtb2RhbCwgdHJ1ZSwge1xuICAgICAgYmVmb3JlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJldmVudFNjcm9sbCgpXG4gICAgICAgIHRoaXMuJGJvZHkuYXBwZW5kKCRtb2RhbClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGZhZGVPdXQgKCRiYWNrZHJvcCwgJG1vZGFsKSB7XG4gICAgYW5pbWF0ZUZhZGUoJGJhY2tkcm9wLCBmYWxzZSwge1xuICAgICAgYWZ0ZXI6ICgpID0+ICRiYWNrZHJvcC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICB9KVxuICAgIGFuaW1hdGVGYWRlKCRtb2RhbCwgZmFsc2UsIHtcbiAgICAgIGFmdGVyOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuYWxsb3dTY3JvbGwoKVxuICAgICAgICAkbW9kYWwucmVtb3ZlKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIGh0bWwg5pys5paH44Gu44K544Kv44Ot44O844Or44KS5oqR5Yi244GZ44KLXG4gICAqIOOCueOCr+ODreODvOODq+ODkOODvOOBjOa2iOOBiOOBn+WIhuaoquOBq+OBmuOCjOOCi+OBn+OCgeOAgXBhZGRpbmctcmlnaHQg44KS6L+95Yqg44GZ44KLXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcmV2ZW50U2Nyb2xsICgpIHtcbiAgICBjb25zdCAkaHRtbCA9ICQoJyNqcy1odG1sJylcbiAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gJGh0bWwud2lkdGgoKVxuICAgICRodG1sLmFkZENsYXNzKCdvLW1vZGFsX29wZW5lZCcpXG4gICAgICAuY3NzKCdwYWRkaW5nLXJpZ2h0Jywgc2Nyb2xsYmFyV2lkdGgpXG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgYWxsb3dTY3JvbGwgKCkge1xuICAgICQoJyNqcy1odG1sJylcbiAgICAgIC5yZW1vdmVDbGFzcygnby1tb2RhbF9vcGVuZWQnKVxuICAgICAgLmNzcygncGFkZGluZy1yaWdodCcsICcnKVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHNldENsYXNzTGlzdCAobGlzdCkge1xuICAgIHRoaXMuZGF0YS5jbGFzc0xpc3QgPSBsaXN0XG4gIH1cblxuICAvKipcbiAgICogaWQg44Gr55u45b2T44GZ44KL6KaB57Sg44KS44OG44Oz44OX44Os44O844OI44Go44GX44Gm44CB44Oi44O844OA44Or44KS6KGo56S644GZ44KL44CCXG4gICAqIOOBneOBruaZguOAgeOBneOBruODhuODs+ODl+ODrOODvOODiOOBq+S7mOS4juOBleOCjOOBnyBjbGFzcyDjgpIgbW9kYWxfY29udGVudCDjgavov73liqDjgZnjgotcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0g44Oi44O844OA44Or44Gu44OG44Oz44OX44Os44O844OI44GuIElEXG4gICAqL1xuICBzaG93IChpZCkge1xuICAgIC8vIGRhdGEtbW9kYWwtc3AtdXJsIOOBq+WApOOBjOOBguOCiuOAgVNQIOOBruaZguOAgVxuICAgIC8vIOODouODvOODgOODq+OBruS7o+OCj+OCiuOBq+OBneOBruWApOOBriBVUkwg44KS5paw6KaP44K/44OW44Gn6ZaL44GPXG4gICAgaWYgKGlzU1AoKSkge1xuICAgICAgY29uc3QgJHRlbXBsYXRlID0gJCgnIycgKyBpZClcbiAgICAgIGNvbnN0IHNwVVJMID0gJHRlbXBsYXRlLmF0dHIoJ2RhdGEtbW9kYWwtc3AtdXJsJylcbiAgICAgIGlmIChzcFVSTCkge1xuICAgICAgICBvcGVuQXNOZXdUYWIoc3BVUkwpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRhdGEuc2hvd2luZ0lkID0gaWRcbiAgfVxuXG4gIC8qKlxuICAgKiDooajnpLrjgZXjgozjgabjgYTjgovjg6Ljg7zjg4Djg6vjgpLpnZ7ooajnpLrjgavjgZnjgovjgIJcbiAgICovXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuZGF0YS5zaG93aW5nSWQgPSBudWxsXG4gIH1cbn1cblxuLyoqXG4gKiBIVE1MIOWGheOBq+WtmOWcqOOBmeOCi+OBmeOBueOBpuOBruODouODvOODgOODq+OCkuacieWKueWMluOBmeOCi1xuICogYC5qcy1tb2RhbF90cmlnZ2VyYCDjgYzku5jkuI7jgZXjgozjgabjgYTjgovopoHntKDjgYzlr77osaFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZUFsbE1vZGFsICgpIHtcbiAgY29uc3QgbW9kYWwgPSBuZXcgTW9kYWxWTSgkKCdib2R5JykpXG5cbiAgLy8gZGF0YS1tb2RhbC10ZW1wbGF0ZS1uZXh0IOOBjCB0cnVlIOOBruOBqOOBjeOAgXRyaWdnZXIg44Gu5qyh44Gu6KaB57Sg44KS44OG44Oz44OX44Os44O844OI44Go44GZ44KLXG4gIGxldCB1aWQgPSAwXG4gICQoJy5qcy1tb2RhbF90cmlnZ2VyW2RhdGEtbW9kYWwtdGVtcGxhdGUtbmV4dD1cInRydWVcIl0nKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgIGNvbnN0ICR0cmlnZ2VyID0gJChlbClcbiAgICBjb25zdCAkdGVtcGxhdGUgPSAkdHJpZ2dlci5uZXh0KClcblxuICAgIHVpZCArPSAxXG4gICAgY29uc3QgaWQgPSBganMtbW9kYWxfYXV0b19hc3NpZ25lZF9pZF8ke3VpZH1gXG4gICAgJHRyaWdnZXIuYXR0cignaHJlZicsICcjJyArIGlkKVxuICAgICR0ZW1wbGF0ZS5hdHRyKCdpZCcsIGlkKVxuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtbW9kYWxfdHJpZ2dlcicsIGV2ZW50ID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcblxuICAgIGNvbnN0IGlkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJylcbiAgICBpZiAoaWRbMF0gIT09ICcjJyB8fCBpZC5sZW5ndGggPD0gMSkgcmV0dXJuXG5cbiAgICBtb2RhbC5zaG93KGlkLnNsaWNlKDEpKVxuICB9KVxufVxuIiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnLi9fbW9kdWxlJ1xuaW1wb3J0IHsgZGVib3VuY2UgfSBmcm9tICcuL191dGlsaXR5J1xuXG4vKipcbiAqIOODquOCteOCpOOCuuOBruebo+imluOCkuihjOOBhlxuICovXG5leHBvcnQgY2xhc3MgUmVzaXplVk0gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlYm91bmNlTXMgLSByZXNpemUg44Kk44OZ44Oz44OI44KS6ZaT5byV44GP56eS5pWwXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoZGVib3VuY2VNcykge1xuICAgIHN1cGVyKClcblxuICAgIGNvbnN0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgdGhpcy50cmlnZ2VyKCdyZXNpemUnKVxuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXIgPSBkZWJvdW5jZU1zID8gZGVib3VuY2Uob25SZXNpemUsIGRlYm91bmNlTXMpIDogb25SZXNpemVcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmxpc3RlbmVyKVxuICB9XG5cbiAgLyoqXG4gICAqIOODquOCteOCpOOCuuOBruebo+imluOCkuOChOOCgeOCi1xuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMubGlzdGVuZXIpXG4gIH1cbn1cbiIsIi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9pbnRlciBldmVudFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBkZXZpY2VFdmVudHMgPSB7XG4gIFBvaW50ZXI6IHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQsXG4gIE1TUG9pbnRlcjogd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkLFxuICBUb3VjaDogdHlwZW9mIGRvY3VtZW50Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCdcbn1cblxuLyoqXG4gKiDjg4fjg5DjgqTjgrnjga7lr77lv5zjgqTjg5njg7Pjg4jjgavlv5zjgZjjgabkvb/nlKjjgZnjgovjgqTjg5njg7Pjg4jlkI3jgpLlrprnvqnjgZfjgZ/jgqrjg5bjgrjjgqfjgq/jg4hcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXZlbnRzLmNsaWNrIC0gYGNsaWNrYCDjgajlkIznrYnjga7jgqTjg5njg7Pjg4jlkI1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBldmVudHMuZG93biAtIGBtb3VzZWRvd25gIOOBqOWQjOetieOBruOCpOODmeODs+ODiOWQjVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGV2ZW50cy5tb3ZlIC0gYG1vdXNlbW92ZWAg44Go5ZCM562J44Gu44Kk44OZ44Oz44OI5ZCNXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXZlbnRzLnVwIC0gYG1vdXNldXBgIOOBqOWQjOetieOBruOCpOODmeODs+ODiOWQjVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGV2ZW50cy5lbnRlciAtIGBtb3VzZWVudGVyYCDjgajlkIznrYnjga7jgqTjg5njg7Pjg4jlkI1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBldmVudHMubGVhdmUgLSBgbW91c2VsZWF2ZWAg44Go5ZCM562J44Gu44Kk44OZ44Oz44OI5ZCNXG4gKi9cbmxldCBldmVudHMgPSB7XG4gIGNsaWNrOiAnY2xpY2snLFxuICBkb3duOiAnbW91c2Vkb3duJyxcbiAgbW92ZTogJ21vdXNlbW92ZScsXG4gIHVwOiAnbW91c2V1cCcsXG4gIGVudGVyOiAnbW91c2VlbnRlcicsXG4gIGxlYXZlOiAnbW91c2VsZWF2ZSdcbn1cbmlmIChkZXZpY2VFdmVudHMuUG9pbnRlcikge1xuICBldmVudHMgPSB7XG4gICAgY2xpY2s6ICdjbGljaycsXG4gICAgZG93bjogJ3BvaW50ZXJkb3duJyxcbiAgICBtb3ZlOiAncG9pbnRlcm1vdmUnLFxuICAgIHVwOiAncG9pbnRlcnVwJyxcbiAgICBlbnRlcjogJ3BvaW50ZXJlbnRlcicsXG4gICAgbGVhdmU6ICdwb2ludGVybGVhdmUnXG4gIH1cbn0gZWxzZSBpZiAoZGV2aWNlRXZlbnRzLk1TUG9pbnRlcikge1xuICBldmVudHMgPSB7XG4gICAgY2xpY2s6ICdjbGljaycsXG4gICAgZG93bjogJ01TUG9pbnRlckRvd24nLFxuICAgIG1vdmU6ICdNU1BvaW50ZXJNb3ZlJyxcbiAgICB1cDogJ01TUG9pbnRlclVwJyxcbiAgICBlbnRlcjogJ01TUG9pbnRlckVudGVyJyxcbiAgICBsZWF2ZTogJ01TUG9pbnRlckxlYXZlJ1xuICB9XG59IGVsc2UgaWYgKGRldmljZUV2ZW50cy5Ub3VjaCkge1xuICBldmVudHMgPSB7XG4gICAgY2xpY2s6ICdjbGljaycsXG4gICAgZG93bjogJ3RvdWNoc3RhcnQnLFxuICAgIG1vdmU6ICd0b3VjaG1vdmUnLFxuICAgIHVwOiAndG91Y2hlbmQnLFxuICAgIGVudGVyOiAndG91Y2hlbnRlcicsXG4gICAgbGVhdmU6ICd0b3VjaGxlYXZlJ1xuICB9XG59XG5leHBvcnQgeyBldmVudHMgfVxuXG4vKipcbiAqIGV2ZW50IOOBrui1t+OBjeOBn+eCueOBruOAgeOCr+ODqeOCpOOCouODs+ODiOWGheOBp+OBriBYLCBZIOW6p+aomeOCkuWPluW+l+OBmeOCi1xuICogQHBhcmFtIHtFdmVudH0gZSAtIGV2ZW50IG9iamVjdFxuICogQHJldHVybiB7e3g6IG51bWJlciwgeTogbnVtYmVyfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENsaWVudFBvcyAoZSkge1xuICBjb25zdCBlT2JqID0gZS5jaGFuZ2VkVG91Y2hlcyA/IGUuY2hhbmdlZFRvdWNoZXNbMF0gOiBlXG5cbiAgcmV0dXJuIHtcbiAgICB4OiBlT2JqLmNsaWVudFgsXG4gICAgeTogZU9iai5jbGllbnRZXG4gIH1cbn1cbiIsIi8qKlxuICogS2V5Ym9hcmRFdmVudC5rZXlDb2RlIOOBruWApFxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBLRVlfQ09ERS5MRUZUIC0g4oaSXG4gKiBAcHJvcGVydHkge251bWJlcn0gS0VZX0NPREUuVVAgLSDihpFcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBLRVlfQ09ERS5SSUdIVCAtIOKGkFxuICogQHByb3BlcnR5IHtudW1iZXJ9IEtFWV9DT0RFLkRPV04gLSDihpNcbiAqL1xuZXhwb3J0IGNvbnN0IEtFWV9DT0RFID0ge1xuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwXG59XG4iLCJpbXBvcnQgJCBmcm9tICdqcXVlcnknXHJcblxyXG5pbXBvcnQgeyBlbmFibGVTbW9vdGhTY3JvbGwgfSBmcm9tICdAb3JvL3N0YXRpYy1zaXRlLW1vZHVsZXMnXHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIERvY3VtZW50IFJlYWR5XHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcbiQoKCkgPT4ge1xyXG4gIC8vIOOCueODoOODvOOCueOCueOCr+ODreODvOODq1xyXG4gIGVuYWJsZVNtb290aFNjcm9sbCgpXHJcblxyXG4gIC8vIOODmOODg+ODgOODvCBhY2NvcmRpb24g44Oh44OL44Ol44O8XHJcbiAgY29uc3QgJGdsb2JhbE5hdiA9ICQoJy5qcy1nbG9iYWxfbmF2JylcclxuICBjb25zdCB0cmFuc2l0aW9uRGVsYXkgPSAyMDBcclxuICBjb25zdCAkaGFtYnVyZ2VyQnV0dG9uID0gJCgnLmpzLWhlYWRlcl9hY2NvcmRpb24nKVxyXG5cclxuICBjb25zdCBhY3RpdmF0ZUFjY29yZGlvbiA9ICgpID0+IHtcclxuICAgICRnbG9iYWxOYXYuYWRkQ2xhc3MoJ28tYWN0aXZhdGluZycpXHJcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ28tYm9keV9tb2RhbCcpXHJcbiAgICAkaGFtYnVyZ2VyQnV0dG9uLmFkZENsYXNzKCdvLWFjdGl2YXRlZCcpXHJcbiAgICAkaGFtYnVyZ2VyQnV0dG9uLmZpbmQoJy5qcy1idXR0b25fdGV4dCcpLmh0bWwoJ2Nsb3NlJylcclxuXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgJGdsb2JhbE5hdi5hZGRDbGFzcygnby1hY3RpdmF0ZWQnKVxyXG4gICAgfSwgMClcclxuICB9XHJcblxyXG4gIGNvbnN0IGRlYWN0aXZhdGVBY2NvcmRpb24gPSAoKSA9PiB7XHJcbiAgICAkZ2xvYmFsTmF2LnJlbW92ZUNsYXNzKCdvLWFjdGl2YXRlZCcpXHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ28tYm9keV9tb2RhbCcpXHJcbiAgICAkaGFtYnVyZ2VyQnV0dG9uLnJlbW92ZUNsYXNzKCdvLWFjdGl2YXRlZCcpXHJcbiAgICAkaGFtYnVyZ2VyQnV0dG9uLmZpbmQoJy5qcy1idXR0b25fdGV4dCcpLmh0bWwoJ21lbnUnKVxyXG5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAkZ2xvYmFsTmF2LnJlbW92ZUNsYXNzKCdvLWFjdGl2YXRpbmcnKVxyXG4gICAgfSwgdHJhbnNpdGlvbkRlbGF5KVxyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9nZ2xlQWNjb3JkaW9uID0gKCkgPT4ge1xyXG4gICAgaWYgKCRnbG9iYWxOYXYuaGFzQ2xhc3MoJ28tYWN0aXZhdGVkJykpIHtcclxuICAgICAgZGVhY3RpdmF0ZUFjY29yZGlvbigpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhY3RpdmF0ZUFjY29yZGlvbigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkaGFtYnVyZ2VyQnV0dG9uLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgdG9nZ2xlQWNjb3JkaW9uKClcclxuICB9KVxyXG5cclxuICAkKCcuanMtZ2xvYmFsX25hdicpLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLWdsb2JhbF9uYXYnKSkge1xyXG4gICAgICB0b2dnbGVBY2NvcmRpb24oKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIC8vIOODmOODg+ODgOODvCDjgrXjgqTjg4jlhoXmpJzntKLjgqjjg6rjgqLjga7plovplolcclxuICBjb25zdCAkc2VhcmNoQXJlYSA9ICQoJy5qcy1oZWFkZXJfc2VhcmNoJylcclxuXHJcbiAgY29uc3QgdG9nZ2xlU2VhcmNoQXJlYSA9ICgpID0+IHtcclxuICAgIGlmICgkc2VhcmNoQXJlYS5oYXNDbGFzcygnby1hY3RpdmF0ZWQnKSkge1xyXG4gICAgICAkKCcuanMtaGVhZGVyX3NlYXJjaF9hY2NvcmRpb24nKS5yZW1vdmVDbGFzcygnby1hY3RpdmF0ZWQnKVxyXG4gICAgICAkc2VhcmNoQXJlYS5yZW1vdmVDbGFzcygnby1hY3RpdmF0ZWQnKVxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAkc2VhcmNoQXJlYS5yZW1vdmVDbGFzcygnby1hY3RpdmF0aW5nJylcclxuICAgICAgfSwgdHJhbnNpdGlvbkRlbGF5KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCgnLmpzLWhlYWRlcl9zZWFyY2hfYWNjb3JkaW9uJykuYWRkQ2xhc3MoJ28tYWN0aXZhdGVkJylcclxuICAgICAgJHNlYXJjaEFyZWEuYWRkQ2xhc3MoJ28tYWN0aXZhdGluZycpXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICRzZWFyY2hBcmVhLmFkZENsYXNzKCdvLWFjdGl2YXRlZCcpXHJcbiAgICAgIH0sIDApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkKCcuanMtaGVhZGVyX3NlYXJjaF9hY2NvcmRpb24nKS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgIHRvZ2dsZVNlYXJjaEFyZWEoKVxyXG4gIH0pXHJcblxyXG4gICQoJy5qcy1zZWFyY2hfZmlsbScpLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgdG9nZ2xlU2VhcmNoQXJlYSgpXHJcbiAgfSlcclxuXHJcbiAgJCgnLmpzLXNlYXJjaF9oaWRlJykub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICB0b2dnbGVTZWFyY2hBcmVhKClcclxuICB9KVxyXG5cclxuICAvLyDjg4jjg4Pjg5fjgbjmiLvjgovjg5zjgr/jg7Pjga7liLblvqFcclxuXHJcbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KVxyXG4gIGxldCBoaWRlRmxhZyA9IHRydWVcclxuICBjb25zdCB0b1RvcEJ1dHRvbiA9ICQoJy5wYWdlX3RvcCcpXHJcbiAgY29uc3Qgc2Nyb2xsVGhyZXNob2xkID0gNTAwXHJcbiAgbGV0IGJvZHlIZWlnaHRcclxuICBsZXQgZml4ZWRUaHJlc2hvbGQgPSB3aW5kb3cuaW5uZXJXaWR0aCA+IDc2OCA/IDExNiA6IDIxNlxyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICBib2R5SGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHRcclxuICAgIGZpeGVkVGhyZXNob2xkID0gd2luZG93LmlubmVyV2lkdGggPiA3NjggPyAxMTYgOiAyMTZcclxuICB9KVxyXG5cclxuICAkd2luZG93Lm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICBib2R5SGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHRcclxuICAgIGZpeGVkVGhyZXNob2xkID0gd2luZG93LmlubmVyV2lkdGggPiA3NjggPyAxMTYgOiAyMTZcclxuICB9KVxyXG5cclxuICAkd2luZG93Lm9uKCdzY3JvbGwnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBzY3JvbGxUb3AgPSAkd2luZG93LnNjcm9sbFRvcCgpXHJcbiAgICAvLyBJRSDjgacg44Os44K344OU5LiA6Kan44Oa44O844K444Gn44Gu5LiN5YW35ZCI44KS5raI44GZXHJcbiAgICBib2R5SGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICBjb25zdCBkaXN0YW5jZVRvQm90dG9tID0gYm9keUhlaWdodCAtIHNjcm9sbFRvcCAtIHdpbmRvdy5pbm5lckhlaWdodFxyXG5cclxuICAgIGlmIChoaWRlRmxhZyAmJiBzY3JvbGxUb3AgPiBzY3JvbGxUaHJlc2hvbGQpIHtcclxuICAgICAgdG9Ub3BCdXR0b24uY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMSknKVxyXG4gICAgICBoaWRlRmxhZyA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFoaWRlRmxhZyAmJiBzY3JvbGxUb3AgPCBzY3JvbGxUaHJlc2hvbGQpIHtcclxuICAgICAgdG9Ub3BCdXR0b24uY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMCknKVxyXG4gICAgICBoaWRlRmxhZyA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGlzdGFuY2VUb0JvdHRvbSA8IGZpeGVkVGhyZXNob2xkKSB7XHJcbiAgICAgIHRvVG9wQnV0dG9uLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKVxyXG4gICAgICB0b1RvcEJ1dHRvbi5jc3MoJ2JvdHRvbScsIGAke2ZpeGVkVGhyZXNob2xkICsgMzB9cHhgKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdG9Ub3BCdXR0b24uY3NzKCdwb3NpdGlvbicsICdmaXhlZCcpXHJcbiAgICAgIHRvVG9wQnV0dG9uLmNzcygnYm90dG9tJywgJzMwcHgnKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIC8vIC5qcy1uZXdfcGlja2VyIOOBq+aWsOOBl+OBhOaWh+abuOOBp+OBguOCi+OBi+OBqeOBhuOBi+aknOWHuuOBl+OBpiBvLW5ld19hcnRpY2xlIOOCkuOBpOOBkeOCi1xyXG4gIGNvbnN0IGRhdGVOb3cgPSBuZXcgRGF0ZSgpXHJcbiAgY29uc3QgZGF0ZU1pbGxpc2Vjb25kcyA9IGRhdGVOb3cuZ2V0VGltZSgpXHJcbiAgY29uc3Qgb25lV2Vla01pbGxpc2Vjb25kcyA9IDYwNDgwMDAwMFxyXG5cclxuICAkKCcuanMtbmV3X3BpY2tlcicpLmVhY2goKGtleSwgaXRlbSkgPT4ge1xyXG4gICAgY29uc3QgYXJ0aWNsZUlPU0RhdGUgPSAkKGl0ZW0pLmF0dHIoJ2RhdGEtZGF0ZScpXHJcblxyXG4gICAgLy8g5q2j44GX44GE5pel44Gk44GR44GY44KD44Gq44GL44Gj44Gf44KJIHJldHVyblxyXG4gICAgaWYgKCFhcnRpY2xlSU9TRGF0ZSkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGNvbnN0IGFydGljbGVUaW1lID0gbmV3IERhdGUoYXJ0aWNsZUlPU0RhdGUpXHJcbiAgICBpZiAoZGF0ZU1pbGxpc2Vjb25kcyAtIGFydGljbGVUaW1lIDwgb25lV2Vla01pbGxpc2Vjb25kcykge1xyXG4gICAgICAkKGl0ZW0pLmFkZENsYXNzKCdvLW5ld19hcnRpY2xlJylcclxuICAgIH1cclxuICB9KVxyXG59KVxyXG4iXSwibmFtZXMiOlsiY29uc3QiLCJsZXQiLCJzdXBlciIsInRoaXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBQSxJQUFNLFVBQVUsR0FBRyxJQUFHO0FBQ3RCQSxJQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsRUFBQzs7Ozs7QUFLaEMsQUFBT0EsSUFBTSxJQUFJLGVBQU0sR0FBSzs7O0FBRzVCLEFBQU9BLElBQU0sR0FBRyxlQUFNLFNBQUcsUUFBSTs7Ozs7OztBQU83QixBQUFPLFNBQVMsd0JBQXdCLEVBQUUsS0FBSyxFQUFFO0VBQy9DLE9BQU8sU0FBUyxrQkFBa0IsSUFBSTtJQUNwQyxPQUFPLE1BQU0sQ0FBQyxVQUFVLDhCQUEyQixLQUFLLFVBQU0sQ0FBQyxPQUFPO0dBQ3ZFO0NBQ0Y7Ozs7OztBQU1ELEFBQU9BLElBQU0sSUFBSSxHQUFHLHdCQUF3QixDQUFDLFNBQVMsRUFBQzs7Ozs7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
