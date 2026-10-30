const CONFIG = {
  name: "Liza",
  timing: { bloomAt: 4.2, linesAt: 8.6, photosAt: 39, endAt: 45 },
  lines: [
    { text: "and I love…",                    at: 9 },
    { text: "you look so pretty and",         at: 13 },
    { text: "I love this view,",              at: 15 },
    { text: "the way we feel in love,",       at: 19 },
    { text: "but I love looking at you more", at: 29.5 },
    { text: "I love you, Babyyyy",            at: 30 }
  ],
  photos: [
    { src: "images/d6b4aa2a-960a-44cd-85e0-08a28f944d3c.jpg", caption: "My girl" },
    { src: "images/b58ff5f7-04f5-4da7-8354-87e42bdfc49e.jpg", caption: "my love" },
    { src: "images/8827ab5d-40a7-4dc7-b533-89ab14a415a8.jpg", caption: "Babyy ♥" }
  ]
};

const $ = (s) => document.querySelector(s);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let run = 0;
const bgm = $("#bgm");
const muteBtn = $("#mute");
let wantMusic = true;

let musicUnlocked = false, songStart = 0;
const songTime = () => (performance.now() - songStart) / 1000;
bgm.addEventListener("playing", () => { songStart = performance.now() - bgm.currentTime * 1000; });
if (location.hash === "#timer") {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:99;background:#000c;color:#fff;font:14px monospace;padding:6px 10px;border-radius:6px";
  document.body.appendChild(d);
  setInterval(() => { d.textContent = musicUnlocked ? songTime().toFixed(1) + " s" : "puzzle…"; }, 100);
}
function playMusic() {
  if (!wantMusic || !musicUnlocked) return;
  const p = bgm.play();
  if (p && p.then) p.then(() => muteBtn.classList.remove("muted")).catch(() => {});
}
muteBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!musicUnlocked) return;
  bgm.muted = !bgm.muted;
  muteBtn.classList.toggle("muted", bgm.muted);
});


function show(id) {
  document.querySelectorAll(".scene").forEach((s) => {
    const on = s.id === id;
    s.classList.toggle("on", on);
    s.setAttribute("aria-hidden", on ? "false" : "true");
  });
}
const wait = (ms, my) => new Promise((res, rej) => setTimeout(() => (my === run ? res() : rej("cancel")), ms));

const SHAPES = [
  '<svg width="%s" height="%s" viewBox="0 0 200 180"><path d="M100 172 C 20 110, 2 70, 2 48 C 2 22, 22 4, 48 4 C 70 4, 90 16, 100 36 C 110 16, 130 4, 152 4 C 178 4, 198 22, 198 48 C 198 70, 180 110, 100 172 Z" fill="#c1002f"/><ellipse cx="58" cy="44" rx="16" ry="9" fill="rgba(255,255,255,.35)" transform="rotate(-30 58 44)"/></svg>',
  '<svg width="%s" height="%s" viewBox="0 0 24 24"><path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4Z" fill="#c1002f"/></svg>',
  '<svg width="%s" height="%s" viewBox="0 0 24 24"><path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4Z" fill="#f2a1b5"/></svg>',
  '<svg width="%s" height="%s" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#e0607e"/></svg>'
];
let partsOn = false, partsTimer = null;
function spawn() {
  if (!partsOn || document.hidden) return;
  const el = document.createElement("div");
  el.className = "pt";
  const k = Math.random();
  const idx = k < 0.38 ? 0 : k < 0.62 ? 1 : k < 0.8 ? 2 : 3;
  const size = idx === 0 ? 14 + Math.random() * 30 : idx === 3 ? 5 + Math.random() * 6 : 8 + Math.random() * 16;
  el.innerHTML = SHAPES[idx].replace(/%s/g, size.toFixed(0));
  const edge = Math.random() < 0.75;
  const x = edge ? (Math.random() < 0.5 ? Math.random() * 16 : 84 + Math.random() * 16) : Math.random() * 100;
  el.style.left = x + "%";
  el.style.setProperty("--dx", ((Math.random() - 0.5) * 80).toFixed(0) + "px");
  el.style.setProperty("--rot", ((Math.random() - 0.5) * 120).toFixed(0) + "deg");
  el.style.animationDuration = (7 + Math.random() * 6).toFixed(1) + "s";
  $("#parts").appendChild(el);
  setTimeout(() => el.remove(), 14000);
}
function setParts(on) {
  partsOn = on;
  if (on && !partsTimer) {
    for (let i = 0; i < 7; i++) setTimeout(spawn, i * 160);
    partsTimer = setInterval(spawn, 520);
  }
  if (!on && partsTimer) { clearInterval(partsTimer); partsTimer = null; }
}

