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
    { name: '🎯 Victoires récentes', value: p.recent && p.recent.winRate != null ? `${p.recent.winRate} %` : '—', inline: true },
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

const panelComponents = () => [{
  type: 1, components: [
    { type: 2, style: 1, custom_id: 'maj', label: 'Mettre à jour', emoji: { name: '🔄' } },
    { type: 2, style: 2, custom_id: 'stats', label: 'Stats équipe', emoji: { name: '📊' } },
    { type: 2, style: 2, custom_id: 'classe', label: 'Classé', emoji: { name: '⚔️' } },
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
    if (name === 'panneau') return msg({ embeds: [{ title: '🎮 Panneau ZTH', description: 'Contrôle le bot avec les boutons ci-dessous.', color: PURPLE }], components: panelComponents() });
    return ephemeral({ content: 'Commande inconnue.' });
  }

  // button clicks
  if (interaction.type === 3) {
    if (cid === 'maj') { const r = await triggerWithCooldown(env); return ephemeral({ content: r.wait ? `⏳ Déjà lancée, réessaie dans ${r.wait} s.` : r.ok ? '🔄 Mise à jour lancée !' : '❌ Échec (token GitHub ?).' }); }
    if (cid === 'stats') { const d = await getData(); return ephemeral({ embeds: [teamStatsEmbed(d)] }); }
    if (cid === 'classe') { const d = await getData(); return ephemeral({ embeds: [classeEmbed(d)] }); }
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
