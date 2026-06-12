/* -------------------------------------------------------
   設定の読み込み（images.js で定義）
   ------------------------------------------------------- */
const IMAGES = window.SLOT_IMAGES;
const CONFIG = window.SLOT_CONFIG;

/* -------------------------------------------------------
   起動チェック
   ------------------------------------------------------- */
if (!IMAGES || IMAGES.length < 2) {
  console.error('images.js に画像が2枚以上必要です');
}

/* -------------------------------------------------------
   STATE
   ------------------------------------------------------- */
let spinning = false;

/* -------------------------------------------------------
   DOM 参照
   ------------------------------------------------------- */
const reelsEl        = document.getElementById('reels');
const spinBtn        = document.getElementById('spinBtn');
const resultMsg      = document.getElementById('resultMsg');
const winLine        = document.getElementById('winLine');
const jackpotOverlay = document.getElementById('jackpotOverlay');

/* -------------------------------------------------------
   初期化
   ------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  buildReels();
});

spinBtn.addEventListener('click', () => {
  if (spinning) return;
  startSpin();
});

/* -------------------------------------------------------
   リール構築
   各リールは IMAGES を stripRepeats 周分並べた縦ストリップ
   ------------------------------------------------------- */
function buildReels() {
  reelsEl.innerHTML = '';

  for (let i = 0; i < CONFIG.reelCount; i++) {
    const reel = document.createElement('div');
    reel.className = 'reel';

    const strip = document.createElement('div');
    strip.className = 'reel-strip';

    for (let r = 0; r < CONFIG.stripRepeats; r++) {
      shuffled(IMAGES).forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.draggable = false;
        img.dataset.src = src;
        strip.appendChild(img);
      });
    }

    reel.appendChild(strip);
    reelsEl.appendChild(reel);
  }
}

/* -------------------------------------------------------
   スピン開始
   ------------------------------------------------------- */
function startSpin() {
  spinning = true;
  spinBtn.disabled = true;
  spinBtn.classList.add('spinning');
  resultMsg.textContent = '';
  resultMsg.className = 'result-msg';
  winLine.classList.remove('active');
  jackpotOverlay.classList.remove('active');

  const reels  = Array.from(reelsEl.querySelectorAll('.reel'));
  const results = [];   // 各リールの停止画像src
  let stopped = 0;

  reels.forEach((reel, i) => {
    const strip  = reel.querySelector('.reel-strip');
    const imgH   = getSlotHeight(reel);
    const totalH = strip.scrollHeight;

    let pos = currentPos(strip);

    const stopAfter = CONFIG.spinDuration.base + i * CONFIG.spinDuration.stagger;
    const startTime = performance.now();

    reel.classList.add('spinning');

    function frame(now) {
      const elapsed = now - startTime;

      pos -= CONFIG.spinSpeed;

      // ループ：末尾に達したら先頭に巻き戻す
      const loopBack = -(totalH - imgH * IMAGES.length);
      if (pos < loopBack) {
        pos += IMAGES.length * imgH * (CONFIG.stripRepeats - 1);
      }

      strip.style.transform = `translateY(${pos}px)`;

      if (elapsed < stopAfter) {
        requestAnimationFrame(frame);
      } else {
        // 最も近いコマにスナップ
        pos = snapToSlot(pos, imgH);
        strip.style.transform = `translateY(${pos}px)`;
        reel.classList.remove('spinning');

        // 停止コマのsrcを記録
        const idx = posToIndex(pos, imgH, strip.children.length);
        results[i] = strip.children[idx]?.dataset.src ?? '';

        stopped++;
        if (stopped === reels.length) onAllStopped(results);
      }
    }

    requestAnimationFrame(frame);
  });
}

/* -------------------------------------------------------
   全リール停止後の勝敗判定
   ------------------------------------------------------- */
function onAllStopped(results) {
  spinning = false;
  spinBtn.disabled = false;
  spinBtn.classList.remove('spinning');

  const isJackpot = results.every(src => src === results[0]);

  if (isJackpot) {
    winLine.classList.add('active');
    jackpotOverlay.classList.add('active');

    setTimeout(() => {
      jackpotOverlay.classList.remove('active');
      winLine.classList.remove('active');
      resultMsg.textContent = '当たり！';
      resultMsg.className = 'result-msg win';
    }, CONFIG.jackpotDisplay);
  } else {
    resultMsg.textContent = 'はずれ...';
  }
}

/* -------------------------------------------------------
   ユーティリティ
   ------------------------------------------------------- */

/** ストリップの現在のtranslateY値を取得 */
function currentPos(strip) {
  const t = strip.style.transform;
  return t ? parseFloat(t.replace('translateY(', '')) : 0;
}

/** 1コマの高さ（img height + margin） */
function getSlotHeight(reel) {
  const img = reel.querySelector('img');
  if (!img) return 120;
  const s = getComputedStyle(img);
  return img.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom);
}

/** posを最近傍のスロット境界にスナップ */
function snapToSlot(pos, slotH) {
  return Math.round(pos / slotH) * slotH;
}

/** translateYから中央に来る画像インデックスを計算 */
function posToIndex(pos, slotH, total) {
  let idx = Math.round(-pos / slotH) % total;
  if (idx < 0) idx += total;
  return idx;
}

/** Fisher-Yatesシャッフル（元配列を変えない） */
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}