import { describe, expect, it } from 'vitest';
import {
  BF_FIELDS,
  BF_FONT_INHERIT,
  BF_SCOPE,
  BF_COLOR_PRESET_CUSTOM,
  BF_COLOR_PRESET_INHERIT,
} from './constants.mjs';
import { parseFormOptions } from './parseFormOptions.mjs';

describe('parseFormOptions', () => {
  it('parses minimal defaults', () => {
    expect(parseFormOptions({})).toEqual({
      charScope: BF_SCOPE.ALL,
      fontFamily: '',
      fontSizePt: null,
      bold: false,
      foregroundColor: '',
    });
  });

  it('maps font inherit sentinel to empty', () => {
    const inputs = {
      [BF_FIELDS.FONT_FAMILY]: { stringInputs: { value: [BF_FONT_INHERIT] } },
    };
    expect(parseFormOptions(inputs).fontFamily).toBe('');
  });

  it('reads scope from stringInputs (Workspace Docs)', () => {
    const inputs = {
      [BF_FIELDS.CASE_MODE]: { stringInputs: { value: [BF_SCOPE.UPPER] } },
    };
    expect(parseFormOptions(inputs).charScope).toBe(BF_SCOPE.UPPER);
  });

  it('parses selections and strings', () => {
    const inputs = {
      [BF_FIELDS.CASE_MODE]: { selectionInputs: { value: [BF_SCOPE.LOWER] } },
      [BF_FIELDS.FONT_FAMILY]: { selectionInputs: { value: ['Arial'] } },
      [BF_FIELDS.FONT_SIZE]: { stringInputs: { value: ['12'] } },
      [BF_FIELDS.BOLD]: { selectionInputs: { value: ['1'] } },
      [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_CUSTOM] } },
      [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: ['#AbCdEf'] } },
    };
    expect(parseFormOptions(inputs)).toEqual({
      charScope: BF_SCOPE.LOWER,
      fontFamily: 'Arial',
      fontSizePt: 12,
      bold: true,
      foregroundColor: '#abcdef',
    });
  });

  it('reads preset hex from color dropdown', () => {
    const inputs = {
      [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: ['#0000ff'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#0000ff');
  });

  it('inherit preset ignores hex field', () => {
    const inputs = {
      [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_INHERIT] } },
      [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: ['#ff0000'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('');
  });

  it('inherit preset ignores RGB compact field', () => {
    const inputs = {
      [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_INHERIT] } },
      [BF_FIELDS.COLOR_RGB]: { stringInputs: { value: ['255 0 0'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('');
  });

  it('resolves RGB compact when preset is custom', () => {
    const inputs = {
      [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_CUSTOM] } },
      [BF_FIELDS.COLOR_RGB]: { stringInputs: { value: ['10 20 30'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#0a141e');
  });

  it('RGB compact wins over preset hex and custom hex', () => {
    const inputs = {
      [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: ['#0000ff'] } },
      [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: ['#ffffff'] } },
      [BF_FIELDS.COLOR_RGB]: { stringInputs: { value: ['0 128 0'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#008000');
  });

  it('accepts RGB compact with commas', () => {
    const inputs = {
      [BF_FIELDS.COLOR_RGB]: { stringInputs: { value: ['255,255,0'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#ffff00');
  });

  it('throws BF_BAD_COLOR on partial RGB compact with custom preset', () => {
    expect(() =>
      parseFormOptions({
        [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_CUSTOM] } },
        [BF_FIELDS.COLOR_RGB]: { stringInputs: { value: ['1 2'] } },
        [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: [''] } },
      })
    ).toThrowError('BF_BAD_COLOR');
  });

  it('legacy form without color preset uses RGB compact', () => {
    const inputs = {
      [BF_FIELDS.COLOR_RGB]: { stringInputs: { value: ['255 255 0'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#ffff00');
  });

  it('legacy three separate R G B fields still work when COLOR_RGB empty', () => {
    const inputs = {
      [BF_FIELDS.COLOR_R]: { stringInputs: { value: ['255'] } },
      [BF_FIELDS.COLOR_G]: { stringInputs: { value: ['255'] } },
      [BF_FIELDS.COLOR_B]: { stringInputs: { value: ['0'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#ffff00');
  });

  it('accepts decimal comma in size', () => {
    const inputs = {
      [BF_FIELDS.FONT_SIZE]: { stringInputs: { value: ['11,5'] } },
    };
    expect(parseFormOptions(inputs).fontSizePt).toBe(11.5);
  });

  it('throws BF_BAD_SIZE', () => {
    expect(() =>
      parseFormOptions({
        [BF_FIELDS.FONT_SIZE]: { stringInputs: { value: ['0'] } },
      })
    ).toThrowError('BF_BAD_SIZE');
    expect(() =>
      parseFormOptions({
        [BF_FIELDS.FONT_SIZE]: { stringInputs: { value: ['401'] } },
      })
    ).toThrowError('BF_BAD_SIZE');
  });

  it('throws BF_BAD_COLOR', () => {
    expect(() =>
      parseFormOptions({
        [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_CUSTOM] } },
        [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: ['red'] } },
      })
    ).toThrowError('BF_BAD_COLOR');
    expect(() =>
      parseFormOptions({
        [BF_FIELDS.COLOR_PRESET]: { selectionInputs: { value: [BF_COLOR_PRESET_CUSTOM] } },
        [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: ['#fff'] } },
      })
    ).toThrowError('BF_BAD_COLOR');
  });

  it('legacy form without color preset uses hex field only', () => {
    const inputs = {
      [BF_FIELDS.FOREGROUND_COLOR]: { stringInputs: { value: ['#aabbcc'] } },
    };
    expect(parseFormOptions(inputs).foregroundColor).toBe('#aabbcc');
  });

  it('normalizes unknown scope to all', () => {
    const inputs = {
      [BF_FIELDS.CASE_MODE]: { stringInputs: { value: ['bogus'] } },
    };
    expect(parseFormOptions(inputs).charScope).toBe(BF_SCOPE.ALL);
  });
});
