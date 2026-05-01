/** Mirrors src/Code.gs (bfParseFormInputs_) — keep in sync. */

import {
  BF_FIELDS,
  BF_FONT_INHERIT,
  BF_SCOPE,
  BF_COLOR_PRESET_INHERIT,
  BF_COLOR_PRESET_CUSTOM,
} from './constants.mjs';

function unwrap(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  if (raw[''] && typeof raw[''] === 'object') return raw[''];
  return raw;
}

function readString(inputs, key) {
  const entry = unwrap(inputs[key]);
  if (!entry || !entry.stringInputs) return '';
  const v = entry.stringInputs.value;
  if (!v || !v.length) return '';
  return String(v[0]).trim();
}

/** Dropdown values: Workspace Docs often uses stringInputs, not selectionInputs. */
function readSelection(inputs, key) {
  const entry = unwrap(inputs[key]);
  if (!entry) return null;
  if (entry.selectionInputs && entry.selectionInputs.value && entry.selectionInputs.value.length) {
    return String(entry.selectionInputs.value[0]);
  }
  if (entry.stringInputs && entry.stringInputs.value && entry.stringInputs.value.length) {
    return String(entry.stringInputs.value[0]);
  }
  return null;
}

function normalizeCharScope(raw) {
  if (raw === BF_SCOPE.UPPER || raw === BF_SCOPE.LOWER || raw === BF_SCOPE.ALL) return raw;
  return BF_SCOPE.ALL;
}

function parseRgbByte(s, strict) {
  const n = Number(String(s).trim().replace(',', '.'));
  if (Number.isNaN(n) || n < 0 || n > 255 || Math.floor(n) !== n) {
    if (strict) throw new Error('BF_BAD_COLOR');
    return null;
  }
  return n;
}

function tryRgbFromFormStrings(rStr, gStr, bStr, strict) {
  const empty = (s) => !s || String(s).trim() === '';
  if (empty(rStr) && empty(gStr) && empty(bStr)) return null;
  if (empty(rStr) || empty(gStr) || empty(bStr)) {
    if (strict) throw new Error('BF_BAD_COLOR');
    return null;
  }
  const r = parseRgbByte(rStr, strict);
  const g = parseRgbByte(gStr, strict);
  const b = parseRgbByte(bStr, strict);
  if (r === null || g === null || b === null) return null;
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const h = (n) => {
    const x = Math.max(0, Math.min(255, Math.floor(n)));
    const t = x.toString(16);
    return t.length === 1 ? `0${t}` : t;
  };
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Aligné sur Code.gs bfRgbStringsFromDraftRaw_. */
function rgbStringsFromInputs(inputs) {
  const compact = readString(inputs, BF_FIELDS.COLOR_RGB);
  if (compact) {
    const parts = compact
      .replace(/[,;]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);
    return {
      r: parts[0] ?? '',
      g: parts[1] ?? '',
      b: parts[2] ?? '',
    };
  }
  return {
    r: readString(inputs, BF_FIELDS.COLOR_R),
    g: readString(inputs, BF_FIELDS.COLOR_G),
    b: readString(inputs, BF_FIELDS.COLOR_B),
  };
}

function resolveForegroundColor(inputs, strict) {
  const presetRaw = readSelection(inputs, BF_FIELDS.COLOR_PRESET);
  const colorRaw = readString(inputs, BF_FIELDS.FOREGROUND_COLOR);
  const { r: rStr, g: gStr, b: bStr } = rgbStringsFromInputs(inputs);

  if (presetRaw === null || presetRaw === undefined) {
    const rgb0 = tryRgbFromFormStrings(rStr, gStr, bStr, strict);
    if (rgb0) return rgbToHex(rgb0.r, rgb0.g, rgb0.b);
    if (!colorRaw) return '';
    if (!/^#[0-9a-fA-F]{6}$/.test(colorRaw)) {
      if (strict) throw new Error('BF_BAD_COLOR');
      return '';
    }
    return colorRaw.toLowerCase();
  }

  if (!presetRaw || presetRaw === BF_COLOR_PRESET_INHERIT) return '';

  const rgb = tryRgbFromFormStrings(rStr, gStr, bStr, strict);
  if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);

  if (presetRaw === BF_COLOR_PRESET_CUSTOM) {
    if (!colorRaw) return '';
    if (!/^#[0-9a-fA-F]{6}$/.test(colorRaw)) {
      if (strict) throw new Error('BF_BAD_COLOR');
      return '';
    }
    return colorRaw.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(presetRaw)) return presetRaw.toLowerCase();

  if (strict) throw new Error('BF_BAD_COLOR');
  return '';
}

/**
 * @param {Record<string, unknown>} inputs Workspace Card formInputs map
 */
export function parseFormOptions(inputs) {
  const charScope = normalizeCharScope(readSelection(inputs, BF_FIELDS.CASE_MODE) || BF_SCOPE.ALL);
  const fontRaw = readSelection(inputs, BF_FIELDS.FONT_FAMILY) || '';
  const fontFamily = fontRaw === BF_FONT_INHERIT ? '' : fontRaw;

  const sizeStr = readString(inputs, BF_FIELDS.FONT_SIZE);
  let fontSizePt = null;
  if (sizeStr) {
    const n = Number(sizeStr.replace(',', '.'));
    if (Number.isNaN(n) || n < 1 || n > 400) {
      throw new Error('BF_BAD_SIZE');
    }
    fontSizePt = n;
  }

  const boldStr = readSelection(inputs, BF_FIELDS.BOLD) || '0';
  const bold = boldStr === '1';

  const foregroundColor = resolveForegroundColor(inputs, true);

  return {
    charScope,
    fontFamily,
    fontSizePt,
    bold,
    foregroundColor,
  };
}
