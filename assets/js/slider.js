// assets/js/slider.js
(function () {
  const root = document.getElementById('heroSlider');
  if (!root) return;

  const track = document.getElementById('sliderTrack');
  const originalSlides = Array.from(track.children);
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');

  if (originalSlides.length === 0) return;

  // --- クローンスライドを追加（先頭・末尾） ---
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

  firstClone.dataset.clone = 'first';
  lastClone.dataset.clone = 'last';

  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);

  const allSlides = Array.from(track.children);
  let index = 1; // 実スライド1枚目を指す

  const slideWidth = () => Math.round(root.clientWidth);

  // --- ドット生成 ---
  originalSlides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'slider__dot';
    b.setAttribute('aria-label', `${i + 1}枚目へ`);
    b.addEventListener('click', () => moveTo(i + 1, true)); // i+1 に注意
    dotsWrap.appendChild(b);
  });

  function updateDots() {
    if (!dotsWrap) return;
    const dots = Array.from(dotsWrap.children);

    dots.forEach((dot, i) => {
      const slideIndex = i + 1; // 実スライドのindex
      dot.setAttribute('aria-current', slideIndex === index ? 'true' : 'false');
    });
  }

  function moveTo(i, withTransition = true) {
    track.style.transition = withTransition ? 'transform 0.6s ease' : 'none';
    index = i;
    const x = slideWidth() * index;
    track.style.transform = `translate3d(-${x}px, 0, 0)`;
    updateDots();
  }

  // --- 前後ボタン ---
  prev.addEventListener('click', () => moveTo(index - 1, true));
  next.addEventListener('click', () => moveTo(index + 1, true));

  // --- 無限ループ処理 ---
  track.addEventListener('transitionend', () => {
    const current = allSlides[index];
    if (!current) return;

    if (current.dataset.clone === 'first') {
      // 末尾 → 先頭クローン → 実1枚目に瞬間ジャンプ
      moveTo(1, false);
    } else if (current.dataset.clone === 'last') {
      // 先頭 → 末尾クローン → 実最終スライドに瞬間ジャンプ
      moveTo(originalSlides.length, false);
    }
  });

  // リサイズ時も位置を再計算
  window.addEventListener(
    'resize',
    () => {
      moveTo(index, false);
    },
    { passive: true }
  );

  // 初期表示
  moveTo(index, false);
})();
