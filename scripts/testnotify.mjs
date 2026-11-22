// One-off: posts a test message with everyone's current stats and an @everyone ping.
// Reads the freshly built site/data.json. Removed after the test.
import { readFile } from 'node:fs/promises';
const WEBHOOK = process.env.DISCORD_WEBHOOK;
if (!WEBHOOK) { console.log('TEST: no webhook'); process.exit(0); }
const TIER = ['Bronze', 'Argent', 'Or', 'Diamant', 'Mythique', 'Légendaire', 'Maître', 'Pro'];
const tierName = (n) => { if (n == null) return null; const i = Math.min(7, Math.max(0, Math.floor((n - 1) / 3))); const d = i === 7 ? '' : [' I', ' II', ' III'][(n - 1) % 3]; return TIER[i] + d; };
const F = (v) => v == null ? '—' : Number(v).toLocaleString('fr-CH').replace(/[’']/g, ' ');
const d = JSON.parse(await readFile(process.env.OUT_FILE || 'site/data.json', 'utf8'));
const fields = d.players.map((p) => {
  const rk = p.ranked && p.ranked.rankedRank != null ? `${tierName(p.ranked.rankedRank)} · ${F(p.ranked.rankedElo)} pts` : '—';
  const wr = p.recent && p.recent.winRate != null ? ` · 🎯 ${p.recent.winRate} %` : '';
  return { name: p.name, value: `🏆 ${F(p.trophies)} · ⚔️ ${rk}${wr}`, inline: false };
});
const body = { content: '@everyone 🔔 **Test des notifications ZTH** — voici les stats actuelles de l\'équipe 👇', allowed_mentions: { parse: ['everyone'] },
  embeds: [{ title: '📊 Stats de l\'équipe en ce moment', color: 0x6C3BFF, fields, footer: { text: 'Site : caloug.github.io/zth · message de test' } }] };
const r = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
console.log('TEST SENT:', r.status, r.ok ? 'ok' : (await r.text()).slice(0, 150));
