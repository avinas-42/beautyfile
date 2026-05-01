# Beauty File

Add-on **Google Workspace** pour **Google Docs** : mise en forme ciblée (police, taille, styles, couleur) selon une **portée sur les lettres** — tout le texte, majuscules uniquement ou minuscules uniquement.

Le code vit dans **Google Apps Script** (runtime **V8**). Ce dépôt sert de source locale ; la publication vers Google se fait avec **`clasp`**.

## Fonctionnalités

- **Portée des lettres** : tout le document, ou seulement les lettres déjà en majuscules / en minuscules (pas une conversion de casse globale du document).
- **Police** : catégorie (sans-serif, serif, classiques Docs, etc.) puis famille dans la catégorie ; option « inchangée ».
- **Taille (pt)** et **Gras · italique · souligné** (menu combiné).
- **Couleur** : pastilles, champ RGB compact et hex `#rrggbb`.
- Préférences utilisateur persistées (**ScriptProperties**).

Interface du panneau latéral en **anglais** (Card Service).

## Prérequis

- [Node.js](https://nodejs.org/) (LTS recommandé)
- Compte Google avec accès au projet Apps Script de l’add-on
- [API Apps Script](https://script.google.com/home/usersettings) activée pour votre utilisateur (nécessaire à `clasp push`)

## Installation

```bash
git clone <url-du-depot> beautyfile
cd beautyfile
npm install
```

### Configuration locale (non versionnée)

| Fichier | Rôle |
|--------|------|
| `.clasp.json` | Copier depuis `.clasp.json.example`, renseigner `scriptId` (paramètres du projet sur [script.google.com](https://script.google.com)). `rootDir` doit rester `src`. |
| `.deployment.local` | Pour `npm run deploy:test` : copier `.deployment.local.example` et renseigner `BEAUTYFILE_DEPLOYMENT_ID` (ID du déploiement *module complémentaire* dans Apps Script → Déployer). Alternative : variable d’environnement `BEAUTYFILE_DEPLOYMENT_ID`. |

Connexion Google pour clasp :

```bash
npm run login
```

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm test` | Tests unitaires (**Vitest**) — logique alignée sur le parsing des champs carte (`lib/` ↔ `Code.gs`). |
| `npm run push` | Envoie le contenu de `src/` vers le projet Apps Script (`clasp push`). |
| `npm run deploy:test` | `clasp push` puis mise à jour du déploiement test existant (`scripts/deploy-test.mjs`). |
| `npm run open` | Ouvre le projet dans l’éditeur Apps Script. |
| `npm run logs` | Journaux clasp. |
| `npm run fonts:sync` | Régénère `src/BfFontChoices.gs` et le snapshot polices (voir `.env.example` pour une clé Google Fonts optionnelle). |

À exécuter depuis la **racine** du dépôt.

## Structure du dépôt

```
src/                  # Fichiers poussés vers Apps Script (.gs, appsscript.json)
lib/                  # Logique testée sous Node (parseFormOptions, etc.)
scripts/              # deploy-test.mjs, sync-fonts.mjs
docs/                 # Pages statiques (ex. politique de confidentialité), assets (logo)
.clasp.json.example   # Modèle de configuration clasp
```

Les fichiers **`docs/*.md`** sont ignorés par git dans cette configuration de dépôt ; les notes détaillées publication / QA peuvent vivre en local dans `docs/`.

## Tests

```bash
npm test
```

Toute évolution de `bfParseFormInputs_` / résolution couleur dans `Code.gs` doit rester alignée avec `lib/parseFormOptions.mjs`.

## Déploiement & logo

- Après `npm run push`, vérifier sur **script.google.com** que le projet correspond bien au `scriptId` de votre `.clasp.json`.
- Logo add-on : `docs/assets/beautyfile-addon-logo.png` (héberger en **HTTPS** public pour `logoUrl` dans `appsscript.json`, par ex. GitHub Pages sur ce dépôt).

## Licence

Non précisée dans ce dépôt ; à compléter selon votre choix (`LICENSE`).
