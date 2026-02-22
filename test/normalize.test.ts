import { normalizeForMatch, normalizeFuzzyKey } from '../src/normalize';

describe('normalize', () => {
  test('normalizeForMatch: trim ve büyük harf', () => {
    expect(normalizeForMatch('  ankara  ')).toBe('ANKARA');
    expect(normalizeForMatch('İstanbul')).toBe('İSTANBUL');
    expect(normalizeForMatch('Kadıköy')).toBe('KADIKÖY');
  });

  test('normalizeForMatch: boş ve geçersiz', () => {
    expect(normalizeForMatch('')).toBe('');
    expect(normalizeForMatch(null as unknown as string)).toBe('');
    expect(normalizeForMatch(undefined as unknown as string)).toBe('');
  });

  test('normalizeFuzzyKey: Türkçe karakterler ASCII', () => {
    expect(normalizeFuzzyKey('Kadıköy')).toBe('KADIKOY');
    expect(normalizeFuzzyKey('Çankaya')).toBe('CANKAYA');
    expect(normalizeFuzzyKey('İstanbul')).toBe('ISTANBUL');
    expect(normalizeFuzzyKey('Kadikoy')).toBe('KADIKOY');
  });

  test('normalizeFuzzyKey: trim', () => {
    expect(normalizeFuzzyKey('  ADANA  ')).toBe('ADANA');
  });

  test('normalizeFuzzyKey: boş', () => {
    expect(normalizeFuzzyKey('')).toBe('');
  });

  test('normalizeForMatch: çoklu boşluk ve sadece boşluk', () => {
    expect(normalizeForMatch('  ankara   \t  ')).toBe('ANKARA');
    expect(normalizeForMatch('   ')).toBe('');
  });

  test('normalizeForMatch: tüm Türkçe karakterler korunur', () => {
    expect(normalizeForMatch('şığıüöç')).toBe('ŞIĞIÜÖÇ');
    expect(normalizeForMatch('ı')).toBe('I');
    expect(normalizeForMatch('i')).toBe('İ');
  });

  test('normalizeFuzzyKey: tüm Türkçe karakterler ASCII', () => {
    expect(normalizeFuzzyKey('Şişli')).toBe('SISLI');
    expect(normalizeFuzzyKey('Beşiktaş')).toBe('BESIKTAS');
    expect(normalizeFuzzyKey('Çengelköy')).toBe('CENGELKOY');
    expect(normalizeFuzzyKey('Göztepe')).toBe('GOZTEPE');
  });
});
