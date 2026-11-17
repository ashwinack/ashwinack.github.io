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
      <li class="feat reveal"><a href="${link(p)}" data-cursor="View" data-video="${esc(p.video || "")}">
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
      <li><a class="row" href="${link(p)}" data-cursor="View" data-peek="${esc(p.poster)}" data-video="${esc(p.video || "")}">
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

  /* ---------- Project detail: one template for project.html and for the viewer on the main page ---------- */
  const detail = (p, i, inDialog) => {
    const fact = (label, value) => (value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : "");
    const facts = fact("Year", p.year) + fact("My role", p.role) + fact("Tools and protocols", (p.tools || []).join(", "));
    const part = (title, text) => (text ? `<section><h2>${title}</h2><p>${esc(text)}</p></section>` : "");
    const story = part("The problem", p.problem) + part("What I built", p.built) + part("Outcome", p.outcome);
    const prev = PROJECTS[i - 1], next = PROJECTS[i + 1];
    const go = (q, label) => !q ? "" : inDialog
      ? `<button type="button" data-go="${esc(q.id)}"><span>${label}</span><b>${esc(q.title)}</b></button>`
      : `<a href="${link(q)}" data-cursor="View"><span>${label}</span><b data-split>${esc(q.title)}</b></a>`;
    const T = inDialog ? "h2" : "h1";
    return `
      <${T} class="p-title"${inDialog ? ' id="viewerTitle"' : ""}>${esc(p.title)}</${T}>
      <p class="summary">${esc(p.summary)}</p>
      <div class="tags">${tagsHtml(p)}</div>
      ${p.signal && p.signal.length ? `<p class="signal" aria-label="Signal path: ${esc(p.signal.join(", then "))}">${p.signal.map(esc).join(' <i aria-hidden="true">→</i> ')}</p>` : ""}
      ${p.video ? `<figure class="media frame${p.portrait ? " portrait" : ""}" data-cursor="Play"><video controls playsinline preload="metadata" poster="${esc(p.poster)}" aria-label="Video of ${esc(p.title)}${p.sound ? ", with sound" : ", no sound"}"><source src="${esc(p.video)}" type="video/mp4"></video></figure>` : ""}
      ${p.images && p.images.length ? `<div class="shots">${p.images.map((src, k) => `<img src="${esc(src)}" alt="${esc(p.title)}, photo ${k + 1}" loading="lazy" decoding="async">`).join("")}</div>` : ""}
      ${facts ? `<dl class="facts">${facts}</dl>` : ""}
      ${story ? `<div class="story">${story}</div>` : ""}
      <nav class="pager" aria-label="More projects">${go(prev, "Previous")}${go(next, "Next")}</nav>`;
  };
  const wireVideo = (root) => { // the cursor label follows the player state
    const fig = $(".media", root), vid = fig && $("video", fig);
    if (vid) { const lab = () => { fig.dataset.cursor = vid.paused ? "Play" : "Pause"; }; vid.addEventListener("play", lab); vid.addEventListener("pause", lab); }
  };

  const page = $("[data-project]");
  if (page) {
    const id = new URLSearchParams(location.search).get("id");
    const i = PROJECTS.findIndex((p) => p.id === id), p = PROJECTS[i];
    if (!p) {
      page.innerHTML = `<a class="back" href="videos.html">← All videos</a><h1>Project not found</h1><p class="summary">That link does not match a project. Go back to the list and pick one.</p>`;
    } else {
      document.title = `${p.title}, Ashwin CK`;
      page.innerHTML = `<a class="back" href="videos.html">← All videos</a>` + detail(p, i, false);
      wireVideo(page);
    }
  }

  /* ---------- Viewer on the main page: every project opens here, with its video playing ---------- */
  const viewer = $("#viewer"), vBody = $("#viewerBody"), vCount = $("#viewerCount");
  if (viewer) {
    let cur = -1;
    const show = (id) => {
      const i = PROJECTS.findIndex((q) => q.id === id); if (i < 0) return;
      cur = i; vBody.innerHTML = detail(PROJECTS[i], i, true); wireVideo(vBody);
      vCount.textContent = `${String(i + 1).padStart(2, "0")} / ${PROJECTS.length}`;
      $$("[data-go]", vBody).forEach((b) => b.addEventListener("click", () => show(b.dataset.go)));
      viewer.scrollTop = 0;
      if (!viewer.open) viewer.showModal();
      history.replaceState(null, "", `#project=${id}`);
      const v = $("video", vBody); if (v) { const pr = v.play(); if (pr) pr.catch(() => {}); } // opened by a click, so sound may play
    };
    viewer.addEventListener("close", () => {
      const v = $("video", vBody); if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
      vBody.innerHTML = ""; history.replaceState(null, "", location.pathname + location.search);
    });
    $("#viewerClose").addEventListener("click", () => viewer.close());
    viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener("keydown", (e) => {
      if (e.target.closest && e.target.closest("video")) return; // arrow keys belong to the player when it has focus
      if (e.key === "ArrowRight" && PROJECTS[cur + 1]) show(PROJECTS[cur + 1].id);
      if (e.key === "ArrowLeft" && PROJECTS[cur - 1]) show(PROJECTS[cur - 1].id);
    });
    document.addEventListener("click", (e) => { // project links open the viewer; ctrl, shift and middle click still open the page
      const a = e.target.closest && e.target.closest('a[href^="project.html"]');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); show(new URL(a.href).searchParams.get("id"));
    });
    const m = /^#project=(.+)$/.exec(location.hash); if (m) show(decodeURIComponent(m[1])); // a shared link opens straight on the video
  }
  /* ---------- Glimpse on the main page: the line under the video names the project on screen and opens it ---------- */
  const gNow = $("#glimpseNow"), gVideo = $("#reel");
  if (gNow && gVideo && window.GLIMPSE) {
    const order = window.GLIMPSE.map((id) => PROJECTS.find((q) => q.id === id)).filter(Boolean), n = order.length;
    const STEP = 1.3; // seconds each project is on screen: 1.6 s minus the 0.3 s dissolve
    const ticks = $("#glimpseTicks"); if (ticks) ticks.innerHTML = order.map(() => "<i></i>").join("");
    const tickEls = ticks ? $$("i", ticks) : [];
    let shown = -1;
    const update = () => {
      const k = Math.max(0, Math.min(n - 1, Math.floor((gVideo.currentTime + 0.1) / STEP)));
      if (k === shown) return; shown = k;
      const q = order[k];
      $("#glimpseNo").textContent = `${pad(k + 1)} / ${n}`; $("#glimpseTitle").textContent = q.title; gNow.href = link(q);
      tickEls.forEach((el, i) => el.classList.toggle("on", i === k));
    };
    gVideo.addEventListener("timeupdate", update); gVideo.addEventListener("seeked", update); update();
    const fr = $("#glimpseFrame"); if (fr) fr.addEventListener("click", () => gNow.click()); // a click on the video opens the project on screen
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

  /* ---------- Fluid background: a small stable-fluids simulation (Jos Stam), drawn faintly behind everything ---------- */
  // Pointers and fingers stir it, and three slow hidden currents keep it drifting on its own. Off with "reduce motion".
  const fluidCv = $("#fluid");
  if (fluidCv && !reduceMotion) {
    const fctx = fluidCv.getContext("2d", { willReadFrequently: true }); // a tiny canvas rewritten every frame is cheaper kept on the CPU side
    const NX = finePointer ? 72 : 40, DT = 1.5; // a coarse grid is enough: the picture is smoothed when it is scaled up
    let NY = 1, S = 0, u, v, u0, v0, d, d0, img, px32;
    const IX = (i, j) => i + (NX + 2) * j;
    const setup = () => {
      NY = Math.max(24, Math.round((NX * (innerHeight || 1)) / (innerWidth || 1)) || 24); S = (NX + 2) * (NY + 2);
      u = new Float32Array(S); v = new Float32Array(S); u0 = new Float32Array(S); v0 = new Float32Array(S); d = new Float32Array(S); d0 = new Float32Array(S);
      fluidCv.width = NX; fluidCv.height = NY; img = fctx.createImageData(NX, NY);
    };
    const bounds = (b, x) => {
      for (let j = 1; j <= NY; j++) { x[IX(0, j)] = b === 1 ? -x[IX(1, j)] : x[IX(1, j)]; x[IX(NX + 1, j)] = b === 1 ? -x[IX(NX, j)] : x[IX(NX, j)]; }
      for (let i = 1; i <= NX; i++) { x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)]; x[IX(i, NY + 1)] = b === 2 ? -x[IX(i, NY)] : x[IX(i, NY)]; }
    };
    const advect = (b, dst, src, uu, vv) => { // carry a field along the velocity field
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
        const k = IX(i, j);
        const x = Math.min(NX + 0.5, Math.max(0.5, i - DT * uu[k])), y = Math.min(NY + 0.5, Math.max(0.5, j - DT * vv[k]));
        const i0 = x | 0, j0 = y | 0, s1 = x - i0, t1 = y - j0;
        dst[k] = (1 - s1) * ((1 - t1) * src[IX(i0, j0)] + t1 * src[IX(i0, j0 + 1)]) + s1 * ((1 - t1) * src[IX(i0 + 1, j0)] + t1 * src[IX(i0 + 1, j0 + 1)]);
      }
      bounds(b, dst);
    };
    const project = (uu, vv, p, div) => { // keep the flow swirling instead of piling up
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) { const k = IX(i, j); div[k] = -0.5 * (uu[k + 1] - uu[k - 1] + vv[k + NX + 2] - vv[k - NX - 2]); p[k] = 0; }
      bounds(0, div); bounds(0, p);
      for (let n = 0; n < 8; n++) { for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) { const k = IX(i, j); p[k] = (div[k] + p[k - 1] + p[k + 1] + p[k - NX - 2] + p[k + NX + 2]) / 4; } bounds(0, p); }
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) { const k = IX(i, j); uu[k] -= 0.5 * (p[k + 1] - p[k - 1]); vv[k] -= 0.5 * (p[k + NX + 2] - p[k - NX - 2]); }
      bounds(1, uu); bounds(2, vv);
    };
    const splat = (x, y, dx, dy, amount, r = 3.4) => { // push and tint the fluid at a screen position
      const cx = (x / innerWidth) * NX + 1, cy = (y / innerHeight) * NY + 1;
      for (let j = Math.max(1, Math.floor(cy - r)); j <= Math.min(NY, Math.ceil(cy + r)); j++)
        for (let i = Math.max(1, Math.floor(cx - r)); i <= Math.min(NX, Math.ceil(cx + r)); i++) {
          const dd = Math.hypot(i - cx, j - cy); if (dd >= r) continue;
          const w = (1 - dd / r) * (1 - dd / r), k = IX(i, j);
          u[k] += dx * w; v[k] += dy * w; d[k] = Math.min(1.4, d[k] + amount * w);
        }
    };
    const last = new Map();
    const stir = (id, x, y) => {
      const p = last.get(id);
      if (p) {
        let dx = ((x - p.x) / innerWidth) * NX * 1.4, dy = ((y - p.y) / innerHeight) * NY * 1.4; const m = Math.hypot(dx, dy);
        if (m > 3) { dx *= 3 / m; dy *= 3 / m; }
        if (m > 0.02) splat(x, y, dx, dy, Math.min(0.5, 0.1 + m * 0.12));
      }
      last.set(id, { x, y });
    };
    setup();
    addEventListener("resize", setup);
    addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") stir("m", e.clientX, e.clientY); }, { passive: true });
    addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch") splat(e.clientX, e.clientY, 0, 0, 0.7, 5); }, { passive: true });
    document.addEventListener("pointerleave", () => last.delete("m"));
    addEventListener("touchstart", (e) => { for (const t of e.changedTouches) { last.set("t" + t.identifier, { x: t.clientX, y: t.clientY }); splat(t.clientX, t.clientY, 0, 0, 0.7, 5); } }, { passive: true });
    addEventListener("touchmove", (e) => { for (const t of e.changedTouches) stir("t" + t.identifier, t.clientX, t.clientY); }, { passive: true });
    const lift = (e) => { for (const t of e.changedTouches) last.delete("t" + t.identifier); };
    addEventListener("touchend", lift, { passive: true }); addEventListener("touchcancel", lift, { passive: true });

    const draw = () => {
      const px = img.data;
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
        const k = IX(i, j), o = ((j - 1) * NX + (i - 1)) * 4, den = Math.min(1, Math.max(0, d[k]));
        const warm = Math.min(1, Math.hypot(u[k], v[k]) * 0.55) * 0.85; // fast flow turns orange, slow flow stays warm white
        px[o] = 236 + (224 - 236) * warm; px[o + 1] = 230 + (103 - 230) * warm; px[o + 2] = 218 + (47 - 218) * warm; px[o + 3] = den * 60;
      }
      fctx.putImageData(img, 0, 0);
    };
    let lastStep = 0;
    const run = (now) => {
      requestAnimationFrame(run);
      if (now - lastStep < 33) return; // about 30 updates a second is plenty for slow fluid and halves the work (a step costs under 1 ms)
      lastStep = now;
      const t = now / 1000;
      for (let n = 0; n < 3; n++) { // slow hidden currents so the background moves even when nobody touches the page
        const ex = innerWidth * (0.5 + 0.4 * Math.cos(t * 0.11 + n * 2.1)), ey = innerHeight * (0.5 + 0.36 * Math.sin(t * 0.13 + n * 1.7)), a = t * 0.4 + n * 2;
        splat(ex, ey, Math.cos(a) * 0.42, Math.sin(a) * 0.5, 0.14, 5.5);
      }
      u0.set(u); v0.set(v); advect(1, u, u0, u0, v0); advect(2, v, v0, u0, v0); project(u, v, u0, v0);
      d0.set(d); advect(0, d, d0, u, v);
      for (let k = 0; k < S; k++) { d[k] *= 0.989; u[k] *= 0.996; v[k] *= 0.996; }
      draw();
    };
    requestAnimationFrame(run);
  }
  /* ---------- Page-wide field: a dot grid plus TouchDesigner-style blob tracking ---------- */
  // Every pointer (mouse or finger) leaves heat in a coarse grid. Cells above a threshold form blobs; each blob is found by
  // flood fill and tracked from frame to frame, then drawn with a bracket, centroid cross, id, size and speed, like a Blob Track TOP.
  // Mouse and touch both work (each finger is its own blob). With "reduce motion" the field stays a still dot grid.
  const field = $("#field");
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
    };
    const frame = () => {
      for (const inp of inputs.values()) { deposit(inp.x, inp.y, 0.12, R); inp.idle = inp.moved ? 0 : (inp.idle || 0) + 1; if (inp.idle > 8 && inp.trail.length > 1) inp.trail.shift(); inp.moved = false; } // a held pointer keeps its blob alive; its trail fades once it rests
      let alive = inputs.size > 0;
      for (let k = 0; k < heat.length; k++) { const v = heat[k]; if (v > 0.004) { heat[k] = v * 0.972; alive = true; } else heat[k] = 0; }
      if (alive || live > 0) {
        live = alive ? 30 : live - 1;
        draw();
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
  peek.className = "peek"; peek.setAttribute("aria-hidden", "true"); peek.innerHTML = '<img alt=""><video muted loop playsinline preload="none"></video>';
  document.body.appendChild(peek);
  const peekImg = peek.firstChild, peekVid = peek.lastChild;

  let mx = -100, my = -100, cx = -100, cy = -100, kx = 0, ky = 0, sx = 0, sy = 0, qx = 0, qy = 0, peekOn = false, peekRow = null, peekTimer = 0;
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
    if (row) {
      if (row !== peekRow) { // a new row: show its still at once, start its video after a short dwell
        peekRow = row; clearTimeout(peekTimer); peekVid.classList.remove("on"); peekVid.removeAttribute("src"); peekVid.load();
        peekImg.src = row.dataset.peek;
        if (row.dataset.video) peekTimer = setTimeout(() => { peekVid.src = row.dataset.video; peekVid.play().then(() => peekVid.classList.add("on")).catch(() => {}); }, 220);
      }
      peekOn = true;
    } else {
      if (peekRow) { peekRow = null; clearTimeout(peekTimer); peekVid.pause(); peekVid.classList.remove("on"); peekVid.removeAttribute("src"); peekVid.load(); }
      peekOn = false;
    }
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

  // featured images play their video, muted, while the pointer is on them
  $$(".feat > a").forEach((a) => {
    const fr = $(".frame", a); let vid = null, tm = 0;
    a.addEventListener("pointerenter", () => { if (!a.dataset.video) return; tm = setTimeout(() => {
      vid = document.createElement("video"); vid.className = "hover-video"; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.src = a.dataset.video;
      fr.appendChild(vid); vid.play().then(() => vid.classList.add("on")).catch(() => {}); }, 200); });
    a.addEventListener("pointerleave", () => { clearTimeout(tm); if (vid) { vid.remove(); vid = null; } });
  });
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
