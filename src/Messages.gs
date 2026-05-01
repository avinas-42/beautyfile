/**
 * FR / EN strings for sidebar UI and notifications.
 */
var BF_MESSAGES = {
  fr: {
    title: 'Beauty File',
    subtitle: 'Mise en forme ciblée : police, taille, gras, couleur selon la portée choisie.',
    caseLabel: 'Portée des lettres',
    scopeAll: 'Tout le texte',
    scopeUpper: 'Majuscules uniquement',
    scopeLower: 'Minuscules uniquement',
    fontCategoryLabel: 'Catégorie',
    fontCategoryNames: {
      'sans-serif': 'Sans empattement',
      serif: 'Serif',
      monospace: 'Monospace',
      display: 'Affichage',
      handwriting: 'Manuscrite',
      docs: 'Classiques Docs',
    },
    fontLabel: 'Police',
    fontDefault: '(inchangée)',
    sizeLabel: 'Taille (pt)',
    sizeLabelFull: 'Taille (pt) — ex. 11',
    sizePlaceholder: 'ex. 11',
    boldLabel: 'Gras',
    boldNo: 'Non',
    boldYes: 'Oui',
    colorLabel: 'Couleur (#rrggbb)',
    colorSectionTitle: 'Nuancier',
    colorSpectrumCaption: 'Cliquez une pastille pour choisir une couleur.',
    colorRgbCompact: 'R · G · B (0–255)',
    colorRgbCompactHint: 'ex. 255 128 0',
    colorHexHint: 'Hex (#rrggbb)',
    colorLabelFull: 'Couleur — ex. #000000, vide = ignorer',
    colorPlaceholder: 'ex. #000000 laisser vide pour ignorer',
    apply: 'Beauty File',
    success: 'Mise en forme appliquée.',
    errAuth: 'Impossible d’accéder au document actif.',
    errTooLarge: 'Document trop volumineux pour un traitement fiable. Réduisez le texte ou traitez par sections.',
    errInvalidColor: 'Couleur invalide. Utilisez #rrggbb (hex).',
    errInvalidSize: 'Taille invalide. Utilisez un nombre entre 1 et 400.',
    errGeneric: 'Une erreur est survenue. Réessayez ou consultez les journaux.',
  },
  en: {
    title: 'Beauty File',
    subtitle: 'Targeted formatting: font, size, bold, color on the letter scope you choose.',
    caseLabel: 'Letter scope',
    scopeAll: 'All text',
    scopeUpper: 'Uppercase letters only',
    scopeLower: 'Lowercase letters only',
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
    boldLabel: 'Bold',
    boldNo: 'No',
    boldYes: 'Yes',
    colorLabel: 'Color (#rrggbb)',
    colorSectionTitle: 'Swatches',
    colorSpectrumCaption: 'Tap a swatch to pick a color.',
    colorRgbCompact: 'R · G · B (0–255)',
    colorRgbCompactHint: 'e.g. 255 128 0',
    colorHexHint: 'Hex (#rrggbb)',
    colorLabelFull: 'Color — e.g. #000000, empty to skip',
    colorPlaceholder: 'e.g. #000000 leave empty to skip',
    apply: 'Beauty File',
    success: 'Formatting applied.',
    errAuth: 'Cannot access the active document.',
    errTooLarge: 'Document is too large for a reliable single pass. Split or trim content.',
    errInvalidColor: 'Invalid color. Use #rrggbb.',
    errInvalidSize: 'Invalid size. Use a number between 1 and 400.',
    errGeneric: 'Something went wrong. Try again or check logs.',
  },
};

/**
 * @param {string} locale BCP-47 or Apps Script locale string
 * @return {Object} message map
 */
function bfMessagesForLocale(locale) {
  var lang = (locale || '').toLowerCase().slice(0, 2);
  if (lang === 'fr') return BF_MESSAGES.fr;
  return BF_MESSAGES.en;
}

/**
 * @param {GoogleAppsScript.Events.BaseEvent} e
 * @return {Object} message map
 */
function bfMessagesFromEvent(e) {
  var loc =
    (e && e.commonEventObject && e.commonEventObject.userLocale) ||
    Session.getActiveUserLocale();
  return bfMessagesForLocale(loc);
}