const cv = $("#fx"), ctx = cv.getContext("2d");
let flowers = [], density = 1, W = 0, H = 0, dpr = 1;
function sizeCanvas() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function makeFlower(initial) {
  return {
    x: Math.random() * W, y: initial ? Math.random() * H : -40,
    s: 14 + Math.random() * 34, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.012,
    vy: 0.25 + Math.random() * 0.6, sw: Math.random() * 6.28, sa: 0.2 + Math.random() * 0.5,
    shade: Math.random()
  };
}
function drawFlower(f) {
  ctx.save();
  ctx.translate(f.x, f.y); ctx.rotate(f.r);
  const c1 = `hsl(${344 + f.shade * 10} ${80 + f.shade * 15}% ${86 - f.shade * 8}%)`;
  ctx.fillStyle = c1;
  ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath(); ctx.ellipse(0, -f.s * 0.52, f.s * 0.36, f.s * 0.52, 0, 0, 6.3); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#e3718f"; ctx.beginPath(); ctx.arc(0, 0, f.s * 0.12, 0, 6.3); ctx.fill();
  ctx.restore();
}
function frame() {
  ctx.clearRect(0, 0, W, H);
  const target = Math.round(((W * H) / 9000) * density);
  while (flowers.length < target) flowers.push(makeFlower(flowers.length < 1 || true));
  if (flowers.length > target) flowers.length = target;
  for (const f of flowers) {
    f.y += f.vy; f.sw += 0.012; f.x += Math.sin(f.sw) * f.sa; f.r += f.vr;
    if (f.y > H + 50) Object.assign(f, makeFlower(false));
    drawFlower(f);
  }
  requestAnimationFrame(frame);
}
function setBlossoms(mode) {
  if (mode === "off") { document.body.classList.remove("pink"); return; }
  density = mode === "dense" ? 1.15 : 0.32;
  document.body.classList.add("pink");
}
addEventListener("resize", sizeCanvas);

const HEART = "M100 172 C 20 110, 2 70, 2 48 C 2 22, 22 4, 48 4 C 70 4, 90 16, 100 36 C 110 16, 130 4, 152 4 C 178 4, 198 22, 198 48 C 198 70, 180 110, 100 172 Z";
const NS = "http://www.w3.org/2000/svg";

