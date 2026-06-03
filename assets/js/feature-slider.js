// assets/js/feature-slider.js
(function () {
  const track = document.getElementById('featureTrack');
  const prev = document.getElementById('featurePrev');
  const next = document.getElementById('featureNext');

  if (!track) return;

  const baseSlides = Array.from(track.children);
  if (baseSlides.length === 0) return;

  const width = () =>
    document.querySelector('.feature-slider-window').clientWidth;

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
    track.style.transform = `translateX(-${x}px)`;
  }

  prev.addEventListener('click', () => moveTo(index - 1, true));
  next.addEventListener('click', () => moveTo(index + 1, true));

  // 無限ループ処理
  track.addEventListener('transitionend', () => {
    const current = allSlides[index];
    if (!current) return;

    if (current.dataset.clone === 'first') {
      moveTo(1, false);
    } else if (current.dataset.clone === 'last') {
      moveTo(baseSlides.length, false);
    }
  });

  window.addEventListener('resize', () => moveTo(index, false));

  // 初期位置
  moveTo(index, false);
})();
