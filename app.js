const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
const hasGSAP = typeof window.gsap !== "undefined";

// NOTE: audioUrl must be a direct audio file URL playable by <audio>.
const tracks = [
  {
    title: "Self Control",
    artist: "Laura Branigan",
    year: 1984,
    mood: "After Hours",
    len: "4:06",
    audioUrl: "sc.mp3",
    coverUrl: "sc.webp",
    blurb: "After-hours neon. A perfect midnight cruise anthem."
  },
  {
    title: "Call Me",
    artist: "Go West",
    year: 1980,
    mood: "Neon Sprint",
    len: "3:32",
    audioUrl: "cm.mp3",
    coverUrl: "cm.jpg",
    blurb: "Sharp, confident, and fast—like the city at full speed."
  },
  {
    title: "Dance Hall Days",
    artist: "Wang Chung",
    year: 1984,
    mood: "Sunset Pop",
    len: "3:46",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "dh.jpg",
    blurb: "Glossy pop energy—sunset gradient and palm silhouettes."
  },
  {
    title: "Out of Touch",
    artist: "Daryl Hall & John Oates",
    year: 1984,
    mood: "Cruise",
    len: "3:58",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "ot.jpg",
    blurb: "Big chorus, big lights. A Flash FM essential."
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    year: 1982,
    mood: "Swagger",
    len: "4:54",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "bj.jpg",
    blurb: "That bassline. That tension. Vice City swagger."
  },
  {
    title: "Africa",
    artist: "Toto",
    year: 1982,
    mood: "Widescreen",
    len: "4:55",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverUrl: "https://picsum.photos/seed/africa/1000/1000",
    blurb: "Warm, widescreen nostalgia—perfect for a long drive."
  },
  {
    title: "Gloria",
    artist: "Laura Branigan",
    year: 1982,
    mood: "Arena Lights",
    len: "4:54",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverUrl: "https://picsum.photos/seed/gloria/1000/1000",
    blurb: "Arena-sized vocals and neon romance."
  },
  {
    title: "Atomic",
    artist: "Blondie",
    year: 1980,
    mood: "Chrome Cool",
    len: "4:37",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://picsum.photos/seed/atomic/1000/1000",
    blurb: "Cool, sleek, and stylish—like chrome under neon."
  },
  {
    title: "Broken Wings",
    artist: "Mr. Mister",
    year: 1985,
    mood: "Night Drive",
    len: "4:43",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    coverUrl: "https://picsum.photos/seed/broken-wings/1000/1000",
    blurb: "Soft-focus night drive feelings, city lights in the rain."
  }
];

// --- DOM ---
const list = document.getElementById("list");

const coverMedia = document.getElementById("coverMedia");
const coverImg = document.getElementById("coverImg");
const coverTitle = document.getElementById("coverTitle");
const coverArtist = document.getElementById("coverArtist");
const tagYear = document.getElementById("tagYear");
const tagMood = document.getElementById("tagMood");
const tagLen = document.getElementById("tagLen");

const nowBlurb = document.getElementById("nowBlurb");
const nowTitle = document.getElementById("nowTitle");
const nextTitle = document.getElementById("nextTitle");
const sideText = document.getElementById("sideText");

const heroPlay = document.getElementById("heroPlay");
const shuffleBtn = document.getElementById("shuffleBtn");

const coverPlay = document.getElementById("coverPlay");
const coverPlayIcon = document.getElementById("coverPlayIcon");

const eq = document.getElementById("eq");

const mini = document.getElementById("mini");
const waveWrap = mini?.querySelector(".waveWrap") ?? null;
const visualizer = document.getElementById("visualizer");

const miniImg = document.getElementById("miniImg");
const miniTitleEl = document.getElementById("miniTitle");
const miniArtistEl = document.getElementById("miniArtist");
const bar = document.getElementById("bar");

const audio = document.getElementById("audio");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const toggleBtn = document.getElementById("toggle");

const volume = document.getElementById("volume");
const muteBtn = document.getElementById("muteBtn");

// --- state ---
let index = 0;
let expandedIndex = null;

let eqTween = null;
let coverWiggleTween = null;
let waveTl = null;
let visualizerTween = null;

let lastVolume = 0.85;

// --- utilities ---
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function setText(el, text) {
  if (el) el.textContent = text;
}

