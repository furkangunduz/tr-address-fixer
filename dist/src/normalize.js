"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeForMatch = normalizeForMatch;
exports.normalizeFuzzyKey = normalizeFuzzyKey;
/**
 * Trim ve Türkçe büyük harf normalizasyonu.
 * Çıktı referans veriyle karşılaştırmada kullanılır; Türkçe karakterler korunur.
 */
function normalizeForMatch(s) {
    if (s == null || typeof s !== 'string')
        return '';
    return s.trim().toLocaleUpperCase('tr-TR');
}
const TR_FUZZY_MAP = [
    ['İ', 'I'],
    ['I', 'I'],
    ['ı', 'i'],
    ['Ğ', 'G'],
    ['ğ', 'g'],
    ['Ü', 'U'],
    ['ü', 'u'],
    ['Ş', 'S'],
    ['ş', 's'],
    ['Ö', 'O'],
    ['ö', 'o'],
    ['Ç', 'C'],
    ['ç', 'c'],
];
function buildFuzzyReplacer() {
    const re = new RegExp(TR_FUZZY_MAP.map(([a]) => a).join('|'), 'gu');
    const map = new Map();
    for (const [from, to] of TR_FUZZY_MAP) {
        map.set(from, to);
    }
    return (s) => {
        if (s == null || typeof s !== 'string')
            return '';
        return s.replace(re, (ch) => {
            const mapped = map.get(ch);
            return mapped !== undefined ? mapped : ch;
        }).toUpperCase();
    };
}
const toFuzzyKey = buildFuzzyReplacer();
/**
 * Fuzzy eşleştirme için anahtar: Türkçe karakterler ASCII karşılıklara dönüştürülür (ı→i, ğ→g, ü→u, ş→s, ö→o, ç→c).
 * Sadece eşleştirme aşamasında kullanılır; çıktıda orijinal referans değeri döndürülür.
 */
function normalizeFuzzyKey(s) {
    const trimmed = s == null || typeof s !== 'string' ? '' : s.trim();
    return toFuzzyKey(trimmed);
}
//# sourceMappingURL=normalize.js.map