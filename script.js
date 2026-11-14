/* Ashwin CK portfolio. Content comes from window.PROJECTS / window.CATEGORIES in projects.js.
   Pointer effects (custom cursor, tilt, parallax, magnetic links, list preview, hero field) run only with a mouse
   and only when the visitor has not asked for reduced motion. Touch screens get the plain, static page. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const PROJECTS = window.PROJECTS || [], CATEGORIES = window.CATEGORIES || [];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || { label: id }).label;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const FX = finePointer && !reduceMotion;
  const pad = (n) => String(n).padStart(2, "0");

  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  /* ---------- Small-screen menu ---------- */
  const menuBtn = $("#menuBtn"), nav = $("#siteNav");
  if (menuBtn && nav) {
    const setMenu = (open) => { nav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
    menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Reel: muted loop that only plays while it is on screen ---------- */
  const reel = $("#reel");
  if (reel) {
    if (reduceMotion) reel.controls = true;
    else {
      let visible = false;
      const sync = () => { if (visible && !document.hidden) { const p = reel.play(); if (p) p.catch(() => {}); } else reel.pause(); };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(reel);
      document.addEventListener("visibilitychange", sync);
      ["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, sync, { once: true, passive: true }));
    }
  }

  /* ---------- Featured + archive ---------- */
  const tagsHtml = (p) => p.categories.map((c) => `<span>${esc(catLabel(c))}</span>`).join("") + p.tech.map((t) => `<span class="t">${esc(t)}</span>`).join("");
  const link = (p) => `project.html?id=${encodeURIComponent(p.id)}`;

  const featured = $("#featured");
  if (featured) {
    featured.innerHTML = PROJECTS.filter((p) => p.featured).sort((a, b) => a.featured - b.featured).map((p, i) => `
      <li class="feat reveal"><a href="${link(p)}" data-cursor="View">
        <div class="frame" data-tilt="3"><img src="${esc(p.poster)}" alt="Still from ${esc(p.title)}" width="1280" height="720" loading="lazy" decoding="async"></div>
        <div class="feat-txt">
          <span class="feat-no mono">${pad(i + 1)}${p.year ? ` / ${esc(p.year)}` : ""}</span>
          <h3 data-split>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="tags">${tagsHtml(p)}</div>
        </div>
      </a></li>`).join("");
  }

  const grid = $("#archiveGrid");
  if (grid) {
    const catChips = $("#catChips"), techChips = $("#techChips"), count = $("#archiveCount"), empty = $("#archiveEmpty");
    const state = { cat: "all", tech: "all" };
    grid.innerHTML = PROJECTS.map((p, i) => `
      <li><a class="row" href="${link(p)}" data-cursor="View" data-peek="${esc(p.poster)}">
        <span class="row-no mono">${pad(i + 1)}</span>
        <img class="thumb" src="${esc(p.poster)}" alt="Still from ${esc(p.title)}" width="224" height="126" loading="lazy" decoding="async">
        <h3>${esc(p.title)}</h3>
        <div class="tags">${tagsHtml(p)}</div>
        <span class="year mono">${esc(p.year || "")}</span>
      </a></li>`).join("");
    const items = $$("li", grid);
    const cats = CATEGORIES.map((c) => ({ id: c.id, label: c.label, n: PROJECTS.filter((p) => p.categories.includes(c.id)).length })).filter((c) => c.n);
    const techCount = {};
    PROJECTS.forEach((p) => p.tech.forEach((t) => { techCount[t] = (techCount[t] || 0) + 1; }));
    const techs = Object.keys(techCount).sort((a, b) => techCount[b] - techCount[a] || a.localeCompare(b)).map((t) => ({ id: t, label: t, n: techCount[t] }));
    const chips = (list, kind) => [{ id: "all", label: "All", n: PROJECTS.length }, ...list]
      .map((c) => `<button type="button" class="chip" data-kind="${kind}" data-id="${esc(c.id)}" aria-pressed="${c.id === "all"}">${esc(c.label)}<small>${c.n}</small></button>`).join("");
    catChips.innerHTML = chips(cats, "cat");
    techChips.innerHTML = chips(techs, "tech");
    const apply = () => {
      let shown = 0;
      PROJECTS.forEach((p, i) => {
        const ok = (state.cat === "all" || p.categories.includes(state.cat)) && (state.tech === "all" || p.tech.includes(state.tech));
        items[i].hidden = !ok; if (ok) shown++;
      });
      $$(".chip").forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.kind] === b.dataset.id)));
      count.textContent = shown === PROJECTS.length ? `${PROJECTS.length} projects` : `${shown} of ${PROJECTS.length} projects`;
      empty.hidden = shown > 0;
    };
    $(".filters").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (!b) return; state[b.dataset.kind] = b.dataset.id; apply(); });
    $("#clearFilters").addEventListener("click", () => { state.cat = state.tech = "all"; apply(); });
    apply();
  }

  /* ---------- Project page: project.html?id=... ---------- */
  const page = $("[data-project]");
  if (page) {
    const id = new URLSearchParams(location.search).get("id");
    const i = PROJECTS.findIndex((p) => p.id === id), p = PROJECTS[i];
    if (!p) {
      page.innerHTML = `<a class="back" href="./#archive">← All projects</a><h1>Project not found</h1><p class="summary">That link does not match a project. Go back to the list and pick one.</p>`;
    } else {
      document.title = `${p.title}, Ashwin CK`;
      const fact = (label, value) => (value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : "");
      const facts = fact("Year", p.year) + fact("My role", p.role) + fact("Tools and protocols", (p.tools || []).join(", "));
      const part = (title, text) => (text ? `<section><h2>${title}</h2><p>${esc(text)}</p></section>` : "");
      const story = part("The problem", p.problem) + part("What I built", p.built) + part("Outcome", p.outcome);
      const prev = PROJECTS[i - 1], next = PROJECTS[i + 1];
      page.innerHTML = `
        <a class="back" href="./#archive">← All projects</a>
        <h1>${esc(p.title)}</h1>
        <p class="summary">${esc(p.summary)}</p>
        <div class="tags">${tagsHtml(p)}</div>
        ${p.signal && p.signal.length ? `<p class="signal" aria-label="Signal path: ${esc(p.signal.join(", then "))}">${p.signal.map(esc).join(' <i aria-hidden="true">→</i> ')}</p>` : ""}
        ${p.video ? `<figure class="media frame${p.portrait ? " portrait" : ""}" data-cursor="Play"><video controls playsinline preload="metadata" poster="${esc(p.poster)}" aria-label="Video of ${esc(p.title)}${p.sound ? ", with sound" : ", no sound"}"><source src="${esc(p.video)}" type="video/mp4"></video></figure>` : ""}
        ${p.images && p.images.length ? `<div class="shots">${p.images.map((src, k) => `<img src="${esc(src)}" alt="${esc(p.title)}, photo ${k + 1}" loading="lazy" decoding="async">`).join("")}</div>` : ""}
        ${facts ? `<dl class="facts">${facts}</dl>` : ""}
        ${story ? `<div class="story">${story}</div>` : ""}
        <nav class="pager" aria-label="More projects">
          ${prev ? `<a href="${link(prev)}" data-cursor="View"><span>Previous</span><b data-split>${esc(prev.title)}</b></a>` : ""}
          ${next ? `<a href="${link(next)}" data-cursor="View"><span>Next</span><b data-split>${esc(next.title)}</b></a>` : ""}
        </nav>`;
      const fig = $(".media", page), vid = fig && $("video", fig);
      if (vid) { // the cursor label follows the player state
        const lab = () => { fig.dataset.cursor = vid.paused ? "Play" : "Pause"; };
        vid.addEventListener("play", lab); vid.addEventListener("pause", lab);
      }
    }
  }

  /* ---------- Letter-level hover: split text into letters (screen readers still get the plain text) ---------- */
  $$("[data-split]").forEach((el) => {
    const text = el.textContent.trim(); let n = 0;
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="sp-w" aria-hidden="true">${[...w].map((ch) => `<span class="sp-c" style="--i:${n++}">${esc(ch)}</span>`).join("")}</span>`).join(" ");
  });

  /* ---------- Scroll reveal ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
    setTimeout(() => $$(".reveal").forEach((el) => el.classList.add("in")), 4000); // never leave content hidden
  }

  /* ---------- Blob drawing, in the look of a video blob-tracking overlay ---------- */
  // Thin white boxes with a small value in the middle, and hairlines running through the boxes and out to the edges.
  const lineThrough = (ctx, a, b, W, H) => {
    const dx = b.x - a.x, dy = b.y - a.y; if (!dx && !dy) return;
    let t0 = -1e9, t1 = 1e9;
    for (const [p, d, lim] of [[a.x, dx, W], [a.y, dy, H]]) {
      if (d) { const u = (0 - p) / d, w = (lim - p) / d; t0 = Math.max(t0, Math.min(u, w)); t1 = Math.min(t1, Math.max(u, w)); }
      else if (p < 0 || p > lim) return;
    }
    ctx.moveTo(a.x + dx * t0, a.y + dy * t0); ctx.lineTo(a.x + dx * t1, a.y + dy * t1);
  };
  const drawBlobs = (ctx, blobs, W, H, minBox, fontPx, fan = 2) => {
    const list = [...blobs].sort((p, q) => p.x - q.x);
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255, 255, 255, 0.72)"; ctx.beginPath();
    for (let i = 0; i < list.length; i++) for (let k = 1; k <= fan; k++) if (list[i + k]) lineThrough(ctx, list[i], list[i + k], W, H);
    ctx.stroke();
    ctx.font = `${fontPx}px 'JetBrains Mono', monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const b of blobs) {
      const w = Math.round(Math.max(minBox, b.x1 - b.x0)), h = Math.round(Math.max(minBox, b.y1 - b.y0));
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)"; ctx.strokeRect(Math.round(b.x - w / 2) + 0.5, Math.round(b.y - h / 2) + 0.5, w, h);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"; ctx.fillText(b.val.toFixed(4), b.x, b.y);
    }
  };
  /* ---------- Page-wide field: a dot grid plus TouchDesigner-style blob tracking ---------- */
  // Every pointer (mouse or finger) leaves heat in a coarse grid. Cells above a threshold form blobs; each blob is found by
  // flood fill and tracked from frame to frame, then drawn with a bracket, centroid cross, id, size and speed, like a Blob Track TOP.
  // Mouse and touch both work (each finger is its own blob). With "reduce motion" the field stays a still dot grid.
  const field = $("#field"), readout = $("#readout");
  if (field) {
    const ctx = field.getContext("2d"), coarse = !finePointer;
    const GAP = 30, CELL = coarse ? 14 : 12, REACH = 190, THRESH = 0.42, R = coarse ? 4 : 3.2;
    let W = 0, H = 0, pts = [], cols = 0, rows = 0, heat = new Float32Array(0), seen = new Int32Array(0), stamp = 0;
    const inputs = new Map(); // pointer id -> { x, y }
    let blobs = [], nextId = 1, live = 2, tick = 0;

    const size = () => {
      const dpr = coarse ? 1 : Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight; field.width = Math.round(W * dpr); field.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = []; for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) pts.push([x, y]);
      cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL); heat = new Float32Array(cols * rows); seen = new Int32Array(cols * rows);
      live = 2;
    };
    const deposit = (x, y, amount, r) => {
      const cx = x / CELL, cy = y / CELL;
      for (let j = Math.max(0, Math.floor(cy - r)); j <= Math.min(rows - 1, Math.ceil(cy + r)); j++)
        for (let i = Math.max(0, Math.floor(cx - r)); i <= Math.min(cols - 1, Math.ceil(cx + r)); i++) {
          const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy);
          if (d < r) { const k = j * cols + i; heat[k] = Math.min(1.6, heat[k] + (1 - d / r) * amount); }
        }
    };
    const stroke = (inp, x, y) => { // fill the path between two pointer samples so fast moves leave a solid trail
      const dx = x - inp.x, dy = y - inp.y, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (CELL * 0.6)));
      for (let s = 1; s <= n; s++) deposit(inp.x + (dx * s) / n, inp.y + (dy * s) / n, 0.55, R);
      inp.x = x; inp.y = y;
    };

    const find = () => { // threshold, flood fill into blobs, then keep ids stable by matching to the previous frame
      stamp++; const found = [];
      for (let s = 0; s < heat.length; s++) {
        if (heat[s] < THRESH || seen[s] === stamp) continue;
        const stack = [s]; seen[s] = stamp;
        let n = 0, i0 = cols, i1 = 0, j0 = rows, j1 = 0, sw = 0, sx = 0, sy = 0;
        while (stack.length) {
          const k = stack.pop(), i = k % cols, j = (k / cols) | 0, w = heat[k];
          n++; sw += w; sx += (i + 0.5) * w; sy += (j + 0.5) * w;
          if (i < i0) i0 = i; if (i > i1) i1 = i; if (j < j0) j0 = j; if (j > j1) j1 = j;
          if (i > 0 && heat[k - 1] >= THRESH && seen[k - 1] !== stamp) { seen[k - 1] = stamp; stack.push(k - 1); }
          if (i < cols - 1 && heat[k + 1] >= THRESH && seen[k + 1] !== stamp) { seen[k + 1] = stamp; stack.push(k + 1); }
          if (j > 0 && heat[k - cols] >= THRESH && seen[k - cols] !== stamp) { seen[k - cols] = stamp; stack.push(k - cols); }
          if (j < rows - 1 && heat[k + cols] >= THRESH && seen[k + cols] !== stamp) { seen[k + cols] = stamp; stack.push(k + cols); }
        }
        if (n >= 3) found.push({ x: (sx / sw) * CELL, y: (sy / sw) * CELL, x0: i0 * CELL, y0: j0 * CELL, x1: (i1 + 1) * CELL, y1: (j1 + 1) * CELL, area: n });
      }
      const prev = blobs;
      blobs = found.map((b) => {
        let best = -1, bd = 140;
        prev.forEach((p, i) => { if (!p.used) { const d = Math.hypot(p.x - b.x, p.y - b.y); if (d < bd) { bd = d; best = i; } } });
        if (best >= 0) { const p = prev[best]; p.used = true; b.id = p.id; b.v = p.v * 0.8 + bd * 60 * 0.2; }
        else { b.id = nextId++; b.v = 0; }
        b.val = 1 + b.area / 40;
        return b;
      });
    };

    const pad2 = (n) => String(n).padStart(2, "0");
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const near = [...inputs.values()];
      for (const [x, y] of pts) { // the dot grid, pushed aside around every pointer
        let px = x, py = y, k = 0;
        for (const inp of near) {
          const dx = x - inp.x, dy = y - inp.y, d = Math.hypot(dx, dy);
          if (d < REACH) { const kk = 1 - d / REACH; if (kk > k) k = kk; const push = (kk * kk * 14) / (d || 1); px += dx * push; py += dy * push; }
        }
        const sz = 1.5 + k * 2.5;
        ctx.fillStyle = k > 0.02 ? `rgba(255, 255, 255, ${0.25 + k * 0.7})` : "rgba(236, 230, 218, 0.22)";
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }
      for (const inp of near) { // the path the pointer has just taken
        const tr = inp.trail;
        for (let t = 1; t < tr.length; t++) {
          ctx.strokeStyle = `rgba(224, 103, 47, ${(t / tr.length) * 0.8})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(tr[t - 1][0], tr[t - 1][1]); ctx.lineTo(tr[t][0], tr[t][1]); ctx.stroke();
        }
      }
      drawBlobs(ctx, blobs, W, H, 44, 10);
    };
    const frame = () => {
      for (const inp of inputs.values()) { deposit(inp.x, inp.y, 0.12, R); inp.idle = inp.moved ? 0 : (inp.idle || 0) + 1; if (inp.idle > 8 && inp.trail.length > 1) inp.trail.shift(); inp.moved = false; } // a held pointer keeps its blob alive; its trail fades once it rests
      let alive = inputs.size > 0;
      for (let k = 0; k < heat.length; k++) { const v = heat[k]; if (v > 0.004) { heat[k] = v * 0.972; alive = true; } else heat[k] = 0; }
      if (alive || live > 0) {
        live = alive ? 30 : live - 1;
        find(); draw();
        if (readout && ++tick % 5 === 0) readout.textContent = blobs.length ? `blobs ${blobs.length}   id ${pad2(blobs[0].id % 100)}   x ${(blobs[0].x / W).toFixed(3)}   y ${(blobs[0].y / H).toFixed(3)}` : "blobs 0   waiting for input";
      }
      requestAnimationFrame(frame);
    };

    size(); draw();
    addEventListener("resize", size);
    if (!reduceMotion) {
      const set = (id, x, y, burst) => {
        const inp = inputs.get(id);
        if (inp) { stroke(inp, x, y); inp.trail.push([x, y]); if (inp.trail.length > 26) inp.trail.shift(); inp.moved = true; } else inputs.set(id, { x, y, trail: [[x, y]], moved: true });
        if (burst) deposit(x, y, 1.1, coarse ? 5 : 4);
        live = 30;
      };
      addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") set("m", e.clientX, e.clientY); }, { passive: true });
      addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch") set("m", e.clientX, e.clientY, true); }, { passive: true });
      document.addEventListener("pointerleave", () => inputs.delete("m"));
      // touch: every finger is its own blob; touch events keep firing while the page scrolls
      const each = (e, fn) => { for (const t of e.changedTouches) fn(t); };
      addEventListener("touchstart", (e) => each(e, (t) => set("t" + t.identifier, t.clientX, t.clientY, true)), { passive: true });
      addEventListener("touchmove", (e) => each(e, (t) => set("t" + t.identifier, t.clientX, t.clientY)), { passive: true });
      const lift = (e) => each(e, (t) => inputs.delete("t" + t.identifier));
      addEventListener("touchend", lift, { passive: true }); addEventListener("touchcancel", lift, { passive: true });
      addEventListener("blur", () => inputs.clear()); // never leave a blob stuck if the page loses focus
      document.addEventListener("visibilitychange", () => { if (document.hidden) inputs.clear(); });
      requestAnimationFrame(frame);
    }
  }

  // touch: dragging a finger across a media frame tilts it, as the mouse does on a computer
  if (!finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach((el) => {
      const max = +el.dataset.tilt || 3;
      const lean = (e) => {
        const t = e.touches[0]; if (!t) return;
        const r = el.getBoundingClientRect(), fx = (t.clientX - r.left) / r.width - 0.5, fy = (t.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .1s linear"; el.style.transform = `perspective(1200px) rotateX(${(-fy * max).toFixed(2)}deg) rotateY(${(fx * max).toFixed(2)}deg)`;
      };
      const rest = () => { el.style.transition = "transform .6s cubic-bezier(.22, 1, .36, 1)"; el.style.transform = ""; };
      el.addEventListener("touchstart", lean, { passive: true }); el.addEventListener("touchmove", lean, { passive: true });
      el.addEventListener("touchend", rest, { passive: true }); el.addEventListener("touchcancel", rest, { passive: true });
    });
  }
  if (!FX) return;

  /* ================= Pointer effects (mouse only) ================= */
  root.classList.add("has-pointer", "has-cursor");
  const cursor = document.createElement("div");
  cursor.className = "cursor"; cursor.setAttribute("aria-hidden", "true"); cursor.innerHTML = "<i></i>";
  document.body.appendChild(cursor);
  const cLabel = cursor.firstChild;
  const peek = document.createElement("div");
  peek.className = "peek"; peek.setAttribute("aria-hidden", "true"); peek.innerHTML = '<img alt="">';
  document.body.appendChild(peek);
  const peekImg = peek.firstChild;

  let mx = -100, my = -100, cx = -100, cy = -100, kx = 0, ky = 0, sx = 0, sy = 0, qx = 0, qy = 0, peekOn = false;
  const depthEls = $$("[data-depth]").map((el) => [el, +el.dataset.depth]);

  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    mx = e.clientX; my = e.clientY; kx = mx / innerWidth - 0.5; ky = my / innerHeight - 0.5;
    cursor.classList.add("on");
    const t = e.target.closest ? e.target : null;
    const lab = t && t.closest("[data-cursor]"), lnk = t && t.closest("a, button, summary, .chip");
    cursor.classList.toggle("label", !!lab); cursor.classList.toggle("link", !lab && !!lnk);
    cLabel.textContent = lab ? lab.dataset.cursor : "";
    const row = t && t.closest("[data-peek]");
    if (row) { if (peekImg.getAttribute("src") !== row.dataset.peek) peekImg.src = row.dataset.peek; peekOn = true; } else peekOn = false;
    peek.classList.toggle("on", peekOn);
  }, { passive: true });
  document.addEventListener("pointerleave", () => { cursor.classList.remove("on"); peek.classList.remove("on"); });
  addEventListener("pointerdown", () => cursor.classList.add("down"));
  addEventListener("pointerup", () => cursor.classList.remove("down"));

  // tilt: media frames lean a few degrees toward the pointer and the picture inside shifts the other way
  const tiltOn = (el) => {
    const max = +el.dataset.tilt || 3;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width - 0.5, fy = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform .15s linear";
      el.style.transform = `perspective(1200px) rotateX(${(-fy * max).toFixed(2)}deg) rotateY(${(fx * max).toFixed(2)}deg)`;
      el.style.setProperty("--px", `${(-fx * 14).toFixed(1)}px`); el.style.setProperty("--py", `${(-fy * 14).toFixed(1)}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform .7s cubic-bezier(.22, 1, .36, 1)"; el.style.transform = "";
      el.style.setProperty("--px", "0px"); el.style.setProperty("--py", "0px");
    });
  };
  $$("[data-tilt]").forEach(tiltOn);

  // magnetic: navigation links lean toward the pointer
  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transition = "transform .15s linear";
      el.style.transform = `translate(${((e.clientX - (r.left + r.width / 2)) * 0.3).toFixed(1)}px, ${((e.clientY - (r.top + r.height / 2)) * 0.4).toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transition = "transform .5s cubic-bezier(.22, 1, .36, 1)"; el.style.transform = ""; });
  });

  const loop = () => {
    cx += (mx - cx) * 0.28; cy += (my - cy) * 0.28;
    cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    sx += (kx - sx) * 0.07; sy += (ky - sy) * 0.07;
    for (const [el, d] of depthEls) el.style.transform = `translate3d(${(sx * d).toFixed(2)}px, ${(sy * d).toFixed(2)}px, 0)`;
    if (peekOn) {
      qx += (mx - qx) * 0.16; qy += (my - qy) * 0.16;
      const px = Math.min(qx + 28, innerWidth - 360), py = Math.min(Math.max(qy - 96, 64), innerHeight - 210);
      peek.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    } else { qx = mx; qy = my; }
    requestAnimationFrame(loop);
  };
  loop();
})();
