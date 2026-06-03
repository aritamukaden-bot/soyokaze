
(() => {
  const root = document.getElementById("instaSlider");
  if (!root) return;

  const track = root.querySelector(".slider-track");
  const slides = Array.from(root.querySelectorAll(".slide"));
  const prevBtn = root.querySelector(".prev");
  const nextBtn = root.querySelector(".next");
  const dotsWrap = root.querySelector(".slider-dots");

  let index = 0;
  const max = slides.length;

  // ドット生成
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slider-dot";
    b.setAttribute("aria-label", `スライド ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function go(i) {
    index = (i + max) % max;   // ループ
    update();
  }

  prevBtn.addEventListener("click", () => go(index - 1));
  nextBtn.addEventListener("click", () => go(index + 1));

  // キーボード操作（左右キー）
  root.tabIndex = 0;
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  // スワイプ対応（スマホ）
  let startX = null;
  root.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  root.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    startX = null;
    if (Math.abs(diff) < 40) return;
    diff > 0 ? go(index - 1) : go(index + 1);
  });

  update();
})();
