/**
 * Entry points for the Workspace Add-on (Google Docs).
 */

/**
 * Sidebar homepage (Beauty File panel).
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {GoogleAppsScript.Card.Card}
 */
function onHomepageOpen(e) {
  var msg = bfMessagesFromEvent(e);
  var prefs = bfPrefsLoad();
  return bfBuildMainCard_(msg, prefs, {});
}

/**
 * Reconstruit la carte quand la catégorie de police change (liste déroulante filtrée).
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {GoogleAppsScript.Card.ActionResponse}
 */
function onFontCategoryChange(e) {
  var msg = bfMessagesFromEvent(e);
  var prefs = bfPrefsLoad();
  var inputs = (e && e.commonEventObject && e.commonEventObject.formInputs) || {};
  var draftRaw = bfParseCardDraft_(inputs);
  var cat = draftRaw.fontCategory || bfDefaultFontCategory_();
  if (BF_FONT_CATEGORY_ORDER.indexOf(cat) < 0) cat = bfDefaultFontCategory_();
  var card = bfBuildMainCard_(msg, prefs, { categoryExplicit: cat, draftRaw: draftRaw });
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(card))
    .build();
}

/**
 * Clic sur une pastille du nuancier : met à jour la couleur affichée (RGB + hex).
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {GoogleAppsScript.Card.ActionResponse}
 */
function onColorPick(e) {
  var msg = bfMessagesFromEvent(e);
  var prefs = bfPrefsLoad();
  var inputs = (e && e.commonEventObject && e.commonEventObject.formInputs) || {};
  var draftRaw = bfParseCardDraft_(inputs);
  var params =
    (e && e.commonEventObject && e.commonEventObject.parameters) ||
    (e && e.parameters) ||
    {};
  var hex = params.hex;
  if (hex && typeof hex === 'object') hex = String(hex);
  if (hex && /^#[0-9a-fA-F]{6}$/.test(hex)) {
    hex = hex.toLowerCase();
    draftRaw.colorRaw = hex;
    var comp = bfHexToRgbComponents_(hex);
    draftRaw.colorRStr = String(comp.r);
    draftRaw.colorGStr = String(comp.g);
    draftRaw.colorBStr = String(comp.b);
    draftRaw.colorRgbCompact = comp.r + ' ' + comp.g + ' ' + comp.b;
  }
  var card = bfBuildMainCard_(msg, prefs, { draftRaw: draftRaw });
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(card))
    .build();
}

/**
 * Hex ou R/G/B modifiés : synchronise les champs lorsque la saisie est une couleur valide.
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {GoogleAppsScript.Card.ActionResponse}
 */
function onColorFieldChange(e) {
  var msg = bfMessagesFromEvent(e);
  var prefs = bfPrefsLoad();
  var inputs = (e && e.commonEventObject && e.commonEventObject.formInputs) || {};
  var draftRaw = bfParseCardDraft_(inputs);
  var params =
    (e && e.commonEventObject && e.commonEventObject.parameters) ||
    (e && e.parameters) ||
    {};
  var src = params.src != null ? String(params.src) : '';

  var rs = bfRgbStringsFromDraftRaw_(draftRaw);
  var colorRaw = String(draftRaw.colorRaw != null ? draftRaw.colorRaw : '');

  var rgb = bfTryRgbFromFormStrings_(rs.r, rs.g, rs.b, false);
  var hexNorm = bfNormalizeHexColor_(colorRaw);

  function applyFromRgb_(rgbObj) {
    draftRaw.colorRaw = bfRgbToHex_(rgbObj.r, rgbObj.g, rgbObj.b);
    draftRaw.colorRStr = String(rgbObj.r);
    draftRaw.colorGStr = String(rgbObj.g);
    draftRaw.colorBStr = String(rgbObj.b);
    draftRaw.colorRgbCompact = rgbObj.r + ' ' + rgbObj.g + ' ' + rgbObj.b;
  }
  function applyFromHex_(h) {
    draftRaw.colorRaw = h;
    var comp = bfHexToRgbComponents_(h);
    draftRaw.colorRStr = String(comp.r);
    draftRaw.colorGStr = String(comp.g);
    draftRaw.colorBStr = String(comp.b);
    draftRaw.colorRgbCompact = comp.r + ' ' + comp.g + ' ' + comp.b;
  }

  if (src === 'hex') {
    if (hexNorm) applyFromHex_(hexNorm);
    else if (rgb) applyFromRgb_(rgb);
  } else if (src === 'rgb') {
    if (rgb) applyFromRgb_(rgb);
    else if (hexNorm) applyFromHex_(hexNorm);
  } else {
    if (hexNorm) applyFromHex_(hexNorm);
    else if (rgb) applyFromRgb_(rgb);
  }

  var card = bfBuildMainCard_(msg, prefs, { draftRaw: draftRaw });
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(card))
    .build();
}