// --- volume ---
function setVolume(v, { remember = true } = {}) {
  const value = clamp(Number(v), 0, 1);
  audio.volume = value;
  if (volume) volume.value = String(value);

  if (muteBtn) muteBtn.textContent = value === 0 ? "🔇" : (value < 0.5 ? "🔈" : "🔊");
  if (remember && value > 0) lastVolume = value;

  try { localStorage.setItem("flashfm_volume", String(value)); } catch {}
}

(function initVolume() {
  let saved = null;
  try { saved = localStorage.getItem("flashfm_volume"); } catch {}
  const initial = saved !== null ? Number(saved) : Number(volume?.value ?? 0.85);
  setVolume(Number.isFinite(initial) ? initial : 0.85);
})();

volume?.addEventListener("input", (e) => setVolume(e.target.value));
muteBtn?.addEventListener("click", () => {
  if (audio.volume === 0) setVolume(lastVolume || 0.85);
  else setVolume(0, { remember: false });
});

// --- UI updates ---
function updateNowNextUI() {
  const t = tracks[index];
  const next = tracks[(index + 1) % tracks.length];
  setText(nowTitle, `${t.title} — ${t.artist}`);
  setText(nextTitle, `${next.title} — ${next.artist}`);
}

function setPreview(t) {
  setText(coverTitle, t.title);
  setText(coverArtist, t.artist);
  setText(tagYear, `YEAR ${t.year}`);
  setText(tagMood, `MOOD ${t.mood}`);
  setText(tagLen, `LEN ${t.len}`);

  if (nowBlurb) nowBlurb.textContent = t.blurb;
  if (sideText) sideText.textContent = t.blurb;

  if (!coverImg) return;

  if (prefersReduced || !hasGSAP) {
    coverImg.src = t.coverUrl;
    coverImg.style.opacity = "1";
    return;
  }

  gsap.killTweensOf(coverImg);
  gsap.to(coverImg, {
    opacity: 0,
    scale: 0.985,
    duration: 0.14,
    ease: "power2.out",
    onComplete: () => {
      coverImg.src = t.coverUrl;
      gsap.to(coverImg, { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" });
    }
  });
}

function setMini(t) {
  if (miniImg) miniImg.src = t.coverUrl;
  setText(miniTitleEl, t.title);
  setText(miniArtistEl, t.artist);
}

function openMini() {
  if (!mini) return;

  if (prefersReduced || !hasGSAP) {
    mini.style.transform = "translateY(0)";
    mini.style.opacity = "1";
    return;
  }
  gsap.to(mini, { y: 0, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.75)" });
}

function setToggleIcon() {
  const paused = audio.paused;
  if (toggleBtn) toggleBtn.textContent = paused ? "▶" : "❚❚";
  if (coverPlayIcon) coverPlayIcon.textContent = paused ? "▶" : "❚❚";
}

// --- waves ---
function startWaves() {
  if (!waveWrap) return;

  if (prefersReduced || !hasGSAP) {
    waveWrap.style.opacity = "0.35";
    return;
  }

  waveWrap.style.opacity = "1";

  if (waveTl) waveTl.kill();
  waveTl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });

  waveTl
    .to(".waveSvg", { x: "-8%", duration: 4.6 }, 0)
    .to(".waveSvg", { x: "0%", duration: 4.6 }, 4.6);

  gsap.to(".waveSvg", { y: 2, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
}

function stopWaves() {
  if (!waveWrap) return;

  if (!hasGSAP) {
    waveWrap.style.opacity = "0";
    return;
  }

  if (waveTl) {
    waveTl.kill();
    waveTl = null;
  }
  gsap.killTweensOf(".waveSvg");
  gsap.to(waveWrap, { opacity: 0, duration: 0.25, ease: "power2.out" });
}

// --- playing state: EQ + cover wiggle + visualizer ---
function startVisualizer() {
  if (!visualizer) return;

  visualizer.classList.add("active");

  if (prefersReduced || !hasGSAP) return;

  if (visualizerTween) visualizerTween.kill();

  visualizerTween = gsap.to(".viBar", {
    scaleY: () => gsap.utils.random(0.3, 2.2),
    duration: () => gsap.utils.random(0.22, 0.35),
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
    stagger: 0.08
  });
}

function stopVisualizer() {
  if (!visualizer) return;

  visualizer.classList.remove("active");

  if (!hasGSAP) return;

  if (visualizerTween) {
    visualizerTween.kill();
    visualizerTween = null;
  }

  gsap.to(".viBar", { scaleY: 0.2, duration: 0.2, ease: "power2.out" });
}

function setPlayingState(playing) {
  if (!hasGSAP || prefersReduced) {
    if (playing) {
      startWaves();
      startVisualizer();
    } else {
      stopWaves();
      stopVisualizer();
    }
    return;
  }

  if (eqTween) { eqTween.kill(); eqTween = null; }
  if (coverWiggleTween) { coverWiggleTween.kill(); coverWiggleTween = null; }

  if (playing) {
    if (eq) gsap.to(eq, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });

    eqTween = gsap.to("#eq span", {
      scaleY: () => gsap.utils.random(0.5, 1.8),
      duration: 0.18,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.06
    });

    if (coverImg) {
      coverWiggleTween = gsap.to(coverImg, {
        rotate: 0.6,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

    startWaves();
    startVisualizer();
  } else {
    if (eq) gsap.to(eq, { opacity: 0, y: 6, duration: 0.2, ease: "power2.out" });
    if (coverImg) gsap.to(coverImg, { rotate: 0, duration: 0.25, ease: "power2.out" });

    stopWaves();
    stopVisualizer();
  }
}

// --- ripple ---
function ripple(btn, ev) {
  if (!btn) return;

  const r = document.createElement("span");
  r.className = "ripple";

  const rect = btn.getBoundingClientRect();
  const x = (ev?.clientX ?? rect.left + rect.width / 2) - rect.left;
  const y = (ev?.clientY ?? rect.top + rect.height / 2) - rect.top;

  r.style.left = x + "px";
  r.style.top = y + "px";
  btn.appendChild(r);

  if (prefersReduced || !hasGSAP) {
    setTimeout(() => r.remove(), 180);
    return;
  }

  gsap.fromTo(r, { width: 6, height: 6, opacity: 0.7 }, {
    width: 220,
    height: 220,
    opacity: 0,
    duration: 0.45,
    ease: "power2.out",
    onComplete: () => r.remove()
  });
}

// --- playback ---
function load(i, autoplay = false) {
  index = (i + tracks.length) % tracks.length;
  const t = tracks[index];

  audio.src = t.audioUrl;
  audio.load();

  setPreview(t);
  setMini(t);
  updateNowNextUI();
  openMini();

  if (autoplay) {
    audio.play().then(() => {
      setToggleIcon();
      setPlayingState(true);
    }).catch(() => setToggleIcon());
  } else {
    setToggleIcon();
    setPlayingState(false);
  }
}

function toggle() {
  if (!audio.src) load(index, true);

  if (audio.paused) {
    audio.play().then(() => {
      setToggleIcon();
      setPlayingState(true);
    }).catch(setToggleIcon);
  } else {
    audio.pause();
    setToggleIcon();
    setPlayingState(false);
  }

  openMini();
}

// --- expand details ---
function collapseAllDetails() {
  document.querySelectorAll(".track").forEach(card => {
    const details = card.querySelector(".details");
    if (!details) return;

    if (!hasGSAP || prefersReduced) {
      details.style.display = "none";
      return;
    }

    gsap.to(details, {
      maxHeight: 0,
      opacity: 0,
      y: -4,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.14,
      ease: "power2.inOut"
    });
  });
}

function expandDetails(card) {
  const details = card.querySelector(".details");
  if (!details) return;

  if (!hasGSAP || prefersReduced) {
    details.style.display = "grid";
    details.style.paddingTop = "10px";
    details.style.paddingBottom = "12px";
    return;
  }

  gsap.to(details, {
    maxHeight: 140,
    opacity: 1,
    y: 0,
    paddingTop: 10,
    paddingBottom: 12,
    duration: 0.18,
    ease: "power2.out"
  });
}

function initTrackInteractions() {
  document.querySelectorAll(".track").forEach(card => {
    const i = Number(card.dataset.i);
    const details = card.querySelector(".details");

    if (details) {
      if (!hasGSAP || prefersReduced) {
        details.style.display = "none";
      } else {
        gsap.set(details, { maxHeight: 0, opacity: 0, y: -4, paddingTop: 0, paddingBottom: 0 });
      }
    }

    card.addEventListener("mouseenter", () => {
      setPreview(tracks[i]);
      if (window.matchMedia("(hover: hover)").matches) expandDetails(card);
    });

    card.addEventListener("mouseleave", () => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      if (!details) return;

      if (!hasGSAP || prefersReduced) {
        details.style.display = "none";
      } else {
        gsap.to(details, { maxHeight: 0, opacity: 0, y: -4, paddingTop: 0, paddingBottom: 0, duration: 0.14, ease: "power2.inOut" });
      }
    });

    const row = card.querySelector(".row");
    row?.addEventListener("click", () => {
      setPreview(tracks[i]);

      if (expandedIndex === i) {
        expandedIndex = null;
        if (!details) return;
        if (!hasGSAP || prefersReduced) details.style.display = "none";
        else gsap.to(details, { maxHeight: 0, opacity: 0, y: -4, paddingTop: 0, paddingBottom: 0, duration: 0.14, ease: "power2.inOut" });
      } else {
        expandedIndex = i;
        collapseAllDetails();
        expandDetails(card);
      }
    });

    const playBtn = card.querySelector("[data-play]");
    playBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      ripple(playBtn, e);
      load(i, true);
    });
  });
}

// --- render ---
function render() {
  if (!list) return;

  list.innerHTML = tracks.map((t, i) => `
    <div class="track" data-i="${i}">
      <div class="row" role="button" aria-label="Select ${t.title}">
        <div class="index">${String(i + 1).padStart(2, "0")}</div>
        <div>
          <div class="name">${t.title}</div>
          <div class="artist">${t.artist}</div>
        </div>
        <div class="meta">${t.year} • ${t.len}</div>
      </div>

      <div class="details">
        <div class="blurb">${t.blurb}</div>
        <button class="playBtn" type="button" data-play="${i}">PLAY</button>
      </div>
    </div>
  `).join("");

  initTrackInteractions();
}

// --- cover tilt ---
function coverTilt() {
  if (!coverMedia || !coverImg) return;
  if (!hasGSAP || prefersReduced) return;

  coverMedia.addEventListener("mousemove", (e) => {
    const r = coverMedia.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(coverImg, { rotateY: px * 6, rotateX: -py * 6, duration: 0.25, ease: "power2.out" });
    gsap.to(".coverSheen", { opacity: 0.9, x: px * 40, y: py * 40, duration: 0.25, ease: "power2.out" });
  });

  coverMedia.addEventListener("mouseleave", () => {
    gsap.to(coverImg, { rotateX: 0, rotateY: 0, duration: 0.35, ease: "power2.out" });
    gsap.to(".coverSheen", { opacity: 0, duration: 0.2, ease: "power2.out" });
  });
}

// --- keyboard shortcuts ---
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

window.addEventListener("keydown", (e) => {
  if (isTypingTarget(document.activeElement)) return;

  if (e.code === "Space") {
    e.preventDefault();
    toggle();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    load(index - 1, true);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    load(index + 1, true);
  }
});

// --- buttons ---
prevBtn?.addEventListener("click", () => load(index - 1, true));
nextBtn?.addEventListener("click", () => load(index + 1, true));
toggleBtn?.addEventListener("click", toggle);
coverPlay?.addEventListener("click", toggle);
heroPlay?.addEventListener("click", toggle);

shuffleBtn?.addEventListener("click", () => {
  const next = Math.floor(Math.random() * tracks.length);
  load(next, true);
});

// --- audio progress & state ---
audio.addEventListener("timeupdate", () => {
  if (!audio.duration || !bar) return;
  bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
});
audio.addEventListener("ended", () => load(index + 1, true));
audio.addEventListener("pause", () => setPlayingState(false));
audio.addEventListener("play", () => setPlayingState(true));

// --- intro ---
function intro() {
  if (!hasGSAP || prefersReduced) return;

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.from(".glass", { y: 14, opacity: 0, duration: 0.45 })
    .from(".heroIntro > *", { y: 10, opacity: 0, duration: 0.25, stagger: 0.08 }, "<0.05")
    .from(".heroBody > *", { y: 10, opacity: 0, duration: 0.25, stagger: 0.10 }, "<0.05")
    .from(".panel, .side", { y: 10, opacity: 0, duration: 0.25, stagger: 0.08 }, "<0.05")
    .from(".track", { y: 8, opacity: 0, duration: 0.18, stagger: 0.04 }, "<0.05");
}

// --- init ---
render();
load(0, false);
coverTilt();
intro();
setToggleIcon();
updateNowNextUI();
setPlayingState(false);