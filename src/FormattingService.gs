/**
 * Parcourt le document et applique police / taille / gras / italique / souligné / couleur uniquement aux plages
 * correspondant à la portée choisie (tout le texte, lettres majuscules, ou lettres minuscules).
 */

/**
 * @param {GoogleAppsScript.Document.Document} doc
 * @param {{
 *   charScope: string,
 *   fontFamily: string,
 *   fontSizePt: ?number,
 *   bold: boolean,
 *   italic: boolean,
 *   underline: boolean,
 *   foregroundColor: string,
 *   includeHeadersFooters: boolean
 * }} options
 */
function bfFormatEntireDocument(doc, options) {
  var body = doc.getBody();
  bfAssertDocSize_(body);

  bfProcessContainer_(body, options);

  if (options.includeHeadersFooters) {
    var h = doc.getHeader();
    if (h) bfProcessContainer_(h, options);
    var f = doc.getFooter();
    if (f) bfProcessContainer_(f, options);
  }
}

function bfApproxDocumentChars_(body) {
  return body.getText().length;
}

function bfAssertDocSize_(body) {
  var n = bfApproxDocumentChars_(body);
  if (n > BF_MAX_CHARS_SOFT) {
    throw new Error('BF_TOO_LARGE');
  }
}

/**
 * @param {GoogleAppsScript.Document.ContainerElement} container
 * @param {Object} options
 */
function bfProcessContainer_(container, options) {
  var count = container.getNumChildren();
  for (var i = 0; i < count; i++) {
    bfProcessElement_(container.getChild(i), options);
  }
}

/**
 * @param {GoogleAppsScript.Document.Element} element
 * @param {Object} options
 */
function bfProcessElement_(element, options) {
  var t = element.getType();
  switch (t) {
    case DocumentApp.ElementType.PARAGRAPH:
    case DocumentApp.ElementType.LIST_ITEM:
      bfApplyToText_(element.editAsText(), options);
      return;
    case DocumentApp.ElementType.TABLE:
      bfProcessTable_(element.asTable(), options);
      return;
    default:
      return;
  }
}

function bfProcessTable_(table, options) {
  for (var r = 0; r < table.getNumRows(); r++) {
    var row = table.getRow(r);
    for (var c = 0; c < row.getNumCells(); c++) {
      bfProcessContainer_(row.getCell(c), options);
    }
  }
}

function bfIsLetter_(ch, loc) {
  if (!ch) return false;
  return ch.toLocaleUpperCase(loc) !== ch.toLocaleLowerCase(loc);
}

function bfIsUpperLetter_(ch, loc) {
  return bfIsLetter_(ch, loc) && ch === ch.toLocaleUpperCase(loc);
}

function bfIsLowerLetter_(ch, loc) {
  return bfIsLetter_(ch, loc) && ch === ch.toLocaleLowerCase(loc);
}

/**
 * @param {string} ch
 * @param {string} scope BF_SCOPE.*
 * @param {string} loc
 */
function bfCharMatchesScope_(ch, scope, loc) {
  if (scope === BF_SCOPE.ALL || !scope) return true;
  if (scope === BF_SCOPE.UPPER) return bfIsUpperLetter_(ch, loc);
  if (scope === BF_SCOPE.LOWER) return bfIsLowerLetter_(ch, loc);
  return true;
}

/**
 * Plages d’indices inclusives [start, end] dans la chaîne UTF-16 du paragraphe.
 * @param {string} s
 * @param {string} scope
 * @param {string} loc
 * @return {Array<{start:number,end:number}>}
 */
function bfCollectRanges_(s, scope, loc) {
  if (!s || s.length === 0) return [];
  var ranges = [];
  var runStart = -1;
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    var match = bfCharMatchesScope_(ch, scope, loc);
    if (match) {
      if (runStart < 0) runStart = i;
    } else {
      if (runStart >= 0) {
        ranges.push({ start: runStart, end: i - 1 });
        runStart = -1;
      }
    }
  }
  if (runStart >= 0) ranges.push({ start: runStart, end: s.length - 1 });
  return ranges;
}

/**
 * @param {GoogleAppsScript.Document.Text} text
 * @param {Object} options
 */
function bfApplyToText_(text, options) {
  var loc = Session.getActiveUserLocale();
  var raw = text.getText();
  if (!raw || raw.length === 0) return;

  var scope = options.charScope || BF_SCOPE.ALL;
  var ranges = bfCollectRanges_(raw, scope, loc);

  for (var r = 0; r < ranges.length; r++) {
    var a = ranges[r].start;
    var b = ranges[r].end;
    if (options.fontFamily) {
      text.setFontFamily(a, b, options.fontFamily);
    }
    if (options.fontSizePt && !isNaN(options.fontSizePt)) {
      text.setFontSize(a, b, options.fontSizePt);
    }
    text.setBold(a, b, Boolean(options.bold));
    text.setItalic(a, b, Boolean(options.italic));
    text.setUnderline(a, b, Boolean(options.underline));
    if (options.foregroundColor) {
      text.setForegroundColor(a, b, options.foregroundColor);
    }
  }
}
