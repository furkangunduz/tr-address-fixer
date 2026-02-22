"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalize_1 = require("../src/normalize");
describe('normalize', () => {
    test('normalizeForMatch: trim ve büyük harf', () => {
        expect((0, normalize_1.normalizeForMatch)('  ankara  ')).toBe('ANKARA');
        expect((0, normalize_1.normalizeForMatch)('İstanbul')).toBe('İSTANBUL');
        expect((0, normalize_1.normalizeForMatch)('Kadıköy')).toBe('KADIKÖY');
    });
    test('normalizeForMatch: boş ve geçersiz', () => {
        expect((0, normalize_1.normalizeForMatch)('')).toBe('');
        expect((0, normalize_1.normalizeForMatch)(null)).toBe('');
        expect((0, normalize_1.normalizeForMatch)(undefined)).toBe('');
    });
    test('normalizeFuzzyKey: Türkçe karakterler ASCII', () => {
        expect((0, normalize_1.normalizeFuzzyKey)('Kadıköy')).toBe('KADIKOY');
        expect((0, normalize_1.normalizeFuzzyKey)('Çankaya')).toBe('CANKAYA');
        expect((0, normalize_1.normalizeFuzzyKey)('İstanbul')).toBe('ISTANBUL');
        expect((0, normalize_1.normalizeFuzzyKey)('Kadikoy')).toBe('KADIKOY');
    });
    test('normalizeFuzzyKey: trim', () => {
        expect((0, normalize_1.normalizeFuzzyKey)('  ADANA  ')).toBe('ADANA');
    });
    test('normalizeFuzzyKey: boş', () => {
        expect((0, normalize_1.normalizeFuzzyKey)('')).toBe('');
    });
    test('normalizeForMatch: çoklu boşluk ve sadece boşluk', () => {
        expect((0, normalize_1.normalizeForMatch)('  ankara   \t  ')).toBe('ANKARA');
        expect((0, normalize_1.normalizeForMatch)('   ')).toBe('');
    });
    test('normalizeForMatch: tüm Türkçe karakterler korunur', () => {
        expect((0, normalize_1.normalizeForMatch)('şığıüöç')).toBe('ŞIĞIÜÖÇ');
        expect((0, normalize_1.normalizeForMatch)('ı')).toBe('I');
        expect((0, normalize_1.normalizeForMatch)('i')).toBe('İ');
    });
    test('normalizeFuzzyKey: tüm Türkçe karakterler ASCII', () => {
        expect((0, normalize_1.normalizeFuzzyKey)('Şişli')).toBe('SISLI');
        expect((0, normalize_1.normalizeFuzzyKey)('Beşiktaş')).toBe('BESIKTAS');
        expect((0, normalize_1.normalizeFuzzyKey)('Çengelköy')).toBe('CENGELKOY');
        expect((0, normalize_1.normalizeFuzzyKey)('Göztepe')).toBe('GOZTEPE');
    });
});
//# sourceMappingURL=normalize.test.js.map