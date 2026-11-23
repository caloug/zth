// ZTH control bot — a Cloudflare Worker that handles Discord slash commands and buttons.
//
// It needs (set in the Cloudflare dashboard):
//   - var    DISCORD_PUBLIC_KEY : the app's public key (verifies Discord's signatures)
//   - secret GH_TOKEN           : a GitHub token that can run Actions (for /maj)
//   - KV      CONFIG            : a KV namespace bound as CONFIG (stores notif on/off)
// Settings used in code:
const REPO = 'caloug/zth';
const WORKFLOW = 'update.yml';
const DATA_URL = 'https://caloug.github.io/zth/data.json';
const SITE = 'https://caloug.github.io/zth/';

const TIERS = ['Bronze', 'Argent', 'Or', 'Diamant', 'Mythique', 'Légendaire', 'Maître', 'Pro'];
const tierName = (n) => { if (n == null) return '—'; const i = Math.min(7, Math.max(0, Math.floor((n - 1) / 3))); const d = i === 7 ? '' : [' I', ' II', ' III'][(n - 1) % 3]; return TIERS[i] + d; };
const F = (v) => v == null ? '—' : Number(v).toLocaleString('fr-CH').replace(/[’']/g, ' ');
const PURPLE = 0x6C3BFF, GOLD = 0xFFC93C, GREEN = 0x3DDC84, RED = 0xFF5C6C;

// ---- Discord signature check (Ed25519) ----
const hex2bytes = (hex) => { const a = new Uint8Array(hex.length / 2); for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16); return a; };
async function verify(request, body, publicKey) {
  const sig = request.headers.get('x-signature-ed25519'), ts = request.headers.get('x-signature-timestamp');
  if (!sig || !ts) return false;
  try {
    const key = await crypto.subtle.importKey('raw', hex2bytes(publicKey), { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify({ name: 'Ed25519' }, key, hex2bytes(sig), new TextEncoder().encode(ts + body));
  } catch { return false; }
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
const msg = (data) => json({ type: 4, data });        // reply
const ephemeral = (data) => json({ type: 4, data: { ...data, flags: 64 } }); // reply only the clicker sees

// ---- data helpers ----
async function getData() { const r = await fetch(DATA_URL + '?t=' + Date.now(), { cf: { cacheTtl: 0 } }); if (!r.ok) throw new Error('data ' + r.status); return r.json(); }
const findPlayer = (d, q) => { if (!q) return null; const t = q.replace(/^#/, '').toUpperCase(); return d.players.find((p) => p.tag === t || p.name.toLowerCase() === q.toLowerCase()); };

function statsEmbed(d, p) {
  const r = p.ranked || {};
  const fields = [
    { name: '🏆 Trophées', value: `${F(p.trophies)} (record ${F(p.highestTrophies)})`, inline: true },
    { name: '⚔️ Classé', value: r.rankedRank ? `${tierName(r.rankedRank)} · ${F(r.rankedElo)} pts` : '—', inline: true },
    { name: '🎯 WR Classé', value: p.wr?.ranked?.rate != null ? `${p.wr.ranked.rate} %` : '—', inline: true },
    { name: '🏆 WR Trophées', value: p.wr?.ladder?.rate != null ? `${p.wr.ladder.rate} %` : '—', inline: true },
    { name: '🧱 Brawlers', value: `${p.brawlersOwned} / ${p.brawlersTotal}`, inline: true },
    { name: '🥊 Victoires 3c3', value: F(p.wins3v3), inline: true },
  ];
  if (p.week) fields.push({ name: '📅 Cette semaine', value: `${p.week.trophies >= 0 ? '+' : ''}${F(p.week.trophies)} 🏆 · ${F(p.week.battles)} combats`, inline: true });
  return { title: `📊 ${p.name}`, url: SITE + '?p=' + p.tag, color: PURPLE, fields, footer: { text: 'ZTH · stats en direct' } };
}
function teamStatsEmbed(d) {
  const lines = [...d.players].sort((a, b) => b.trophies - a.trophies).map((p) => {
    const r = p.ranked || {}; return `**${p.name}** — 🏆 ${F(p.trophies)} · ⚔️ ${r.rankedRank ? tierName(r.rankedRank) + ' (' + F(r.rankedElo) + ')' : '—'}`;
  });
  return { title: '📊 Stats de l\'équipe', url: SITE, color: PURPLE, description: lines.join('\n'), footer: { text: 'ZTH · stats en direct' } };
}
function classeEmbed(d) {
  const rk = d.players.filter((p) => p.ranked && p.ranked.rankedElo != null).sort((a, b) => b.ranked.rankedElo - a.ranked.rankedElo);
  const medals = ['🥇', '🥈', '🥉'];
  const lines = rk.map((p, i) => `${medals[i] || '•'} **${p.name}** — ${tierName(p.ranked.rankedRank)} · ${F(p.ranked.rankedElo)} pts`);
  return { title: '⚔️ Classé — qui est devant ?', color: GOLD, description: lines.join('\n') || 'Pas de données classé.', footer: { text: 'ZTH' } };
}

async function getHistory() { try { const r = await fetch('https://caloug.github.io/zth/history.json?t=' + Date.now(), { cf: { cacheTtl: 0 } }); return r.ok ? (await r.json()).points : null; } catch { return null; } }
function weekEmbed(d) {
  const sg = (v, s = '') => v == null ? '—' : (v > 0 ? '+' : '') + F(v) + s;
  const lines = d.players.filter((p) => p.week).map((p) => { const w = p.week; return `**${p.name}** — 🏆 ${sg(w.trophies)}${w.elo != null ? ` · ⚔️ ${sg(w.elo, ' pts')}` : ''} · 🎮 ${F(w.battles)}${w.winRate != null ? ` · ${w.winRate}% V` : ''}` + (w.brawler ? `\n   Brawler : ${w.brawler.name}` : '') + (w.bestMap ? ` · Top map : ${w.bestMap.map} (${w.bestMap.wr}%)` : ''); });
  return { title: '📅 Résumé de la semaine', color: PURPLE, description: lines.join('\n\n') || 'Pas de données.' };
}
function compareEmbed(d, aTag, bTag) {
  const A = d.players.find((p) => p.tag === aTag), B = d.players.find((p) => p.tag === bTag);
  if (!A || !B || A === B) return { title: 'Comparer', description: 'Choisis deux joueurs différents.', color: RED };
  const rk = (p) => p.ranked?.rankedRank ? `${tierName(p.ranked.rankedRank)} (${F(p.ranked.rankedElo)})` : '—';
  const row = (lab, av, bv) => `${lab} — **${av}** vs **${bv}**`;
  return { title: `⚔️ ${A.name} vs ${B.name}`, color: PURPLE, description: [
    row('🏆 Trophées', F(A.trophies), F(B.trophies)), row('⚔️ Classé', rk(A), rk(B)),
    row('🎯 WR Classé', (A.wr?.ranked?.rate ?? '—') + '%', (B.wr?.ranked?.rate ?? '—') + '%'),
    row('🏆 WR Trophées', (A.wr?.ladder?.rate ?? '—') + '%', (B.wr?.ladder?.rate ?? '—') + '%'),
    row('💥 3c3', F(A.wins3v3), F(B.wins3v3)), row('🧱 Brawlers', A.brawlersOwned + '/' + A.brawlersTotal, B.brawlersOwned + '/' + B.brawlersTotal),
  ].join('\n') };
}
function mapEmbed(d, tag) {
  const p = d.players.find((x) => x.tag === tag) || d.players[0];
  const maps = (p.maps || []).filter((m) => m.wr != null && m.w + m.l >= 3);
  const fmt = (m) => `${m.map} — ${m.wr}% (${m.w}V/${m.l}D)`;
  return { title: `🗺️ Maps de ${p.name}`, color: PURPLE, fields: [
    { name: '✅ Meilleures', value: [...maps].sort((a, b) => b.wr - a.wr).slice(0, 5).map(fmt).join('\n') || '—' },
    { name: '😤 Pires', value: [...maps].sort((a, b) => a.wr - b.wr).slice(0, 3).map(fmt).join('\n') || '—' },
  ], footer: { text: 'Min. 3 combats enregistrés par map' } };
}
function recordsEmbed(d, hist) {
  const ps = d.players, nameOf = (t) => (ps.find((x) => x.tag === t) || {}).name || t, lines = [];
  let best = null; if (hist) for (const x of ps) { const m = new Map(); for (const q of hist) { const v = q.p[x.tag]; if (!v || v.tr == null) continue; m.set(q.t.slice(0, 10), v.tr); } const arr = [...m.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1); for (let i = 1; i < arr.length; i++) { const dd = arr[i][1] - arr[i - 1][1]; if (!best || dd > best.d) best = { d: dd, tag: x.tag }; } }
  if (best && best.d > 0) lines.push(`📈 Plus gros gain/jour : **${nameOf(best.tag)}** +${F(best.d)} 🏆`);
  const bs = ps.filter((x) => x.bestStreak).sort((a, b) => b.bestStreak.n - a.bestStreak.n)[0]; if (bs) lines.push(`🔥 Plus longue série : **${bs.name}** ${bs.bestStreak.n} victoires`);
  const ws = ps.filter((x) => (x.worstStreak || 0) >= 2).sort((a, b) => b.worstStreak - a.worstStreak)[0]; if (ws) lines.push(`🧊 Plus longue série de défaites : **${ws.name}** ${ws.worstStreak}`);
  const hr = ps.filter((x) => x.ranked?.highestAllTimeRankedRank).sort((a, b) => b.ranked.highestAllTimeRankedRank - a.ranked.highestAllTimeRankedRank)[0]; if (hr) lines.push(`⚔️ Plus haut rang : **${hr.name}** ${tierName(hr.ranked.highestAllTimeRankedRank)}`);
  return { title: "🏆 Records de l'équipe", color: GOLD, description: lines.join('\n') || '—' };
}
function brawlerEmbed(d, tag) {
  const p = d.players.find((x) => x.tag === tag) || d.players[0];
  const mb = (p.mapBrawler || []).slice(0, 6).map((m) => `${m.map} : **${m.brawler}** (${m.wr}%)`);
  return { title: `🧱 Brawlers de ${p.name}`, color: PURPLE, description: [
    `⭐ Meilleur brawler : **${p.topBrawler?.name || '—'}**${p.topBrawler ? ` (${F(p.topBrawler.trophies)} 🏆)` : ''}`,
    p.bestStreak ? `🔥 Meilleure série : **${p.bestStreak.brawler}** ${p.bestStreak.n} victoires` : null,
    `🧱 Collection : **${p.brawlersOwned}/${p.brawlersTotal}**`,
    mb.length ? `\n**Meilleur brawler par map :**\n` + mb.join('\n') : null,
  ].filter(Boolean).join('\n') };
}
const panelComponents = () => [{
  type: 1, components: [
    { type: 2, style: 1, custom_id: 'maj', label: 'Mettre à jour', emoji: { name: '🔄' } },
    { type: 2, style: 2, custom_id: 'stats', label: 'Stats équipe', emoji: { name: '📊' } },
    { type: 2, style: 2, custom_id: 'classe', label: 'Classé', emoji: { name: '⚔️' } },
    { type: 2, style: 2, custom_id: 'semaine', label: 'Semaine', emoji: { name: '📅' } },
    { type: 2, style: 2, custom_id: 'records', label: 'Records', emoji: { name: '🏆' } },
    { type: 2, style: 2, custom_id: 'notifs', label: 'Notifs', emoji: { name: '🔔' } },
    { type: 2, style: 5, label: 'Ouvrir le site', url: SITE },
  ],
}];

async function getConfig(env) { try { const c = await env.CONFIG.get('config', 'json'); return c || { notifs: true }; } catch { return { notifs: true }; } }
async function setConfig(env, c) { try { await env.CONFIG.put('config', JSON.stringify(c)); } catch {} }

async function triggerUpdate(env) {
  const r0 = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST', headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'zth-bot', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify({ ref: 'main' }),
  });
  return r0.status === 204;
}
// Anybody in the server can trigger an update, but at most once per 90 s (shared), to avoid spam.
async function triggerWithCooldown(env) {
  const c = await getConfig(env); const now = Date.now();
  if (c.lastMaj && now - c.lastMaj < 90000) return { ok: true, wait: Math.ceil((90000 - (now - c.lastMaj)) / 1000) };
  const ok = await triggerUpdate(env); if (ok) { c.lastMaj = now; await setConfig(env, c); }
  return { ok, wait: 0 };
}

// ---- interaction routing ----
async function handle(interaction, env) {
  if (interaction.type === 1) return json({ type: 1 }); // PING
  const name = interaction.data?.name;
  const cid = interaction.data?.custom_id;
  const opt = (n) => interaction.data?.options?.find((o) => o.name === n)?.value;

  // slash commands
  if (interaction.type === 2) {
    if (name === 'stats') { const d = await getData(); const who = opt('joueur'); const p = findPlayer(d, who); return msg({ embeds: [p ? statsEmbed(d, p) : teamStatsEmbed(d)] }); }
    if (name === 'classe') { const d = await getData(); return msg({ embeds: [classeEmbed(d)] }); }
    if (name === 'maj') { const r = await triggerWithCooldown(env); return ephemeral({ content: r.wait ? `⏳ Une mise à jour vient d'être lancée. Réessaie dans ${r.wait} s.` : r.ok ? '🔄 Mise à jour lancée ! Les nouvelles stats arrivent dans ~1 min.' : '❌ Échec (token GitHub ?).' }); }
    if (name === 'notifs') { const c = await getConfig(env); const v = opt('etat'); c.notifs = v === 'on'; await setConfig(env, c); return ephemeral({ content: c.notifs ? '🔔 Notifications **activées**.' : '🔕 Notifications **coupées**.' }); }
    if (name === 'semaine') { const d = await getData(); return msg({ embeds: [weekEmbed(d)] }); }
    if (name === 'compare') { const d = await getData(); return msg({ embeds: [compareEmbed(d, opt('joueur1'), opt('joueur2'))] }); }
    if (name === 'map') { const d = await getData(); return msg({ embeds: [mapEmbed(d, opt('joueur'))] }); }
    if (name === 'records') { const d = await getData(); const h = await getHistory(); return msg({ embeds: [recordsEmbed(d, h)] }); }
    if (name === 'brawler') { const d = await getData(); return msg({ embeds: [brawlerEmbed(d, opt('joueur'))] }); }
    if (name === 'panneau') return msg({ embeds: [{ title: '🎮 Panneau ZTH', description: 'Contrôle le bot avec les boutons ci-dessous.', color: PURPLE }], components: panelComponents() });
    return ephemeral({ content: 'Commande inconnue.' });
  }

  // button clicks
  if (interaction.type === 3) {
    if (cid === 'maj') { const r = await triggerWithCooldown(env); return ephemeral({ content: r.wait ? `⏳ Déjà lancée, réessaie dans ${r.wait} s.` : r.ok ? '🔄 Mise à jour lancée !' : '❌ Échec (token GitHub ?).' }); }
    if (cid === 'stats') { const d = await getData(); return ephemeral({ embeds: [teamStatsEmbed(d)] }); }
    if (cid === 'classe') { const d = await getData(); return ephemeral({ embeds: [classeEmbed(d)] }); }
    if (cid === 'semaine') { const d = await getData(); return ephemeral({ embeds: [weekEmbed(d)] }); }
    if (cid === 'records') { const d = await getData(); const h = await getHistory(); return ephemeral({ embeds: [recordsEmbed(d, h)] }); }
    if (cid === 'notifs') { const c = await getConfig(env); c.notifs = !c.notifs; await setConfig(env, c); return ephemeral({ content: c.notifs ? '🔔 Notifications **activées**.' : '🔕 Notifications **coupées**.' }); }
    return ephemeral({ content: 'Bouton inconnu.' });
  }
  return json({ type: 4, data: { content: '?' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // public config endpoint, read by the stats updater to know if notifications are on
    if (request.method === 'GET' && url.pathname === '/config.json') return json(await getConfig(env));
    if (request.method === 'GET') return new Response('ZTH bot en ligne ✅', { status: 200 });
    const body = await request.text();
    if (!(await verify(request, body, env.DISCORD_PUBLIC_KEY))) return new Response('bad signature', { status: 401 });
    return handle(JSON.parse(body), env);
  },
  // Cloudflare Cron: triggers the stats update on a schedule (replaces GitHub's own scheduler)
  async scheduled(event, env) { await triggerUpdate(env); },
};
