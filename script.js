// Carlsberg Websites — 2026 Year in Review
// One scroll gesture or click = one slide. Also: arrow keys, Page Up/Down, Space, Home/End, swipe, side dots, #hash links.
(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const dotsNav = document.querySelector(".dots");
  const cur = document.getElementById("cur");
  document.getElementById("tot").textContent = String(slides.length).padStart(2, "0");

  const SLIDE_MS = 1000;       // matches --slide-dur in style.css
  let index = 0;
  let animating = false;
  let wheelQuietUntil = 0;     // swallows trackpad inertia after a move
  const leaveTimers = new Map();

  // ---- scale the 1600×900 canvas to the window ----
  const fit = () => {
    const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    document.documentElement.style.setProperty("--scale", s);
  };
  window.addEventListener("resize", fit);
  fit();

  // ---- decorate slides ----
  slides.forEach((slide, i) => {
    slide.style.zIndex = i + 1;   // later slides roll over earlier ones
    const canvas = slide.querySelector(".canvas");

    if (!slide.hasAttribute("data-nofooter")) {
      const f = document.createElement("div");
      f.className = "footer";
      const logo = slide.classList.contains("light") ? "logo-black.png" : "logo-white.png";
      f.innerHTML = `<img src="assets/${logo}" alt=""><span>Digital Marketing IIT</span>`;
      canvas.appendChild(f);
    }

    slide.querySelectorAll(".frame").forEach((fr) => {
      ["tl", "tr", "bl", "br"].forEach((c) => {
        const el = document.createElement("i");
        el.className = `c ${c}`;
        fr.appendChild(el);
      });
    });

    slide.querySelectorAll(".ticket").forEach((t, n) => t.style.setProperty("--n", n));
    slide.querySelectorAll(".pair .bar, .hbars .bar").forEach((b, n) => b.style.setProperty("--n", n));

    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `${i + 1}. ${slide.dataset.title || "Slide"}`);
    dot.addEventListener("click", () => go(i));
    dotsNav.appendChild(dot);
  });

  // marquee bulbs around the frame
  document.querySelectorAll(".marquee .bulbs").forEach((box) => {
    const w = 1204, h = 516, inset = 19, step = 37;
    const pts = [];
    const nx = Math.round((w - 2 * inset) / step), ny = Math.round((h - 2 * inset) / step);
    const sx = (w - 2 * inset) / nx, sy = (h - 2 * inset) / ny;
    for (let k = 0; k < nx; k++) pts.push([inset + k * sx, inset]);
    for (let k = 0; k < ny; k++) pts.push([w - inset, inset + k * sy]);
    for (let k = 0; k < nx; k++) pts.push([w - inset - k * sx, h - inset]);
    for (let k = 0; k < ny; k++) pts.push([inset, h - inset - k * sy]);
    pts.forEach(([x, y], k) => {
      const b = document.createElement("i");
      b.style.left = `${x - 3}px`;
      b.style.top = `${y - 3}px`;
      b.style.setProperty("--i", k % 12);
      box.appendChild(b);
    });
  });

  // ---- numbers that count up when their slide arrives ----
  const fmt = (el, v) => {
    const dec = +(el.dataset.decimals || 0);
    el.textContent = v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || "");
  };
  const countUp = (slide) => {
    slide.querySelectorAll("[data-countup]").forEach((el) => {
      const target = parseFloat(el.dataset.countup);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return fmt(el, target);
      fmt(el, 0);
      const start = performance.now() + 700, dur = 1400;
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / dur));
        fmt(el, target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  // ---- state ----
  const render = (instant = false) => {
    if (instant) slides.forEach((s) => (s.style.transition = "none"));
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === index);
      s.classList.toggle("is-past", i < index);
      s.setAttribute("aria-hidden", i === index ? "false" : "true");
      if (i === index) {
        clearTimeout(leaveTimers.get(s));
        requestAnimationFrame(() => s.classList.add("played"));
        countUp(s);
      } else if (s.classList.contains("played")) {
        // reset its entrance animations only once it is off screen
        clearTimeout(leaveTimers.get(s));
        leaveTimers.set(s, setTimeout(() => s.classList.remove("played"), instant ? 0 : SLIDE_MS));
      }
    });
    if (instant) {
      void document.body.offsetHeight;
      slides.forEach((s) => (s.style.transition = ""));
    }
    [...dotsNav.children].forEach((d, i) => d.classList.toggle("on", i === index));
    cur.textContent = String(index + 1).padStart(2, "0");
    history.replaceState(null, "", `#${index + 1}`);
  };

  const go = (to) => {
    to = Math.max(0, Math.min(slides.length - 1, to));
    if (to === index || animating) return;
    index = to;
    animating = true;
    render();
    setTimeout(() => (animating = false), SLIDE_MS * 0.85);
  };
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // ---- wheel / trackpad ----
  window.addEventListener("wheel", (e) => {
    e.preventDefault();
    const now = performance.now();
    if (animating || now < wheelQuietUntil) {
      wheelQuietUntil = now + 160;   // keep ignoring while inertia is still streaming in
      return;
    }
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;
    wheelQuietUntil = now + 160;
    d > 0 ? next() : prev();
  }, { passive: false });

  // ---- keyboard ----
  window.addEventListener("keydown", (e) => {
    const k = e.key;
    if (["ArrowDown", "ArrowRight", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); next(); }
    else if (["ArrowUp", "ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); go(0); }
    else if (k === "End") { e.preventDefault(); go(slides.length - 1); }
    else if (k === "f" || k === "F") {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    }
  });

  // ---- click / tap anywhere = next slide (the side dots keep their own behaviour) ----
  let downAt = null;
  window.addEventListener("mousedown", (e) => {
    downAt = [e.clientX, e.clientY];
    if (e.shiftKey) e.preventDefault(); // stop Shift+click from selecting text
  });
  window.addEventListener("click", (e) => {
    if (e.button !== 0 || e.target.closest("button, a, .dots")) return;
    // a drag (e.g. selecting text) isn't a "next"
    if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    window.getSelection?.().removeAllRanges();
    e.shiftKey ? prev() : next();
  });

  // ---- touch ----
  let ty = null;
  window.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  window.addEventListener("touchend", (e) => {
    if (ty === null) return;
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) (dy > 0 ? next : prev)();
    ty = null;
  });

  // ---- start (supports links like index.html#12) ----
  const fromHash = parseInt(location.hash.slice(1), 10);
  if (fromHash >= 1 && fromHash <= slides.length) index = fromHash - 1;
  render(true);
})();