function knob(a, b, dir, fill) {
  const R = 10, off = 12, nw = 8;
  let cx, cy, rx, ry, rw, rh;
  if (dir === "r") { cx = a + off; cy = b; rx = a - 2; ry = b - nw / 2; rw = off; rh = nw; }
  if (dir === "l") { cx = a - off; cy = b; rx = a - off; ry = b - nw / 2; rw = off + 2; rh = nw; }
  if (dir === "d") { cx = b; cy = a + off; rx = b - nw / 2; ry = a - 2; rw = nw; rh = off; }
  if (dir === "u") { cx = b; cy = a - off; rx = b - nw / 2; ry = a - off; rw = nw; rh = off + 2; }
  return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${fill}"/><rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${fill}"/>`;
}
const PIECES = [
  { id: "tl", x: 0,   y: 0,  w: 100, h: 88, own: knob(100, 50, "r", "#fff"),  blank: knob(88, 50, "u", "#000"), ox: "25%", oy: "25%", slot: [0.2, 0.14],  r0: -24 },
  { id: "tr", x: 100, y: 0,  w: 100, h: 88, own: knob(88, 150, "d", "#fff"),  blank: knob(100, 50, "r", "#000"), ox: "75%", oy: "25%", slot: [0.82, 0.12], r0: 20 },
  { id: "bl", x: 0,   y: 88, w: 100, h: 92, own: knob(88, 50, "u", "#fff"),   blank: knob(100, 132, "l", "#000"), ox: "25%", oy: "72%", slot: [0.17, 0.8],  r0: 28 },
  { id: "br", x: 100, y: 88, w: 100, h: 92, own: knob(100, 132, "l", "#fff"), blank: knob(88, 150, "d", "#000"), ox: "75%", oy: "72%", slot: [0.83, 0.78], r0: -18 }
];
let pieceEls = [], solved = 0, puzzleOpen = true;

function buildPuzzle() {
  const board = $("#board");
  board.classList.remove("done");
  pieceEls.forEach((p) => p.remove());
  pieceEls = []; solved = 0; puzzleOpen = true;
  PIECES.forEach((p) => {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 180");
    svg.setAttribute("class", "piece");
    svg.style.transformOrigin = `${p.ox} ${p.oy}`;
    svg.innerHTML = `
      <mask id="mk-${p.id}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="260" height="240">
        <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#fff"/>
        ${p.own}${p.blank}
      </mask>
      <g clip-path="url(#heartClip)"><rect x="-30" y="-30" width="260" height="240" fill="url(#g)" mask="url(#mk-${p.id})"/></g>
      <rect class="hit" x="${p.x - 10}" y="${p.y - 10}" width="${p.w + 20}" height="${p.h + 20}" fill="transparent" clip-path="url(#heartClip)"/>`;
    svg.dataset.id = p.id;
    board.appendChild(svg);
    pieceEls.push(svg);
    svg._p = p;
    attachDrag(svg);
  });
  scatter();
}

function scatter() {
  const stage = $("#stage").getBoundingClientRect();
  const board = $("#board").getBoundingClientRect();
  const k = board.width / 200;
  pieceEls.forEach((el) => {
    if (el.classList.contains("locked")) return;
    const p = el._p;
    const homeX = board.left + (p.x + p.w / 2) * k, homeY = board.top + (p.y + p.h / 2) * k;
    const tx = stage.left + stage.width * p.slot[0], ty = stage.top + stage.height * p.slot[1];
    el._x = tx - homeX; el._y = ty - homeY; el._r = p.r0;
    apply(el);
  });
}
function apply(el) {
  el.style.setProperty("--x", el._x + "px");
  el.style.setProperty("--y", el._y + "px");
  el.style.setProperty("--r", el._r + "deg");
}

function attachDrag(el) {
  const hit = el.querySelector(".hit");
  let sx, sy, ox, oy, id = null;
  hit.addEventListener("pointerdown", (e) => {
    if (!puzzleOpen || el.classList.contains("locked")) return;
    e.preventDefault();
    id = e.pointerId; hit.setPointerCapture(id);
    sx = e.clientX; sy = e.clientY; ox = el._x; oy = el._y;
    el.classList.add("drag");
    el._r = 0; apply(el);
    el.style.transition = "transform .0s";
    el.style.zIndex = 6;
  });
  hit.addEventListener("pointermove", (e) => {
    if (id !== e.pointerId) return;
    el._x = ox + (e.clientX - sx); el._y = oy + (e.clientY - sy);
    apply(el);
  });
  const end = (e) => {
    if (id !== e.pointerId) return;
    id = null;
    el.classList.remove("drag");
    el.style.transition = "";
    el.style.zIndex = "";
    const k = $("#board").getBoundingClientRect().width / 200;
    const dist = Math.hypot(el._x, el._y);
    if (dist < Math.max(30, 34 * k * 0.6)) {
      el._x = 0; el._y = 0; el._r = 0; apply(el);
      el.classList.add("locked");
      if (navigator.vibrate) { try { navigator.vibrate(18); } catch (_) {} }
      solved++;
      if (solved === PIECES.length) finishPuzzle();
    } else {
      // keep where dropped, but clamp inside the stage so it can be grabbed again
      const stage = $("#stage").getBoundingClientRect();
      const board = $("#board").getBoundingClientRect();
      const p = el._p;
      const cx = board.left + (p.x + p.w / 2) * k + el._x, cy = board.top + (p.y + p.h / 2) * k + el._y;
      const minX = stage.left + 40, maxX = stage.right - 40, minY = stage.top + 30, maxY = stage.bottom - 30;
      el._x += Math.min(Math.max(cx, minX), maxX) - cx;
      el._y += Math.min(Math.max(cy, minY), maxY) - cy;
      apply(el);
    }
  };
  hit.addEventListener("pointerup", end);
  hit.addEventListener("pointercancel", end);
}

async function finishPuzzle() {
  puzzleOpen = false;
  const my = ++run;
  try {
    await wait(350, my);
    $("#board").classList.add("done");
    musicUnlocked = true; bgm.currentTime = 0; songStart = performance.now(); playMusic();
    await wait(900, my);
    sequence(my);
  } catch (_) {}
}

const waitSong = async (sec, my) => { while (songTime() < sec) await wait(40, my); };
async function typeLine(text, endAt, my) {
  const scene = $("#s-lines");
  const el = document.createElement("div");
  el.className = "line";
  const words = text.split(" ");
  el.innerHTML = words.map((w, i) => `<span class="w">${w}${i < words.length - 1 ? " " : ""}</span>`).join("");
  scene.appendChild(el);
  await wait(60, my);
  for (const s of el.querySelectorAll(".w")) { s.classList.add("in"); await wait(reduced ? 80 : 340, my); }
  await waitSong(endAt - 0.75, my);
  el.classList.add("out");
  await wait(750, my);
  el.remove();
}

function buildPhotos() {
  const stage = $("#polStage");
  stage.innerHTML = "";
  const pos = [
    { left: "4%", top: "10%", rot: "-6deg", d: "0s" },
    { left: "30%", top: "38%", rot: "4deg", d: "1.2s" },
    { left: "auto", right: "3%", top: "6%", rot: "7deg", d: "2.2s" }
  ];
  CONFIG.photos.slice(0, 3).forEach((ph, i) => {
    const p = pos[i];
    const d = document.createElement("div");
    d.className = "polaroid";
    d.style.left = p.left; if (p.right) d.style.right = p.right; d.style.top = p.top;
    d.style.setProperty("--rot", p.rot); d.style.setProperty("--d", p.d);
    const img = document.createElement("div");
    img.className = "ph";
    if (ph.src) img.style.backgroundImage = `url("${ph.src}")`; else img.textContent = "your photo here";
    const cap = document.createElement("div");
    cap.className = "cap"; cap.textContent = ph.caption || "";
    d.append(img, cap);
    stage.appendChild(d);
  });
}

async function sequence(my) {
  const T = CONFIG.timing;
  try {
    show("s-reveal");
    setParts(false);
    await waitSong(T.bloomAt, my);
    setBlossoms("dense");
    $("#s-bloom").querySelector(".name").textContent = CONFIG.name;
    show("s-bloom");
    await waitSong(T.linesAt, my);
    setBlossoms("off");
    show("s-lines");
    setParts(true);
    $("#s-lines").innerHTML = "";
    const L = CONFIG.lines;
    for (let i = 0; i < L.length; i++) {
      await waitSong(L[i].at, my);
      await typeLine(L[i].text, i + 1 < L.length ? L[i + 1].at : T.photosAt, my);
    }
    await waitSong(T.photosAt, my);
    setBlossoms("light");
    buildPhotos();
    show("s-photos");
    await wait(500, my);
    document.querySelectorAll(".polaroid").forEach((p, i) => setTimeout(() => p.classList.add("in"), i * 1100));
    await waitSong(T.endAt, my);
    setBlossoms("off");
    $("#endBig").textContent = "I love you, " + CONFIG.name;
    show("s-end");
  } catch (_) { /* replay cancelled the run */ }
}

$("#replay").addEventListener("click", () => {
  run++;
  setParts(false);
  setBlossoms("off");
  $("#s-lines").innerHTML = "";
  show("s-puzzle");
  buildPuzzle();
});

sizeCanvas();
requestAnimationFrame(frame);
buildPuzzle();
addEventListener("resize", () => { if (puzzleOpen) scatter(); });
document.fonts && document.fonts.ready.then(() => { if (puzzleOpen) scatter(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) bgm.pause(); else if (musicUnlocked) bgm.play().catch(() => {}); });