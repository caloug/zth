// Fetches every player in players.json from the official Brawl Stars API
// (through the RoyaleAPI proxy, so it works from GitHub's changing IPs)
// and writes site/data.json for the website.
//
// Needs the env var BS_API_KEY: a key from https://developer.brawlstars.com
// created for the IP 45.79.218.79.
// Set BS_API_BASE to use another server (default: RoyaleAPI proxy).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
const DUMP = process.env.BS_DUMP_DIR; // when set, save every raw API answer there (for offline tests)

const API = process.env.BS_API_BASE || 'https://bsproxy.royaleapi.dev/v1';
const KEY = process.env.BS_API_KEY;
const OUT = process.env.OUT_FILE || 'site/data.json';
const HIST_OUT = process.env.HISTORY_OUT || OUT.replace(/[^/]+$/, 'history.json');
const HIST_URL = process.env.HISTORY_URL || 'https://caloug.github.io/zth/history.json';

if (!KEY && !process.env.BS_MOCK_DIR) {
  console.error('Missing BS_API_KEY secret.');
  process.exit(1);
}

async function api(path) {
  if (process.env.BS_MOCK_DIR) {
    // Offline test mode: read <mockdir>/<path with / replaced>.json
    const file = `${process.env.BS_MOCK_DIR}/${path.replace(/[\/%]/g, '_')}.json`;
    return JSON.parse(await readFile(file, 'utf8'));
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API + path, { headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json' } });
    if (res.ok) {
      const j = await res.json();
      if (DUMP) { await mkdir(DUMP, { recursive: true }); await writeFile(`${DUMP}/${path.replace(/[\/%]/g, '_')}.json`, JSON.stringify(j)); }
      return j;
    }
    const body = await res.text();
    if (res.status === 404) throw new Error(`Not found: ${path}`);
    if (res.status === 403) throw new Error(`Access denied (check the API key and its IP 45.79.218.79): ${body.slice(0, 200)}`);
    if (attempt === 3) throw new Error(`API ${res.status} for ${path}: ${body.slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
}

const color = (c) => typeof c === 'string' && /^0x[0-9a-f]{8}$/i.test(c) ? '#' + c.slice(4) : null;
const opt = async (path) => { try { return await api(path); } catch (e) { console.warn(`optional ${path}: ${e.message}`); return null; } };
const enc = (tag) => encodeURIComponent('#' + tag.replace(/^#/, '').toUpperCase());

// A showdown counts as a win when the player finishes in the top half
// (solo: rank 1-4, duo: rank 1-2, trio: rank 1-2 teams) — same as the game's trophy gain.
function battleResult(item, tag) {
  const b = item.battle || {};
  if (b.result) return b.result === 'victory' ? 'win' : b.result === 'defeat' ? 'loss' : 'draw';
  if (typeof b.rank === 'number') {
    const mode = (b.mode || item.event?.mode || '').toLowerCase();
    const cut = mode.includes('duo') || mode.includes('trio') ? 2 : 4;
    return b.rank <= cut ? 'win' : 'loss';
  }
  return 'other';
}

function findMe(item, tag) {
  const b = item.battle || {};
  const want = '#' + tag;
  const people = [
    ...(b.teams || []).flat(),
    ...(b.players || []),
  ];
  return people.find((p) => (p.tag || '').toUpperCase() === want);
}

// ---- history: download the published copy, add a point, thin it out ----
async function loadHistory() {
  if (process.env.BS_MOCK_DIR || process.env.HISTORY_FILE) {
    if (!process.env.HISTORY_FILE) return [];
    try { return JSON.parse(await readFile(process.env.HISTORY_FILE, 'utf8')).points || []; }
    catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  }
  // Any error except 404 stops the run, so a bad download never wipes the history.
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(HIST_URL + '?t=' + Date.now(), { cache: 'no-store' });
      if (res.status === 404) { console.log('No history yet, starting a new one.'); return []; }
      if (!res.ok) throw new Error(`history.json HTTP ${res.status}`);
      const j = await res.json();
      if (!Array.isArray(j.points)) throw new Error('history.json has no points array');
      return j.points;
    } catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
  }
  throw new Error(`Could not download history (${lastErr.message}); stopping so it is not wiped.`);
}

// Keep every point from the last 48 h, the last point of each hour up to 30 days,
// the last point of each day after that, and nothing older than 400 days.
function thin(points, now = Date.now()) {
  const H = 3600e3, D = 24 * H;
  const sorted = [...points].sort((a, b) => new Date(a.t) - new Date(b.t));
  const keep = new Map();
  for (const pt of sorted) {
    const age = now - new Date(pt.t);
    if (age > 400 * D) continue;
    const key = age <= 48 * H ? 'r' + pt.t : age <= 30 * D ? 'h' + pt.t.slice(0, 13) : 'd' + pt.t.slice(0, 10);
    keep.set(key, pt); // later points overwrite earlier ones in the same bucket
  }
  return [...keep.values()].sort((a, b) => new Date(a.t) - new Date(b.t));
}

async function main() {
  const history = await loadHistory();
  const { players: tags } = JSON.parse(await readFile('players.json', 'utf8'));
  const catalog = await api('/brawlers?limit=200');
  const all = catalog.items || [];
  const totalSP = all.reduce((s, b) => s + (b.starPowers || []).length, 0);
  const totalGadgets = all.reduce((s, b) => s + (b.gadgets || []).length, 0);

  const players = [];
  const failed = [];
  for (const raw of tags) {
    const tag = raw.replace(/^#/, '').toUpperCase();
    try {
      const p = await api(`/players/${enc(tag)}`);
      let log = { items: [] };
      try { log = await api(`/players/${enc(tag)}/battlelog`); } catch (e) { console.warn(`battlelog ${tag}: ${e.message}`); }

      // ---- recent battles ----
      const battles = (log.items || []).map((it) => {
        const me = findMe(it, tag);
        return {
          time: it.battleTime,
          mode: it.event?.mode || it.battle?.mode || 'unknown',
          map: it.event?.map || null,
          type: it.battle?.type || null,
          mapId: it.event?.id || null,
          modeId: typeof it.event?.modeId === 'number' ? it.event.modeId : null,
          rank: typeof it.battle?.rank === 'number' ? it.battle.rank : null,
          brawlerId: me?.brawler?.id || me?.brawlers?.[0]?.id || null,
          result: battleResult(it, tag),
          trophyChange: typeof it.battle?.trophyChange === 'number' ? it.battle.trophyChange : null,
          brawler: me?.brawler?.name || (me?.brawlers?.[0]?.name) || null,
        };
      });
      const count = (arr, key) => Object.entries(arr.reduce((m, x) => { if (x[key]) m[x[key]] = (m[x[key]] || 0) + 1; return m; }, {}))
        .map(([k, n]) => ({ name: k, battles: n })).sort((a, b) => b.battles - a.battles);
      const decided = battles.filter((b) => b.result === 'win' || b.result === 'loss');
      const wins = decided.filter((b) => b.result === 'win').length;
      const tc = battles.filter((b) => b.trophyChange != null);

      // ---- what's missing (by name) ----
      const owned = new Map((p.brawlers || []).map((b) => [b.id, b]));
      const missingSP = [], missingGadgets = [], missingBrawlers = [], missingIds = [];
      for (const b of all) {
        const mine = owned.get(b.id);
        if (!mine) { missingBrawlers.push(b.name); missingIds.push(b.id); continue; }
        const haveSP = new Set((mine.starPowers || []).map((x) => x.id));
        const haveG = new Set((mine.gadgets || []).map((x) => x.id));
        for (const sp of b.starPowers || []) if (!haveSP.has(sp.id)) missingSP.push({ brawler: b.name, name: sp.name, power: mine.power, id: sp.id, bid: b.id });
        for (const g of b.gadgets || []) if (!haveG.has(g.id)) missingGadgets.push({ brawler: b.name, name: g.name, power: mine.power, id: g.id, bid: b.id });
      }
      const myBrawlers = p.brawlers || [];
      const top = [...myBrawlers].sort((a, b) => (b.trophies || 0) - (a.trophies || 0))[0];

      // Any ranked-looking numbers the API gives (field names vary between API versions).
      const ranked = {};
      for (const [k, v] of Object.entries(p)) if (/rank/i.test(k) && (typeof v === 'number' || typeof v === 'string')) ranked[k] = v;

      players.push({
        tag,
        name: p.name,
        nameColor: color(p.nameColor),
        icon: p.icon?.id || null,
        club: p.club?.name || null,
        clubTag: p.club?.tag || null,
        prestige: p.totalPrestigeLevel ?? null,
        fame: p.fame ?? null,
        fameTier: p.fameTierName || null,
        expPoints: p.expPoints ?? null,
        bestStreak: (() => { const b = [...(p.brawlers || [])].sort((a, z) => (z.maxWinStreak || 0) - (a.maxWinStreak || 0))[0]; return b && b.maxWinStreak ? { n: b.maxWinStreak, brawler: b.name, id: b.id } : null; })(),
        brawlers: (p.brawlers || []).map((b) => ({ id: b.id, name: b.name, power: b.power, rank: b.rank ?? null, trophies: b.trophies, highestTrophies: b.highestTrophies,
          prestige: b.prestigeLevel ?? 0, streak: b.currentWinStreak ?? 0, maxStreak: b.maxWinStreak ?? 0,
          sp: (b.starPowers || []).length, gadgets: (b.gadgets || []).length, gears: (b.gears || []).length, hc: (b.hyperCharges || []).length }))
          .sort((a, z) => z.trophies - a.trophies),
        trophies: p.trophies,
        highestTrophies: p.highestTrophies,
        expLevel: p.expLevel,
        wins3v3: p['3vs3Victories'] ?? null,
        soloWins: p.soloVictories ?? null,
        duoWins: p.duoVictories ?? null,
        brawlersOwned: myBrawlers.length,
        brawlersTotal: all.length,
        maxPower: myBrawlers.filter((b) => b.power === 11).length,
        topBrawler: top ? { name: top.name, trophies: top.trophies, id: top.id } : null,
        recent: {
          battles: battles.length,
          decided: decided.length,
          wins,
          winRate: decided.length ? Math.round(wins / decided.length * 100) : null,
          trophyChange: tc.reduce((s, b) => s + b.trophyChange, 0),
          modes: count(battles, 'mode'),
          brawlers: count(battles, 'brawler').slice(0, 10),
          list: battles.slice(0, 25).reverse().map((b) => ({ time: b.time, mode: b.mode, modeId: b.modeId, map: b.map, mapId: b.mapId, type: b.type, result: b.result, rank: b.rank, trophyChange: b.trophyChange, brawler: b.brawler, brawlerId: b.brawlerId })),
        },
        brawlerTrophies: myBrawlers.map((b) => b.trophies || 0),
        powerLevels: Array.from({ length: 11 }, (_, i) => myBrawlers.filter((b) => b.power === i + 1).length),
        progress: {
          starPowers: { owned: myBrawlers.reduce((s, b) => s + (b.starPowers || []).length, 0), total: totalSP },
          gadgets: { owned: myBrawlers.reduce((s, b) => s + (b.gadgets || []).length, 0), total: totalGadgets },
          maxPower: { owned: myBrawlers.filter((b) => b.power === 11).length, total: all.length },
          brawlers: { owned: myBrawlers.length, total: all.length },
        },
        missing: { starPowers: missingSP, gadgets: missingGadgets, brawlers: missingBrawlers, brawlerIds: missingIds },
        ranked,
      });
      console.log(`OK ${tag} ${p.name}: ${p.trophies} trophies`);
    } catch (e) {
      console.error(`FAILED ${tag}: ${e.message}`);
      failed.push(tag);
    }
  }

  if (!players.length) {
    console.error('No player could be loaded, keeping the old data.');
    process.exit(1);
  }

  // ---- extras (all optional: a failure here never breaks the update) ----
  const clubs = {};
  for (const t of [...new Set(players.map((x) => x.clubTag).filter(Boolean))]) {
    const c = await opt(`/clubs/${encodeURIComponent(t)}`); if (!c) continue;
    const members = (c.members || []).sort((a, z) => z.trophies - a.trophies);
    clubs[t] = { tag: t, name: c.name, badgeId: c.badgeId || null, type: c.type, trophies: c.trophies, requiredTrophies: c.requiredTrophies, description: c.description || '',
      count: members.length, members: members.map((m, i) => ({ pos: i + 1, tag: m.tag.replace('#', ''), name: m.name, role: m.role, trophies: m.trophies, nameColor: color(m.nameColor), icon: m.icon?.id || null })) };
  }
  const rot = await opt('/events/rotation');
  const rotation = Array.isArray(rot) ? rot.map((r) => ({ start: r.startTime, end: r.endTime, slot: r.slotId, mode: r.event?.mode, modeId: r.event?.modeId ?? null, map: r.event?.map, mapId: r.event?.id })) : [];
  const boards = {};
  for (const loc of ['CH', 'global']) {
    const r = await opt(`/rankings/${loc}/players?limit=200`); if (!r) continue;
    const items = r.items || []; boards[loc] = { min: items.at(-1)?.trophies ?? null, top: items[0] ? { name: items[0].name, trophies: items[0].trophies } : null,
      mine: Object.fromEntries(items.filter((x) => players.some((pl) => '#' + pl.tag === x.tag)).map((x) => [x.tag.replace('#', ''), x.rank])) };
  }
  // Swiss brawler leaderboards: check each player's best brawlers (max 24 unique boards per run)
  const want = new Map();
  for (const pl of players) for (const b of pl.brawlers.slice(0, 8)) if (b.trophies >= 1000) want.set(b.id, b.name);
  const brawlerBoards = {};
  for (const [id, name] of [...want].slice(0, 24)) {
    const r = await opt(`/rankings/CH/brawlers/${id}?limit=200`); if (!r) continue;
    const items = r.items || [];
    brawlerBoards[id] = { name, min: items.at(-1)?.trophies ?? null, n: items.length };
    for (const x of items) { const pl = players.find((q) => '#' + q.tag === x.tag); if (pl) (pl.chBrawlers ||= []).push({ id, name, rank: x.rank, trophies: x.trophies }); }
  }
  players.forEach((pl) => pl.chBrawlers && pl.chBrawlers.sort((a, z) => a.rank - z.rank));
  const allBrawlers = all.map((b) => ({ id: b.id, name: b.name }));

  const out = { updatedAt: new Date().toISOString(), players, failed, clubs, rotation, boards, brawlerBoards, allBrawlers };
  await mkdir(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 1));
  const pt = { t: out.updatedAt, p: {} };
  for (const pl of players) pt.p[pl.tag] = { tr: pl.trophies, elo: typeof pl.ranked?.rankedElo === 'number' ? pl.ranked.rankedElo : null };
  const points = thin([...history, pt]);
  await writeFile(HIST_OUT, JSON.stringify({ updatedAt: out.updatedAt, points }));
  console.log(`History: ${points.length} points`);
  console.log(`Wrote ${OUT} with ${players.length} players${failed.length ? `, failed: ${failed.join(', ')}` : ''}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
