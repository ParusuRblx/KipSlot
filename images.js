/* -------------------------------------------------------
   スロットに使う画像
   ------------------------------------------------------- */
window.SLOT_IMAGES = [
  "images/00.png",
  "images/01.png",
  "images/02.png",
  "images/03.png",
  "images/04.png",
  "images/05.png",
  "images/06.png",
  "images/07.png",
  "images/08.png",
  "images/09.png",
  "images/10.png",
  "images/11.png",
  "images/12.png",
  "images/13.png",
  "images/99.png",
];

/* -------------------------------------------------------
   ゲーム挙動の設定
   ------------------------------------------------------- */
window.SLOT_CONFIG = {
  reelCount:      3,      // リールの本数
  stripRepeats:   6,      // 1リール内で画像を何周分並べるか
  spinDuration: {
    base:    900,         // 最初のリールが止まるまでの時間 (ms)
    stagger: 350,         // リールごとの追加遅延 (ms)
  },
  spinSpeed:      40,     // スクロール速度 (px/frame、大きいほど速い)
  jackpotDisplay: 1000,   // 当選演出の表示時間 (ms)
};
 