/**
 * Primary action: apply options to the entire document.
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {GoogleAppsScript.Card.ActionResponse}
 */
function applyBeautyFile(e) {
  var msg = bfMessagesFromEvent(e);
  try {
    var opts = bfParseOptionsFromEvent_(e);
    opts.includeHeadersFooters = false;

    var doc = DocumentApp.getActiveDocument();
    if (!doc) {
      throw new Error('BF_NO_DOC');
    }

    bfFormatEntireDocument(doc, opts);
    bfPrefsSave(opts);

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText(msg.success))
      .build();
  } catch (err) {
    console.error(err);
    return bfBuildErrorResponse_(msg, err);
  }
}

/**
 * Optional entry point for automation prototypes (see docs/TRIGGERS_AND_ALTERNATIVES.md).
 * Uses last saved preferences from the sidebar.
 */
function applyBeautyFileWithSavedPreferences() {
  var prefs = bfPrefsLoad();
  var doc = DocumentApp.getActiveDocument();
  if (!doc) throw new Error('BF_NO_DOC');
  var opts = {
    charScope: bfNormalizeCharScope_(prefs.charScope),
    fontFamily: prefs.fontFamily || '',
    fontSizePt: prefs.fontSizePt,
    bold: !!prefs.bold,
    foregroundColor: prefs.foregroundColor || '',
    includeHeadersFooters: false,
  };
  bfFormatEntireDocument(doc, opts);
}

/**
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {Object} options for FormattingService
 * Parsed shape must stay aligned with lib/parseFormOptions.mjs (npm test).
 */
function bfParseOptionsFromEvent_(e) {
  var inputs = (e && e.commonEventObject && e.commonEventObject.formInputs) || {};
  return bfParseFormInputs_(inputs);
}

function bfNormalizeCharScope_(raw) {
  if (raw === BF_SCOPE.UPPER || raw === BF_SCOPE.LOWER || raw === BF_SCOPE.ALL) return raw;
  return BF_SCOPE.ALL;
}

/**
 * Lecture souple des champs carte pour rebuild (pas de throw taille/couleur).
 * @param {Object} inputs formInputs
 * @return {Object}
 */
function bfParseCardDraft_(inputs) {
  var inputsObj = inputs || {};
  return {
    charScope: bfNormalizeCharScope_(bfReadSelection_(inputsObj, BF_FIELDS.CASE_MODE) || BF_SCOPE.ALL),
    fontCategory: bfReadSelection_(inputsObj, BF_FIELDS.FONT_CATEGORY),
    fontFamily: bfReadSelection_(inputsObj, BF_FIELDS.FONT_FAMILY),
    fontSizeStr: bfReadString_(inputsObj, BF_FIELDS.FONT_SIZE),
    boldStr: bfReadSelection_(inputsObj, BF_FIELDS.BOLD),
    colorPresetStr: bfReadSelection_(inputsObj, BF_FIELDS.COLOR_PRESET),
    colorRaw: bfReadString_(inputsObj, BF_FIELDS.FOREGROUND_COLOR),
    colorRgbCompact: bfReadString_(inputsObj, BF_FIELDS.COLOR_RGB),
    colorRStr: bfReadString_(inputsObj, BF_FIELDS.COLOR_R),
    colorGStr: bfReadString_(inputsObj, BF_FIELDS.COLOR_G),
    colorBStr: bfReadString_(inputsObj, BF_FIELDS.COLOR_B),
  };
}

/**
 * @param {Object} prefs bfPrefsLoad()
 * @param {Object|null} draftRaw bfParseCardDraft_
 * @return {{charScope:string,fontSizePt:?number,bold:boolean,foregroundColor:string}}
 */
