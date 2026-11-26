(() => {
  const $ = (id) => document.getElementById(id);
  const F = (v) => v == null || isNaN(v) ? '—' : Number(v).toLocaleString('fr-CH').replace(/[’']/g, ' ');
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const MODES = { gemGrab: 'Razzia de gemmes', brawlBall: 'Brawlball', brawlBall5V5: 'Brawlball 5c5', heist: 'Braquage', bounty: 'Prime', knockout: 'Hors-jeu',
    knockout5V5: 'Hors-jeu 5c5', hotZone: 'Zone réservée', soloShowdown: 'Survivant solo', duoShowdown: 'Survivant duo', trioShowdown: 'Survivant trio',
    wipeout: 'Élimination', wipeout5V5: 'Élimination 5c5', duels: 'Duels', basketBrawl: 'Basket Brawl', volleyBrawl: 'Volley Brawl', payload: 'Convoi',
    siege: 'Siège', bossFight: 'Combat de boss', roboRumble: 'Robo-attaque', bigGame: 'Gros gibier', hunters: 'Chasseurs', presentPlunder: 'Pillage de cadeaux',
    drumRoll: 'Roulement de tambour', unknown: 'Autre' };
  const MCOL = { gemGrab: '#9B4DFF', brawlBall: '#3D8BFF', heist: '#E54BA6', bounty: '#2EC5D9', knockout: '#FF8A2B', hotZone: '#E5484D',
    soloShowdown: '#3CB371', duoShowdown: '#2E9E5E', trioShowdown: '#258A52', duels: '#F2B705' };
  const PAL = ['#FFC93C', '#FF3D7F', '#6C3BFF', '#3D8BFF', '#3CB371', '#FF8A2B', '#2EC5D9', '#B57BFF', '#E5484D', '#F2B705'];
  const mode = (m) => MODES[m] || m.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  // Ranked: rank number 1-22 → tier + division (1 = Bronze I … 19 = Maître I, 22 = Pro)
  const TIERS = [
    ['Bronze', 'linear-gradient(135deg,#7A3610,#D07A34)', '#A64A16', '#F7A452', 'M8 6 L40 6 L40 24 Q40 38 24 45 Q8 38 8 24 Z'],
    ['Argent', 'linear-gradient(135deg,#2C4A82,#7E9FD6)', '#3F64A8', '#B4CDF4', 'M8 6 L40 6 L40 24 Q40 38 24 45 Q8 38 8 24 Z'],
    ['Or', 'linear-gradient(135deg,#8E5C00,#E0B320)', '#B87700', '#FFDC4E', 'M8 6 L40 6 L40 24 Q40 38 24 45 Q8 38 8 24 Z'],
    ['Diamant', 'linear-gradient(135deg,#0A4FA6,#2FB8E8)', '#0C63CC', '#52E6FF', 'M24 3 L44 22 L24 45 L4 22 Z'],
    ['Mythique', 'linear-gradient(135deg,#5A0F78,#D23DBE)', '#8A1AAE', '#FF6BE6', 'M24 3 L42 13 L42 35 L24 45 L6 35 L6 13 Z'],
    ['Légendaire', 'linear-gradient(135deg,#5E070B,#D0261E)', '#8A0B10', '#FF4A3A', 'M24 3 L29 17 L44 17 L32 26 L37 41 L24 32 L11 41 L16 26 L4 17 L19 17 Z'],
    ['Maître', 'linear-gradient(135deg,#0A4D1C,#3FAE2A)', '#0B6B25', '#8CF25E', 'M24 4 L30 12 L40 8 L38 20 L44 28 L34 32 L32 44 L24 38 L16 44 L14 32 L4 28 L10 20 L8 8 L18 12 Z'],
    ['Pro', 'linear-gradient(135deg,#2E3036,#8D929C)', '#5C606B', '#F4F4F4', 'M24 3 L44 14 L44 34 L24 45 L4 34 L4 14 Z'],
  ];
  const rankTier = (n) => {
    const nn = Number.isFinite(+n) ? +n : 1;
    const i = Math.min(7, Math.max(0, Math.floor((nn - 1) / 3)));
    const div = i === 7 ? '' : ['I', 'II', 'III'][(nn - 1) % 3];
    const [name, bg, c1, c2, path] = TIERS[i];
    return { i, name: (name + ' ' + div).trim(), bg, c1, c2, path, div: i === 7 ? '' : String(((nn - 1) % 3) + 1) };
  };
  const emblemSvg = (t) => {
    const id = 'em' + t.i + Math.random().toString(36).slice(2, 7);
    const sparkles = [[1, 3], [47, 3], [1, 45], [47, 45]].slice(0, Math.max(0, t.i - 3))
      .map(([x, y]) => `<path d="M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z" fill="#FFF6C8" stroke="${t.c1}" stroke-width=".6"/>`).join('');
    return `<svg width="52" height="52" viewBox="-4 -4 56 56" role="img" aria-label="Emblème ${t.name}" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.c2}"/><stop offset="1" stop-color="${t.c1}"/></linearGradient>
      <radialGradient id="${id}g"><stop offset=".4" stop-color="${t.c2}" stop-opacity=".55"/><stop offset="1" stop-color="${t.c2}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="${id}c"><path d="${t.path}"/></clipPath></defs>
      <circle cx="24" cy="24" r="28" fill="url(#${id}g)"/>
      <path d="${t.path}" fill="url(#${id})" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="0" y="0" width="48" height="20" fill="url(#${id}s)" clip-path="url(#${id}c)"/>
      <path d="${t.path}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5" transform="translate(24 24) scale(.74) translate(-24 -24)"/>
      ${sparkles}${t.div ? `<text x="24" y="30" text-anchor="middle" font-size="17" font-weight="900" fill="#fff" stroke="rgba(0,0,0,.45)" stroke-width="1" paint-order="stroke" font-family="system-ui,sans-serif">${t.div}</text>` : ''}</svg>`;
  };
  const elo = (x) => x.ranked && x.ranked.rankedElo != null ? x.ranked.rankedElo : null;

  // ---------- game images (Brawlify CDN, official Supercell art under the Fan Content Policy) ----------
  const CDN = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? '/cdn' : 'https://cdn.brawlify.com';
  const IMG = {
    brawler: (id) => `${CDN}/brawlers/borderless/${id}.png`,
    icon: (id) => `${CDN}/profile-icons/regular/${id}.png`,
    rank: (n) => `${CDN}/ranked/tiered/${58000000 + Math.min(22, Math.max(1, n)) - 1}.png`,
    mode: (mid) => `${CDN}/game-modes/regular/${48000000 + mid}.png`,
    map: (id) => `${CDN}/maps/regular/${id}.png`,
    badge: (id) => `${CDN}/club-badges/regular/${id}.png`,
    sp: (id) => `${CDN}/star-powers/regular/${id}.png`,
    gadget: (id) => `${CDN}/gadgets/regular/${id}.png`,
  };
  const img = (src, cls, alt) => { const i = el('img', cls); i.src = src; i.alt = alt || ''; i.loading = 'lazy'; i.decoding = 'async'; i.onerror = () => { i.style.visibility = 'hidden'; }; return i; };
  const MODE_ID = { gemGrab: 0, heist: 2, bounty: 3, brawlBall: 5, soloShowdown: 6, bigGame: 7, roboRumble: 8, duoShowdown: 9, bossFight: 10, siege: 11, hotZone: 17, knockout: 20, duels: 24, wipeout: 25, payload: 26, hunters: 35, trioShowdown: 38 };
  const modeId = (m) => MODE_ID[m];
  const ROLES = { president: 'Président', vicePresident: 'Vice-président', senior: 'Senior', member: 'Membre' };
  const until = (s) => { const ms = battleDate(s) - Date.now(); if (ms <= 0) return 'terminé'; const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4); return h ? `encore ${h} h ${String(m).padStart(2, '0')}` : `encore ${m} min`; };
  const ago = (s) => { const m = Math.round((Date.now() - battleDate(s)) / 6e4); return m < 60 ? `il y a ${Math.max(1, m)} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
  // Brawl Stars' API has no real "online" flag, so the most recent battle is used as "last seen".
  const seen = (s) => { if (!s) return { cls: 'off', label: 'Pas de partie récente' }; const m = Math.floor((Date.now() - battleDate(s)) / 6e4); const cls = m < 30 ? 'on' : m < 1440 ? 'idle' : 'off'; return { cls, label: 'Dernier combat ' + (m < 3 ? 'à l\'instant' : ago(s)) }; };
  const TYPES = { soloRanked: ['Classé', 'rk2'], teamRanked: ['Classé', 'rk2'], ranked: ['Trophées', ''], friendly: ['Amical', ''], challenge: ['Défi', ''], tournament: ['Tournoi', ''], championshipChallenge: ['Championnat', 'rk2'] };
  let batFilter = 'all', batAll = false, bgSort = 'tr', bgAll = false, mpSort = 'n', mpScope = 'me', mpAll = false, wrView = 'week';
  const DDay = new Intl.DateTimeFormat('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });

  let data = null;
  let hist = null;      // history.json ({points:[{t, p:{tag:{tr, elo}}}]}), may stay null
  let range = '7j';     // range for the "dans le temps" charts
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, style) => { const e = document.createElementNS(NS, tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (style) Object.assign(e.style, style); return e; };
  const svText = (x, y, txt, attrs, style) => { const t = sv('text', Object.assign({ x, y, 'font-size': 11 }, attrs), Object.assign({ fill: 'var(--muted)' }, style)); t.textContent = txt; return t; };
  const DT = new Intl.DateTimeFormat('fr-CH', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const DD = new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' });
  const DH = new Intl.DateTimeFormat('fr-CH', { hour: '2-digit', minute: '2-digit' });
  const battleDate = (s) => s && /^\d{8}T/.test(s) ? new Date(s.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/, '$1-$2-$3T$4:$5:$6')) : new Date(s);
  const empty = (box, msg) => { box.replaceChildren(el('div', 'empty', msg)); };
  const PCOL = (i) => ['var(--y)', 'var(--pink)', 'var(--purple)'][i] || PAL[i % PAL.length];
  const PHEX = (i) => ['#FFC93C', '#FF3D7F', '#6C3BFF'][i] || PAL[i % PAL.length];

  // Nice round tick values between lo and hi
  const niceTicks = (lo, hi, n = 4) => {
    const span = hi - lo || 1; const raw = span / n; const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => x >= raw) || raw;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 100) / 100 || 0); return out;
  };

  // Tooltip that follows pointer/touch; `pick(xPx)` returns {x, lines:[[color, text]...], marks:[[y, color]...]} or null
  const attachTip = (box, svg, W, H, pick) => {
    const tip = el('div', 'tip'); tip.hidden = true; box.append(tip);
    const vline = sv('line', { y1: 8, y2: H - 22, 'stroke-width': 1 }, { stroke: 'var(--muted)', opacity: 0, strokeDasharray: '3 3' });
    const marks = sv('g'); svg.append(vline, marks);
    const move = (ev) => {
      const r = svg.getBoundingClientRect(); const xPx = (ev.clientX - r.left) * W / r.width;
      const hit = pick(xPx); if (!hit) return hide();
      vline.setAttribute('x1', hit.x); vline.setAttribute('x2', hit.x); vline.style.opacity = hit.noLine ? 0 : .6;
      marks.replaceChildren(...(hit.marks || []).map(([y, c]) => sv('circle', { cx: hit.x, cy: y, r: 4.5, 'stroke-width': 2 }, { fill: c, stroke: 'var(--panel)' })));
      tip.replaceChildren(...hit.lines.map(([c, t], i) => { const d = el('div'); if (c) { const k = el('span'); k.textContent = '● '; k.style.color = c; d.append(k); } d.append(i === 0 && !c ? Object.assign(el('b'), { textContent: t }) : t); return d; }));
      tip.hidden = false;
      const px = hit.x * r.width / W; const tw = tip.offsetWidth;
      tip.style.left = Math.min(Math.max(px, tw / 2 + 2), r.width - tw / 2 - 2) + 'px';
      tip.style.top = Math.max(0, (hit.top ?? 20) * r.height / H) + 'px';
    };
    const hide = () => { tip.hidden = true; vline.style.opacity = 0; marks.replaceChildren(); };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', hide);
  };

  // Line chart. series: [{name, color, pts:[[x, y|null], ...]}]; opts: {time, height, fmtX(x), tipTitle(x), tipVal(v)}
  function lineChart(box, series, opts = {}) {
    box.replaceChildren();
    const W = Math.max(280, Math.round(box.clientWidth || 340)), H = opts.height || 220, L = 54, R = 10, T = 10, B = 24;
    const xs = series.flatMap((s) => s.pts.map((p) => p[0])), ys = series.flatMap((s) => s.pts.map((p) => p[1]).filter((v) => v != null));
    if (!ys.length) return;
    let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x0 === x1) { x0 -= 1; x1 += 1; }
    let y0 = Math.min(...ys), y1 = Math.max(...ys); if (opts.zero) { y0 = Math.min(0, y0); y1 = Math.max(0, y1); }
    const pad = (y1 - y0) * 0.08 || Math.max(5, Math.abs(y1) * 0.002); y0 -= pad; y1 += pad;
    const X = (x) => L + (x - x0) / (x1 - x0) * (W - L - R), Y = (y) => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opts.label || 'Graphique' });
    niceTicks(y0, y1).forEach((v) => { svg.append(sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v) }, { stroke: 'var(--grid)' })); svg.append(svText(L - 6, Y(v) + 4, F(v), { 'text-anchor': 'end' })); });
    if (opts.zero && y0 < 0) svg.append(sv('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), 'stroke-width': 1.5 }, { stroke: 'var(--muted)', opacity: .6 }));
    // x ticks
    const nT = Math.max(2, Math.min(5, Math.floor((W - L) / 90)));
    for (let i = 0; i <= nT; i++) { const x = x0 + (x1 - x0) * i / nT; svg.append(svText(X(x), H - 6, opts.fmtX ? opts.fmtX(x) : String(Math.round(x)), { 'text-anchor': i === 0 ? 'start' : i === nT ? 'end' : 'middle' })); }
    series.forEach((s) => {
      let d = '', pen = false; s.pts.forEach(([x, y]) => { if (y == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); pen = true; });
      svg.append(sv('path', { d, fill: 'none', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, { stroke: s.color }));
      const last = [...s.pts].reverse().find((p) => p[1] != null); if (last) svg.append(sv('circle', { cx: X(last[0]), cy: Y(last[1]), r: 3.5 }, { fill: s.color }));
    });
    box.append(svg);
    attachTip(box, svg, W, H, (xPx) => {
      if (xPx < L - 10 || xPx > W - R + 10) return null;
      const xv = x0 + (xPx - L) / (W - L - R) * (x1 - x0);
      let best = null; xs.forEach((x) => { if (best == null || Math.abs(x - xv) < Math.abs(best - xv)) best = x; });
      const lines = [[null, opts.tipTitle ? opts.tipTitle(best) : String(best)]], marks = [];
      series.forEach((s) => { const p = s.pts.find((q) => q[0] === best); if (p && p[1] != null) { lines.push([s.color, (series.length > 1 || s.name ? s.name + ' · ' : '') + (opts.tipVal ? opts.tipVal(p[1], p) : F(p[1]))]); marks.push([Y(p[1]), s.color]); } });
      if (lines.length < 2) return null;
      return { x: X(best), lines, marks, top: Math.min(...marks.map((m) => m[0])) };
    });
    return { svg, X, Y, W, H };
  }

  // Vertical bar chart. items: [{label, value, color, tip}]
  function barChart(box, items, opts = {}) {
    box.replaceChildren();
    const W = Math.max(280, Math.round(box.clientWidth || 340)), H = opts.height || 190, L = 30, R = 6, T = 16, B = 34;
    const max = Math.max(1, ...items.map((i) => i.value)); const n = items.length; const slot = (W - L - R) / n; const bw = Math.min(46, slot * 0.72);
    const Y = (v) => T + (1 - v / max) * (H - T - B);
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opts.label || 'Graphique en barres' });
    niceTicks(0, max, 3).filter((v) => Number.isInteger(v)).forEach((v) => { svg.append(sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v) }, { stroke: 'var(--grid)' })); svg.append(svText(L - 5, Y(v) + 4, F(v), { 'text-anchor': 'end' })); });
    const every = Math.ceil(n / Math.max(1, Math.floor((W - L) / 44)));
    items.forEach((it, i) => {
      const cx = L + slot * (i + .5); const h = Y(0) - Y(it.value);
      svg.append(sv('rect', { x: cx - bw / 2, y: Y(it.value), width: bw, height: Math.max(0, h), rx: 4 }, { fill: it.color || 'var(--purple)' }));
      if (it.value) svg.append(svText(cx, Y(it.value) - 4, F(it.value), { 'text-anchor': 'middle', 'font-weight': 700 }, { fill: 'var(--fg)' }));
      if (i % every === 0) svg.append(svText(cx, H - 18, it.label, { 'text-anchor': 'middle', 'font-size': 10.5 }));
      if (it.sub && i % every === 0) svg.append(svText(cx, H - 6, it.sub, { 'text-anchor': 'middle', 'font-size': 9.5 }));
    });
    box.append(svg);
    attachTip(box, svg, W, H, (xPx) => { const i = Math.floor((xPx - L) / slot); const it = items[i]; if (!it) return null;
      return { x: L + slot * (i + .5), noLine: true, lines: [[null, it.tip || it.label], ['', F(it.value) + ' ' + (opts.unit || 'brawler') + (it.value > 1 ? 's' : '')]], top: Y(it.value) }; });
  }

  // Donut. items: [{label, value, color}]
  function donutChart(box, legend, items) {
    box.replaceChildren(); legend.replaceChildren();
    const tot = items.reduce((s, i) => s + i.value, 0); if (!tot) return empty(box, 'Pas encore de combats.');
    const S = 150, R = 56, C = 2 * Math.PI * R; const svg = sv('svg', { viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': 'Modes joués par l\'équipe' });
    svg.append(sv('circle', { cx: S / 2, cy: S / 2, r: R, fill: 'none', 'stroke-width': 22 }, { stroke: 'var(--grid)' }));
    let acc = 0;
    items.forEach((it) => {
      const len = it.value / tot * C; const c = sv('circle', { cx: S / 2, cy: S / 2, r: R, fill: 'none', 'stroke-width': 22, 'stroke-dasharray': `${Math.max(0, len - 1.5)} ${C}`, 'stroke-dashoffset': -acc, transform: `rotate(-90 ${S / 2} ${S / 2})` }, { stroke: it.color });
      const tt = sv('title'); tt.textContent = `${it.label} · ${Math.round(it.value / tot * 100)} %`; c.append(tt); svg.append(c); acc += len;
      const lg = el('span'); const k = el('i'); k.style.background = it.color; lg.append(k, el('span', null, it.label), Object.assign(el('b'), { textContent: Math.round(it.value / tot * 100) + ' %' })); legend.append(lg);
    });
    const t1 = svText(S / 2, S / 2 + 2, F(tot), { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800 }, { fill: 'var(--fg)' });
    const t2 = svText(S / 2, S / 2 + 20, 'combats', { 'text-anchor': 'middle', 'font-size': 11 });
    svg.append(t1, t2); box.append(svg);
  }

  // ---------- battles, events, club, Swiss ranks, brawler grid ----------
  function battleRowEl(b) {
    const sd = /Showdown/i.test(b.mode || '');
    const res = b.result === 'win' ? 'win' : b.result === 'loss' ? 'loss' : '';
    const row = el('div', 'bt ' + (res === 'win' ? 'bw' : res === 'loss' ? 'bl2' : ''));
    const mi = b.modeId != null ? b.modeId : modeId(b.mode); row.append(mi != null ? img(IMG.mode(mi), 'ico l', mode(b.mode)) : el('span'));
    row.append(b.brawlerId ? img(IMG.brawler(b.brawlerId), 'bimg', b.brawler || '') : el('span'));
    const m = el('div', 'm'); const t = el('b', null, mode(b.mode || 'unknown')); const ty = TYPES[b.type];
    const sm = el('small'); if (ty) sm.append(el('span', 'tg ' + ty[1], ty[0]), ' '); sm.append((b.brawler || '') + (b.map ? ' · ' + b.map : '')); m.append(t, sm); row.append(m);
    const r = el('div', 'r', sd && b.rank ? 'Top ' + b.rank : res === 'win' ? 'Victoire' : res === 'loss' ? 'Défaite' : 'Égalité');
    r.style.color = res === 'win' ? 'var(--ok)' : res === 'loss' ? 'var(--bad)' : 'var(--muted)';
    r.append(el('small', null, (b.trophyChange != null ? (b.trophyChange >= 0 ? '+' : '') + b.trophyChange + ' 🏆 · ' : '') + ago(b.time))); row.append(r);
    return row;
  }
  function mapRowEl(m) {
    const r = el('div', 'mp'); const ic = el('div', 'mp-i'); if (m.mapId) ic.append(img(IMG.map(m.mapId), 'mm', m.map)); if (m.modeId != null) ic.append(img(IMG.mode(m.modeId), 'mo', ''));
    const n = el('div', 'mp-n'); n.append(el('b', null, m.map || '—'), el('small', null, mode(m.mode || 'unknown') + ' · ' + m.n + ' combat' + (m.n > 1 ? 's' : '')));
    const col = m.wr == null ? 'var(--muted)' : m.wr >= 55 ? 'var(--ok)' : m.wr < 45 ? 'var(--bad)' : 'var(--y)';
    const t = el('div', 'track'); const f = el('div', 'fill'); f.style.width = (m.wr || 0) + '%'; f.style.background = col; t.append(f);
    const v = el('div', 'mp-v', m.wr == null ? '—' : m.wr + ' %'); v.style.color = col; v.append(el('small', null, `${m.w} V · ${m.l} D`));
    r.append(ic, n, t, v); return r;
  }
  const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function renderCal(boxId, p, type) {
    const box = $(boxId); if (!box) return; box.replaceChildren();
    const map = new Map((p.wrLog && p.wrLog.day || []).map((d) => [d.k, d]));
    const now = new Date(), year = now.getFullYear(), month = now.getMonth();
    box.append(el('div', 'cal-title', MONTHS_FR[month] + ' ' + year));
    const head = el('div', 'cal-head'); ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((d) => head.append(el('span', null, d))); box.append(head);
    const grid = el('div', 'cal-grid');
    const startWd = (new Date(year, month, 1).getDay() + 6) % 7, daysIn = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < startWd; i++) grid.append(el('div', 'cal-cell empty'));
    for (let d = 1; d <= daysIn; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, rec = map.get(key);
      const w = type === 'ranked' ? (rec ? rec.rw : 0) : (rec ? rec.lw : 0), l = type === 'ranked' ? (rec ? rec.rl : 0) : (rec ? rec.ll : 0);
      const cell = el('div', 'cal-cell'); cell.append(el('span', 'cal-d', String(d)));
      if (w + l > 0) { const wr = Math.round(w / (w + l) * 100); cell.classList.add(wr >= 50 ? 'g' : 'b'); cell.append(el('span', 'cal-wr', wr + '%')); cell.title = `${d} ${MONTHS_FR[month]} · ${wr}% (${w}V/${l}D)`; }
      grid.append(cell);
    }
    box.append(grid);
  }
  function renderTypeTabs(p) {
    renderCal('calLad', p, 'ladder'); renderCal('calRk', p, 'ranked');
    const listFor = (type) => [...((p.recent && p.recent.list) || [])].reverse().filter((b) => type === 'ranked' ? (b.type === 'soloRanked' || b.type === 'teamRanked') : b.type === 'ranked');
    const fillBat = (boxId, type) => { const bl = $(boxId); if (!bl) return; bl.replaceChildren(); const l = listFor(type); if (!l.length) bl.append(el('div', 'empty', 'Aucun combat ' + (type === 'ranked' ? 'classé' : 'trophées') + ' récent enregistré.')); l.slice(0, 25).forEach((b) => bl.append(battleRowEl(b))); };
    fillBat('batLad', 'ladder'); fillBat('batRk', 'ranked');
    const fillMaps = (boxId, arr) => { const ml = $(boxId); if (!ml) return; ml.replaceChildren(); const maps = (arr || []).filter((m) => m.wr != null).slice(0, 15); if (!maps.length) ml.append(el('div', 'empty', 'Pas encore assez de combats par map (3 minimum avec un même brawler).')); maps.forEach((m) => ml.append(mapRowEl(m))); };
    fillMaps('mpLad', p.mapsLadder); fillMaps('mpRk', p.mapsRanked);
  }
  function renderExtras(p, ps) {
    // ---- weekly summary (whole team, last 7 days) ----
    const wks = ps.filter((x) => x.week);
    $('wkCard').hidden = !wks.length;
    if (wks.length) {
      const sg = (v, suf) => v == null ? '—' : (v > 0 ? '+' : '') + F(v) + suf;
      const hi = $('wkHi'); hi.replaceChildren();
      const award = (t, e, x, v) => { if (!x) return; const a = el('div', 'award'); a.append(el('div', 'e', e), el('div', 't', t), el('div', 'n', x.name), el('div', 'v', v)); hi.append(a); };
      const best = (f, ok = () => true) => [...wks].filter((x) => ok(x) && f(x) != null).sort((a, b) => f(b) - f(a))[0];
      const mvp = best((x) => x.week.trophies, (x) => x.week.trophies > 0); award('MVP trophées', '🏆', mvp, mvp && sg(mvp.week.trophies, ' trophées'));
      const act = best((x) => x.week.battles, (x) => x.week.battles > 0); award('Le plus actif', '🎮', act, act && F(act.week.battles) + ' combats');
      const acc = best((x) => x.week.winRate, (x) => x.week.decided >= 5); award('Meilleur % de victoires', '🎯', acc, acc && acc.week.winRate + ' % sur ' + acc.week.decided + ' combats');
      const rk = best((x) => x.week.elo, (x) => x.week.elo > 0); award('Plus gros gain en classé', '⚔️', rk, rk && sg(rk.week.elo, ' points'));
      const wc = $('wkC'); wc.replaceChildren();
      wks.forEach((x) => {
        const w = x.week; const c = el('div', 'wk'); const h = el('div', 'wk-h'); if (x.icon) h.append(img(IMG.icon(x.icon), null, '')); h.append(el('b', null, x.name)); c.append(h);
        const line = (icon, ...parts) => { const l = el('div', 'wk-l'); if (icon) l.append(typeof icon === 'string' && icon.startsWith('http') || (typeof icon === 'string' && icon.startsWith('/')) ? img(icon, null, '') : el('span', null, icon)); const tx = el('span'); parts.forEach((pt) => tx.append(pt)); l.append(tx); c.append(l); return l; };
        const num = (v, suf) => el('span', v == null ? '' : v >= 0 ? 'up' : 'dn', sg(v, suf));
        line('🏆', num(w.trophies, ' trophées'));
        if (w.elo != null) line('⚔️', num(w.elo, ' points de classé'));
        line('🎮', `${F(w.battles)} combats${w.ranked ? ' (dont ' + w.ranked + ' en classé)' : ''}${w.winRate != null ? ' · ' + w.winRate + ' % de victoires' : ''}`);
        if (w.brawler) line(w.brawler.id ? IMG.brawler(w.brawler.id) : '🧍', 'Brawler de la semaine : ', Object.assign(el('b'), { textContent: w.brawler.name }), ` (${w.brawler.n} combats, ${w.brawler.w} V)`);
        if (w.bestMap) line(w.bestMap.modeId != null ? IMG.mode(w.bestMap.modeId) : '🗺️', 'Meilleure map : ', Object.assign(el('b'), { textContent: w.bestMap.map }), ` (${w.bestMap.wr} %)`);
        wc.append(c);
      });
      const since = data.tracked ? battleDate(data.tracked) : null;
      $('wkN').textContent = '7 derniers jours.' + (since && Date.now() - since < 7 * 864e5 ? ` Les combats sont enregistrés depuis ${DDay.format(since)} : le résumé se complète jour après jour.` : '');
    }

    // ---- win rate per map ----
    const scopes = [['me', p.name], ['team', 'Équipe']];
    $('mpScope').replaceChildren(...scopes.map(([k, lab]) => { const b = el('button', null, lab); b.type = 'button'; b.setAttribute('aria-pressed', mpScope === k); b.onclick = () => { mpScope = k; mpAll = false; renderExtras(p, ps); }; return b; }));
    $('mpS').value = mpSort; $('mpS').onchange = (e) => { mpSort = e.target.value; mpAll = false; renderExtras(p, ps); };
    let maps = [...((mpScope === 'team' ? data.team && data.team.maps : p.maps) || [])];
    if (mpSort !== 'n') maps = maps.filter((m) => m.w + m.l >= 3).sort((a, b) => mpSort === 'best' ? b.wr - a.wr || b.n - a.n : a.wr - b.wr || b.n - a.n);
    const ml = $('mpL'); ml.replaceChildren();
    if (!maps.length) ml.append(el('div', 'empty', mpSort === 'n' ? 'Pas encore de combats enregistrés.' : 'Il faut au moins 3 combats sur une map pour la classer. Revenez plus tard !'));
    maps.slice(0, mpAll ? 40 : 10).forEach((m) => ml.append(mapRowEl(m)));
    const mm = $('mpMore'); mm.hidden = mpAll || maps.length <= 10; mm.textContent = `Afficher les ${Math.min(40, maps.length)} maps`; mm.onclick = () => { mpAll = true; renderExtras(p, ps); };
    $('mpN').textContent = (mpScope === 'team' ? 'Toute l’équipe' : p.name) + (data.tracked ? ` · combats enregistrés depuis ${DDay.format(battleDate(data.tracked))}` : '') + '. Au Survivant, une victoire = finir dans la première moitié.';
    const worst = (p.maps || []).filter((m) => m.wr != null && m.w + m.l >= 3).sort((a, b) => a.wr - b.wr)[0];
    const mw = $('mpWorst'); mw.textContent = worst ? `😤 Bête noire de ${p.name} : ${worst.map} — ${worst.wr}% sur ${worst.n} combats` : '';
    mw.style.cssText = worst ? 'margin-top:10px;font-weight:700;color:var(--bad)' : '';
    const rc = $('records'); rc.replaceChildren();
    const nameOf = (tag) => (ps.find((x) => x.tag === tag) || {}).name || tag;
    const recAward = (e, t, who, v) => { if (!who) return; const a = el('div', 'award'); a.append(el('div', 'e', e), el('div', 't', t), el('div', 'n', who), el('div', 'v', v)); rc.append(a); };
    let best = null;
    if (hist && hist.points) for (const x of ps) { const m = new Map(); for (const q of hist.points) { const v = q.p[x.tag]; if (!v || v.tr == null) continue; m.set(q.t.slice(0, 10), v.tr); } const arr = [...m.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1); for (let i = 1; i < arr.length; i++) { const d = arr[i][1] - arr[i - 1][1]; if (!best || d > best.d) best = { d, tag: x.tag }; } }
    if (best && best.d > 0) recAward('📈', 'Plus gros gain en un jour', nameOf(best.tag), '+' + F(best.d) + ' 🏆');
    const bs = ps.filter((x) => x.bestStreak).sort((a, b) => b.bestStreak.n - a.bestStreak.n)[0];
    if (bs) recAward('🔥', 'Plus longue série', bs.name, bs.bestStreak.n + ' victoires');
    const ws = ps.filter((x) => (x.worstStreak || 0) >= 2).sort((a, b) => b.worstStreak - a.worstStreak)[0];
    if (ws) recAward('🧊', 'Plus longue série de défaites', ws.name, ws.worstStreak + ' défaites');
    const hr = ps.filter((x) => x.ranked && x.ranked.highestAllTimeRankedRank).sort((a, b) => b.ranked.highestAllTimeRankedRank - a.ranked.highestAllTimeRankedRank)[0];
    if (hr) recAward('⚔️', 'Plus haut rang atteint', hr.name, rankTier(hr.ranked.highestAllTimeRankedRank).name);
    const hotS = ps.filter((x) => x.currentStreak >= 2).sort((a, b) => b.currentStreak - a.currentStreak)[0];
    if (hotS) recAward('⚡', 'En feu en ce moment', hotS.name, hotS.currentStreak + " victoires d'affilée");
    // best brawler per map (selected player)
    $('mbT').textContent = '🎯 Meilleur brawler par map · ' + p.name;
    const mb = $('mapBr'); mb.replaceChildren(); const mbl = p.mapBrawler || [];
    if (!mbl.length) mb.append(el('div', 'empty', 'Pas encore assez de combats enregistrés par map.'));
    mbl.forEach((m) => { const r = el('div', 'mb-row');
      const ic = el('div', 'mp-i'); if (m.mapId) ic.append(img(IMG.map(m.mapId), 'mm', '')); if (m.modeId != null) ic.append(img(IMG.mode(m.modeId), 'mo', ''));
      const n = el('div', 'mp-n'); n.append(el('b', null, m.map || '—'), el('small', null, mode(m.mode || 'unknown')));
      const br = el('div', 'mb-br'); if (m.brawlerId) br.append(img(IMG.brawler(m.brawlerId), null, m.brawler)); br.append(el('span', null, m.brawler));
      const v = el('div', 'mp-v'); v.textContent = m.wr + ' %'; v.style.color = m.wr >= 55 ? 'var(--ok)' : m.wr < 45 ? 'var(--bad)' : 'var(--y)'; v.append(el('small', null, m.games + ' combats' + (m.games < 10 ? ' · tendance provisoire' : '')));
      r.append(ic, n, br, v); mb.append(r); });
    // weekly podium
    const pod = $('podium'); pod.replaceChildren();
    const wk = ps.filter((x) => x.week).map((x) => ({ x, t: x.week.trophies })).sort((a, b) => b.t - a.t);
    const medal = ['🥇', '🥈', '🥉'];
    if (!wk.length) pod.append(el('div', 'empty', 'Pas encore de données cette semaine.'));
    wk.slice(0, 3).forEach((e, i) => { const r = el('div', 'pod-row'); r.dataset.k = e.x.tag; r.append(el('span', 'pod-m', medal[i] || '•')); if (e.x.icon) r.append(img(IMG.icon(e.x.icon), null, '')); else r.append(el('span')); r.append(el('b', null, e.x.name)); const v = el('span', 'pod-v', (e.t >= 0 ? '+' : '') + F(e.t) + ' 🏆'); v.style.color = e.t >= 0 ? 'var(--ok)' : 'var(--bad)'; r.append(v); pod.append(r); });
    renderTypeTabs(p);

    // recent battles
    $('batT').textContent = '🕹️ Derniers combats · ' + p.name;
    const list = [...((p.recent && p.recent.list) || [])].reverse(); // newest first
    const counts = { all: list.length, rk: list.filter((b) => (TYPES[b.type] || [])[1] === 'rk2').length, tr: list.filter((b) => b.type === 'ranked').length };
    const fl = $('batF'); fl.replaceChildren(...[['all', 'Tout'], ['rk', 'Classé'], ['tr', 'Trophées']].map(([k, lab]) => { const b = el('button', null, `${lab} (${counts[k]})`); b.type = 'button'; b.setAttribute('aria-pressed', batFilter === k); b.onclick = () => { batFilter = k; batAll = false; renderExtras(p, ps); }; return b; }));
    const shown = list.filter((b) => batFilter === 'all' || (batFilter === 'rk' ? (TYPES[b.type] || [])[1] === 'rk2' : b.type === 'ranked'));
    const bl = $('batL'); bl.replaceChildren();
    if (!shown.length) bl.append(el('div', 'empty', 'Aucun combat de ce type récemment.'));
    shown.slice(0, batAll ? 25 : 8).forEach((b) => bl.append(battleRowEl(b)));
    const mo = $('batMore'); mo.hidden = batAll || shown.length <= 8; mo.textContent = `Afficher les ${shown.length} combats`; mo.onclick = () => { batAll = true; renderExtras(p, ps); };

    // events
    const evs = (data.rotation || []).filter((e) => battleDate(e.end) > Date.now()).sort((a, b) => (a.slot || 0) - (b.slot || 0));
    $('evCard').hidden = !evs.length; const ev = $('evs'); ev.replaceChildren();
    evs.forEach((e) => {
      const c = el('div', 'ev'); const top = el('div', 'ev-top'); top.style.background = MCOL[e.mode] || '#4A4F6A';
      if (e.modeId != null) top.append(img(IMG.mode(e.modeId), null, ''));
      top.append(el('span', 'ev-m', mode(e.mode || 'unknown'))); c.append(top);
      if (e.mapId) c.append(img(IMG.map(e.mapId), 'ev-map', 'Carte ' + (e.map || '')));
      const bt = el('div', 'ev-b'); bt.append(el('b', null, e.map || '—'), el('small', null, until(e.end))); c.append(bt); ev.append(c);
    });

    // Swiss rankings (whole team)
    const chr = $('chr'); chr.replaceChildren(); const CH = data.boards && data.boards.CH;
    ps.forEach((x) => {
      const box = el('div', 'chr-p'); const h = el('div', 'chr-h'); if (x.icon) h.append(img(IMG.icon(x.icon), null, ''));
      const nm = el('b', null, x.name); h.append(nm);
      const myRank = CH && CH.mine && CH.mine[x.tag];
      h.append(el('small', null, myRank ? `· #${myRank} en Suisse 🇨🇭` : CH && CH.min ? `· top 200 suisse : encore ${F(CH.min - x.trophies)} 🏆` : ''));
      box.append(h);
      const tags = el('div', 'tags');
      (x.chBrawlers || []).forEach((b) => { const d = el('span', 'bdg'); d.append(img(IMG.brawler(b.id), null, ''), Object.assign(el('b'), { textContent: '#' + b.rank }), ' ' + b.name); tags.append(d); });
      if (!(x.chBrawlers || []).length && data.brawlerBoards) {
        const near = (x.brawlers || []).slice(0, 8).map((b) => ({ b, bb: data.brawlerBoards[b.id] })).filter((z) => z.bb && z.bb.min && z.bb.n >= 200).map((z) => ({ ...z, gap: z.bb.min - z.b.trophies + 1 })).sort((a, c) => a.gap - c.gap)[0];
        tags.append(el('span', 'note', near ? `Aucun brawler dans le top 200 suisse. Le plus proche : ${near.b.name}, encore ${F(near.gap)} 🏆.` : 'Aucun brawler dans le top 200 suisse.'));
      }
      box.append(tags); chr.append(box);
    });

    // club of the selected player
    const club = p.clubTag && data.clubs && data.clubs[p.clubTag];
    $('clubCard').hidden = !club;
    if (club) {
      $('clubT').textContent = '🛡️ Club · ' + club.name;
      const ch = $('clubH'); ch.replaceChildren(); if (club.badgeId) ch.append(img(IMG.badge(club.badgeId), null, 'Badge du club'));
      const info = el('div'); info.append(el('div', 'big', F(club.trophies) + ' 🏆'), el('p', 'note', `${club.count} membres · dès ${F(club.requiredTrophies)} 🏆 · ${club.type === 'open' ? 'ouvert' : club.type === 'closed' ? 'fermé' : 'sur invitation'}`)); ch.append(info);
      const cl = $('clubL'); cl.replaceChildren();
      const ours = new Set(ps.map((z) => z.tag));
      club.members.forEach((m) => {
        const r = el('div', 'cm' + (ours.has(m.tag) ? ' me' : '')); r.append(el('span', 'pos', '#' + m.pos), m.icon ? img(IMG.icon(m.icon), null, '') : el('span'));
        const n = el('div', 'n'); const nb = el('span', null, m.name); if (m.nameColor && !document.body.classList.contains('light') && m.nameColor !== '#ffffff') nb.style.color = m.nameColor; n.append(nb, el('small', null, ROLES[m.role] || m.role)); r.append(n, el('span', 'val', F(m.trophies)));
        cl.append(r);
      });
    }

    // brawler grid
    const own = [...(p.brawlers || [])]; const ownIds = new Set(own.map((b) => b.id));
    const sorters = { tr: (a, b) => b.trophies - a.trophies, pw: (a, b) => b.power - a.power || b.trophies - a.trophies, st: (a, b) => b.maxStreak - a.maxStreak || b.trophies - a.trophies, nm: (a, b) => a.name.localeCompare(b.name) };
    own.sort(sorters[bgSort]); $('bgS').value = bgSort; $('bgS').onchange = (e) => { bgSort = e.target.value; renderExtras(p, ps); };
    $('bgT').textContent = `🧱 Brawlers · ${own.length} / ${(data.allBrawlers || []).length || p.brawlersTotal}`;
    const g = $('bg'); g.replaceChildren(); const LIM = innerWidth < 700 ? 18 : 40;
    own.forEach((b) => {
      const c = el('div', 'bc'); c.title = `${b.name} · niveau ${b.power} · ${F(b.trophies)} 🏆 (record ${F(b.highestTrophies)})${b.maxStreak ? ' · meilleure série ' + b.maxStreak : ''}${b.prestige ? ' · prestige ' + b.prestige : ''}`;
      c.append(img(IMG.brawler(b.id), null, b.name), el('span', 'bc-p' + (b.power === 11 ? ' max' : ''), String(b.power)));
      if (b.prestige) c.append(el('span', 'bc-x', '★'.repeat(Math.min(3, b.prestige))));
      c.append(el('div', 'bc-t', b.name), el('div', 'bc-s', '🏆 ' + F(b.trophies) + (b.maxStreak >= 5 ? ' · 🔥' + b.maxStreak : '')));
      g.append(c);
    });
    (data.allBrawlers || []).filter((b) => !ownIds.has(b.id)).forEach((b) => { const c = el('div', 'bc lock'); c.append(img(IMG.brawler(b.id), null, b.name), el('div', 'bc-t', b.name), el('div', 'bc-s', '🔒 Pas débloqué')); g.append(c); });
    const cards = [...g.children]; if (!bgAll) cards.slice(LIM).forEach((c) => c.remove());
    const bm = $('bgMore'); bm.hidden = bgAll || cards.length <= LIM; bm.textContent = `Afficher les ${cards.length} brawlers`; bm.onclick = () => { bgAll = true; renderExtras(p, ps); };
  }

  // ---------- graphs ----------
  const RANGES = [['24h', '24 h', 864e5], ['7j', '7 j', 6048e5], ['30j', '30 j', 2592e6], ['all', 'Tout', Infinity]];
  function signedBars(box, items, opts = {}) {
    box.replaceChildren();
    const W = Math.max(280, Math.round(box.clientWidth || 340)), H = opts.height || 190, L = 42, R = 8, T = 16, B = 26;
    const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
    const Y = (v) => T + (H - T - B) * (1 - (v + max) / (2 * max));
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opts.label || 'Graphique' });
    [max, 0, -max].forEach((v) => { svg.append(sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v) }, { stroke: v === 0 ? 'var(--muted)' : 'var(--grid)', opacity: v === 0 ? .55 : 1 })); svg.append(svText(L - 5, Y(v) + 4, (v > 0 ? '+' : '') + F(v), { 'text-anchor': 'end' })); });
    const n = items.length, slot = (W - L - R) / n, bw = Math.min(30, slot * 0.6);
    const every = Math.ceil(n / Math.max(1, Math.floor((W - L) / 42)));
    items.forEach((it, i) => { const cx = L + slot * (i + .5), y0 = Y(0), y1 = Y(it.value), col = it.value >= 0 ? 'var(--ok)' : 'var(--bad)';
      svg.append(sv('rect', { x: cx - bw / 2, y: Math.min(y0, y1), width: bw, height: Math.max(1, Math.abs(y1 - y0)), rx: 3 }, { fill: col }));
      if (i % every === 0) svg.append(svText(cx, H - 6, it.label, { 'text-anchor': 'middle', 'font-size': 10.5 })); });
    box.append(svg);
    attachTip(box, svg, W, H, (xPx) => { const i = Math.floor((xPx - L) / slot); const it = items[i]; if (!it) return null;
      return { x: L + slot * (i + .5), noLine: true, lines: [[null, it.tip || it.label], ['', (it.value >= 0 ? '+' : '') + F(it.value) + ' 🏆']], top: Y(Math.max(0, it.value)) }; });
  }
  // =====================================================================
  //  ZTH motion system — every animation has one trigger and is gated by M.calm()
  // =====================================================================
  const M = (() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const off = () => { try { return localStorage.getItem('cf-motion') === 'off'; } catch (_) { return false; } };
    const calm = () => mq.matches || off();
    const store = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };
    const root = document.documentElement;
    const applyOff = () => { root.dataset.motion = calm() ? 'off' : 'on'; const b = document.getElementById('motionToggle'); if (b) b.textContent = off() ? 'Animations : désactivées' : mq.matches ? 'Animations : réduites (réglage de l’appareil)' : 'Animations : activées'; };
    mq.addEventListener && mq.addEventListener('change', applyOff);
    const o = { switching: false, tro: new Map(), drawn: new Set(), calm };
    // ---- tween a number (data-driven count-up) ----
    const tween = (node, from, to, dur, fmt) => {
      cancelAnimationFrame(node._raf); if (calm() || from === to) { node.textContent = fmt(to); return; }
      const t0 = performance.now(); const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); node.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) node._raf = requestAnimationFrame(step); };
      node._raf = requestAnimationFrame(step);
    };
    o.tween = tween;
    // ---- hero trophies: count-up on first open / player switch / real change ----
    o.hero = (p) => {
      const t = document.getElementById('hTro'); let ic = t.querySelector('.tro-ic'), n = t.querySelector('.tro-n');
      if (!ic) { ic = document.createElement('span'); ic.className = 'tro-ic'; ic.textContent = '🏆'; n = document.createElement('span'); n.className = 'tro-n'; t.replaceChildren(ic, n); }
      const to = +p.trophies || 0, prev = o.tro.get(p.tag); let from = null;
      if (o.switching || prev == null) from = 0; else if (prev !== to) from = prev;
      o.tro.set(p.tag, to);
      if (from == null || from === to) { n.textContent = F(to); return; }
      const big = Math.abs(to - from) > 20000; tween(n, from, to, big ? 500 : Math.min(900, 500 + Math.abs(to - from) / 40), F);
      if (prev != null && prev !== to && !o.switching) { ic.classList.remove('up', 'down'); void ic.offsetWidth; ic.classList.add(to > prev ? 'up' : 'down'); }
    };
    // ---- triggers for list entrances (user actions only, never the silent refresh) ----
    let inT; o.enter = () => { if (calm()) return; document.body.classList.add('mo-in'); clearTimeout(inT); inT = setTimeout(() => document.body.classList.remove('mo-in'), 700); };
    // ---- active nav indicator ----
    o.onTab = (t, fromUser) => { if (fromUser !== undefined) o.enter(); if (t === 'equipe') setTimeout(() => { o.champion(); o.vs(); }, 60); if (t === 'brawlers') o.enter(); };
    // ---- charts: draw once per chart per player, when visible ----
    const io = ('IntersectionObserver' in window) ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); o.drawn.add(e.target.dataset.k); io.unobserve(e.target); } }), { threshold: .25 }) : null;
    o.charts = () => {
      document.querySelectorAll('.chart svg').forEach((svg) => {
        const box = svg.parentElement, key = (box.id || box.className) + '|' + sel; svg.querySelectorAll('path[fill="none"][stroke-linecap="round"]').forEach((p) => { p.setAttribute('pathLength', '1'); });
        if (calm() || !io || o.drawn.has(key)) { svg.classList.add('in'); return; }
        if (box.clientWidth === 0) return; // hidden pane: draw when it is opened
        svg.classList.add('anim-chart'); svg.dataset.k = key; io.observe(svg);
      });
    };
    // ---- before/after a data refresh: FLIP for ranking rows, pulse on changed stats ----
    o.snap = () => { const m = {}; ['race', 'podium', 'cmp'].forEach((id) => { const c = document.getElementById(id); if (!c) return; m[id] = [...c.querySelectorAll('[data-k]')].map((r) => [r.dataset.k, r.getBoundingClientRect().top, r.getBoundingClientRect().height]); }); return m; };
    o.flip = (snap) => {
      if (calm()) return;
      Object.keys(snap).forEach((id) => { const c = document.getElementById(id), old = snap[id]; if (!c || !old.length) return;
        const rows = [...c.querySelectorAll('[data-k]')]; if (old.map((r) => r[0]).join() === rows.map((r) => r.dataset.k).join()) return;
        rows.forEach((r) => { const was = old.find((x) => x[0] === r.dataset.k); const h = r.getBoundingClientRect(); if (!was || !was[2] || !h.height) return; const dy = was[1] - h.top; if (!dy) return;
          r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
          const cls = dy > 0 ? 'mv-up' : 'mv-down'; r.classList.add(cls); setTimeout(() => r.classList.remove(cls), 1400); });
      });
    };
    o.afterData = (prev, d, snap, first) => {
      const lv = document.querySelector('.live'); if (lv && !calm() && !first) { lv.classList.remove('ping'); void lv.offsetWidth; lv.classList.add('ping'); }
      if (!first && prev) {
        o.flip(snap);
        const a = prev.players.find((x) => x.tag === sel), b = d.players.find((x) => x.tag === sel);
        if (a && b && !calm()) [['hTro', a.trophies, b.trophies], ['k3', a.wins3v3, b.wins3v3], ['kWr', a.recent && a.recent.winRate, b.recent && b.recent.winRate]].forEach(([id, x, y]) => { if (x !== y) { const e = document.getElementById(id); if (e) { e.classList.remove('upd'); void e.offsetWidth; e.classList.add('upd'); setTimeout(() => e.classList.remove('upd'), 1700); } } });
      }
      o.detect(d);
      o.afterRender(first);
    };
    // ---- KPI numbers count up from 0 on open / player switch ----
    o.kpis = () => { if (calm()) return; document.querySelectorAll('.pane[data-pane="overview"] .big').forEach((n) => { const t = n.textContent.trim(); if (!/^\d[\d\s\u00a0\u202f]*$/.test(t) || n.children.length) return; const v = parseInt(t.replace(/\D/g, ''), 10); if (v > 0) tween(n, 0, v, 700, F); }); };
    o.homeBat = () => { const src = document.getElementById('batL'), dst = document.getElementById('batHome'); if (!src || !dst) return; dst.replaceChildren(...[...src.children].slice(0, 3).map((n) => n.cloneNode(true))); document.getElementById('homeBat').hidden = !dst.children.length; };
    document.addEventListener('click', (e) => { if (e.target.id === 'homeAll') setTab('combats', true); });
    o.afterRender = (switching) => {
      try { o.homeBat(); } catch (_) {}
      if (switching) { o.enter(); o.ring(); o.kpis(); }
      o.switching = false;
    };
    // ---- progress ring: grows to the real value on first open / switch ----
    o.ring = () => { if (calm()) return; const c = document.querySelector('#kWr svg circle:last-child'); if (!c) return; const fin = c.getAttribute('stroke-dasharray'); if (!fin) return; const C = fin.split(' ')[1];
      c.style.transition = 'none'; c.setAttribute('stroke-dasharray', '0 ' + C); void c.getBoundingClientRect(); c.style.transition = 'stroke-dasharray .6s cubic-bezier(.16,1,.3,1)'; c.setAttribute('stroke-dasharray', fin); };
    // ---- toast / achievement ----
    const host = () => { let h = document.getElementById('toasts'); if (!h) { h = document.createElement('div'); h.id = 'toasts'; h.setAttribute('aria-live', 'polite'); document.body.append(h); } return h; };
    o.toast = (text, kind) => { const t = document.createElement('div'); t.className = 'toast ' + (kind || ''); t.textContent = (kind === 'ok' ? '✓ ' : kind === 'bad' ? '⚠ ' : '') + text; host().append(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220); }, 3800); };
    o.burst = (anchor) => { if (calm() || !anchor) return; const r = anchor.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 12; i++) { const s = document.createElement('i'); s.className = 'pt'; const a = (i / 12) * Math.PI * 2 + Math.random() * .4, d = 28 + Math.random() * 26; s.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${i % 3 ? '#FFC93C' : '#6C3BFF'}`; document.body.append(s); setTimeout(() => s.remove(), 800); } };
    o.achieve = (icon, title, detail) => { const c = document.createElement('div'); c.className = 'ach'; c.setAttribute('role', 'status');
      const b = document.createElement('span'); b.className = 'ach-b'; b.textContent = icon; const tx = document.createElement('div'); tx.innerHTML = '<b></b><small></small>'; tx.firstChild.textContent = title; tx.lastChild.textContent = detail;
      const x = document.createElement('button'); x.type = 'button'; x.className = 'ach-x'; x.setAttribute('aria-label', 'Fermer'); x.textContent = '✕'; const close = () => { c.classList.add('out'); setTimeout(() => c.remove(), 220); }; x.onclick = close;
      c.append(b, tx, x); host().append(c); setTimeout(() => o.burst(b), 120); setTimeout(close, 9000); };
    // ---- genuine achievements only: compared with what this browser saw before ----
    o.detect = (d) => d.players.forEach((p) => {
      const mile = Math.floor((p.trophies || 0) / 5000) * 5000, mk = 'cf-mile:' + p.tag, sm = store.get(mk);
      if (sm == null) store.set(mk, String(mile)); else if (mile > +sm) { store.set(mk, String(mile)); o.achieve('🏆', F(mile) + ' trophées', p.name + ' vient de dépasser ce palier (' + F(p.trophies) + ' actuellement).'); }
      const rk = p.ranked && p.ranked.rankedRank, rkk = 'cf-rank:' + p.tag, sr = store.get(rkk);
      if (rk != null) { if (sr == null) store.set(rkk, String(rk)); else if (rk > +sr) { store.set(rkk, String(rk)); o.achieve('⚔️', 'Promotion Ranked', p.name + ' monte au rang ' + rankTier(rk).name + '.'); } }
      const bs = p.bestStreak && p.bestStreak.n, bk = 'cf-streak:' + p.tag, sb = store.get(bk);
      if (bs) { if (sb == null) store.set(bk, String(bs)); else if (bs > +sb) { store.set(bk, String(bs)); o.achieve('🔥', 'Nouveau record de série', p.name + ' : ' + bs + ' victoires de suite avec ' + p.bestStreak.brawler + '.'); } }
    });
    // ---- weekly champion reveal (once per week, tie-aware) ----
    o.champion = () => {
      if (!data) return; const wk = data.players.filter((x) => x.week && x.week.trophies != null).map((x) => ({ x, t: x.week.trophies })).sort((a, b) => b.t - a.t);
      if (!wk.length || wk[0].t <= 0) return; const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const key = 'cf-champ:' + d.toISOString().slice(0, 10); if (store.get(key)) return;
      const first = document.querySelector('#podium .pod-row'); if (!first || !first.getBoundingClientRect().height) return; store.set(key, '1');
      const tie = wk.length > 1 && wk[1].t === wk[0].t; const lab = document.createElement('span'); lab.className = 'champ'; lab.textContent = tie ? 'Égalité en tête' : 'Champion de la semaine'; first.append(lab);
      if (!calm()) { first.classList.add('reveal'); o.burst(first); const v = first.querySelector('b + *, .pod-v, span:last-of-type'); }
    };
    // ---- head-to-head: players enter from each side, once per comparison ----
    o.vs = () => { const h = document.getElementById('h2h'); if (!h || !h.getBoundingClientRect().height || calm()) return; const sig = [...document.querySelectorAll('#hA, #hB')].map((e) => e.value).join('|') || 'x'; if (h.dataset.vs === sig) return; h.dataset.vs = sig; h.classList.remove('vs-in'); void h.offsetWidth; h.classList.add('vs-in'); setTimeout(() => h.classList.remove('vs-in'), 900); };
    // ---- modal: focus trap, Escape, focus restore ----
    o.modal = ({ title, body, actions, onClose }) => {
      const prevFocus = o.ret || document.activeElement; o.ret = null; const back = document.createElement('div'); back.className = 'modal-back'; const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', title);
      const h = document.createElement('h2'); h.textContent = title; const x = document.createElement('button'); x.type = 'button'; x.className = 'btn modal-x'; x.setAttribute('aria-label', 'Fermer'); x.textContent = '✕';
      const bar = document.createElement('div'); bar.className = 'modal-act'; (actions || []).forEach((a) => bar.append(a)); m.append(x, h, body, bar); back.append(m); document.body.append(back);
      const close = () => { document.removeEventListener('keydown', key, true); back.classList.add('out'); setTimeout(() => { back.remove(); if (onClose) onClose(); if (prevFocus && prevFocus.focus) prevFocus.focus(); }, calm() ? 0 : 180); };
      const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } else if (e.key === 'Tab') { const f = [...m.querySelectorAll('button,a[href],input,select')].filter((n) => !n.disabled); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } };
      document.addEventListener('keydown', key, true); x.onclick = close; back.addEventListener('click', (e) => { if (e.target === back) close(); }); (actions && actions[0] || x).focus(); return close;
    };
    // ---- theme: one short transition on the whole page ----
    o.themeFx = () => { if (calm()) return; root.classList.add('theming'); setTimeout(() => root.classList.remove('theming'), 320); };
    // ---- info tooltips (never the only place for essential info) ----
    let tipEl; const closeTip = () => { if (tipEl) { tipEl.classList.remove('on'); } };
    o.info = (h, text) => { if (!h || h.querySelector('.info')) return; const b = document.createElement('button'); b.type = 'button'; b.className = 'info'; b.textContent = 'i'; b.setAttribute('aria-label', 'Explication : ' + text);
      const show = () => { if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tipbox'; tipEl.setAttribute('role', 'tooltip'); tipEl.id = 'tipbox'; document.body.append(tipEl); } tipEl.textContent = text; const r = b.getBoundingClientRect(); tipEl.style.left = Math.max(8, Math.min(innerWidth - 268, r.left - 120)) + 'px'; tipEl.style.top = (r.bottom + 8 + scrollY) + 'px'; tipEl.classList.add('on'); b.setAttribute('aria-describedby', 'tipbox'); };
      b.onclick = (e) => { e.stopPropagation(); tipEl && tipEl.classList.contains('on') ? closeTip() : show(); }; b.onmouseenter = show; b.onmouseleave = closeTip; b.onfocus = show; b.onblur = closeTip; h.append(' ', b); };
    document.addEventListener('click', closeTip); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTip(); });
    // ---- brawler selection ----
    document.addEventListener('click', (e) => { const c = e.target.closest && e.target.closest('#bg .bc'); if (!c) return; const was = c.classList.contains('sel'); document.querySelectorAll('#bg .bc.sel').forEach((n) => n.classList.remove('sel')); const bi = document.getElementById('bcInfo'); if (was) { bi.hidden = true; return; } c.classList.add('sel'); bi.textContent = c.title; bi.hidden = false; bi.classList.remove('show'); void bi.offsetWidth; bi.classList.add('show'); });
    // ---- filters: short fade on the section that changed ----
    document.addEventListener('click', (e) => { const f = e.target.closest && e.target.closest('.flt button, .seg button, .rng button'); if (!f || calm()) return; const sec = f.closest('section, .card'); if (!sec) return; setTimeout(() => { sec.classList.remove('refilter'); void sec.offsetWidth; sec.classList.add('refilter'); setTimeout(() => sec.classList.remove('refilter'), 260); }, 0); });
    // ---- animations on/off switch (skip / disable) ----
    document.addEventListener('click', (e) => { if (e.target.id === 'motionToggle') { store.set('cf-motion', off() ? 'on' : 'off'); applyOff(); } });
    // ---- brand entrance: once per session, never blocking ----
    o.brand = () => { let seenB = null; try { seenB = sessionStorage.getItem('zth-brand'); sessionStorage.setItem('zth-brand', '1'); } catch (_) {} if (!seenB && !calm()) root.dataset.brand = 'in'; setTimeout(() => { delete root.dataset.brand; }, 700); };
    o.init = () => { applyOff(); o.brand(); setTimeout(() => { o.info(document.getElementById('wrT'), 'Taux calculé sur les combats archivés des 60 derniers jours. Le nombre de victoires et de défaites est toujours affiché à côté.'); o.info(document.getElementById('mbT'), 'Sous 10 combats avec un brawler sur une map, le résultat est une tendance provisoire : trop peu de parties pour conclure.'); o.info(document.querySelector('#podium') && document.querySelector('#podium').closest('section').querySelector('h2'), 'Gain de trophées sur les 7 derniers jours, d\'après l\'historique enregistré par le site.'); }, 0); };
    return o;
  })();
  function drawGraphs() { drawGraphsRaw(); try { M.charts(); } catch (_) {} }
  function drawGraphsRaw() {
    if (!data) return;
    const ps = data.players; const p = player(); const pi = ps.indexOf(p);
    // range buttons
    document.querySelectorAll('[data-rng]').forEach((g) => { g.replaceChildren(...RANGES.map(([k, lab]) => { const b = el('button', null, lab); b.type = 'button'; b.setAttribute('aria-pressed', k === range); b.onclick = () => { range = k; drawGraphs(); }; return b; })); });
    const pts = (hist && hist.points) || []; const span = RANGES.find((r) => r[0] === range)[2];
    const tEnd = pts.length ? new Date(pts[pts.length - 1].t).getTime() : Date.now();
    const win = pts.filter((q) => tEnd - new Date(q.t).getTime() <= span);
    const shortSpan = win.length > 1 && (new Date(win[win.length - 1].t) - new Date(win[0].t)) <= 1.6 * 864e5;
    const timeOpts = (unit) => ({ fmtX: (x) => (shortSpan ? DH : DD).format(new Date(x)), tipTitle: (x) => DT.format(new Date(x)), tipVal: (v) => F(v) + unit });
    const mk = (key) => ps.map((x, i) => ({ name: x.name, color: PCOL(i), hex: PHEX(i), pts: win.map((q) => [new Date(q.t).getTime(), q.p[x.tag] ? q.p[x.tag][key] ?? null : null]) }));
    const legend = (id, ser) => { const l = $(id); l.replaceChildren(...ser.map((s) => { const sp = el('span'); const k = el('i'); k.style.background = s.color; sp.append(k, s.name); return sp; })); };
    const MSG = "L'historique se remplit… revenez dans quelques heures.";
    // A. trophies
    const sT = mk('tr'); const nT = Math.max(0, ...sT.map((s) => s.pts.filter((q) => q[1] != null).length));
    if (nT < 2) { empty($('gTro'), MSG); $('gTroL').replaceChildren(); }
    else {
      // Trophy counts are very different (50 000 vs 140 000): show each player as change since the start of the range when the gap is large.
      const firsts = sT.map((s) => (s.pts.find((q) => q[1] != null) || [0, null])[1]).filter((v) => v != null);
      const spread = Math.max(...firsts) - Math.min(...firsts); const rel = firsts.length > 1 && spread > 5000;
      const ser = rel ? sT.map((s) => { const b = (s.pts.find((q) => q[1] != null) || [0, 0])[1]; return Object.assign({}, s, { abs: s.pts, pts: s.pts.map(([x, y]) => [x, y == null ? null : y - b]) }); }) : sT;
      lineChart($('gTro'), ser, Object.assign(timeOpts(' 🏆'), { label: 'Trophées dans le temps', zero: rel,
        tipVal: rel ? (v, q) => { const s = ser.find((z) => z.pts.includes(q)); const a = s.abs[s.pts.indexOf(q)][1]; return F(a) + ' 🏆 (' + (v >= 0 ? '+' : '') + F(v) + ')'; } : (v) => F(v) + ' 🏆' }));
      legend('gTroL', ser);
      if (rel) $('gTroL').append(el('span', null, '· gain depuis le début de la période'));
    }
    // B. ranked points
    const hasElo = ps.some((x) => elo(x) != null) || pts.some((q) => Object.values(q.p).some((v) => v.elo != null));
    $('gEloCard').hidden = !hasElo;
    if (hasElo) {
      const sE = mk('elo'); const nE = Math.max(0, ...sE.map((s) => s.pts.filter((q) => q[1] != null).length));
      if (nE < 2) { empty($('gElo'), MSG); $('gEloL').replaceChildren(); }
      else { lineChart($('gElo'), sE.filter((s) => s.pts.some((q) => q[1] != null)), Object.assign(timeOpts(' pts'), { label: 'Points de classé dans le temps' })); legend('gEloL', sE.filter((s) => s.pts.some((q) => q[1] != null))); }
    }
    // C. last 25 battles (selected player)
    $('gBatT').textContent = 'Les 25 derniers combats · ' + p.name;
    const list = (p.recent && p.recent.list) || [];
    if (!list.length) { empty($('gBat'), 'Pas de combats récents.'); $('gBatSq').replaceChildren(); }
    else {
      let cum = 0; const cpts = [[0, 0], ...list.map((b, i) => [i + 1, (cum += b.trophyChange || 0)])];
      const col = cum >= 0 ? 'var(--ok)' : 'var(--bad)';
      const desc = (b) => mode(b.mode || 'unknown') + (b.brawler ? ' · ' + b.brawler : '');
      const res = (b) => b.result === 'win' ? 'Victoire' : b.result === 'loss' ? 'Défaite' : 'Autre';
      const tc = (b) => b.trophyChange == null ? '' : ' · ' + (b.trophyChange >= 0 ? '+' : '') + b.trophyChange + ' 🏆';
      lineChart($('gBat'), [{ name: '', color: col, pts: cpts }], { height: 180, zero: true, label: 'Trophées cumulés sur les 25 derniers combats',
        fmtX: (x) => x === 0 ? 'plus ancien' : x >= list.length ? 'récent' : '', tipTitle: (x) => x === 0 ? 'Départ' : desc(list[x - 1]),
        tipVal: (v, q) => q[0] === 0 ? '0' : res(list[q[0] - 1]) + tc(list[q[0] - 1]) + ' · total ' + (v >= 0 ? '+' : '') + F(v) });
      const sq = $('gBatSq'); sq.replaceChildren(...list.map((b) => { const d = el('span'); d.style.background = b.result === 'win' ? 'var(--ok)' : b.result === 'loss' ? 'var(--bad)' : 'var(--muted)'; d.title = res(b) + ' · ' + desc(b) + tc(b); return d; }));
    }
    // D. brawler trophy spread (selected player)
    $('gDistT').textContent = 'Trophées des brawlers · ' + p.name;
    const bt = p.brawlerTrophies || [];
    if (!bt.length) empty($('gDist'), 'Pas de données.');
    else {
      const mx = Math.max(...bt); const raw = mx / 8; const step = [100, 250, 500, 750, 1000, 1500, 2000].find((x) => x >= raw) || 2500;
      const nb = Math.min(10, Math.max(1, Math.floor(mx / step) + 1)); const items = Array.from({ length: nb }, (_, i) => ({ value: 0, i }));
      bt.forEach((v) => items[Math.min(nb - 1, Math.floor(v / step))].value++);
      const lab = (v) => v >= 1000 ? (v / 1000).toLocaleString('fr-CH', { maximumFractionDigits: 2 }) + 'k' : String(v);
      items.forEach((it) => { const a = it.i * step, b = a + step - 1; const last = it.i === nb - 1 && mx > b; it.label = last ? lab(a) + '+' : lab(a); it.tip = last ? F(a) + ' trophées et plus' : F(a) + ' – ' + F(b) + ' trophées'; it.color = PHEX(pi); });
      barChart($('gDist'), items, { label: 'Répartition des trophées des brawlers' });
    }
    // E. power levels (selected player)
    $('gPowT').textContent = 'Niveaux de puissance · ' + p.name;
    const pl = p.powerLevels || [];
    if (!pl.length) empty($('gPow'), 'Pas de données.');
    else barChart($('gPow'), pl.map((v, i) => ({ label: String(i + 1), value: v, color: i === 10 ? 'var(--y)' : 'var(--purple)', tip: 'Niveau ' + (i + 1) })), { label: 'Niveaux de puissance' });
    // F. team modes donut
    const sqM = sumBy(ps.flatMap((x) => x.recent.modes.map((m) => [m.name, m.battles, x.tag])));
    const top = sqM.slice(0, 6); const rest = sqM.slice(6).reduce((s, m) => s + m.n, 0);
    const items = top.map((m, i) => ({ label: mode(m.k), value: m.n, color: MCOL[m.k] || PAL[(i + 3) % PAL.length] })); if (rest) items.push({ label: 'Autres', value: rest, color: '#8A8FA8' });
    donutChart($('gMod'), $('gModL'), items);
    $('gDayT').textContent = 'Trophées par jour · ' + p.name;
    const dMap = new Map();
    for (const q of pts) { const v = q.p[p.tag]; if (!v || v.tr == null) continue; dMap.set(q.t.slice(0, 10), v.tr); }
    const dEnt = [...dMap.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1);
    if (dEnt.length < 2) empty($('gDay'), MSG);
    else { const recd = dEnt.slice(-14), dItems = []; for (let i = 1; i < recd.length; i++) { const dt = new Date(recd[i][0]); dItems.push({ label: DD.format(dt).replace('.', ''), value: recd[i][1] - recd[i - 1][1], tip: new Intl.DateTimeFormat('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }).format(dt) }); } signedBars($('gDay'), dItems, { label: 'Trophées par jour' }); }
    $('gHoursT').textContent = 'Quand ' + p.name + ' joue';
    const ph = p.playHours || [];
    if (!ph.some((v) => v)) empty($('gHours'), 'Pas encore assez de combats enregistrés.');
    else { const peak = ph.indexOf(Math.max(...ph)); barChart($('gHours'), ph.map((v, h) => ({ label: h + 'h', value: v, color: h === peak ? 'var(--y)' : 'var(--purple)', tip: h + 'h-' + ((h + 1) % 24) + 'h' })), { unit: 'combat', label: 'Combats par heure' }); }
    // win rate over time (Classé vs Trophées), selected player
    $('wrT').textContent = '🎯 Taux de victoire · ' + p.name;
    const WRV = [['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois']];
    $('wrView').replaceChildren(...WRV.map(([k, lab]) => { const b = el('button', null, lab); b.type = 'button'; b.setAttribute('aria-pressed', wrView === k); b.onclick = () => { wrView = k; drawGraphs(); }; return b; }));
    const wrTile = (lbl, o, col) => { const d = el('div', 'wrb'); d.append(el('div', 'lbl', lbl)); const big = el('div', 'big', o.rate == null ? '—' : o.rate + ' %'); big.style.color = o.rate == null ? 'var(--muted)' : col; d.append(big, el('div', 'note', o.w + ' V · ' + o.l + ' D')); return d; };
    $('wrNow').replaceChildren(wrTile('⚔️ Classé', (p.wr && p.wr.ranked) || { rate: null, w: 0, l: 0 }, 'var(--pink)'), wrTile('🏆 Trophées', (p.wr && p.wr.ladder) || { rate: null, w: 0, l: 0 }, 'var(--y)'));
    const wlog = (p.wrLog && p.wrLog[wrView]) || [];
    const toPts = (wk, lk) => wlog.map((b) => { const w = b[wk], l = b[lk]; return [new Date(b.k).getTime(), w + l ? Math.round(w / (w + l) * 100) : null]; });
    const wser = [{ name: 'Classé', color: 'var(--pink)', pts: toPts('rw', 'rl') }, { name: 'Trophées', color: 'var(--y)', pts: toPts('lw', 'll') }].filter((se) => se.pts.some((q) => q[1] != null));
    if (!wser.length) { empty($('gWR'), 'Pas encore assez de combats enregistrés.'); $('gWRL').replaceChildren(); }
    else { const fx = wrView === 'month' ? (xx) => new Intl.DateTimeFormat('fr-CH', { month: 'short' }).format(new Date(xx)) : (xx) => new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' }).format(new Date(xx));
      const tt = wrView === 'month' ? (xx) => new Intl.DateTimeFormat('fr-CH', { month: 'long', year: 'numeric' }).format(new Date(xx)) : (xx) => new Intl.DateTimeFormat('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(xx));
      lineChart($('gWR'), wser, { label: 'Taux de victoire', fmtX: fx, tipTitle: tt, tipVal: (v) => v + ' %' }); legend('gWRL', wser); }
    // per-type WR charts (Trophées tab + Ranked tab)
    [['wrViewLad'], ['wrViewRk']].forEach(([id]) => { const g = $(id); if (g) g.replaceChildren(...WRV.map(([k, lab]) => { const b = el('button', null, lab); b.type = 'button'; b.setAttribute('aria-pressed', wrView === k); b.onclick = () => { wrView = k; drawGraphs(); }; return b; })); });
    const wrTypeChart = (boxId, wk, lk, col, nm) => { const box = $(boxId); if (!box) return; const pts = ((p.wrLog && p.wrLog[wrView]) || []).map((b) => { const w = b[wk], l = b[lk]; return [new Date(b.k).getTime(), w + l ? Math.round(w / (w + l) * 100) : null]; }); if (!pts.some((q) => q[1] != null)) { empty(box, 'Pas encore assez de combats enregistrés.'); return; } const fxx = wrView === 'month' ? (xx) => new Intl.DateTimeFormat('fr-CH', { month: 'short' }).format(new Date(xx)) : (xx) => new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' }).format(new Date(xx)); lineChart(box, [{ name: nm, color: col, pts }], { label: nm, fmtX: fxx, tipTitle: (xx) => new Date(xx).toLocaleDateString('fr-CH'), tipVal: (v) => v + ' %' }); };
    wrTypeChart('gWRlad', 'lw', 'll', 'var(--y)', 'Trophées'); wrTypeChart('gWRrk', 'rw', 'rl', 'var(--pink)', 'Classé');
  }
  const normTag = (t) => (t || '').replace(/^#/, '').toUpperCase();
  let sel = null;
  try { sel = normTag(new URLSearchParams(location.search).get('p')); } catch (_) {}
  if (!sel) { try { sel = localStorage.getItem('cf-player'); } catch (_) {} }
  // Change the selected player everywhere: state, saved choice, and the address bar (so the link is shareable).
  let swapT; const setSel = (tag) => { const prevSel = sel; sel = tag; try { localStorage.setItem('cf-player', tag); } catch (_) {}
    try { const u = new URL(location.href); u.searchParams.set('p', tag); history.replaceState(null, '', u); } catch (_) {}
    const order = (data && data.players || []).map((x) => x.tag), dir = Math.sign(order.indexOf(tag) - order.indexOf(prevSel)) || 1;
    document.body.style.setProperty('--dir', dir); document.body.classList.add('swap', 'intro'); clearTimeout(swapT); swapT = setTimeout(() => document.body.classList.remove('swap', 'intro'), 900);
    document.body.classList.add('anim'); clearTimeout(animT); animT = setTimeout(() => document.body.classList.remove('anim'), 800); M.switching = true; render(); M.afterRender(true); };
  let A = null, B = null, animT;

  // ---------- theme ----------
  const setTheme = (light) => { M.themeFx(); document.body.classList.toggle('light', light); $('theme').textContent = light ? 'Sombre' : 'Clair'; };
  let light = false; try { light = localStorage.getItem('cf-theme') === 'light'; } catch (_) {}
  setTheme(light);
  $('theme').onclick = () => { light = !light; setTheme(light); if (data) drawGraphs(); try { localStorage.setItem('cf-theme', light ? 'light' : 'dark'); } catch (_) {} };

  // ---------- helpers ----------
  const barRow = (label, value, max, color, valText, icon) => {
    const r = el('div', 'row');
    const l = el('span', 'row-l'); const d = icon ? img(icon, null, '') : el('span', 'dot'); if (!icon) d.style.background = color; l.append(d, el('span', null, label));
    const t = el('div', 'track'); const f = el('div', 'fill'); f.style.width = (max ? value / max * 100 : 0) + '%'; f.style.background = color; t.append(f);
    r.append(l, t, el('span', 'val', valText ?? F(value))); return r;
  };
  const player = () => data.players.find((p) => p.tag === sel) || data.players[0];
  const pct = (o) => o && o.total ? o.owned / o.total * 100 : 0;
  const completion = (p) => { const g = p.progress; const xs = [g.starPowers, g.gadgets, g.brawlers, g.maxPower].filter((x) => x && x.total); return xs.length ? Math.round(xs.reduce((s, x) => s + pct(x), 0) / xs.length * 10) / 10 : 0; };
  const sumBy = (rows) => { const m = new Map(); rows.forEach(([k, n, who]) => { const x = m.get(k) || { n: 0, who: new Set() }; x.n += n; x.who.add(who); m.set(k, x); }); return [...m].map(([k, x]) => ({ k, n: x.n, who: x.who.size })).sort((a, b) => b.n - a.n); };

  // ---------- render ----------
  function render() { try {
    const ps = data.players; const p = player(); sel = p.tag;

    // hero
    $('hWarn').hidden = !p.incomplete;
    $('hName').textContent = p.name; $('hName').style.color = p.nameColor || '';
    $('hMeta').textContent = '#' + p.tag + ' · Niveau ' + F(p.expLevel) + (p.prestige ? ' · Prestige total ' + F(p.prestige) : '');
    const av = $('hAva'); if (p.icon) { av.src = IMG.icon(p.icon); av.alt = 'Icône de ' + p.name; av.hidden = false; } else av.hidden = true;
    const pills = $('hPills'); pills.replaceChildren();
    const pill = (src, txt) => { const d = el('span', 'pill'); if (src) d.append(img(src, null, '')); d.append(txt); pills.append(d); };
    (p.alts || []).forEach((a) => pill(null, '🔗 Stats fusionnées avec ' + a.name + ' (' + F(a.trophies) + ' 🏆)'));
    if (p.ranked && p.ranked.rankedRank) pill(IMG.rank(p.ranked.rankedRank), rankTier(p.ranked.rankedRank).name + ' · ' + F(p.ranked.rankedElo) + ' pts');
    const club = p.clubTag && data.clubs && data.clubs[p.clubTag];
    if (p.club) pill(club && club.badgeId ? IMG.badge(club.badgeId) : null, (club ? '' : 'Club ') + p.club);
    if (p.fameTier) pill(null, '⭐ ' + p.fameTier.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()));
    if (p.currentStreak >= 3) pill(null, "🔥 " + p.currentStreak + " victoires d'affilée");
    else if (p.currentStreak <= -3) pill(null, "🧊 " + (-p.currentStreak) + " défaites d'affilée");
    const hs = $('hSeen'), sv = seen(p.lastBattle); hs.replaceChildren(el('span', 'sdot ' + sv.cls), el('span', null, sv.label)); hs.title = "D'apres la derniere partie - l'API Brawl Stars ne donne pas le statut en ligne"; hs.hidden = false;
    M.hero(p);
    const nearRec = !p.highestTrophies || p.trophies / p.highestTrophies >= 0.99;
    if (nearRec) {
      const step = p.trophies >= 100000 ? 10000 : 5000, nx = Math.floor(p.trophies / step) * step + step;
      $('hFill').style.width = ((p.trophies - (nx - step)) / step * 100) + '%';
      $('hBest').textContent = (p.trophies >= p.highestTrophies ? 'Au record ! 🔥' : 'Record ' + F(p.highestTrophies)) + ' · Prochain palier ' + F(nx);
      $('hLvl').textContent = 'encore ' + F(nx - p.trophies);
    } else {
      $('hFill').style.width = (p.trophies / p.highestTrophies * 100) + '%';
      $('hBest').textContent = 'Record ' + F(p.highestTrophies);
      $('hLvl').textContent = 'À ' + F(p.highestTrophies - p.trophies) + ' du record';
    }
    const tk = $('hTake'); tk.replaceChildren();
    const rc = p.recent;
    if (rc.battles) {
      tk.append('Sur les ', Object.assign(el('b'), { textContent: rc.battles }), ' derniers combats : ', Object.assign(el('b'), { textContent: rc.wins + ' victoires' }),
        rc.trophyChange != null ? ', ' : '.', ...(rc.trophyChange != null ? [Object.assign(el('b'), { textContent: (rc.trophyChange >= 0 ? '+' : '') + F(rc.trophyChange) + ' trophées' }), '.'] : []));
    } else tk.textContent = 'Aucun combat récent.';

    // chips
    const ch = $('chips'); ch.replaceChildren();
    const leadTag = ps.reduce((m, x) => x.trophies > m.trophies ? x : m, ps[0]).tag;
    ps.forEach((x) => { const b = el('button', 'chip' + (x.tag === leadTag ? ' lead' : '')); const sv = seen(x.lastBattle); b.append(el('span', 'sdot ' + sv.cls)); if (x.icon) b.append(img(IMG.icon(x.icon), null, '')); b.append(x.name + ' · ' + F(x.trophies) + ' 🏆'); b.title = sv.label; b.setAttribute('aria-pressed', x.tag === p.tag); b.onclick = () => setSel(x.tag); ch.append(b); });

    // KPIs
    const w = $('kWr'); w.replaceChildren();
    if (rc.winRate != null) {
      const R = 34, C = 2 * Math.PI * R, ns = 'http://www.w3.org/2000/svg';
      const s = document.createElementNS(ns, 'svg'); s.setAttribute('width', 84); s.setAttribute('height', 84); s.setAttribute('viewBox', '0 0 84 84'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', rc.winRate + ' % de victoires');
      const c1 = document.createElementNS(ns, 'circle'); Object.entries({ cx: 42, cy: 42, r: R, fill: 'none', 'stroke-width': 10 }).forEach(([k, v]) => c1.setAttribute(k, v)); c1.style.stroke = 'var(--grid)';
      const c2 = document.createElementNS(ns, 'circle'); Object.entries({ cx: 42, cy: 42, r: R, fill: 'none', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': `${C * rc.winRate / 100} ${C}`, transform: 'rotate(-90 42 42)' }).forEach(([k, v]) => c2.setAttribute(k, v));
      c2.style.stroke = rc.winRate >= 50 ? 'var(--ok)' : 'var(--bad)'; s.append(c1, c2);
      const box = el('div'); box.append(el('div', 'wr-num', rc.winRate + ' %'), el('p', 'note', rc.wins + ' victoires sur ' + rc.decided + ' combats'));
      if (p.wr) box.append(el('p', 'note', '⚔️ Classé ' + (p.wr.ranked.rate == null ? '—' : p.wr.ranked.rate + '%') + ' · 🏆 Troph. ' + (p.wr.ladder.rate == null ? '—' : p.wr.ladder.rate + '%')));
      w.append(s, box);
    } else w.textContent = '—';
    $('k3').textContent = F(p.wins3v3);
    $('kSd').textContent = 'Solo ' + F(p.soloWins) + ' · Duo ' + F(p.duoWins);
    $('kTop').textContent = p.topBrawler ? p.topBrawler.name : '—';
    $('kTopT').textContent = p.topBrawler ? F(p.topBrawler.trophies) + ' trophées' : '';
    const kti = $('kTopI'); if (p.topBrawler && p.topBrawler.id) { kti.src = IMG.brawler(p.topBrawler.id); kti.hidden = false; } else kti.hidden = true;
    const bs = p.bestStreak; $('kStr').textContent = bs ? bs.n + ' victoires' : '—'; $('kStrT').textContent = bs ? 'avec ' + bs.brawler : '';
    const ksi = $('kStrI'); if (bs && bs.id) { ksi.src = IMG.brawler(bs.id); ksi.hidden = false; } else ksi.hidden = true;
    $('kOwn').textContent = p.brawlersOwned + ' / ' + p.brawlersTotal;
    $('kMax').textContent = p.maxPower + ' au niveau 11';

    // what's missing
    const mb = $('missBars'); mb.replaceChildren();
    [['⭐ Pouvoirs stellaires', p.progress.starPowers], ['🔧 Gadgets', p.progress.gadgets], ['🧍 Brawlers', p.progress.brawlers], ['💪 Brawlers niveau 11', p.progress.maxPower]].forEach(([name, o]) => {
      const it = el('div', 'miss-item'); const top = el('div', 'miss-top'); const miss = o.total - o.owned;
      const onOwned = name.includes('stellaires') ? p.missing.starPowers.length : name.includes('Gadgets') ? p.missing.gadgets.length : null;
      const locked = onOwned == null ? 0 : Math.max(0, miss - onOwned);
      top.append(el('b', null, name), miss > 0 ? el('span', 'miss-n', F(miss) + ' manquant' + (miss > 1 ? 's' : '')) : el('span', 'done', '✓ Complet'));
      const t = el('div', 'track'); const f = el('div', 'fill'); f.style.width = pct(o) + '%'; f.style.background = miss > 0 ? 'linear-gradient(90deg,#6C3BFF,#FF3D7F)' : 'var(--ok)'; t.append(f);
      it.append(top, t, el('div', 'note', F(o.owned) + ' / ' + F(o.total) + ' · ' + Math.round(pct(o)) + ' %' + (locked ? ' · dont ' + F(locked) + ' sur des brawlers pas encore débloqués' : ''))); mb.append(it);
    });
    const ml = $('missLists'); ml.replaceChildren();
    const listBlock = (title, items, fmt) => {
      if (!items.length) return;
      const d = el('details'); d.append(el('summary', null, title + ' (' + items.length + ')'));
      const tg = el('div', 'tags'); items.forEach((x) => { const s = el('span', 'tag'); fmt(s, x); tg.append(s); }); d.append(tg); ml.append(d);
    };
    listBlock('Voir les pouvoirs stellaires manquants (brawlers débloqués)', p.missing.starPowers, (s, x) => { if (x.id) s.append(img(IMG.sp(x.id), 'ico s', '')); s.append(' ' + x.name + ' '); s.append(el('small', null, '· ' + x.brawler + (x.power < 9 ? ' (niv. ' + x.power + ')' : ''))); });
    listBlock('Voir les gadgets manquants (brawlers débloqués)', p.missing.gadgets, (s, x) => { if (x.id) s.append(img(IMG.gadget(x.id), 'ico s', '')); s.append(' ' + x.name + ' '); s.append(el('small', null, '· ' + x.brawler + (x.power < 7 ? ' (niv. ' + x.power + ')' : ''))); });
    listBlock('Voir les brawlers manquants', p.missing.brawlers.map((n, i) => ({ n, id: (p.missing.brawlerIds || [])[i] })), (s, x) => { if (x.id) s.append(img(IMG.brawler(x.id), 'ico s', '')); s.append(' ' + x.n); });
    const cp = $('completion'); cp.replaceChildren();
    ps.map((x) => ({ x, c: completion(x) })).sort((a, b) => b.c - a.c).forEach(({ x, c }, i) => cp.append(barRow((['🥇 ', '🥈 ', '🥉 '][i] || '') + x.name, c, 100, 'linear-gradient(90deg,#FFC93C,#FF9F1C)', c + ' %')));

    // ranked
    const R = p.ranked || {};
    const hasRk = R.rankedElo != null;
    $('rankedCard').hidden = !hasRk;
    if (hasRk) {
      const r = $('ranked'); r.replaceChildren();
      [['Actuel', R.rankedRank, R.rankedElo], ['Record de la saison', R.highestSeasonRankedRank, R.highestSeasonRankedElo], ['Record absolu', R.highestAllTimeRankedRank, R.highestAllTimeRankedElo]]
        .filter(([, n, e]) => n != null && e != null).forEach(([lab, n, elo]) => {
          const t = rankTier(n); const c = el('div', 'rk'); c.style.background = t.bg;
          const em = img(IMG.rank(n), null, 'Rang ' + t.name); const info = el('div');
          info.append(el('p', 'rk-l', lab), el('div', 'rk-n', t.name), el('div', 'rk-p', F(elo) + ' pts'));
          c.append(em, info); r.append(c);
        });
    }

    // ranked race
    const rr = ps.filter((x) => elo(x) != null && x.ranked && x.ranked.rankedRank != null).sort((a, b) => elo(b) - elo(a));
    $('raceCard').hidden = rr.length < 2;
    const race = $('race'); race.replaceChildren();
    const rmax = Math.max(1, ...rr.map((x) => Math.max(elo(x), x.ranked.highestAllTimeRankedElo || 0)));
    rr.forEach((x, i) => {
      const t = rankTier(x.ranked.rankedRank);
      const row = barRow((i === 0 ? '👑 ' : '') + x.name, elo(x), rmax, t.bg, t.name + ' · ' + F(elo(x)), IMG.rank(x.ranked.rankedRank)); row.querySelector('.fill').style.background = t.bg;
      const tr = row.querySelector('.track'); tr.style.overflow = 'visible';
      if (x.ranked.highestAllTimeRankedElo) { const mk = el('div', 'race-mk'); mk.style.left = `calc(${x.ranked.highestAllTimeRankedElo / rmax * 100}% - 1px)`; tr.append(mk); }
      row.dataset.k = x.tag; race.append(row);
    });

    // modes / brawlers
    const md = $('modes'); md.replaceChildren(); const mMax = Math.max(1, ...rc.modes.map((m) => m.battles));
    rc.modes.forEach((m) => md.append(barRow(mode(m.name), m.battles, mMax, MCOL[m.name] || '#8A8FA8', null, modeId(m.name) != null ? IMG.mode(modeId(m.name)) : null)));
    if (!rc.modes.length) md.append(el('p', 'empty', 'Aucun combat récent.'));
    const bd = $('brawlers'); bd.replaceChildren(); const bMax = Math.max(1, ...rc.brawlers.map((m) => m.battles));
    const bid = (n) => { const b = (p.brawlers || []).find((z) => z.name === n) || (data.allBrawlers || []).find((z) => z.name === n); return b ? b.id : null; };
    rc.brawlers.forEach((m, i) => { const id = bid(m.name); bd.append(barRow(m.name, m.battles, bMax, PAL[i % PAL.length], null, id ? IMG.brawler(id) : null)); });
    if (!rc.brawlers.length) bd.append(el('p', 'empty', 'Aucun combat récent.'));

    renderExtras(p, ps);

    // awards
    const aw = $('awards'); aw.replaceChildren();
    const award = (title, emoji, get, unit) => {
      const sc = ps.map((x) => ({ x, v: get(x) })).filter((o) => o.v != null && !isNaN(o.v)); if (!sc.length) return;
      const best = Math.max(...sc.map((o) => o.v)); const wl = sc.filter((o) => o.v === best).map((o) => o.x.name); const who = wl.length > 1 ? wl.slice(0, -1).join(', ') + ' et ' + wl[wl.length - 1] : wl[0];
      const c = el('div', 'award'); c.append(el('div', 'e', emoji), el('p', 't', title), el('div', 'n', who), el('div', 'v', F(best) + ' ' + unit)); aw.append(c);
    };
    award('Roi des trophées', '🏆', (x) => x.trophies, 'trophées');
    award('Boss du classé', '👑', (x) => elo(x), 'points de classé');
    award('En feu', '🔥', (x) => x.recent.winRate, '% de victoires récentes');
    award('Joueur d\'équipe', '🤝', (x) => x.wins3v3, 'victoires 3c3');
    award('Star du Survivant', '💀', (x) => (x.soloWins || 0) + (x.duoWins || 0), 'victoires au Survivant');
    award('Collectionneur', '🎒', (x) => x.brawlersOwned, 'brawlers');
    award('Le plus maxé', '💪', (x) => x.maxPower, 'brawlers niveau 11');

    // totals
    const tt = $('totals'); tt.replaceChildren();
    const wrs = ps.map((x) => x.recent.winRate).filter((v) => v != null);
    [['Joueurs', ps.length], ['Trophées au total', ps.reduce((s, x) => s + (x.trophies || 0), 0)], ['Victoires 3c3 au total', ps.reduce((s, x) => s + (x.wins3v3 || 0), 0)],
     ['Victoires au Survivant', ps.reduce((s, x) => s + (x.soloWins || 0) + (x.duoWins || 0), 0)], ['Victoires récentes en moyenne', wrs.length ? Math.round(wrs.reduce((a, b) => a + b, 0) / wrs.length) : null, ' %']]
      .forEach(([l, v, suf]) => { const c = el('div', 'card acc'); c.style.setProperty('--c', 'var(--y)'); c.append(el('p', 'lbl', l), el('div', 'big', v == null ? '—' : F(v) + (suf || ''))); tt.append(c); });

    // fun facts
    const fc = $('facts'); fc.replaceChildren(); const add = (e, t) => { const li = el('li'); li.append(el('span', null, e), el('span', null, t)); fc.append(li); };
    const byT = [...ps].sort((a, b) => b.trophies - a.trophies);
    if (byT.length >= 2) { const rest = byT.slice(1).reduce((s, x) => s + x.trophies, 0);
      add('🏆', byT[0].trophies > rest ? `${byT[0].name} a plus de trophées que tous les autres réunis (${F(byT[0].trophies)} contre ${F(rest)}).` : `${byT[0].name} mène aux trophées avec ${F(byT[0].trophies)}, soit ${F(byT[0].trophies - byT[1].trophies)} de plus que ${byT[1].name}.`); }
    if (rr.length >= 2) {
      const first = rr[0], last = rr[rr.length - 1];
      add('⚔️', `Seulement ${F(elo(first) - elo(last))} points de classé séparent le premier (${first.name}, ${rankTier(first.ranked.rankedRank).name}) du dernier (${last.name}, ${rankTier(last.ranked.rankedRank).name}).`);
      const masters = ps.filter((x) => (x.ranked?.highestAllTimeRankedRank || 0) >= 19).length;
      if (masters) add('🟢', masters === ps.length ? 'Vous avez tous déjà atteint Maître ou plus à votre meilleur niveau.' : `${masters} joueurs sur ${ps.length} ont déjà atteint Maître ou plus.`);
    }
    const sqM = sumBy(ps.flatMap((x) => x.recent.modes.map((m) => [m.name, m.battles, x.tag])));
    if (sqM.length) { const tied = sqM.filter((m) => m.n === sqM[0].n).map((m) => mode(m.k)); add('🎮', tied.length > 1 ? `Les modes préférés de l'équipe en ce moment : ${tied.slice(0, -1).join(', ') + ' et ' + tied[tied.length - 1]} (${sqM[0].n} combats récents chacun).` : `Le mode préféré de l'équipe en ce moment : ${tied[0]} (${sqM[0].n} combats récents).`); }
    const sqB = sumBy(ps.flatMap((x) => x.recent.brawlers.map((m) => [m.name, m.battles, x.tag])));
    const shared = sqB.filter((b) => b.who >= 2).slice(0, 3).map((b) => b.k);
    if (shared.length) add('🤝', `${shared.join(', ')} ${shared.length > 1 ? 'sont joués' : 'est joué'} par plusieurs d'entre vous ces derniers temps.`);
    const byW = [...ps].sort((a, b) => (b.wins3v3 || 0) - (a.wins3v3 || 0));
    add('💥', `Ensemble, vous avez gagné ${F(ps.reduce((s, x) => s + (x.wins3v3 || 0), 0))} parties en 3c3, dont ${F(byW[0].wins3v3)} pour ${byW[0].name}.`);
    const hot = [...ps].filter((x) => x.recent.trophyChange != null).sort((a, b) => b.recent.trophyChange - a.recent.trophyChange)[0];
    if (hot && hot.recent.trophyChange > 0) add('📈', `${hot.name} est en forme : +${F(hot.recent.trophyChange)} trophées sur ses derniers combats.`);

    // milestones + pace projection (from the last 7 days of history)
    const paceOf = (tag) => { if (!hist || !hist.points) return null; const pp = hist.points.filter((q) => q.p[tag] && q.p[tag].tr != null); if (pp.length < 2) return null; const last = new Date(pp[pp.length - 1].t), from = last - 7 * 864e5; const rc = pp.filter((q) => new Date(q.t) >= from); if (rc.length < 2) return null; const d = rc[rc.length - 1].p[tag].tr - rc[0].p[tag].tr, days = (new Date(rc[rc.length - 1].t) - new Date(rc[0].t)) / 864e5; return days > 0 ? d / days : null; };
    const ms = $('milestones'); ms.replaceChildren();
    ps.map((x) => { const step = x.trophies >= 100000 ? 10000 : 5000; const next = Math.floor(x.trophies / step) * step + step; return { x, next, go: next - x.trophies, pc: (x.trophies - (next - step)) / step * 100 }; })
      .sort((a, b) => a.go - b.go).forEach(({ x, next, go, pc }) => {
        const box = el('div'); const top = el('div', 'ms-top'); top.append(el('b', null, x.name + ' → ' + F(next) + ' 🏆'), el('span', 'ms-go', 'encore ' + F(go)));
        const t = el('div', 'track'); const f = el('div', 'fill'); f.style.width = pc + '%'; f.style.background = 'linear-gradient(90deg,#6C3BFF,#FFC93C)'; t.append(f); box.append(top, t);
        const pace = paceOf(x.tag);
        if (pace && pace > 0) { const days = Math.ceil(go / pace); const dt = new Date(Date.now() + days * 864e5); box.append(el('div', 'ms-eta', days <= 120 ? `à ce rythme : ~${DDay.format(dt)}` : 'à ce rythme : dans plusieurs mois')); }
        else if (pace != null && pace <= 0) box.append(el('div', 'ms-eta', 'en baisse ces derniers jours'));
        ms.append(box);
      });

    // head to head
    const fillSel = (s, v) => { s.replaceChildren(...ps.map((x) => new Option(x.name, x.tag))); s.value = v; };
    if (!ps.find((x) => x.tag === A)) A = ps[0].tag; if (!ps.find((x) => x.tag === B)) B = (ps[1] || ps[0]).tag;
    fillSel($('hA'), A); fillSel($('hB'), B);
    if (A === B && ps.length > 1) B = ps.find((x) => x.tag !== A).tag;
    fillSel($('hB'), B);
    $('hA').onchange = (e) => { const old = A; A = e.target.value; if (A === B) B = old; render(); };
    $('hB').onchange = (e) => { const old = B; B = e.target.value; if (A === B) A = old; render(); };
    const a = ps.find((x) => x.tag === A), b = ps.find((x) => x.tag === B); const h = $('h2h'); h.replaceChildren();
    const head = el('div', 'h2h-row'); const ha = el('div', 'win', a.name); ha.style.cssText = 'text-align:right;color:#FFC93C';
    const hb = el('div', 'win', b.name); hb.style.color = '#FF3D7F'; head.append(ha, el('div', 'h2h-l', 'contre'), hb); h.append(head);
    [['Trophées', (x) => x.trophies], ['Record de trophées', (x) => x.highestTrophies], ['Points de classé', (x) => elo(x)], ['Record classé', (x) => x.ranked?.highestAllTimeRankedElo], ['Victoires 3c3', (x) => x.wins3v3], ['Victoires solo', (x) => x.soloWins],
     ['Victoires duo', (x) => x.duoWins], ['% victoires récentes', (x) => x.recent.winRate, ' %'], ['Brawlers niveau 11', (x) => x.maxPower], ['Brawler avec le plus de trophées 🏆', (x) => x.topBrawler?.trophies]]
      .forEach(([lab, get, suf]) => {
        const va = get(a), vb = get(b), mx = Math.max(va || 0, vb || 0) || 1;
        const side = (v, col, left, win) => { const s = el('div', 'side' + (left ? ' l' : '')); const bar = el('div', 'hb'); bar.style.background = col; bar.style.width = (v == null ? 0 : v / mx * 70) + '%';
          s.append(bar, el('span', win ? 'win' : '', v == null ? '—' : F(v) + (suf || ''))); return s; };
        const r = el('div', 'h2h-row'); r.append(side(va, '#FFC93C', true, va != null && (vb == null || va > vb)), el('div', 'h2h-l', lab), side(vb, '#FF3D7F', false, vb != null && (va == null || vb > va))); h.append(r);
      });

    // squad modes / brawlers
    const sm = $('sqModes'); sm.replaceChildren(); const smx = Math.max(1, ...sqM.map((m) => m.n));
    sqM.forEach((m) => sm.append(barRow(mode(m.k), m.n, smx, MCOL[m.k] || '#8A8FA8', null, modeId(m.k) != null ? IMG.mode(modeId(m.k)) : null)));
    const sb = $('sqBrawlers'); sb.replaceChildren(); const top8 = sqB.slice(0, 8); const sbx = Math.max(1, ...top8.map((m) => m.n));
    top8.forEach((m, i) => sb.append(barRow(m.k + (m.who > 1 ? ' 👥' : ''), m.n, sbx, PAL[i % PAL.length])));

    // compare
    const cb = $('cmp'); cb.replaceChildren();
    [...ps].sort((x, y) => y.trophies - x.trophies).forEach((x) => {
      const tr = el('tr', x.tag === p.tag ? 'sel' : ''); tr.dataset.k = x.tag;
      [x.name, '#' + x.tag, F(x.trophies), F(x.highestTrophies), F(x.wins3v3), x.wr && x.wr.ranked.rate != null ? x.wr.ranked.rate + ' %' : '—', x.wr && x.wr.ladder.rate != null ? x.wr.ladder.rate + ' %' : '—', x.topBrawler ? x.topBrawler.name : '—']
        .forEach((v, i) => tr.append(el('td', i >= 2 && i <= 6 ? 'num' : '', v)));
      const sv = seen(x.lastBattle), sc = el('td'); sc.append(el('span', 'sdot ' + sv.cls), ' ' + sv.label.replace('Vu ', '')); tr.append(sc);
      tr.tabIndex = 0; tr.setAttribute('aria-label', 'Voir ' + x.name);
      tr.onclick = () => { setSel(x.tag); window.scrollTo({ top: 0, behavior: 'smooth' }); };
      tr.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tr.onclick(); } };
      cb.append(tr);
    });
    try { drawGraphs(); } catch (e) { console.warn('graphs', e); }
    tick();
    } catch (err) { console.error('render error', err); document.body.classList.remove('loading'); }
  }

  // ---------- "updated X min ago" ----------
  function tick() {
    if (!data) return;
    const mins = Math.max(0, Math.round((Date.now() - new Date(data.updatedAt)) / 60000));
    const lv = document.querySelector('.live'); lv.classList.toggle('warn', mins >= 20 && mins < 60); lv.classList.toggle('dead', mins >= 60);
    lv.title = mins >= 60 ? 'Plus de mise à jour depuis plus d\'une heure' : mins >= 20 ? 'Mise à jour en retard' : 'En direct';
    $('ago').textContent = mins < 1 ? "à l'instant" : mins < 60 ? `il y a ${mins} min` : `il y a ${Math.round(mins / 60)} h`;
  }

  // ---------- load + auto-refresh every minute (data changes every ~5 min) ----------
  let rz; let lastW = innerWidth; addEventListener('resize', () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rz); rz = setTimeout(() => data && drawGraphs(), 150); });
  async function loadHistory() {
    try {
      const r = await fetch('history.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return; const h = await r.json();
      if (!hist || h.updatedAt !== hist.updatedAt) { hist = h; if (data) drawGraphs(); }
    } catch (_) { /* history is optional */ }
  }
  async function load() {
    loadHistory();
    try {
      const r = await fetch('data.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      if (!data || d.updatedAt !== data.updatedAt) {
        const first = !data, prevData = data, snap = M.snap(); if (first) document.body.classList.add('anim'); data = d; render(); document.body.classList.remove('loading'); M.afterData(prevData, d, snap, first);
        if (first) { document.body.classList.add('intro'); setTimeout(() => document.body.classList.remove('intro'), 1200); clearTimeout(animT); animT = setTimeout(() => document.body.classList.remove('anim'), 900); }
      }
      $('loadErr').hidden = true; checkStale(); return true;
    } catch (e) { $('loadErr').hidden = false; return false; }
  }
  $('share').onclick = async () => {
    const p = data && player(); if (!p) return;
    let url; try { const u = new URL(location.href); u.searchParams.set('p', p.tag); url = u.href; } catch (_) { url = location.href; }
    const txt = p.name; const btn = $('share'); const done = (ok) => { btn.textContent = ok ? '✓ Lien copié !' : url; setTimeout(() => { btn.textContent = '🔗 Partager ce joueur'; }, 2500); };
    try { if (navigator.share) { await navigator.share({ title: 'Stats de ' + txt, url }); return; } } catch (_) { return; }
    try { await navigator.clipboard.writeText(url); done(true); } catch (_) { done(false); }
  };
  // ---------- shareable stat card (canvas → image) ----------
  function drawStar(x, cx, cy, R, r, fill, stroke, w) {
    x.beginPath(); for (let i = 0; i < 10; i++) { const rad = i % 2 === 0 ? R : r, a = i * Math.PI / 5; const px = cx + rad * Math.sin(a), py = cy - rad * Math.cos(a); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath();
    x.fillStyle = fill; x.fill(); if (stroke) { x.lineWidth = w; x.strokeStyle = stroke; x.stroke(); }
  }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function fitText(x, txt, fx, fy, maxW, size, font) { let sz = size; do { x.font = '800 ' + sz + 'px ' + font; if (x.measureText(txt).width <= maxW) break; sz -= 2; } while (sz > 20); x.fillText(txt, fx, fy); }
  async function buildCard(p) {
    try { await document.fonts.ready; } catch (_) {}
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const DISP = '"Lilita One", system-ui, sans-serif', SANS = 'system-ui, -apple-system, sans-serif';
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1B0B40'); g.addColorStop(.55, '#4A1FB8'); g.addColorStop(1, '#C2187A'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const blob = (cx, cy, rad, col) => { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, rad); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H); };
    blob(250, 260, 440, 'rgba(255,61,127,.45)'); blob(860, 520, 480, 'rgba(108,59,255,.5)');
    x.textBaseline = 'middle'; x.textAlign = 'left';
    drawStar(x, 95, 112, 44, 19, '#FFC93C', '#2A1600', 6);
    x.fillStyle = '#fff'; x.font = '400 54px ' + DISP; x.fillText('ZTH STATS', 150, 116);
    x.textAlign = 'right'; x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '500 30px ' + SANS; x.fillText(new Date().toLocaleDateString('fr-CH'), W - 70, 116); x.textAlign = 'left';
    x.fillStyle = '#FFC93C'; fitText(x, p.name, 70, 290, W - 140, 120, DISP);
    x.fillStyle = 'rgba(255,255,255,.8)'; x.font = '500 38px ' + SANS; x.fillText('#' + p.tag + '  ·  Niveau ' + F(p.expLevel), 72, 372);
    x.font = '400 150px ' + DISP; x.fillStyle = '#fff'; x.fillText('🏆', 70, 540); const tw = x.measureText('🏆  ').width;
    x.fillStyle = '#FFC93C'; x.fillText(F(p.trophies), 70 + tw, 540);
    x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '600 40px ' + SANS; x.fillText('trophées', 76, 648);
    const r = p.ranked || {}, tiles = [];
    if (r.rankedRank) tiles.push(['⚔️  Classé', rankTier(r.rankedRank).name + ' · ' + F(r.rankedElo)]);
    if (p.wr && p.wr.ranked.rate != null) tiles.push(['🎯  WR Classé', p.wr.ranked.rate + ' %']);
    if (p.wr && p.wr.ladder.rate != null) tiles.push(['🏆  WR Trophées', p.wr.ladder.rate + ' %']);
    if (p.currentStreak >= 3) tiles.push(['🔥  Série', p.currentStreak + ' d\'affilée']);
    if (p.topBrawler) tiles.push(['⭐  Brawler avec le plus de trophées', p.topBrawler.name]);
    tiles.push(['🧱  Collection', p.brawlersOwned + ' / ' + p.brawlersTotal]);
    tiles.push(['💥  Victoires 3c3', F(p.wins3v3)]);
    const tt = tiles.slice(0, 4), tileW = (W - 140 - 40) / 2, tileH = 175, ox = 70, oy = 740;
    tt.forEach((t, i) => { const col = i % 2, row = (i / 2) | 0, tx = ox + col * (tileW + 40), ty = oy + row * (tileH + 30);
      rr(x, tx, ty, tileW, tileH, 26); x.fillStyle = 'rgba(0,0,0,.3)'; x.fill();
      x.fillStyle = 'rgba(255,255,255,.72)'; x.font = '600 30px ' + SANS; x.fillText(t[0], tx + 32, ty + 52);
      x.fillStyle = '#fff'; fitText(x, String(t[1]), tx + 32, ty + 118, tileW - 64, 50, DISP); });
    x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '400 40px ' + DISP; x.fillText('caloug.github.io/zth', 70, H - 92);
    x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '400 25px ' + SANS; x.fillText('Fan non officiel · Brawl Stars est une marque de Supercell', 70, H - 46);
    return await new Promise((res) => c.toBlob(res, 'image/png'));
  }
  async function shareCard() {
    const p = data && player(); if (!p) return; const btn = $('card'), old = btn.textContent; M.ret = document.activeElement; btn.textContent = '…'; btn.disabled = true;
    try {
      const blob = await buildCard(p); const name = 'zth-' + p.name.replace(/[^a-z0-9]/gi, '_') + '.png'; const file = new File([blob], name, { type: 'image/png' });
      const url = URL.createObjectURL(blob); const im = document.createElement('img'); im.src = url; im.alt = 'Carte de stats de ' + p.name; im.className = 'card-prev';
      const share = el('button', 'btn pri', 'Partager'); const dl = el('a', 'btn', 'Télécharger'); dl.href = url; dl.download = name;
      share.onclick = async () => { try { if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'Stats de ' + p.name, text: p.name + ' · ' + F(p.trophies) + ' trophées' }); else dl.click(); } catch (_) {} };
      M.modal({ title: 'Carte de ' + p.name, body: im, actions: [share, dl], onClose: () => URL.revokeObjectURL(url) });
    } catch (e) { console.warn('card', e); M.toast('Impossible de créer la carte', 'bad'); }
    btn.textContent = old; btn.disabled = false;
  }
  $('card').onclick = shareCard;
  $('reload').onclick = async () => {
    const r = $('reload'); if (r.disabled) return; r.disabled = true; r.classList.add('spinning'); r.setAttribute('aria-busy', 'true');
    let ok = false; try { ok = await load(); } finally { r.classList.remove('spinning'); r.disabled = false; r.removeAttribute('aria-busy'); }
    M.toast(ok ? 'Stats actualisées · ' + $('ago').textContent : 'Échec de l\'actualisation — les dernières données sont conservées', ok ? 'ok' : 'bad');
  };

  // ---------- tabs: move each tagged section into its pane, then switch panes ----------
  (function introCard() { const c = $('introCard'); if (!c) return; let seenIt = false; try { seenIt = localStorage.getItem('cf-intro') === '1'; } catch (_) {} c.hidden = seenIt; $('introX').onclick = () => { c.hidden = true; try { localStorage.setItem('cf-intro', '1'); } catch (_) {} }; })();
  (function guides() {
    const G = [["8-Bit","8bit"],["Alli","alli"],["Amber","amber"],["Angelo","angelo"],["Ash","ash"],["Barley","barley"],["Bea","bea"],["Belle","belle"],["Berry","berry"],["Bibi","bibi"],["Bo","bo"],["Bolt","bolt"],["Bonnie","bonnie"],["Brock","brock"],["Bull","bull"],["Buster","buster"],["Buzz","buzz"],["Byron","byron"],["Carl","carl"],["Charlie","charlie"],["Chester","chester"],["Chuck","chuck"],["Clancy","clancy"],["Colette","colette"],["Colt","colt"],["Cordelius","cordelius"],["Cosmo","cosmo"],["Crow","crow"],["Damian","damian"],["Darryl","darryl"],["Doug","doug"],["Draco","draco"],["Dynamike","dynamike"],["Edgar","edgar"],["El Primo","elprimo"],["Emz","emz"],["Eve","eve"],["Fang","fang"],["Finx","finx"],["Frank","frank"],["Gale","gale"],["Gene","gene"],["Gigi","gigi"],["Glowy","glowy"],["Gray","gray"],["Griff","griff"],["Grom","grom"],["Gus","gus"],["Hank","hank"],["Jacky","jacky"],["Jae-Yong","jaeyong"],["Janet","janet"],["Jessie","jessie"],["Juju","juju"],["Kaze","kaze"],["Kenji","kenji"],["Kit","kit"],["Larry & Lawrie","larrylawrie"],["Leon","leon"],["Lily","lily"],["Lola","lola"],["Lou","lou"],["Lumi","lumi"],["Maisie","maisie"],["Mandy","mandy"],["Max","max"],["Meeple","meeple"],["Meg","meg"],["Melodie","melodie"],["Mico","mico"],["Mina","mina"],["Moe","moe"],["Mortis","mortis"],["Mr. P","mrp"],["Najia","najia"],["Nani","nani"],["Nita","nita"],["Nori","nori"],["Ollie","ollie"],["Otis","otis"],["Pam","pam"],["Pearl","pearl"],["Penny","penny"],["Pierce","pierce"],["Piper","piper"],["Poco","poco"],["R-T","rt"],["Rico","rico"],["Rosa","rosa"],["Ruffs","ruffs"],["Sam","sam"],["Sandy","sandy"],["Shade","shade"],["Shelly","shelly"],["Sirius","sirius"],["Spike","spike"],["Sprout","sprout"],["Squeak","squeak"],["Starr Nova","starrnova"],["Stu","stu"],["Surge","surge"],["Tara","tara"],["Tick","tick"],["Trunk","trunk"],["Vince","vince"],["Wendy","wendy"],["Willow","willow"],["Ziggy","ziggy"]], grid = document.getElementById('gdGrid'), inp = document.getElementById('gdFilter');
    if (!grid) return;
    G.forEach(([n, slug]) => { const a = document.createElement('a'); a.href = 'https://powerleagueprodigy.com/' + slug; a.target = '_blank'; a.rel = 'noopener'; a.textContent = n; a.dataset.n = n.toLowerCase(); grid.appendChild(a); });
    inp.addEventListener('input', () => { const q = inp.value.trim().toLowerCase(); grid.querySelectorAll('a').forEach((a) => { a.style.display = !q || a.dataset.n.includes(q) ? '' : 'none'; }); });
  })();
  const TAB_LIST = ['overview', 'combats', 'brawlers', 'equipe', 'tierlist'];
  (function layoutTabs() {
    TAB_LIST.forEach((t) => {
      const pane = document.querySelector(`.pane[data-pane="${t}"]`); if (!pane) return;
      [...document.querySelectorAll(`[data-tab="${t}"][data-o]`)].sort((a, b) => (+a.dataset.o) - (+b.dataset.o)).forEach((el) => pane.appendChild(el));
    });
    const g = $('graphs'); if (g) g.remove(); // its charts have been moved out
  })();

  M.init();
  let curTab = 'overview';
  function setTab(t, fromUser) {
    if (!TAB_LIST.includes(t)) t = 'overview';
    const pdir = Math.sign(TAB_LIST.indexOf(t) - TAB_LIST.indexOf(curTab));
    curTab = t; M.onTab(t, fromUser);
    document.querySelectorAll('.pane').forEach((pn) => pn.style.setProperty('--pdir', pdir));
    document.querySelectorAll('.tab').forEach((b) => { const on = b.dataset.tab === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('.pane').forEach((pn) => pn.classList.toggle('on', pn.dataset.pane === t));
    try { localStorage.setItem('cf-tab', t); } catch (_) {}
    try { history.replaceState(null, '', '#' + t); } catch (_) {}
    if (data) { try { drawGraphs(); } catch (_) {} }        // size charts now that their pane is visible
    if (fromUser) { const y = $('tabs').getBoundingClientRect().top + scrollY - 4; if (scrollY > y) scrollTo({ top: y, behavior: 'smooth' }); }
  }
  document.querySelectorAll('.tab').forEach((b) => { b.onclick = () => setTab(b.dataset.tab, true); });
  function setSub(sub) {
    if (!['all', 'trophy', 'ranked'].includes(sub)) sub = 'all';
    const pn = document.querySelector('.pane[data-pane="combats"]'); if (pn) pn.dataset.sub = sub;
    document.querySelectorAll('#cSeg button').forEach((b) => b.classList.toggle('on', b.dataset.sub === sub));
    try { localStorage.setItem('cf-sub', sub); } catch (_) {}
    if (data) { try { drawGraphs(); } catch (_) {} }
  }
  document.querySelectorAll('#cSeg button').forEach((b) => { b.onclick = () => setSub(b.dataset.sub); });
  (function initSub() { let h = '', sub = 'all'; try { h = location.hash.replace('#', ''); sub = localStorage.getItem('cf-sub') || 'all'; } catch (_) {} if (h === 'trophy' || h === 'ranked') sub = h; setSub(sub); })();
  (function initTab() { let t; try { t = location.hash.replace('#', '') || localStorage.getItem('cf-tab'); } catch (_) {} if (t === 'trophy' || t === 'ranked') t = 'combats'; if (t === 'classe') t = 'equipe'; setTab(TAB_LIST.includes(t) ? t : 'overview'); })();

  load();
  $('retry').onclick = () => load();
  function checkStale() { const b = $('staleBar'); if (!b || !data) return; const m = Math.floor((Date.now() - new Date(data.updatedAt)) / 6e4); if (m < 30) { b.hidden = true; return; } b.hidden = false; b.textContent = '⚠️ Ces stats datent d\'il y a ' + (m < 120 ? m + ' min' : Math.round(m / 60) + ' h') + ' : la mise à jour automatique est peut-être en panne.'; }
  const plainHeads = () => document.querySelectorAll('h2').forEach((h) => { const n = h.firstChild; if (n && n.nodeType === 3) { const t = n.textContent.replace(/^[\p{Extended_Pictographic}\uFE0F\u200d\s]+/u, ''); if (t !== n.textContent) n.textContent = t; } });
  plainHeads(); setInterval(plainHeads, 1500);
  setInterval(load, 60 * 1000); setInterval(checkStale, 60 * 1000);
  setInterval(tick, 20 * 1000);
  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
