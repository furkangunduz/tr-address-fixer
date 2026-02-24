import { normalizeForMatch, normalizeFuzzyKey, isCountryName } from '../src/normalize';

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

  test('isCountryName: Türkiye / Turkey tanınır', () => {
    expect(isCountryName('Türkiye')).toBe(true);
    expect(isCountryName('Turkey')).toBe(true);
    expect(isCountryName('TURKIYE')).toBe(true);
    expect(isCountryName('  Türkiye  ')).toBe(true);
    expect(isCountryName('Ankara')).toBe(false);
    expect(isCountryName('')).toBe(false);
  });

  test('normalizeForMatch: sayı ve özel karakter içeren string', () => {
    expect(normalizeForMatch('ankara 123')).toBe('ANKARA 123');
    expect(normalizeForMatch('No:5')).toBe('NO:5');
  });

  test('normalizeForMatch: tek karakter', () => {
    expect(normalizeForMatch('a')).toBe('A');
    expect(normalizeForMatch('ı')).toBe('I');
  });

  test('normalizeForMatch: uzun string', () => {
    const long = 'A'.repeat(500);
    expect(normalizeForMatch(long).length).toBe(500);
    expect(normalizeForMatch(long)).toBe(long);
  });

  test('isCountryName: null ve undefined', () => {
    expect(isCountryName(null as unknown as string)).toBe(false);
    expect(isCountryName(undefined as unknown as string)).toBe(false);
  });

  test('normalizeFuzzyKey: sayı korunur', () => {
    expect(normalizeFuzzyKey('Kadıköy123')).toBe('KADIKOY123');
  });
});