function bfMergeDisplayPrefsForCard_(prefs, draftRaw) {
  var charScope = bfNormalizeCharScope_(prefs.charScope || BF_SCOPE.ALL);
  var fontSizePt = prefs.fontSizePt;
  var bold = !!prefs.bold;
  var foregroundColor = prefs.foregroundColor || '';
  if (!draftRaw) {
    return {
      charScope: charScope,
      fontSizePt: fontSizePt,
      bold: bold,
      foregroundColor: foregroundColor,
    };
  }
  if (draftRaw.charScope != null) charScope = bfNormalizeCharScope_(draftRaw.charScope);
  if (draftRaw.fontSizeStr !== undefined && draftRaw.fontSizeStr !== '') {
    var n = Number(String(draftRaw.fontSizeStr).replace(',', '.'));
    if (!isNaN(n) && n >= 1 && n <= 400) fontSizePt = n;
  }
  if (draftRaw.boldStr === '0' || draftRaw.boldStr === '1') bold = draftRaw.boldStr === '1';
  foregroundColor = bfForegroundColorFromDraft_(prefs.foregroundColor || '', draftRaw);
  return {
    charScope: charScope,
    fontSizePt: fontSizePt,
    bold: bold,
    foregroundColor: foregroundColor,
  };
}

/**
 * Lit R/G/B depuis le champ compact « r g b » / « r,g,b » ou les trois champs legacy.
 * @param {Object|null} draftLike
 * @return {{r:string,g:string,b:string}}
 */
function bfRgbStringsFromDraftRaw_(draftLike) {
  if (!draftLike) return { r: '', g: '', b: '' };
  var compact = draftLike.colorRgbCompact != null ? String(draftLike.colorRgbCompact).trim() : '';
  if (compact !== '') {
    var parts = compact.replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
    return {
      r: parts[0] != null ? parts[0] : '',
      g: parts[1] != null ? parts[1] : '',
      b: parts[2] != null ? parts[2] : '',
    };
  }
  return {
    r: draftLike.colorRStr != null ? String(draftLike.colorRStr) : '',
    g: draftLike.colorGStr != null ? String(draftLike.colorGStr) : '',
    b: draftLike.colorBStr != null ? String(draftLike.colorBStr) : '',
  };
}

/**
 * @param {string} prefsFg couleur persistée par défaut
 * @param {Object|null} draftRaw
 * @return {string} #rrggbb ou ''
 */
