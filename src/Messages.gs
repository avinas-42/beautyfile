/**
 * Sidebar UI and notification strings (English only for Marketplace consistency).
 */

/** @type {Object} */
var BF_MESSAGES = {
  title: 'Beauty File',
  subtitle: 'Targeted formatting: font, size, bold, italic, underline, color on the letter scope you choose.',
  caseLabel: 'Letter scope',
  scopeAll: 'All text',
  scopeUpper: 'Uppercase only',
  scopeLower: 'Lowercase only',
  fontCategoryLabel: 'Category',
  fontCategoryNames: {
    'sans-serif': 'Sans-serif',
    serif: 'Serif',
    monospace: 'Monospace',
    display: 'Display',
    handwriting: 'Handwriting',
    docs: 'Docs classics',
  },
  fontLabel: 'Font',
  fontDefault: '(unchanged)',
  sizeLabel: 'Size (pt)',
  sizeLabelFull: 'Size (pt) — e.g. 11',
  sizePlaceholder: 'e.g. 11',
  textEmphasisLabel: 'Bold · italic · underline',
  textEmphasisNames: {
    none: 'None',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    bold_italic: 'Bold + italic',
    bold_underline: 'Bold + underline',
    italic_underline: 'Italic + underline',
    all: 'Bold + italic + underline',
  },
  colorLabel: 'Color (#rrggbb)',
  colorSectionTitle: 'Swatches',
  colorSpectrumCaption: 'Tap a swatch to pick a color.',
  colorRgbCompact: 'R · G · B (0–255)',
  colorRgbCompactHint: 'e.g. 255 128 0',
  colorHexHint: 'Hex (#rrggbb)',
  colorLabelFull: 'Color — e.g. #000000, empty to skip',
  colorPlaceholder: 'e.g. #000000 leave empty to skip',
  apply: 'Apply',
  success: 'Formatting applied.',
  errAuth: 'Cannot access the active document.',
  errTooLarge: 'Document is too large for a reliable single pass. Split or trim content.',
  errInvalidColor: 'Invalid color. Use #rrggbb.',
  errInvalidSize: 'Invalid size. Use a number between 1 and 400.',
  errGeneric: 'Something went wrong. Try again or check logs.',
};

/**
 * Add-on UI is always English (ignore host locale).
 * @param {string=} locale unused
 * @return {Object} message map
 */
function bfMessagesForLocale(locale) {
  return BF_MESSAGES;
}

/**
 * @param {GoogleAppsScript.Events.BaseEvent=} e unused
 * @return {Object} message map
 */
function bfMessagesFromEvent(e) {
  return BF_MESSAGES;
}
