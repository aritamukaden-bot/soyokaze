// 風エフェクトの初回限定表示制御
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const mainTitle = document.getElementById("mainTitle");

  // すでに訪問済みなら、イントロをスキップ
  if (sessionStorage.getItem("visited")) {
    intro.style.display = "none";   // エフェクトを非表示
    mainTitle.style.opacity = 1;    // タイトルを普通に表示
  } else {
    // 初回訪問時のみ風エフェクトを実行
    sessionStorage.setItem("visited", "true");
    // ここであなたの既存の風エフェクトを起動する関数を呼ぶ
    startWindEffect(); // ← 風エフェクトの関数名をここに（仮）
  }
});


(() => {
  // ===== 共通 =====
  const R=(a,b)=>a+Math.random()*(b-a);
  let STORM = false;          // タッチ/クリックで強風モード
  let pileStarted = false;    // 積もりフェーズ開始済みか

  // CSS変数を実色へ解決（Canvasに無効色が入らないように）
  let LEAF_COLORS = [];
  function initLeafColors(){
    const cs = getComputedStyle(document.documentElement);
    LEAF_COLORS = ['--leaf1','--leaf2','--leaf3'].map(k=>cs.getPropertyValue(k).trim()).filter(Boolean);
    if (LEAF_COLORS.length===0) LEAF_COLORS=['#2ecc71','#27ae60','#1faa59'];
  }

  // ===== 風（前半） =====
  const CFG = { DURATION: 5200, ANGLE: 18*Math.PI/180, PARTICLES: 380, LEAVES: 60, BASE: 0.7, BOOST: 16 };
  const intro  = document.getElementById('intro');
  const title  = document.getElementById('mainTitle');
  const hint   = document.getElementById('hint');

  const wind = document.getElementById('wind');
  const wctx = wind.getContext('2d');

  const pile = document.getElementById('pile');
  const pctx = pile.getContext('2d');

  let w,h,dpr,start=performance.now();
  let parts=[], leaves=[];
  const dirX=Math.cos(CFG.ANGLE), dirY=Math.sin(CFG.ANGLE);

  function resize(){
    dpr = Math.min(devicePixelRatio||1, 2);
    w = wind.width  = pile.width  = Math.floor(innerWidth*dpr);
    h = wind.height = pile.height = Math.floor(innerHeight*dpr);
    wind.style.width = pile.style.width = innerWidth+'px';
    wind.style.height= pile.style.height= innerHeight+'px';
  }
  function initWind(){
    resize();
    parts = Array.from({length:CFG.PARTICLES},()=>({
      x:R(-w*0.25,w*0.05), y:R(-h*0.15,h*1.05), z:R(0.7,1.6),
      len:R(18,48), wd:R(1.1,2.3),
      hue: Math.random()<0.55 ? '255,255,255' : '46,204,113',
      a:R(0.55,0.9), ph:R(0,Math.PI*2)
    }));
    leaves = Array.from({length:CFG.LEAVES},()=>({
      x:R(-w*0.25,w*0.05), y:R(-h*0.10,h*1.00), z:R(0.8,1.4),
      size:R(10,16), rot:R(0,Math.PI*2), rotSpd:R(-0.035,0.035),
      col: Math.random()<0.5 ? 'rgba(46,204,113,0.9)' : 'rgba(39,174,96,0.9)'
    }));
  }

  const easeInOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  function gust(t){
    const boost = STORM ? 28 : 16; // タッチ後強風
    const base  = STORM ? 1.1 : 0.7;
    const mid = Math.pow(Math.max(0,(t-0.4)/0.6),2)*boost;
    return base + easeInOut(t)*1.2 + mid;
  }

  function drawWind(now){
    const elapsed=now-start, t=Math.min(1, elapsed/CFG.DURATION), speed=gust(t);
    wctx.clearRect(0,0,w,h);

    // 粒子
    for(const p of parts){
      const sway=Math.sin(now*0.004+p.ph)*(0.7*p.z)*dpr;
      p.x+=(dirX*speed*p.z*dpr)+sway*0.25;
      p.y+=(dirY*speed*p.z*dpr)+sway*0.06;
      const dx=dirX*p.len, dy=dirY*p.len;
      wctx.beginPath();
      wctx.strokeStyle=`rgba(${p.hue},${p.a})`;
      wctx.lineWidth=p.wd*p.z;
      wctx.moveTo(p.x,p.y); wctx.lineTo(p.x-dx,p.y-dy); wctx.stroke();
      if(p.x>w+60||p.y>h+60){ p.x=R(-w*0.2,-20); p.y=R(-h*0.1,h*0.9); p.z=R(0.7,1.6); }
    }

    // 背景の小葉
    for(const lf of leaves){
      const scale = STORM ? 1.3 : 1;
      lf.x+=(dirX*speed*0.9*lf.z*dpr)*scale;
      lf.y+=(dirY*speed*1.1*lf.z*dpr)*scale;
      lf.rot+=lf.rotSpd*(STORM?1.4:1);
      wctx.save(); wctx.translate(lf.x,lf.y); wctx.rotate(lf.rot);
      const s=lf.size*lf.z*(STORM?1.15:1);
      wctx.fillStyle=lf.col;
      wctx.beginPath();
      wctx.moveTo(0,-s*0.8); wctx.lineTo(s*0.6,0);
      wctx.lineTo(0,s*0.8);  wctx.lineTo(-s*0.6,0);
      wctx.closePath(); wctx.fill();
      wctx.restore();
      if(lf.x>w+60||lf.y>h+60){ lf.x=R(-w*0.2,-20); lf.y=R(-h*0.1,h*0.9); }
    }

    // 風は常に回す。条件を満たしたら積もりを一度だけ開始
    if ((STORM || elapsed >= CFG.DURATION) && !pileStarted) startPilePhase();
    requestAnimationFrame(drawWind);
  }

  // ===== 積もり（後半） =====
  const PILE = { FALLERS: 90, BASE_SPEED: 0.35, SWAY: 0.5, SIZE:[12,22], TARGET_MS: 2800 };
  let pileStart=0, pileHeight=0, settled=[], fallers=[];

  function makeLeaf(isSettled=false, y0=-40, progress=0){
    const growthByProgress = 1 + progress * 0.6;   // 終盤ほど大きく
    const growthByStorm    = STORM ? 1.8 : 1.0;    // STORMでさらに増量
    const size = R(PILE.SIZE[0], PILE.SIZE[1]) * growthByProgress * growthByStorm;
    const col  = LEAF_COLORS[(Math.random()*LEAF_COLORS.length)|0];
    return {
      x: R(0, w), y: y0, s: size, rot: R(0,Math.PI*2),
      rotSpd: R(-0.03,0.03) * (STORM?1.5:1), swayPh: R(0,Math.PI*2),
      col, settled: isSettled
    };
  }

  function startPilePhase(){
    if (pileStarted) return;
    pileStarted = true;
    pileStart = performance.now();

    settled = Array.from({length: 18}, ()=>makeLeaf(true, h - R(10,40), 0));
    const startCount = STORM ? PILE.FALLERS*1.4 : PILE.FALLERS;
    fallers = Array.from({length: Math.floor(startCount)}, ()=> makeLeaf(false, -R(20,200), 0));

    hint.classList.add('hide');
    requestAnimationFrame(drawPile);
  }

  function drawLeaf(ctx, L){
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.rot);
    ctx.fillStyle = L.col;
    const s = L.s;
    ctx.beginPath();
    ctx.moveTo(0,-s*0.8); ctx.lineTo(s*0.6,0);
    ctx.lineTo(0,s*0.8); ctx.lineTo(-s*0.6,0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawPile(now){
    const t = now - pileStart;

    const targetMs = STORM ? PILE.TARGET_MS*0.7 : PILE.TARGET_MS;
    const target = Math.min(1, t / targetMs);
    const targetHeight = h * target;
    pileHeight += (targetHeight - pileHeight) * (STORM?0.2:0.12);

    pctx.clearRect(0, 0, w, h);
    const g = pctx.createLinearGradient(0, h - pileHeight, 0, h);
    g.addColorStop(0, 'rgba(46,204,113,0.18)');
    g.addColorStop(1, 'rgba(46,204,113,0.42)');
    pctx.fillStyle = g;
    pctx.fillRect(0, h - pileHeight, w, pileHeight);

    for (const L of settled) drawLeaf(pctx, L);

    for (let i = fallers.length - 1; i >= 0; i--) {
      const L = fallers[i];
      const sp = (PILE.BASE_SPEED * (STORM?2.2:1)) * (0.8 + Math.random()*0.6) * dpr;
      L.y += sp;
      L.x += Math.sin(L.swayPh + now * 0.002) * (PILE.SWAY * dpr) * (STORM?1.4:1);
      L.rot += L.rotSpd;

      const groundY = h - pileHeight - L.s * 0.3;
      if (L.y >= groundY) {
        L.y = groundY - R(0, 6);
        L.settled = true;
        settled.push(L);
        fallers.splice(i, 1);
        pileHeight = Math.min(h, pileHeight + L.s * 0.25);
        continue;
      }
      drawLeaf(pctx, L);
    }

    if (pileHeight < h * 0.995) {
      if (fallers.length < (STORM? PILE.FALLERS*1.1 : PILE.FALLERS*0.6)) {
        const progress = Math.min(1, pileHeight / h);
        const baseCnt = STORM ? 12 : 6;
        const slope   = STORM ? 28 : 18;
        const addCount = Math.max(baseCnt, Math.floor(baseCnt + progress * slope));
        fallers.push(
          ...Array.from({ length: addCount }, () => makeLeaf(false, -R(20, 180), progress))
        );
      }
      requestAnimationFrame(drawPile);
    } else {
      // タイトル & イントロをフェード → 本文だけ残す（本文CSSなしでもOK）
      const introEl = document.getElementById('intro');
      const titleEl = document.getElementById('mainTitle');
      titleEl.style.opacity = '0';
      introEl.style.opacity = '0';
      setTimeout(() => {
        introEl.remove();
      }, 1000);
    }
  }

  // ===== 入力: タッチ/クリックで STORM に =====
  function goStorm(){
    if (STORM) return;
    STORM = true;
    hint.classList.add('hide');
  }
  window.addEventListener('pointerdown', goStorm, {passive:true});
  window.addEventListener('touchstart', goStorm, {passive:true});
  window.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') goStorm(); });

  // ===== 起動 =====
  window.addEventListener('resize', resize, {passive:true});
  initLeafColors();
  initWind();
  requestAnimationFrame(drawWind);
})();

