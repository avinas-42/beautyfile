/**
 * Persists last-used options (ScriptProperties).
 */

function bfPrefsSave(options) {
  var p = PropertiesService.getUserProperties();
  if (options.charScope) p.setProperty(BF_PROP_KEYS.CHAR_SCOPE, options.charScope);
  if (options.fontFamily) p.setProperty(BF_PROP_KEYS.FONT_FAMILY, options.fontFamily);
  if (options.fontSizePt !== undefined && options.fontSizePt !== null)
    p.setProperty(BF_PROP_KEYS.FONT_SIZE, String(options.fontSizePt));
  if (options.bold !== undefined && options.bold !== null)
    p.setProperty(BF_PROP_KEYS.BOLD, options.bold ? '1' : '0');
  if (options.foregroundColor) p.setProperty(BF_PROP_KEYS.FOREGROUND_COLOR, options.foregroundColor);
}

/**
 * @return {Object} partial options merged with defaults
 */
function bfPrefsLoad() {
  var p = PropertiesService.getUserProperties();
  var scopeRaw = p.getProperty(BF_PROP_KEYS.CHAR_SCOPE);
  if (!scopeRaw) scopeRaw = p.getProperty(BF_PROP_LEGACY_CHAR_SCOPE);
  var charScope = BF_SCOPE.ALL;
  if (scopeRaw === BF_SCOPE.UPPER || scopeRaw === BF_SCOPE.LOWER || scopeRaw === BF_SCOPE.ALL) {
    charScope = scopeRaw;
  }
  return {
    charScope: charScope,
    fontFamily: p.getProperty(BF_PROP_KEYS.FONT_FAMILY) || '',
    fontSizePt: p.getProperty(BF_PROP_KEYS.FONT_SIZE)
      ? Number(p.getProperty(BF_PROP_KEYS.FONT_SIZE))
      : null,
    bold: p.getProperty(BF_PROP_KEYS.BOLD) === '1',
    foregroundColor: p.getProperty(BF_PROP_KEYS.FOREGROUND_COLOR) || '',
  };
}
