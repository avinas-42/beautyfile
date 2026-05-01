import { describe, expect, it } from 'vitest';
import { collectRanges, isLowerLetter, isUpperLetter } from './charScope.mjs';

describe('charScope', () => {
  it('detects ASCII upper/lower', () => {
    expect(isUpperLetter('A', 'en')).toBe(true);
    expect(isLowerLetter('a', 'en')).toBe(true);
    expect(isUpperLetter('a', 'en')).toBe(false);
    expect(isLowerLetter('A', 'en')).toBe(false);
  });

  it('collectRanges all', () => {
    expect(collectRanges('AbC', 'all', 'en')).toEqual([{ start: 0, end: 2 }]);
  });

  it('collectRanges upper only', () => {
    expect(collectRanges('HeLLo', 'upper', 'en')).toEqual([
      { start: 0, end: 0 },
      { start: 2, end: 3 },
    ]);
  });

  it('collectRanges lower only', () => {
    expect(collectRanges('HeLLo', 'lower', 'en')).toEqual([{ start: 1, end: 1 }, { start: 4, end: 4 }]);
  });
});
