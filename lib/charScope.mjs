/** Mirrors src/FormattingService.gs letter helpers — keep in sync. */

export function isLetter(ch, loc) {
  if (!ch) return false;
  const l = loc || 'en';
  return ch.toLocaleUpperCase(l) !== ch.toLocaleLowerCase(l);
}

export function isUpperLetter(ch, loc) {
  const l = loc || 'en';
  return isLetter(ch, l) && ch === ch.toLocaleUpperCase(l);
}

export function isLowerLetter(ch, loc) {
  const l = loc || 'en';
  return isLetter(ch, l) && ch === ch.toLocaleLowerCase(l);
}

export function charMatchesScope(ch, scope, loc) {
  const l = loc || 'en';
  if (scope === 'all' || !scope) return true;
  if (scope === 'upper') return isUpperLetter(ch, l);
  if (scope === 'lower') return isLowerLetter(ch, l);
  return true;
}

/**
 * @param {string} s
 * @param {string} scope all | upper | lower
 * @param {string} loc
 * @return {Array<{ start: number, end: number }>}
 */
export function collectRanges(s, scope, loc) {
  if (!s || s.length === 0) return [];
  const l = loc || 'en';
  const ranges = [];
  let runStart = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    const match = charMatchesScope(ch, scope, l);
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
