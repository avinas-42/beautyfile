#!/usr/bin/env node
/**
 * Regénère src/BfFontChoices.gs : BF_FONT_CATEGORY_ORDER + BF_FONT_CHOICES_BY_CATEGORY.
 * Sources : Google Fonts API, snapshot, ou Fontsource ; fusion fontFamilyEnum.json → catégorie `docs`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'src', 'BfFontChoices.gs');
const SNAPSHOT_FILE = path.join(ROOT, 'data', 'googleFontsSnapshot.json');
const ENUM_FILE = path.join(ROOT, 'data', 'fontFamilyEnum.json');

/** Aligné sur Constants.gs BF_FONT_CATEGORY_ORDER / slugs Google Fonts + docs */
const CATEGORY_ORDER = ['sans-serif', 'serif', 'monospace', 'display', 'handwriting', 'docs'];

const FALLBACK_CATEGORY = 'sans-serif';

function escapeGsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeKey(name) {
  return String(name).trim().toLowerCase();
}

/** Google Fonts API utilise les mêmes slugs ; Fontsource idem. */
function normalizeCategorySlug(raw) {
  if (!raw || typeof raw !== 'string') return FALLBACK_CATEGORY;
  const s = raw.trim().toLowerCase();
  if (CATEGORY_ORDER.includes(s) && s !== 'docs') return s;
  return FALLBACK_CATEGORY;
}

