import $ from 'jquery'

window.onload = function () {
  let filterCategory = document.querySelectorAll('.filter_radio_label')
  let filterList = document.querySelectorAll('.filter_product')
  let pagination = document.querySelector('.pagination')
  let currentPage = document.querySelector('.o-current')
  let totalPage = document.querySelector('.o-total')
  let prev = document.querySelector('.o-prev')
  let next = document.querySelector('.o-next')
  let max = 10
  let page = 1

  // カテゴリボタンをクリックして、ページネーションとフィルタを初期化する
  for (let i = 0; i < filterCategory.length; i++) {
    filterCategory[i].onchange = function () {
      page = 1
      currentPage.innerHTML = 1
      next.classList.add('o-next')
      prev.classList.remove('o-prev')
      filterModule(this.children[0].getAttribute('value'))
      showModule(this.children[0].getAttribute('value'))
      smoothScrollToTop()
    }
  }

  // 複数ボタンのカレント状態同期設定
  function filterModule (ele) {
    for (let i = 0; i < filterCategory.length; i++) {
      filterCategory[i].children[0].removeAttribute('checked')
      if (ele === filterCategory[i].children[0].getAttribute('value')) {
        filterCategory[i].children[0].checked = 'true'
        filterCategory[i].children[0].setAttribute('checked', 'checked')
      }
    }
  }

  // ページネーションとフィルタ機能
  function showModule (ele) {
    let num = 0
    for (let i = 0; i < filterList.length; i++) {
      if (ele === undefined || ele === 'all') {
        num++
        if (num >= page * max - (max - 1) && num <= page * max) {
          filterList[i].classList.add('o-show')
        } else {
          filterList[i].classList.remove('o-show')
        }
      } else {
        filterList[i].classList.remove('o-show')
        if (filterList[i].getAttribute('data-category').indexOf(ele) > -1) {
          num++
          if (num >= page * max - (max - 1) && num <= page * max) {
            filterList[i].classList.add('o-show')
          } else {
            filterList[i].classList.remove('o-show')
          }
        }
      }
    }

    if (num > max) {
      pagination.classList.remove('o-hide')
      totalPage.innerHTML = Math.ceil(num / max)
    } else {
      pagination.classList.add('o-hide')
    }
  }
  showModule()

  // 次のページの表示機能
  function nextModule () {
    if (next.classList.contains('o-next')) {
      currentPage.innerHTML++
      if (currentPage.innerHTML === totalPage.innerHTML) {
        next.classList.remove('o-next')
      }
      if (Number(currentPage) !== 1) {
        prev.classList.add('o-prev')
      }
    }
  }

  //  ボタンをクリックすると、次のページを表示する
  next.addEventListener('click', function () {
    if (next.classList.contains('o-next')) {
      nextModule()
      page++
      if (page !== totalPage.innerHTML) {
        for (let i = 0; i < filterCategory.length; i++) {
          if (filterCategory[i].children[0].hasAttribute('checked')) {
            showModule(filterCategory[i].children[0].getAttribute('value'))
          }
        }
      }
      smoothScrollToTop()
    }
  })
  nextModule()

  // 前のページの表示機能
  function prevModule () {
    if (prev.classList.contains('o-prev')) {
      currentPage.innerHTML--
      if (Number(currentPage.innerHTML) === 1) {
        prev.classList.remove('o-prev')
      }
      if (Number(currentPage) !== 1) {
        next.classList.add('o-next')
      }
    }
  }

  //  ボタンをクリックすると、前のページを表示する
  prev.addEventListener('click', function () {
    if (prev.classList.contains('o-prev')) {
      prevModule()
      page--
      for (let i = 0; i < filterCategory.length; i++) {
        if (filterCategory[i].children[0].hasAttribute('checked')) {
          showModule(filterCategory[i].children[0].getAttribute('value'))
        }
      }
      smoothScrollToTop()
    }
  })
  prevModule()

  // スムーズスクロール
  function smoothScrollToTop () {
    let target = $('.article_main')
    let offsetTop = target.offset().top
    $('html,body').animate({
      scrollTop: offsetTop
    }, 500)
    return false
  }
}
