// Sends Discord messages when something notable happens (rank-up, trophy milestone)
// and a weekly recap on Monday mornings. It compares the current run to a small saved
// state (notify-state.json) so each event is announced once.
//
// Needs the env var DISCORD_WEBHOOK (a Discord channel webhook URL, kept as a GitHub secret).
// Without it, nothing is sent. Set NOTIFY_DRYRUN=1 to print messages instead of sending them.

import { readFile, writeFile } from 'node:fs/promises';

const WEBHOOK = process.env.DISCORD_WEBHOOK;
const DRY = !!process.env.NOTIFY_DRYRUN;
const STATE_URL = process.env.NOTIFY_STATE_URL || 'https://caloug.github.io/zth/notify-state.json';
const STATE_OUT = process.env.NOTIFY_STATE_OUT || 'site/notify-state.json';
const STATE_FILE = process.env.NOTIFY_STATE_FILE; // offline tests
const CDN = 'https://cdn.brawlify.com';

// --- Ranked tiers (same mapping as the website) ---
const TIER_NAMES = ['Bronze', 'Argent', 'Or', 'Diamant', 'Mythique', 'Légendaire', 'Maître', 'Pro'];
const TIER_COLORS = [0xD07A34, 0x7E9FD6, 0xE0B320, 0x2FB8E8, 0xD23DBE, 0xD0261E, 0x3FAE2A, 0x8D929C];
function tier(n) {
  const i = Math.min(7, Math.max(0, Math.floor((n - 1) / 3)));
  const div = i === 7 ? '' : [' I', ' II', ' III'][(n - 1) % 3];
  return { name: TIER_NAMES[i] + div, color: TIER_COLORS[i], icon: `${CDN}/ranked/tiered/${58000000 + Math.min(22, Math.max(1, n)) - 1}.png` };
}
const step = (t) => (t >= 100000 ? 10000 : 5000);
const milestone = (t) => Math.floor(t / step(t)) * step(t);
const F = (v) => Number(v).toLocaleString('fr-CH').replace(/[’']/g, ' ');

// --- Zurich clock, for the weekly recap timing ---
function zurich(now) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', hour12: false }).formatToParts(new Date(now));
  const g = (t) => parts.find((p) => p.type === t)?.value;
  return { day: `${g('year')}-${g('month')}-${g('day')}`, weekday: g('weekday'), hour: Number(g('hour')) };
}

// --- message builders (Discord embeds) ---
const rankMsg = (p, n, elo) => { const t = tier(n); return { embeds: [{ title: '⚔️ Montée en classé !', description: `**${p.name}** atteint **${t.name}**` + (elo != null ? ` · ${F(elo)} pts` : ''), color: t.color, thumbnail: { url: t.icon } }] }; };
const troMsg = (p, mile, tro) => ({ embeds: [{ title: '🏆 Nouveau palier de trophées !', description: `**${p.name}** a dépassé les **${F(mile)}** trophées (actuellement ${F(tro)}).`, color: 0xFFC93C }] });
const startupMsg = () => ({ content: '✅ **Notifications ZTH activées.** Vous recevrez ici les montées en classé, les paliers de trophées et le résumé de la semaine (lundi matin).' });
function weeklyMsg(out) {
  const sg = (v, suf) => v == null ? '—' : (v > 0 ? '+' : '') + F(v) + suf;
  const lines = out.players.filter((p) => p.week).map((p) => {
    const w = p.week;
    const bits = [`🏆 ${sg(w.trophies, '')}`, w.elo != null ? `⚔️ ${sg(w.elo, ' pts')}` : null, `🎮 ${F(w.battles)} combats`, w.winRate != null ? `${w.winRate} % V` : null].filter(Boolean);
    return `**${p.name}** — ${bits.join(' · ')}` + (w.brawler ? `\n   Brawler de la semaine : ${w.brawler.name}` : '') + (w.bestMap ? ` · Meilleure map : ${w.bestMap.map} (${w.bestMap.wr} %)` : '');
  });
  return { embeds: [{ title: '📅 Résumé de la semaine', description: lines.join('\n\n') || 'Pas de combats cette semaine.', color: 0x6C3BFF }] };
}

const bParse = (t) => new Date(/^\d{8}T/.test(t) ? t.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/, '$1-$2-$3T$4:$5:$6') : t);
function dailyMsg(out, history, now) {
  const dayFr = new Intl.DateTimeFormat('fr-CH', { timeZone: 'Europe/Zurich', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(now));
  const cutoff = now - 24 * 3600e3;
  const gain = (tag) => { if (!history) return null; const pp = history.filter((q) => q.p[tag] && q.p[tag].tr != null); if (pp.length < 2) return null; const nowTr = pp[pp.length - 1].p[tag].tr; const base = (pp.find((q) => new Date(q.t).getTime() >= cutoff) || pp[0]).p[tag].tr; return nowTr - base; };
  const todayBattles = (p) => (p.recent?.list || []).filter((b) => bParse(b.time).getTime() >= cutoff).length;
  const lines = out.players.map((p) => { const g = gain(p.tag), nb = todayBattles(p), r = p.ranked || {};
    return `**${p.name}** — 🏆 ${g == null ? '—' : (g >= 0 ? '+' : '') + F(g)}${nb ? ` · 🎮 ${nb} combats` : ''}${r.rankedRank ? ` · ⚔️ ${tier(r.rankedRank).name}` : ''}`; });
  const tot = out.players.reduce((s, p) => { const g = gain(p.tag); return s + (g || 0); }, 0);
  return { embeds: [{ title: '📊 Récap du jour — ' + dayFr, description: lines.join('\n') + (tot ? `\n\n*Ensemble aujourd'hui : ${tot >= 0 ? '+' : ''}${F(tot)} 🏆*` : ''), color: 0x3DDC84 }] };
}

// Pure core: given the previous state and the current data, decide what to announce.
export function computeMessages(prev, out, now = Date.now(), history = null) {
  const msgs = [];
  const fresh = !prev || !prev.players || !Object.keys(prev.players).length;
  const state = { updatedAt: out.updatedAt, players: {}, weeklyDay: prev?.weeklyDay, dailyDay: prev?.dailyDay };
  for (const p of out.players) {
    const was = (prev?.players && prev.players[p.tag]) || {};
    const rank = p.ranked?.rankedRank ?? null, elo = p.ranked?.rankedElo ?? null, mile = milestone(p.trophies);
    if (!fresh) {
      if (rank != null && was.rank != null && rank > was.rank) msgs.push(rankMsg(p, rank, elo));
      if (was.mile != null && mile > was.mile) msgs.push(troMsg(p, mile, p.trophies));
    }
    state.players[p.tag] = { rank, elo, mile };
  }
  const z = zurich(now);
  if (fresh) { state.weeklyDay = z.day; state.dailyDay = z.day; }
  else {
    if (z.weekday === 'Mon' && z.hour >= 8 && prev.weeklyDay !== z.day) { msgs.push(weeklyMsg(out)); state.weeklyDay = z.day; }
    if (z.hour >= 20 && prev.dailyDay !== z.day) { msgs.push(dailyMsg(out, history, now)); state.dailyDay = z.day; }
  }
  if (fresh) msgs.unshift(startupMsg());
  return { msgs, state, fresh };
}

async function loadState() {
  if (STATE_FILE) { try { return JSON.parse(await readFile(STATE_FILE, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return {}; throw e; } }
  if (DRY && !WEBHOOK) return {};
  try {
    const r = await fetch(STATE_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (r.status === 404) return {};
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) { console.warn('notify: could not load state (' + e.message + '), treating as first run'); return {}; }
}

async function send(msg) {
  if (DRY || !WEBHOOK) { console.log('NOTIFY', JSON.stringify(msg).slice(0, 300)); return; }
  const r = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
  if (!r.ok) throw new Error('Discord HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120));
}

// Called from update.mjs after data.json is built. Never throws: a notification problem
// must not break the stats update or the deploy.
export async function notify(out, history = null) {
  if (!WEBHOOK && !DRY && !STATE_FILE) { console.log('notify: no DISCORD_WEBHOOK, skipping'); return; }
  try {
    // The Discord panel can switch notifications off (bot /config.json). When off, we still
    // advance the state (so turning it back on later doesn't dump a backlog), just send nothing.
    let on = true;
    if (process.env.BOT_CONFIG_URL) { try { const r = await fetch(process.env.BOT_CONFIG_URL + '?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) { const c = await r.json(); on = c.notifs !== false; } } catch (e) { console.warn('notify: config fetch failed (' + e.message + '), assuming on'); } }
    const prev = await loadState();
    const { msgs, state, fresh } = computeMessages(prev, out, Date.now(), history);
    if (on) { for (const m of msgs) { try { await send(m); await new Promise((r) => setTimeout(r, 600)); } catch (e) { console.warn('notify send failed: ' + e.message); } } }
    else if (msgs.length) console.log('notify: ' + msgs.length + ' message(s) suppressed (notifications off via panel)');
    const outFile = process.env.NOTIFY_STATE_OUT || STATE_OUT;
    await writeFile(outFile, JSON.stringify(state));
    console.log(`notify: ${fresh ? 'first run (state initialized)' : msgs.length + ' message(s)' + (on ? '' : ' (suppressed, off)')}`);
  } catch (e) { console.warn('notify error: ' + e.message); }
}
