// こういう形にしておく
function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const sideMenu  = document.getElementById('sideMenu');
  const sideClose = document.getElementById('sideClose');

  if (!navToggle || !sideMenu || !sideClose) return;

  navToggle.addEventListener('click', () => {
    sideMenu.classList.add('is-open');
  });

  sideClose.addEventListener('click', () => {
    sideMenu.classList.remove('is-open');
  });
}

// 他のJSから呼べるようにしておく
window.initNavToggle = initNavToggle;