function bfForegroundColorFromDraft_(prefsFg, draftRaw) {
  if (!draftRaw) return prefsFg || '';
  var rs = bfRgbStringsFromDraftRaw_(draftRaw);
  var rgb = bfTryRgbFromFormStrings_(rs.r, rs.g, rs.b, false);
  if (rgb) return bfRgbToHex_(rgb.r, rgb.g, rgb.b);
  var hex = bfNormalizeHexColor_(String(draftRaw.colorRaw || ''));
  if (hex) return hex;
  var pr = draftRaw.colorPresetStr;
  if (pr === BF_COLOR_PRESET_INHERIT || pr === '') return '';
  if (pr && /^#[0-9a-fA-F]{6}$/.test(String(pr))) return String(pr).toLowerCase();
  if (pr === BF_COLOR_PRESET_CUSTOM) return '';
  return '';
}

/**
 * @param {string} rStr
 * @param {string} gStr
 * @param {string} bStr
 * @param {boolean} strict
 * @return {{r:number,g:number,b:number}|null}
 */
function bfTryRgbFromFormStrings_(rStr, gStr, bStr, strict) {
  function empty(s) {
    return !s || String(s).trim() === '';
  }
  if (empty(rStr) && empty(gStr) && empty(bStr)) return null;
  if (empty(rStr) || empty(gStr) || empty(bStr)) {
    if (strict) throw new Error('BF_BAD_COLOR');
    return null;
  }
  var r = bfParseRgbByteNumber_(rStr, strict);
  var g = bfParseRgbByteNumber_(gStr, strict);
  var b = bfParseRgbByteNumber_(bStr, strict);
  if (r === null || g === null || b === null) return null;
  return { r: r, g: g, b: b };
}

/**
 * @param {string} s
 * @param {boolean} strict
 * @return {?number}
 */
function bfParseRgbByteNumber_(s, strict) {
  var n = Number(String(s).trim().replace(',', '.'));
  if (isNaN(n) || n < 0 || n > 255 || Math.floor(n) !== n) {
    if (strict) throw new Error('BF_BAD_COLOR');
    return null;
  }
  return n;
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @return {string}
 */
function bfRgbToHex_(r, g, b) {
  function h(n) {
    var x = Math.max(0, Math.min(255, Math.floor(n)));
    var t = x.toString(16);
    return t.length === 1 ? '0' + t : t;
  }
  return '#' + h(r) + h(g) + h(b);
}

/**
 * @param {string} hex #rrggbb
 * @return {{r:number,g:number,b:number}}
 */
function bfHexToRgbComponents_(hex) {
  var m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

/**
 * @param {Object} inputs formInputs
 * @param {boolean} strict si true, couleur invalide → BF_BAD_COLOR
 * @return {string}
 */
function bfResolveForegroundColorFromForm_(inputs, strict) {
  var presetRaw = bfReadSelection_(inputs, BF_FIELDS.COLOR_PRESET);
  var colorRaw = bfReadString_(inputs, BF_FIELDS.FOREGROUND_COLOR);
  var rs = bfRgbStringsFromDraftRaw_({
    colorRgbCompact: bfReadString_(inputs, BF_FIELDS.COLOR_RGB),
    colorRStr: bfReadString_(inputs, BF_FIELDS.COLOR_R),
    colorGStr: bfReadString_(inputs, BF_FIELDS.COLOR_G),
    colorBStr: bfReadString_(inputs, BF_FIELDS.COLOR_B),
  });
  var rStr = rs.r;
  var gStr = rs.g;
  var bStr = rs.b;

  if (presetRaw === null || presetRaw === undefined) {
    var rgb0 = bfTryRgbFromFormStrings_(rStr, gStr, bStr, strict);
    if (rgb0) return bfRgbToHex_(rgb0.r, rgb0.g, rgb0.b);
    if (!colorRaw) return '';
    if (!/^#[0-9a-fA-F]{6}$/.test(colorRaw)) {
      if (strict) throw new Error('BF_BAD_COLOR');
      return '';
    }
    return colorRaw.toLowerCase();
  }

  if (!presetRaw || presetRaw === BF_COLOR_PRESET_INHERIT) return '';

  var rgb = bfTryRgbFromFormStrings_(rStr, gStr, bStr, strict);
  if (rgb) return bfRgbToHex_(rgb.r, rgb.g, rgb.b);

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

function bfParseFormInputs_(inputs) {
  var charScope = bfNormalizeCharScope_(bfReadSelection_(inputs, BF_FIELDS.CASE_MODE) || BF_SCOPE.ALL);

  var fontRaw = bfReadSelection_(inputs, BF_FIELDS.FONT_FAMILY) || '';
  var fontFamily = fontRaw === BF_FONT_INHERIT ? '' : fontRaw;

  var sizeStr = bfReadString_(inputs, BF_FIELDS.FONT_SIZE);
  var fontSizePt = null;
  if (sizeStr) {
    var n = Number(sizeStr.replace(',', '.'));
    if (isNaN(n) || n < 1 || n > 400) {
      throw new Error('BF_BAD_SIZE');
    }
    fontSizePt = n;
  }

  var boldStr = bfReadSelection_(inputs, BF_FIELDS.BOLD) || '0';
  var bold = boldStr === '1';

  var foregroundColor = bfResolveForegroundColorFromForm_(inputs, true);

  return {
    charScope: charScope,
    fontFamily: fontFamily,
    fontSizePt: fontSizePt,
    bold: bold,
    foregroundColor: foregroundColor,
  };
}

/**
 * Workspace add-ons often nest widget payload under an empty-string key (legacy / client variants).
 * @param {Object} raw
 * @return {Object}
 */
function bfUnwrapFormInput_(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  if (raw[''] && typeof raw[''] === 'object') return raw[''];
  return raw;
}

function bfReadString_(inputs, key) {
  var entry = bfUnwrapFormInput_(inputs[key]);
  if (!entry || !entry.stringInputs) return '';
  var v = entry.stringInputs.value;
  if (!v || !v.length) return '';
  return String(v[0]).trim();
}

/**
 * Dropdown / radio values may arrive as selectionInputs OR stringInputs (Workspace Docs).
 */
function bfReadSelection_(inputs, key) {
  var entry = bfUnwrapFormInput_(inputs[key]);
  if (!entry) return null;
  if (entry.selectionInputs && entry.selectionInputs.value && entry.selectionInputs.value.length) {
    return String(entry.selectionInputs.value[0]);
  }
  if (entry.stringInputs && entry.stringInputs.value && entry.stringInputs.value.length) {
    return String(entry.stringInputs.value[0]);
  }
  return null;
}

/**
 * @param {Object} msg
 * @param {Error} err
 * @return {GoogleAppsScript.Card.ActionResponse}
 */
function bfBuildErrorResponse_(msg, err) {
  var code = String(err && err.message ? err.message : '');
  var text = msg.errGeneric;
  if (code === 'BF_TOO_LARGE') text = msg.errTooLarge;
  else if (code === 'BF_NO_DOC') text = msg.errAuth;
  else if (code === 'BF_BAD_COLOR') text = msg.errInvalidColor;
  else if (code === 'BF_BAD_SIZE') text = msg.errInvalidSize;

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(text))
    .build();
}
