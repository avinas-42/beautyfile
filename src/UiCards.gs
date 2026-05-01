/**
 * Card Service UI for the Docs sidebar.
 */

/**
 * @param {Object} msg
 * @param {string} slug
 * @return {string}
 */
function bfFontCategoryDisplayName_(msg, slug) {
  var names = msg.fontCategoryNames;
  if (names && names[slug]) return names[slug];
  return slug;
}

/**
 * @return {string} catégorie par défaut : « Classiques Docs » si disponible, sinon première non vide.
 */
function bfDefaultFontCategory_() {
  var docsArr = BF_FONT_CHOICES_BY_CATEGORY['docs'];
  if (docsArr && docsArr.length) return 'docs';
  for (var i = 0; i < BF_FONT_CATEGORY_ORDER.length; i++) {
    var c = BF_FONT_CATEGORY_ORDER[i];
    var arr = BF_FONT_CHOICES_BY_CATEGORY[c];
    if (arr && arr.length) return c;
  }
  return 'sans-serif';
}

/**
 * @param {string} fontValue
 * @param {string} cat
 * @return {boolean}
 */
function bfFontInCategory_(fontValue, cat) {
  var arr = BF_FONT_CHOICES_BY_CATEGORY[cat];
  if (!arr) return false;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].value === fontValue) return true;
  }
  return false;
}

/**
 * @param {string} fontValue
 * @return {boolean}
 */
function bfFontChoiceHasValue_(fontValue) {
  for (var i = 0; i < BF_FONT_CATEGORY_ORDER.length; i++) {
    var c = BF_FONT_CATEGORY_ORDER[i];
    if (bfFontInCategory_(fontValue, c)) return true;
  }
  return false;
}

/**
 * @param {string} raw
 * @return {string} hex #rrggbb minuscule ou ''
 */
function bfNormalizeHexColor_(raw) {
  if (!raw || typeof raw !== 'string') return '';
  var s = raw.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) return '';
  return s.toLowerCase();
}

/**
 * Valeur affichée du champ compact R G B (une ligne).
 * @param {string} nc hex normalisé ou ''
 * @param {Object|null} draftRaw
 * @return {string}
 */
function bfRgbCompactValueForCard_(nc, draftRaw) {
  if (nc) {
    var comp = bfHexToRgbComponents_(nc);
    return comp.r + ' ' + comp.g + ' ' + comp.b;
  }
  if (draftRaw && draftRaw.colorRgbCompact != null && String(draftRaw.colorRgbCompact).trim() !== '') {
    return String(draftRaw.colorRgbCompact);
  }
  var rs = bfRgbStringsFromDraftRaw_(draftRaw);
  if (rs.r || rs.g || rs.b) return rs.r + ' ' + rs.g + ' ' + rs.b;
  return '';
}

/**
 * Teinte (°), saturation et luminosité → hex (#rrggbb).
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @return {string}
 */
