# Bot ZTH — guide de déploiement

Un bot Discord avec un panneau de boutons et des commandes `/`, utilisable par **tout le monde** dans le serveur.
Hébergé gratuitement sur Cloudflare Workers (toujours allumé). Il déclenche aussi la mise à jour des stats toutes les 5 min.

Commandes : `/stats [joueur]`, `/classe`, `/maj` (forcer une mise à jour), `/notifs on|off`, `/panneau` (les boutons).

Tu auras besoin de 3 choses, gratuites : une **application Discord**, un compte **Cloudflare**, et un **token GitHub**.

---

## 1. Créer l'application Discord

1. Va sur https://discord.com/developers/applications → **New Application**, nomme-la « ZTH Bot », **Create**.
2. Onglet **Bot** → **Reset Token** → **Copy** : garde ce token de côté (c'est le `DISCORD_BOT_TOKEN`).
3. (Application ID et Public Key déjà pré-remplis dans les fichiers du bot — rien à faire ici.)
4. Onglet **Installation** → Install Link = **Discord Provided Link**. Sous **Default Install Settings**, scopes : `applications.commands` et `bot`. Copie le lien d'installation, ouvre-le, et ajoute le bot à ton serveur.

## 2. Installer les outils (une fois)

Dans **PowerShell** :

1. `winget install OpenJS.NodeJS.LTS` (si Node n'est pas déjà installé ; ferme et rouvre PowerShell après)
2. `cd $HOME\Downloads\zth\bot` (le dossier `bot` de ton repo)
3. `npm install -g wrangler`
4. `npx wrangler login` (ça ouvre le navigateur → crée/connecte ton compte Cloudflare gratuit)

## 3. Enregistrer les commandes `/`

Dans PowerShell, dans le dossier `bot` :

1. `$env:DISCORD_BOT_TOKEN="ton_token_bot"`  (le token de l'onglet Bot)
2. `node register.js`  → doit afficher `✅ Commandes enregistrées`

## 4. Créer le stockage de config (KV)

1. `npx wrangler kv namespace create CONFIG`
2. Ça affiche un `id = "..."`. Ouvre `wrangler.toml` et colle cet id à la place de `PASTE_KV_ID_HERE`.

## 5. Le token GitHub (pour le bouton « Mettre à jour »)

1. Va sur https://github.com/settings/personal-access-tokens → **Generate new token** (fine-grained).
2. **Resource owner** : `caloug`. **Repository access** → Only select repositories → `caloug/zth`.
3. **Permissions** → Repository → **Actions** : **Read and write**.
4. Génère et copie le token.
5. Dans PowerShell : `npx wrangler secret put GH_TOKEN` puis colle le token.

## 6. Déployer

1. `npx wrangler deploy`
2. Ça affiche l'URL du worker, du genre `https://zth-bot.ton-compte.workers.dev`. **Copie-la.**

## 7. Connecter Discord au worker

1. Retourne sur https://discord.com/developers/applications → ton app → **General Information**.
2. **Interactions Endpoint URL** : colle l'URL du worker (étape 6) et **Save**.
   Discord envoie un test ; s'il accepte, c'est bon. (Si erreur : vérifie que `DISCORD_PUBLIC_KEY` est bien la bonne.)

## 8. Relier les notifications au bouton on/off (optionnel mais recommandé)

Pour que `/notifs off` coupe vraiment les alertes :

1. Sur GitHub : **github.com/caloug/zth → Settings → Secrets and variables → Actions → Variables → New repository variable**.
2. Nom : `BOT_CONFIG_URL`. Valeur : `https://zth-bot.ton-compte.workers.dev/config.json` (ton URL worker + `/config.json`).

---

## C'est fini 🎉

Dans ton serveur, tape `/panneau` pour afficher les boutons. Tape `/stats`, `/classe`, `/maj`, `/notifs`.
Tes amis peuvent tout utiliser aussi.

**Si tu changes les commandes plus tard** : relance l'étape 3 (`node register.js`).
**Si tu changes le code du worker** : relance `npx wrangler deploy`.
