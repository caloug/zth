// Registers the ZTH bot's slash commands with Discord. Run once (and again whenever
// the commands below change):  node bot/register.js
// Needs env vars DISCORD_APP_ID and DISCORD_BOT_TOKEN.
const APP = process.env.DISCORD_APP_ID || '1574075870379778159', TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) { console.error('Set DISCORD_BOT_TOKEN (PowerShell: $env:DISCORD_BOT_TOKEN="...")'); process.exit(1); }

const players = [
  { name: 'C.A', value: '8JL8YC98' },
  { name: 'ZTH|Matt', value: 'GR0RVJ0CG' },
  { name: 'ZTH|xuli_8', value: 'RRLRRLYG9' },
];
const commands = [
  { name: 'stats', description: 'Stats actuelles (un joueur, ou toute l\'équipe)', options: [
    { name: 'joueur', description: 'Quel joueur', type: 3, required: false, choices: players } ] },
  { name: 'classe', description: 'Classement classé de l\'équipe' },
  { name: 'maj', description: 'Forcer une mise à jour des stats maintenant' },
  { name: 'notifs', description: 'Activer ou couper les notifications', options: [
    { name: 'etat', description: 'on ou off', type: 3, required: true, choices: [ { name: 'on', value: 'on' }, { name: 'off', value: 'off' } ] } ] },
  { name: 'panneau', description: 'Afficher le panneau de contrôle avec les boutons' },
];

const r = await fetch(`https://discord.com/api/v10/applications/${APP}/commands`, {
  method: 'PUT', headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(commands),
});
console.log(r.status, r.ok ? '✅ Commandes enregistrées' : await r.text());
