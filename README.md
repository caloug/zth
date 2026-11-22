# Caleb's Friends — Brawl Stars site

A free website on GitHub Pages, in French, with live stats for the squad.
A GitHub Action fetches the official Brawl Stars API **every 5 minutes** and republishes the site.

```
players.json                 ← the player tags (edit to add/remove friends)
scripts/update.mjs           ← fetches the API and writes site/data.json
site/index.html              ← the website (French)
.github/workflows/update.yml ← runs every 5 minutes and publishes the site
```

---

## Part 1: Get a free Brawl Stars API key (5 min)

1. Go to **https://developer.brawlstars.com** and click **Register** (this is a developer account, not your game account).
2. Log in, then click your name at the top right → **My Account** → **Create New Key**.
3. Fill in:
   - **Key Name:** `zth`
   - **Description:** `GitHub site`
   - **Allowed IP Addresses:** `45.79.218.79`  ← important: this is the RoyaleAPI proxy the site goes through
4. Click **Create Key**, open the key and **copy the long token**. Keep it secret.

## Part 2: Create the GitHub repository

1. Log in to **https://github.com** (create a free account if needed).
2. Click **+** (top right) → **New repository**.
   - Name: `zth`
   - **Public** (free GitHub Pages needs a public repo; the API key stays hidden in a secret)
   - Do **not** add a README
   - Click **Create repository**
3. In the new repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `BS_API_KEY`
   - Secret: paste the token from Part 1 → **Add secret**
4. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.

## Part 3: Upload the files (PowerShell)

Unzip `this repo`, then open **PowerShell** and run, one by one (replace `YOUR-USERNAME`):

1. `cd $HOME\Downloads\zth`
2. `git init`
3. `git add .`
4. `git commit -m "Caleb's Friends site"`
5. `git branch -M main`
6. `git remote add origin https://github.com/YOUR-USERNAME/zth.git`
7. `git push -u origin main`

(If Git isn't installed: `winget install --id Git.Git -e`, then close and reopen PowerShell.)

## Part 4: Check it works

1. On GitHub, open the **Actions** tab → **Update stats**. Wait for the green ✓ (about 1 minute).
2. Your site is at **https://caloug.github.io/zth/**. Send that link to your friends.
3. From now on it updates by itself every 5 minutes. The page also reloads the numbers on its own every minute.

If the run is red: click it → **Fetch stats** step. "Access denied" means the API key or its IP (`45.79.218.79`) is wrong; make a new key and update the `BS_API_KEY` secret.

---

## Add or remove a friend

Edit `players.json` (on GitHub: open the file → ✏️ pencil → edit → **Commit changes**):

```json
{ "players": ["8JL8YC98", "GR0RVJ0CG", "RRLRRLYG9", "NEWTAG"] }
```

Tags without `#`. The site updates within ~5 minutes.

## Good to know

- **"Every 5 minutes" is a best effort.** GitHub sometimes runs scheduled jobs late (10–20 min) when it's busy.
- **GitHub pauses schedules after 60 days without activity in the repo.** If the "updated X min ago" stops moving, go to **Actions → Update stats → Run workflow**, or commit any small change.
- **Ranked:** the official API may not include Ranked points. If it does, a "Classé" section appears automatically; otherwise it stays hidden.
- **Skins** aren't in the API, so they can't be shown.
- **Missing star powers and gadgets are listed by name**, straight from the API.
- The site is public: anyone with the link can see the squad's stats. No daily trophy history is stored.
- Unofficial fan site. Not made, endorsed or sponsored by Supercell (see https://supercell.com/fan-content-policy).
