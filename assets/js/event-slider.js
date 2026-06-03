// assets/js/event-slider.js
(function () {
  const root = document.getElementById('eventSlider');
  if (!root) return; // ページに無かったら何もしない

  const track = document.getElementById('eventTrack');
  const baseSlides = Array.from(track.children);
  const prev = document.getElementById('eventPrev');
  const next = document.getElementById('eventNext');

  if (baseSlides.length === 0) return;

  // 表示幅（窓の幅）
  const width = () =>
    root.querySelector('.activity-slider-window').clientWidth;

  // --- クローン追加 ---
  const firstClone = baseSlides[0].cloneNode(true);
  const lastClone = baseSlides[baseSlides.length - 1].cloneNode(true);

  firstClone.dataset.clone = 'first';
  lastClone.dataset.clone = 'last';

  track.appendChild(firstClone);
  track.insertBefore(lastClone, baseSlides[0]);

  const allSlides = Array.from(track.children);
  let index = 1; // 実1枚目

  function moveTo(i, withTransition = true) {
    track.style.transition = withTransition ? 'transform 0.6s ease' : 'none';
    index = i;
    const x = width() * index;
    track.style.transform = `translate3d(-${x}px, 0, 0)`;
  }

  prev.addEventListener('click', () => moveTo(index - 1, true));
  next.addEventListener('click', () => moveTo(index + 1, true));

  // 無限ループ処理
  track.addEventListener('transitionend', () => {
    const current = allSlides[index];
    if (!current) return;

    if (current.dataset.clone === 'first') {
      // 末尾側クローン → 実1枚目へ瞬間ジャンプ
      moveTo(1, false);
    } else if (current.dataset.clone === 'last') {
      // 先頭側クローン → 実最後へ瞬間ジャンプ
      moveTo(baseSlides.length, false);
    }
  });

  // リサイズ時も位置調整
  window.addEventListener(
    'resize',
    () => {
      moveTo(index, false);
    },
    { passive: true }
  );

  // 初期位置
  moveTo(index, false);
})();