async function fetchGoogleWebfonts(apiKey) {
  const url = `https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Fonts API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const enriched = {
    _source: 'google-webfonts-api',
    _fetchedAt: new Date().toISOString(),
    kind: data.kind,
    items: data.items || [],
  };
  fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
  console.warn('Wrote', SNAPSHOT_FILE, '(Google Fonts API)');
  return data.items || [];
}

function loadSnapshotFile() {
  if (!fs.existsSync(SNAPSHOT_FILE)) return null;
  const raw = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  const items = raw.items;
  if (!Array.isArray(items)) return null;
  return items;
}

async function fetchFontsourceFallback() {
  const res = await fetch('https://api.fontsource.org/v1/fonts');
  if (!res.ok) throw new Error(`Fontsource ${res.status}`);
  const list = await res.json();
  if (!Array.isArray(list)) throw new Error('Fontsource: expected array');
  const google = list.filter((x) => x.type === 'google' && x.family);
  const items = google.map((x) => ({
    family: x.family,
    category: x.category ? normalizeCategorySlug(x.category) : FALLBACK_CATEGORY,
  }));
  const enriched = {
    _source: 'fontsource-fallback',
    _fetchedAt: new Date().toISOString(),
    _note:
      'Sans GOOGLE_FONTS_API_KEY : liste dérivée de api.fontsource.org (familles type google). Pour snapshot officiel, définir la clé et relancer.',
    items,
  };
  fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
  console.warn('Wrote', SNAPSHOT_FILE, '(Fontsource fallback — pas de clé API)');
  return items;
}

/** Lookup famille → catégorie pour snapshots sans champ category */
async function buildFontsourceCategoryLookup() {
  const res = await fetch('https://api.fontsource.org/v1/fonts');
  if (!res.ok) throw new Error(`Fontsource lookup ${res.status}`);
  const list = await res.json();
  /** @type {Map<string, string>} */
  const map = new Map();
  if (!Array.isArray(list)) return map;
  for (const x of list) {
    if (x.type === 'google' && x.family && x.category) {
      map.set(normalizeKey(x.family), normalizeCategorySlug(x.category));
    }
  }
  return map;
}

/**
 * Assure family + category sur chaque item (Google API fournit category ; vieux snapshots non).
 */
async function normalizeItemsWithCategories(items) {
  const needsLookup = items.some((it) => it.family && !it.category);
  let lookup = null;
  if (needsLookup) {
    console.warn('Enrichissement des catégories via Fontsource (snapshot partiel)…');
    lookup = await buildFontsourceCategoryLookup();
  }
  return items.map((it) => {
    const family = it.family;
    if (!family || typeof family !== 'string') return it;
    let category = it.category ? normalizeCategorySlug(it.category) : null;
    if (!category && lookup) {
      category = lookup.get(normalizeKey(family)) || FALLBACK_CATEGORY;
    }
    if (!category) category = FALLBACK_CATEGORY;
    return { family, category };
  });
}

function loadEnumExtras() {
  if (!fs.existsSync(ENUM_FILE)) return [];
  const raw = JSON.parse(fs.readFileSync(ENUM_FILE, 'utf8'));
  const fam = raw.families;
  return Array.isArray(fam) ? fam.map(String) : [];
}

/**
 * @param {Array<{family:string,category:string}>} webItems
 * @param {string[]} enumFamilies
 */
function buildByCategory(webItems, enumFamilies) {
  /** normalized family → canonical name */
  const googleCanon = new Map();
  for (const it of webItems) {
    const fam = it.family;
    if (!fam) continue;
    const k = normalizeKey(fam);
    if (!googleCanon.has(k)) googleCanon.set(k, fam);
  }

  /** @type {Record<string, Array<{label:string,value:string}>>} */
  const buckets = {};
  for (const cat of CATEGORY_ORDER) buckets[cat] = [];

  for (const it of webItems) {
    const fam = it.family;
    if (!fam) continue;
    const cat = it.category && CATEGORY_ORDER.includes(it.category) && it.category !== 'docs' ? it.category : FALLBACK_CATEGORY;
    const canon = googleCanon.get(normalizeKey(fam)) || fam;
    buckets[cat].push({ label: canon, value: canon });
  }

  for (const fam of enumFamilies) {
    const k = normalizeKey(fam);
    if (googleCanon.has(k)) continue;
    const canon = fam.trim();
    buckets.docs.push({ label: canon, value: canon });
  }

  for (const cat of CATEGORY_ORDER) {
    const seen = new Set();
    const deduped = [];
    buckets[cat].sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
    for (const ch of buckets[cat]) {
      const key = normalizeKey(ch.value);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(ch);
    }
    buckets[cat] = deduped;
  }

  return buckets;
}

function emitBfFontChoicesGs(order, byCategory) {
  let out = `/**\n * Polices par catégorie — généré par scripts/sync-fonts.mjs (ne pas modifier à la main).\n * Refresh : npm run fonts:sync\n */\nvar BF_FONT_CATEGORY_ORDER = [\n`;
  for (const cat of order) {
    out += `  '${escapeGsString(cat)}',\n`;
  }
  out += `];\n\nvar BF_FONT_CHOICES_BY_CATEGORY = {\n`;
  for (const cat of order) {
    const choices = byCategory[cat] || [];
    out += `  '${escapeGsString(cat)}': [\n`;
    for (const ch of choices) {
      out += `    { label: '${escapeGsString(ch.label)}', value: '${escapeGsString(ch.value)}' },\n`;
    }
    out += `  ],\n`;
  }
  out += `};\n`;
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, out, 'utf8');
  const total = order.reduce((n, c) => n + (byCategory[c] || []).length, 0);
  console.warn('Wrote', OUT_FILE, `(${total} entrées sur ${order.length} catégories)`);
}

async function main() {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY || '';

  let items;
  if (apiKey) {
    items = await fetchGoogleWebfonts(apiKey);
    items = items.map((it) => ({
      family: it.family,
      category: it.category ? normalizeCategorySlug(it.category) : FALLBACK_CATEGORY,
    }));
  } else {
    items = loadSnapshotFile();
    if (!items || items.length === 0) {
      console.warn('Pas de clé GOOGLE_FONTS_API_KEY ni snapshot utilisable — téléchargement Fontsource…');
      items = await fetchFontsourceFallback();
    } else {
      console.warn('Utilisation du snapshot existant', SNAPSHOT_FILE);
    }
    items = await normalizeItemsWithCategories(items);
  }

  const enumExtras = loadEnumExtras();
  const byCategory = buildByCategory(items, enumExtras);
  emitBfFontChoicesGs(CATEGORY_ORDER, byCategory);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
