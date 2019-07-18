(function ($,Truncator) {
'use strict';

$ = $ && $.hasOwnProperty('default') ? $['default'] : $;
Truncator = Truncator && Truncator.hasOwnProperty('default') ? Truncator['default'] : Truncator;

/* ========================================
 * Document Ready
 * ========================================= */
$(function () {
  var el = Array.prototype.slice.call(document.querySelectorAll('.js-trunc_wrapper'));

  // トリミングする前に、テキストを保存してください。
  var truncContents = el.map(function (item) {
    return item.querySelector('.js-trunc_content').innerHTML
  });

  var trimmingTextMain = function () {
    el.forEach(function (item, key) {
      // discription がない記事が存在しているから、いずれがない時、処理をしないようにする。
      if (!item.querySelector('.js-trunc_image') || !item.querySelector('.js-trunc_title') || !item.querySelector('.js-trunc_content')) {
        return
      }
      // 画像高さをゲット
      var truncHeight = item.querySelector('.js-trunc_image').offsetHeight;
      // タイトル高さをゲット
      var truncTitleHeight = item.querySelector('.js-trunc_title').offsetHeight;
      // 画像高さをゲット - タイトル高さをゲットの結果は残りテキストの高さとしてトリミング
      var contentShouldTruncTo = truncHeight - truncTitleHeight;
      var truncContent = item.querySelector('.js-trunc_content');
      if (contentShouldTruncTo < 0) {
        item.querySelector('.js-trunc_content').innerHTML = '';
      } else {
        Truncator.truncate(truncContent, truncContents[key], {
          height: contentShouldTruncTo + 10
        });
      }
    });
  };

  trimmingTextMain();

  window.addEventListener('resize', function () {
    trimmingTextMain();
  });
});

}(jQuery,Truncator));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMvaW5kZXguanMiLCJzb3VyY2VzIjpbInNyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJCBmcm9tICdqcXVlcnknXHJcbmltcG9ydCBUcnVuY2F0b3IgZnJvbSAndHJ1bmNhdG9yJ1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBEb2N1bWVudCBSZWFkeVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG4kKCgpID0+IHtcclxuICBjb25zdCBlbCA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10cnVuY193cmFwcGVyJykpXHJcblxyXG4gIC8vIOODiOODquODn+ODs+OCsOOBmeOCi+WJjeOBq+OAgeODhuOCreOCueODiOOCkuS/neWtmOOBl+OBpuOBj+OBoOOBleOBhOOAglxyXG4gIGNvbnN0IHRydW5jQ29udGVudHMgPSBlbC5tYXAoaXRlbSA9PiB7XHJcbiAgICByZXR1cm4gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtdHJ1bmNfY29udGVudCcpLmlubmVySFRNTFxyXG4gIH0pXHJcblxyXG4gIGNvbnN0IHRyaW1taW5nVGV4dE1haW4gPSAoKSA9PiB7XHJcbiAgICBlbC5mb3JFYWNoKChpdGVtLCBrZXkpID0+IHtcclxuICAgICAgLy8gZGlzY3JpcHRpb24g44GM44Gq44GE6KiY5LqL44GM5a2Y5Zyo44GX44Gm44GE44KL44GL44KJ44CB44GE44Ga44KM44GM44Gq44GE5pmC44CB5Yem55CG44KS44GX44Gq44GE44KI44GG44Gr44GZ44KL44CCXHJcbiAgICAgIGlmICghaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtdHJ1bmNfaW1hZ2UnKSB8fCAhaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtdHJ1bmNfdGl0bGUnKSB8fCAhaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtdHJ1bmNfY29udGVudCcpKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgLy8g55S75YOP6auY44GV44KS44Ky44OD44OIXHJcbiAgICAgIGNvbnN0IHRydW5jSGVpZ2h0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtdHJ1bmNfaW1hZ2UnKS5vZmZzZXRIZWlnaHRcclxuICAgICAgLy8g44K/44Kk44OI44Or6auY44GV44KS44Ky44OD44OIXHJcbiAgICAgIGNvbnN0IHRydW5jVGl0bGVIZWlnaHQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy10cnVuY190aXRsZScpLm9mZnNldEhlaWdodFxyXG4gICAgICAvLyDnlLvlg4/pq5jjgZXjgpLjgrLjg4Pjg4ggLSDjgr/jgqTjg4jjg6vpq5jjgZXjgpLjgrLjg4Pjg4jjga7ntZDmnpzjga/mrovjgorjg4bjgq3jgrnjg4jjga7pq5jjgZXjgajjgZfjgabjg4jjg6rjg5/jg7PjgrBcclxuICAgICAgY29uc3QgY29udGVudFNob3VsZFRydW5jVG8gPSB0cnVuY0hlaWdodCAtIHRydW5jVGl0bGVIZWlnaHRcclxuICAgICAgY29uc3QgdHJ1bmNDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtdHJ1bmNfY29udGVudCcpXHJcbiAgICAgIGlmIChjb250ZW50U2hvdWxkVHJ1bmNUbyA8IDApIHtcclxuICAgICAgICBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy10cnVuY19jb250ZW50JykuaW5uZXJIVE1MID0gJydcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBUcnVuY2F0b3IudHJ1bmNhdGUodHJ1bmNDb250ZW50LCB0cnVuY0NvbnRlbnRzW2tleV0sIHtcclxuICAgICAgICAgIGhlaWdodDogY29udGVudFNob3VsZFRydW5jVG8gKyAxMFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB0cmltbWluZ1RleHRNYWluKClcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHRyaW1taW5nVGV4dE1haW4oKVxyXG4gIH0pXHJcbn0pXHJcbiJdLCJuYW1lcyI6WyJjb25zdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBTUEsQ0FBQyxhQUFJO0VBQ0hBLElBQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsRUFBQzs7O0VBR3JGQSxJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsR0FBRyxXQUFDLE1BQUs7SUFDaEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsU0FBUztHQUN6RCxFQUFDOztFQUVGQSxJQUFNLGdCQUFnQixlQUFNO0lBQzFCLEVBQUUsQ0FBQyxPQUFPLFdBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTs7TUFFckIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsRUFBRTtRQUNoSSxNQUFNO09BQ1A7O01BRURBLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxhQUFZOztNQUV0RUEsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBWTs7TUFFM0VBLElBQU0sb0JBQW9CLEdBQUcsV0FBVyxHQUFHLGlCQUFnQjtNQUMzREEsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBQztNQUM1RCxJQUFJLG9CQUFvQixHQUFHLENBQUMsRUFBRTtRQUM1QixJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUU7T0FDdkQsTUFBTTtRQUNMLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtVQUNuRCxNQUFNLEVBQUUsb0JBQW9CLEdBQUcsRUFBRTtTQUNsQyxFQUFDO09BQ0g7S0FDRixFQUFDO0lBQ0g7O0VBRUQsZ0JBQWdCLEdBQUU7O0VBRWxCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBWTtJQUM1QyxnQkFBZ0IsR0FBRTtHQUNuQixFQUFDO0NBQ0gsQ0FBQzs7OzsifQ==
