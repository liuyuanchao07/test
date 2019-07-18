import $ from 'jquery'

window.addEventListener('load', () => {
  const navItem = document.querySelectorAll('.recipe_nav_list_item')
  const recipeList = document.querySelectorAll('.recipe_item')
  const paginationWrapper = document.querySelector('.pagination')
  const paginationList = paginationWrapper.querySelector('.pagination_list')
  const prevButton = document.querySelector('.pagination_prev')
  const nextButton = document.querySelector('.pagination_next')
  let paginationListItem = null
  let menuPrevIndex = 0
  const maxShow = 20
  let pageNumber = 0
  let currentPage = 0

  // カテゴリをクリックする
  navItem.forEach((item, index) => {
    item.index = index
    item.addEventListener('click', function () {
      currentPage = 0
      prevButton.classList.add('o-hide')
      nextButton.classList.remove('o-hide')
      smoothScrollTop()
      if (this.index === menuPrevIndex) {
        return false
      } else {
        navItem[menuPrevIndex].classList.remove('o-current')
        this.classList.add('o-current')
        menuPrevIndex = this.index
        filterModule(this.getAttribute('data-category'))
        pagination(this.getAttribute('data-category'))
      }
      paginationModule()
    })
  })

  // ソート機能
  let filterModule = (category) => {
    let count = 0
    recipeList.forEach((item, index) => {
      item.removeAttribute('index')
      if (category === 'all') {
        item.classList.remove('o-hide')
        item.setAttribute('index', index)
        if (index >= maxShow) {
          item.classList.add('o-hide')
        }
      } else {
        item.classList.add('o-hide')
        if (item.getAttribute('data-category').indexOf(category) > -1) {
          item.setAttribute('index', count)
          if (count < maxShow) {
            item.classList.remove('o-hide')
          }
          count++
        }
      }
    })
  }
  filterModule('all')

  // ページ切り替え
  let pageChangeModuel = (ele) => {
    recipeList.forEach((item) => {
      if (item.hasAttribute('index')) {
        if (item.getAttribute('index') >= ele * maxShow && item.getAttribute('index') < (ele + 1) * maxShow) {
          item.classList.remove('o-hide')
        } else {
          item.classList.add('o-hide')
        }
      }
    })
  }

  // ページネーション
  let pagination = (ele) => {
    paginationListItem = null
    paginationList.innerHTML = ''
    paginationWrapper.classList.remove('o-hide')
    let frg = document.createDocumentFragment()
    if (ele === 'all') {
      pageNumber = Math.ceil(recipeList.length / maxShow)
    } else {
      let count = 0
      recipeList.forEach((item) => {
        if (item.getAttribute('data-category').indexOf(ele) > -1) {
          count++
        }
      })
      pageNumber = Math.ceil(count / maxShow)
    }
    if (pageNumber <= 1) {
      paginationWrapper.classList.add('o-hide')
    }
    for (let i = 0; i < pageNumber; i++) {
      let createTag = document.createElement('span')
      if (i === 0) {
        createTag.classList.add('pagination_list_item')
        createTag.classList.add('o-current')
      } else {
        createTag.classList.add('pagination_list_item')
      }
      createTag.innerHTML = i + 1
      frg.appendChild(createTag)
    }
    paginationList.appendChild(frg)
    frg = null
    paginationListItem = paginationList.querySelectorAll('.pagination_list_item')
  }
  pagination('all')

  // 次へのボタンをクリックする
  nextButton.addEventListener('click', () => {
    currentPage++
    if (currentPage > 0 && currentPage !== pageNumber - 1) {
      prevButton.classList.remove('o-hide')
    } else if (currentPage === pageNumber - 1) {
      prevButton.classList.remove('o-hide')
      nextButton.classList.add('o-hide')
    }
    paginationListItem.forEach((item) => {
      item.classList.remove('o-current')
      paginationListItem[currentPage].classList.add('o-current')
    })
    pageChangeModuel(currentPage)
    smoothScrollTop()
  })

  // 前へのボタンをクリックする
  prevButton.addEventListener('click', () => {
    currentPage--
    if (currentPage < pageNumber - 1 && currentPage !== 0) {
      nextButton.classList.remove('o-hide')
    } else if (currentPage === 0) {
      prevButton.classList.add('o-hide')
      nextButton.classList.remove('o-hide')
    }
    paginationListItem.forEach((item) => {
      item.classList.remove('o-current')
      paginationListItem[currentPage].classList.add('o-current')
    })
    pageChangeModuel(currentPage)
    smoothScrollTop()
  })

  // ページネーションの数字を生成する
  let paginationModule = () => {
    paginationListItem.forEach((item) => {
      item.addEventListener('click', function () {
        paginationListItem.forEach((item) => {
          item.classList.remove('o-current')
        })
        this.classList.add('o-current')
        currentPage = Number(this.innerHTML) - 1
        if (currentPage === 0) {
          prevButton.classList.add('o-hide')
          nextButton.classList.remove('o-hide')
        } else if (currentPage > 0 && currentPage !== pageNumber - 1) {
          prevButton.classList.remove('o-hide')
          nextButton.classList.remove('o-hide')
        } else {
          prevButton.classList.remove('o-hide')
          nextButton.classList.add('o-hide')
        }
        pageChangeModuel(currentPage)
        smoothScrollTop()
      })
    })
  }
  paginationModule()

  // マオスホーバ
  $('.recipe_anchor').on('mouseenter', function () {
    $(this).parents('.recipe_item').find('.recipe_title_anchor').addClass('o-hover')
  }).on('mouseleave', function () {
    $(this).parents('.recipe_item').find('.recipe_title_anchor').removeClass('o-hover')
  })

  $('.recipe_title_anchor').on('mouseenter', function () {
    $(this).parents('.recipe_item').find('.recipe_anchor').addClass('o-hover')
  }).on('mouseleave', function () {
    $(this).parents('.recipe_item').find('.recipe_anchor').removeClass('o-hover')
  })

  // スムーズスクロール
  let smoothScrollTop = () => {
    let $target = $('.recipe_nav').offset().top
    $('html, body').animate({
      scrollTop: $target
    }, 500, 'swing')
  }
})
