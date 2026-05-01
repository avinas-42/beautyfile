/**
 * Field keys for Card Service form inputs (must match UiCards.gs).
 */
var BF_FIELDS = {
  CASE_MODE: 'bf_case_mode',
  FONT_CATEGORY: 'bf_font_category',
  FONT_FAMILY: 'bf_font_family',
  FONT_SIZE: 'bf_font_size',
  /** Gras + italique + souligné (une ligne). */
  TEXT_EMPHASIS: 'bf_text_emphasis',
  /** Anciens menus séparés (cartes encore envoyées par le client). */
  BOLD: 'bf_bold',
  ITALIC: 'bf_italic',
  UNDERLINE: 'bf_underline',
  /** Ancien menu déroulant couleur (formulaires encore envoyés par le client). */
  COLOR_PRESET: 'bf_color_preset',
  FOREGROUND_COLOR: 'bf_foreground_color',
  /** R, G et B sur une ligne (ex. « 255 128 0 » ou « 255,128,0 »). */
  COLOR_RGB: 'bf_color_rgb',
  COLOR_R: 'bf_color_r',
  COLOR_G: 'bf_color_g',
  COLOR_B: 'bf_color_b',
};

/** Valeur réservée : absence de widget preset couleur (cartes anciennes). */
var BF_COLOR_PRESET_INHERIT = '__bf_color_inherit__';

/** Valeur réservée : saisie libre (cartes anciennes). */
var BF_COLOR_PRESET_CUSTOM = '__bf_color_custom__';

/**
 * Portée des caractères à modifier (police, taille, gras, italique, souligné, couleur — pas une conversion de casse globale).
 * Valeurs stockées dans les préférences / formulaire.
 */
var BF_SCOPE = {
  ALL: 'all',
  /** Lettres affichées en majuscules uniquement */
  UPPER: 'upper',
  /** Lettres affichées en minuscules uniquement */
  LOWER: 'lower',
};

/** Ordre du menu combiné gras / italique / souligné (valeurs du formulaire). */
var BF_TEXT_EMPHASIS_ORDER = [
  'none',
  'bold',
  'italic',
  'underline',
  'bold_italic',
  'bold_underline',
  'italic_underline',
  'all',
];

/**
 * Approximate character limit before warning / refusal (runtime safety).
 */
var BF_MAX_CHARS_SOFT = 400000;

/**
 * Property keys for user defaults (ScriptProperties).
 */
var BF_PROP_KEYS = {
  CHAR_SCOPE: 'bf_char_scope',
  FONT_FAMILY: 'bf_default_font',
  FONT_SIZE: 'bf_default_size',
  BOLD: 'bf_default_bold',
  ITALIC: 'bf_default_italic',
  UNDERLINE: 'bf_default_underline',
  FOREGROUND_COLOR: 'bf_default_color',
};

/**
 * Ancienne clé (préférences) — migrée vers bf_char_scope.
 */
var BF_PROP_LEGACY_CHAR_SCOPE = 'bf_default_case';

/**
 * Valeur envoyée par le menu « police inchangée ».
 * Une chaîne vide dans les listes Docs peut décaler le libellé / l’aperçu ; on utilise un sentinelle.
 */
var BF_FONT_INHERIT = '__bf_inherit__';

/** Liste des choix police : voir src/BfFontChoices.gs (généré par npm run fonts:sync). */