function bfWheelHex_(h, s, v) {
  h = ((h % 360) + 360) % 360;
  var c = v * s;
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  var m = v - c;
  var r1;
  var g1;
  var b1;
  var sec = Math.floor(h / 60) % 6;
  switch (sec) {
    case 0:
      r1 = c;
      g1 = x;
      b1 = 0;
      break;
    case 1:
      r1 = x;
      g1 = c;
      b1 = 0;
      break;
    case 2:
      r1 = 0;
      g1 = c;
      b1 = x;
      break;
    case 3:
      r1 = 0;
      g1 = x;
      b1 = c;
      break;
    case 4:
      r1 = x;
      g1 = 0;
      b1 = c;
      break;
    default:
      r1 = c;
      g1 = 0;
      b1 = x;
      break;
  }
  return bfRgbToHex_((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

/**
 * Pastilles supplémentaires (gris + teintes saturées + pastels).
 * @return {Array<string>}
 */
function bfSpectrumSwatchHexes_() {
  var out = [];
  var grays = [0, 36, 72, 108, 144, 180, 216, 255];
  for (var gi = 0; gi < grays.length; gi++) {
    var gv = grays[gi];
    out.push(bfRgbToHex_(gv, gv, gv));
  }
  var hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  for (var hi = 0; hi < hues.length; hi++) {
    out.push(bfWheelHex_(hues[hi], 1, 1));
  }
  for (var hj = 0; hj < hues.length; hj++) {
    out.push(bfWheelHex_(hues[hj], 0.4, 1));
  }
  return out;
}

/** Nombre de pastilles par ligne (largeur sidebar ~4 boutons sans wrap vilain). */
var BF_COLOR_SWATCHES_PER_ROW = 4;

/**
 * @param {string} hex #rrggbb
 * @return {GoogleAppsScript.Card.TextButton}
 */
function bfNewColorSwatchButton_(hex) {
  return CardService.newTextButton()
    .setText('\u200b')
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setBackgroundColor(hex)
    .setOnClickAction(CardService.newAction().setFunctionName('onColorPick').setParameters({ hex: String(hex) }));
}

/**
 * @param {GoogleAppsScript.Card.CardSection} section
 */
function bfAppendColorSwatchWidgets_(section) {
  var hexes = bfSpectrumSwatchHexes_();
  var i = 0;
  while (i < hexes.length) {
    var row = CardService.newButtonSet();
    for (var j = 0; j < BF_COLOR_SWATCHES_PER_ROW && i < hexes.length; j++, i++) {
      row.addButton(bfNewColorSwatchButton_(hexes[i]));
    }
    section.addWidget(row);
  }
}

/**
 * @param {string} fontValue canonique (pas BF_FONT_INHERIT)
 * @return {string} slug catégorie
 */
function bfResolveFontCategory_(fontValue) {
  if (!fontValue || fontValue === BF_FONT_INHERIT) return bfDefaultFontCategory_();
  for (var i = 0; i < BF_FONT_CATEGORY_ORDER.length; i++) {
    var c = BF_FONT_CATEGORY_ORDER[i];
    if (bfFontInCategory_(fontValue, c)) return c;
  }
  return 'docs';
}

/**
 * @param {Object} msg messages bundle
 * @param {Object} prefs from bfPrefsLoad() — préférences persistées (dont fontFamily)
 * @param {Object=} cardOpts categoryExplicit, draftRaw
 * @return {GoogleAppsScript.Card.Card}
 */
function bfBuildMainCard_(msg, prefs, cardOpts) {
  cardOpts = cardOpts || {};
  var categoryExplicit = cardOpts.categoryExplicit;
  var draftRaw = cardOpts.draftRaw || null;

  var mergedDisplay = bfMergeDisplayPrefsForCard_(prefs, draftRaw);
  var charScope = mergedDisplay.charScope || BF_SCOPE.ALL;
  var scopeSection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName(BF_FIELDS.CASE_MODE)
    .setTitle(msg.caseLabel)
    .addItem(msg.scopeAll, BF_SCOPE.ALL, charScope === BF_SCOPE.ALL)
    .addItem(msg.scopeUpper, BF_SCOPE.UPPER, charScope === BF_SCOPE.UPPER)
    .addItem(msg.scopeLower, BF_SCOPE.LOWER, charScope === BF_SCOPE.LOWER);

  var savedFont = prefs.fontFamily || '';

  var activeCategory;
  if (categoryExplicit) {
    activeCategory = categoryExplicit;
  } else {
    activeCategory = savedFont ? bfResolveFontCategory_(savedFont) : bfDefaultFontCategory_();
  }

  var fontFromForm = draftRaw && draftRaw.fontFamily != null ? draftRaw.fontFamily : null;

  var fontInheritSelected;
  if (categoryExplicit) {
    if (fontFromForm && fontFromForm !== BF_FONT_INHERIT && bfFontInCategory_(fontFromForm, activeCategory)) {
      fontInheritSelected = false;
    } else {
      fontInheritSelected = true;
    }
  } else {
    fontInheritSelected = !savedFont;
  }

  var prefFontForOrphan = savedFont;

  var selectedFontValue = '';
  if (!fontInheritSelected) {
    selectedFontValue = categoryExplicit ? fontFromForm : savedFont;
  }

  var categorySection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName(BF_FIELDS.FONT_CATEGORY)
    .setTitle(msg.fontCategoryLabel)
    .setOnChangeAction(CardService.newAction().setFunctionName('onFontCategoryChange'));

  for (var ci = 0; ci < BF_FONT_CATEGORY_ORDER.length; ci++) {
    var catKey = BF_FONT_CATEGORY_ORDER[ci];
    var catArr = BF_FONT_CHOICES_BY_CATEGORY[catKey];
    if (!catArr || !catArr.length) continue;
    categorySection.addItem(bfFontCategoryDisplayName_(msg, catKey), catKey, catKey === activeCategory);
  }

  var fontSection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName(BF_FIELDS.FONT_FAMILY)
    .setTitle(msg.fontLabel)
    .addItem(msg.fontDefault, BF_FONT_INHERIT, fontInheritSelected);

  if (prefFontForOrphan && !bfFontChoiceHasValue_(prefFontForOrphan)) {
    fontSection.addItem(prefFontForOrphan, prefFontForOrphan, !fontInheritSelected && selectedFontValue === prefFontForOrphan);
  }

  var list = BF_FONT_CHOICES_BY_CATEGORY[activeCategory] || [];
  for (var fi = 0; fi < list.length; fi++) {
    var ch = list[fi];
    fontSection.addItem(ch.label, ch.value, !fontInheritSelected && selectedFontValue === ch.value);
  }

  var sizeVal =
    mergedDisplay.fontSizePt != null && !isNaN(mergedDisplay.fontSizePt)
      ? String(mergedDisplay.fontSizePt)
      : '';
  var sizeInput = CardService.newTextInput()
    .setFieldName(BF_FIELDS.FONT_SIZE)
    .setTitle(msg.sizeLabelFull)
    .setValue(sizeVal);

  var emphasisKey = bfEmphasisKeyFromBools_(mergedDisplay.bold, mergedDisplay.italic, mergedDisplay.underline);
  var emphasisSection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName(BF_FIELDS.TEXT_EMPHASIS)
    .setTitle(msg.textEmphasisLabel);
  var names = msg.textEmphasisNames;
  for (var ei = 0; ei < BF_TEXT_EMPHASIS_ORDER.length; ei++) {
    var ek = BF_TEXT_EMPHASIS_ORDER[ei];
    var elabel = names && names[ek] ? names[ek] : ek;
    emphasisSection.addItem(elabel, ek, ek === emphasisKey);
  }

  var nc = bfNormalizeHexColor_(mergedDisplay.foregroundColor || '');

  var colorHexVal = nc ? nc : draftRaw && draftRaw.colorRaw ? String(draftRaw.colorRaw) : '';

  var colorRgbCompactVal = bfRgbCompactValueForCard_(nc, draftRaw);

  var colorRgbInput = CardService.newTextInput()
    .setFieldName(BF_FIELDS.COLOR_RGB)
    .setTitle(msg.colorRgbCompact)
    .setHint(msg.colorRgbCompactHint)
    .setValue(colorRgbCompactVal)
    .setOnChangeAction(CardService.newAction().setFunctionName('onColorFieldChange').setParameters({ src: 'rgb' }));

  var colorInput = CardService.newTextInput()
    .setFieldName(BF_FIELDS.FOREGROUND_COLOR)
    .setTitle(msg.colorHexHint)
    .setValue(colorHexVal)
    .setOnChangeAction(CardService.newAction().setFunctionName('onColorFieldChange').setParameters({ src: 'hex' }));

  var applyAction = CardService.newAction().setFunctionName('applyBeautyFile');

  var button = CardService.newTextButton()
    .setText(msg.apply)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(applyAction);

  var section = CardService.newCardSection()
    .addWidget(scopeSection)
    .addWidget(categorySection)
    .addWidget(fontSection)
    .addWidget(sizeInput)
    .addWidget(emphasisSection)
    .addWidget(colorRgbInput)
    .addWidget(colorInput)
    .addWidget(CardService.newButtonSet().addButton(button));

  var colorPickerSection = CardService.newCardSection()
    .setHeader(msg.colorSectionTitle)
    .addWidget(CardService.newTextParagraph().setText(msg.colorSpectrumCaption));
  bfAppendColorSwatchWidgets_(colorPickerSection);

  return CardService.newCardBuilder()
    .setHeader(bfCardHeader_(msg))
    .addSection(section)
    .addSection(colorPickerSection)
    .build();
}

function bfCardHeader_(msg) {
  return CardService.newCardHeader().setTitle(msg.title).setSubtitle(msg.subtitle);
}
