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

  /* ---------- Hero field: a grid of points that reads the pointer like a tracking system ---------- */
  const field = $("#field"), readout = $("#readout");
  let drawField = null;
  if (field) {
    const ctx = field.getContext("2d"), GAP = 30, REACH = 190;
    let W = 0, H = 0, pts = [];
    const trail = [];
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight; field.width = Math.round(W * dpr); field.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = []; for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) pts.push([x, y]);
    };
    drawField = (mx, my, inside) => {
      ctx.clearRect(0, 0, W, H);
      for (const [x, y] of pts) {
        let px = x, py = y, k = 0;
        if (inside) {
          const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
          if (d < REACH) { k = 1 - d / REACH; const push = k * k * 14 / (d || 1); px += dx * push; py += dy * push; }
        }
        const s = 1.5 + k * 2.5;
        ctx.fillStyle = k > 0.02 ? `rgba(111, 179, 168, ${0.2 + k * 0.8})` : "rgba(236, 230, 218, 0.22)";
        ctx.fillRect(px - s / 2, py - s / 2, s, s);
      }
      if (!inside) return;
      // crosshair and bracket: what the tracker has locked on to
      ctx.strokeStyle = "rgba(111, 179, 168, 0.22)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, my + 0.5); ctx.lineTo(W, my + 0.5); ctx.moveTo(mx + 0.5, 0); ctx.lineTo(mx + 0.5, H); ctx.stroke();
      const b = 26, c = 7; ctx.strokeStyle = "rgba(111, 179, 168, 0.85)";
      ctx.beginPath();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { const X = mx + sx * b, Y = my + sy * b; ctx.moveTo(X - sx * c, Y); ctx.lineTo(X, Y); ctx.lineTo(X, Y - sy * c); });
      ctx.stroke();
      // the recent path of the pointer
      for (let t = 1; t < trail.length; t++) {
        ctx.strokeStyle = `rgba(224, 103, 47, ${(t / trail.length) * 0.7})`;
        ctx.beginPath(); ctx.moveTo(trail[t - 1][0], trail[t - 1][1]); ctx.lineTo(trail[t][0], trail[t][1]); ctx.stroke();
      }
    };
    drawField.trail = trail;
    size(); drawField(0, 0, false);
    addEventListener("resize", () => { size(); drawField(0, 0, false); });
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

  let mx = -100, my = -100, cx = -100, cy = -100, kx = 0, ky = 0, sx = 0, sy = 0, qx = 0, qy = 0, fieldIn = false, fieldDirty = 0, peekOn = false;
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
    if (drawField) { // the field covers the whole window, so it follows the pointer in every section
      fieldIn = true;
      drawField.trail.push([mx, my]); if (drawField.trail.length > 26) drawField.trail.shift();
      drawField.pos = [mx, my];
      if (readout) readout.innerHTML = `tracking pointer <b>x ${(mx / innerWidth).toFixed(3)}</b> <b>y ${(my / innerHeight).toFixed(3)}</b>`;
      fieldDirty = 40;
    }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { cursor.classList.remove("on"); peek.classList.remove("on"); fieldIn = false; fieldDirty = 40; });
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
    if (drawField && fieldDirty > 0) {
      fieldDirty--;
      const tr = drawField.trail; if (!fieldIn || fieldDirty < 30) tr.shift(); // the path fades once the pointer rests or leaves
      const p = drawField.pos || [0, 0];
      drawField(p[0], p[1], fieldIn);
    }
    requestAnimationFrame(loop);
  };
  loop();
})();
