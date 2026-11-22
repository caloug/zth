// One-off: print the shape of real API answers (keys only + a few values) to the Actions log.
const API = 'https://bsproxy.royaleapi.dev/v1', KEY = process.env.BS_API_KEY;
const get = async (p) => { const r = await fetch(API + p, { headers: { Authorization: `Bearer ${KEY}` } }); return r.ok ? r.json() : { status: r.status, body: (await r.text()).slice(0, 200) }; };
const show = (label, o) => console.log('PROBE', label, JSON.stringify(o, (k, v) => (typeof v === 'string' && v.length > 60 ? v.slice(0, 60) : v)).slice(0, 1500));
const p = await get('/players/%238JL8YC98');
show('playerKeys', Object.keys(p)); show('icon', p.icon); show('club', p.club); show('nameColor', p.nameColor);
const b = [...(p.brawlers || [])].sort((a, z) => z.trophies - a.trophies)[0]; show('brawler', b);
const log = await get('/players/%238JL8YC98/battlelog'); show('battle0', log.items?.[0]); show('battleTypes', [...new Set((log.items || []).map((i) => i.battle?.type))]);
if (p.club?.tag) { const c = await get('/clubs/' + encodeURIComponent(p.club.tag)); show('clubKeys', Object.keys(c)); show('club', { ...c, members: (c.members || []).slice(0, 2), n: c.members?.length }); }
const rot = await get('/events/rotation'); show('rotation0', Array.isArray(rot) ? rot[0] : rot); show('rotationN', Array.isArray(rot) ? rot.length : 0);
for (const loc of ['CH', 'global']) { const r = await get(`/rankings/${loc}/players?limit=200`); const items = r.items || []; show('rank-' + loc, { n: items.length, last: items.at(-1)?.trophies, first: items[0], mine: items.filter((x) => ['#8JL8YC98', '#GR0RVJ0CG', '#RRLRRLYG9'].includes(x.tag)).map((x) => [x.tag, x.rank]) }); }
const rk = await get('/rankings/CH/brawlers/' + b.id + '?limit=200'); show('brawlerRankCH', { n: rk.items?.length, last: rk.items?.at(-1)?.trophies, mine: rk.items?.find((x) => x.tag === '#8JL8YC98') });
