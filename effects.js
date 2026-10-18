/**
 * SentryEye - UI Effects (vanilla JS port of React Bits ideas)
 *  1. CursorGrid        -> interactive background grid (canvas 2D)
 *  2. VariableProximity -> hero title letters change weight near the cursor
 *  3. GooeyNav          -> sliding gooey pill + droplets in the navbar
 * No React, no build step - plain HTML/CSS/JS only.
 */
(function () {
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ======================================================================
  // 1. CursorGrid
  // ======================================================================
  function initCursorGrid() {
    const host = document.querySelector('.cyber-grid');
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'cyber-grid-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    host.classList.add('has-canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = {
      cell: 48, radius: 150, hold: 0.35, fade: 0.9,
      color: '0, 240, 255', gridAlpha: 0.05, fillAlpha: 0.07,
      pulseSpeed: 650
    };
    let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, levels = [], touched = [];
    const pulses = [];
    let raf = 0, last = 0, clock = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      cols = Math.ceil(w / cfg.cell) + 1; rows = Math.ceil(h / cfg.cell) + 1;
      levels = new Float32Array(cols * rows);
      touched = new Float32Array(cols * rows).fill(-1e9);
      draw();
    }

    function light(i, v) {
      if (v > levels[i]) levels[i] = v;
      touched[i] = clock;
    }

    function energize(x, y) {
      const r = cfg.radius, s = cfg.cell;
      const c0 = Math.max(0, Math.floor((x - r) / s)), c1 = Math.min(cols - 1, Math.floor((x + r) / s));
      const r0 = Math.max(0, Math.floor((y - r) / s)), r1 = Math.min(rows - 1, Math.floor((y + r) / s));
      for (let ro = r0; ro <= r1; ro++) {
        for (let co = c0; co <= c1; co++) {
          const d = Math.hypot(co * s + s / 2 - x, ro * s + s / 2 - y);
          if (d > r) continue;
          const t = 1 - d / r;
          light(ro * cols + co, t * t * (3 - 2 * t)); // smoothstep falloff
        }
      }
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const s = cfg.cell;
      // faint grid
      ctx.strokeStyle = `rgba(${cfg.color}, ${cfg.gridAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) { ctx.moveTo(c * s + 0.5, 0); ctx.lineTo(c * s + 0.5, h); }
      for (let r = 0; r <= rows; r++) { ctx.moveTo(0, r * s + 0.5); ctx.lineTo(w, r * s + 0.5); }
      ctx.stroke();
      // lit cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = levels[r * cols + c];
          if (v <= 0.01) continue;
          ctx.fillStyle = `rgba(${cfg.color}, ${v * cfg.fillAlpha})`;
          ctx.fillRect(c * s, r * s, s, s);
          ctx.strokeStyle = `rgba(${cfg.color}, ${v * 0.55})`;
          ctx.strokeRect(c * s + 0.5, r * s + 0.5, s, s);
        }
      }
    }

    function frame(now) {
      raf = 0;
      const dt = last ? clamp((now - last) / 1000, 0, 0.05) : 1 / 60;
      last = now; clock += dt;
      let active = pulses.length > 0;

      // click pulses: ring of lit cells
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        const ringR = (clock - p.t0) * cfg.pulseSpeed;
        if (ringR > Math.hypot(w, h) + 200) { pulses.splice(k, 1); continue; }
        const band = cfg.cell * 1.2, s = cfg.cell;
        const c0 = Math.max(0, Math.floor((p.x - ringR - band) / s)), c1 = Math.min(cols - 1, Math.floor((p.x + ringR + band) / s));
        const r0 = Math.max(0, Math.floor((p.y - ringR - band) / s)), r1 = Math.min(rows - 1, Math.floor((p.y + ringR + band) / s));
        const env = Math.max(0, 1 - ringR / (Math.hypot(w, h))) ** 0.6;
        for (let ro = r0; ro <= r1; ro++) for (let co = c0; co <= c1; co++) {
          const off = Math.hypot(co * s + s / 2 - p.x, ro * s + s / 2 - p.y) - ringR;
          if (Math.abs(off) > band) continue;
          light(ro * cols + co, env * Math.exp(-(off / band) * (off / band) * 2));
        }
      }

      const step = dt / cfg.fade;
      for (let i = 0; i < levels.length; i++) {
        if (levels[i] <= 0) continue;
        if (clock - touched[i] > cfg.hold) levels[i] = Math.max(0, levels[i] - step);
        if (levels[i] > 0) active = true;
      }
      draw();
      if (active) raf = requestAnimationFrame(frame); else last = 0;
    }
    const wake = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };

    window.addEventListener('pointermove', e => { if (!reduce) { energize(e.clientX, e.clientY); wake(); } }, { passive: true });
    window.addEventListener('pointerdown', e => { if (!reduce) { pulses.push({ x: e.clientX, y: e.clientY, t0: clock }); wake(); } }, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', wake);
    resize();
  }

  // ======================================================================
  // 2. VariableProximity (hero title)
  // ======================================================================
  function initVariableProximity() {
    const title = document.querySelector('.hero-title');
    if (!title || reduce) return;
    const text = title.textContent.replace(/\s+/g, '');
    const accentFrom = text.indexOf('Eye');
    const letters = [];
    title.setAttribute('aria-label', text);
    title.textContent = '';
    text.split('').forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.className = 'vp-letter' + (i >= accentFrom ? ' cyan-gradient' : '');
      s.setAttribute('aria-hidden', 'true');
      title.appendChild(s);
      letters.push({ el: s, level: 0, target: 0 });
    });

    const cfg = { radius: 140, from: 450, to: 700, smoothing: 0.18 };
    const ptr = { x: 0, y: 0, active: false };
    let raf = 0, last = 0;

    function measure() {
      letters.forEach(l => {
        if (!ptr.active) { l.target = 0; return; }
        const r = l.el.getBoundingClientRect();
        const d = Math.hypot(ptr.x - (r.left + r.width / 2), ptr.y - (r.top + r.height / 2));
        l.target = d >= cfg.radius ? 0 : 1 - d / cfg.radius;
      });
    }
    function tick(now) {
      raf = 0;
      const dt = last ? Math.min(now - last, 64) : 16; last = now;
      measure();
      const ease = 1 - Math.exp(-dt / (cfg.smoothing * 400));
      let settling = false;
      letters.forEach(l => {
        let n = l.level + (l.target - l.level) * ease;
        if (Math.abs(l.target - n) < 0.003) n = l.target; else settling = true;
        l.level = n;
        l.el.style.fontVariationSettings = `'wght' ${(cfg.from + (cfg.to - cfg.from) * n).toFixed(0)}`;
      });
      if (settling || ptr.active) raf = requestAnimationFrame(tick); else last = 0;
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('mousemove', e => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.active = true; wake(); }, { passive: true });
    window.addEventListener('scroll', () => { if (ptr.active) wake(); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { ptr.active = false; wake(); });
    letters.forEach(l => (l.el.style.fontVariationSettings = `'wght' ${cfg.from}`));
  }

  // ======================================================================
  // 3. GooeyNav (desktop only - mobile uses the normal drawer)
  // ======================================================================
  function initGooeyNav() {
    const list = document.querySelector('.nav-links');
    if (!list) return;
    const links = Array.from(list.querySelectorAll('.nav-link'));
    if (!links.length) return;

    const layer = document.createElement('div');
    layer.className = 'gooey-layer';
    layer.setAttribute('aria-hidden', 'true');
    const pill = document.createElement('span');
    pill.className = 'gooey-pill';
    layer.appendChild(pill);
    list.prepend(layer);
    list.classList.add('gooey-ready');

    let current = -1;
    const isDesktop = () => window.innerWidth > 768;

    function rectOf(a) {
      const lr = list.getBoundingClientRect(), r = a.getBoundingClientRect();
      return { x: r.left - lr.left, y: r.top - lr.top, w: r.width, h: r.height };
    }
    function place(i, animate) {
      if (!isDesktop()) return;
      if (i < 0) { pill.style.opacity = '0'; pill.style.transform = pill.style.transform; return; }
      const r = rectOf(links[i]);
      const padX = 14, padY = 5;
      pill.style.opacity = '1';
      pill.style.width = (r.w + padX * 2) + 'px';
      pill.style.height = (r.h + padY * 2) + 'px';
      pill.style.transform = `translate(${r.x - padX}px, ${r.y - padY}px)`;
      if (!animate) return;
    }
    function droplets(fromIdx, toIdx) {
      if (reduce || fromIdx < 0 || !pill.animate) return;
      const a = rectOf(links[fromIdx]), b = rectOf(links[toIdx]);
      const n = 9;
      for (let k = 0; k < n; k++) {
        const d = document.createElement('span');
        d.className = 'gooey-drop';
        const size = 5 + Math.random() * 6;
        d.style.width = d.style.height = size + 'px';
        layer.appendChild(d);
        const sx = a.x + a.w / 2, sy = a.y + a.h / 2;
        const ex = b.x + b.w / 2 + (Math.random() - 0.5) * b.w * 0.5, ey = b.y + b.h / 2;
        const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 30, my = sy + (Math.random() - 0.5) * 60;
        const anim = d.animate([
          { transform: `translate(${sx}px, ${sy}px) scale(0.4)`, opacity: 0.9 },
          { transform: `translate(${mx}px, ${my}px) scale(1)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${ex}px, ${ey}px) scale(0.3)`, opacity: 0 }
        ], { duration: 450 + Math.random() * 300, delay: Math.random() * 90, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' });
        anim.onfinish = () => d.remove();
      }
    }
    function setActive(i) {
      if (i === current) return;
      const prev = current;
      current = i;
      links.forEach((l, k) => l.classList.toggle('is-active', k === i));
      if (!isDesktop()) return;
      if (prev >= 0 && i >= 0) {
        // stretch like a blob, then settle
        pill.animate([{ scale: '1 1' }, { scale: '1.12 0.82' }, { scale: '0.96 1.06' }, { scale: '1 1' }], { duration: 520, easing: 'ease-out' });
        droplets(prev, i);
      }
      place(i, true);
    }

    // scroll-spy
    const targets = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    function spy() {
      const y = window.scrollY + window.innerHeight * 0.35;
      let idx = -1;
      links.forEach((l, k) => {
        const t = document.querySelector(l.getAttribute('href'));
        if (t && t.offsetTop <= y) idx = k;
      });
      setActive(idx);
    }
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { spy(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', () => place(current, false));
    links.forEach((l, k) => l.addEventListener('click', () => setActive(k)));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(current, false));
    spy();
    place(current, false);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCursorGrid();
    initVariableProximity();
    initGooeyNav();
  });
})();
