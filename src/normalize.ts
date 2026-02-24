/**
 * Trim ve Türkçe büyük harf normalizasyonu.
 * Çıktı referans veriyle karşılaştırmada kullanılır; Türkçe karakterler korunur.
 */
export function normalizeForMatch(s: string): string {
  if (s == null || typeof s !== 'string') return '';
  return s.trim().toLocaleUpperCase('tr-TR');
}

const TR_FUZZY_MAP: [string, string][] = [
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

function buildFuzzyReplacer(): (s: string) => string {
  const re = new RegExp(TR_FUZZY_MAP.map(([a]) => a).join('|'), 'gu');
  const map = new Map<string, string>();
  for (const [from, to] of TR_FUZZY_MAP) {
    map.set(from, to);
  }
  return (s: string) => {
    if (s == null || typeof s !== 'string') return '';
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
export function normalizeFuzzyKey(s: string): string {
  const trimmed = s == null || typeof s !== 'string' ? '' : s.trim();
  return toFuzzyKey(trimmed);
}

/** Bilinen ülke adları (normalize edilmiş). İl alanına ülke yazıldığında tespit için. */
const COUNTRY_NAMES = new Set<string>([
  'TURKIYE',
  'TURKEY',
  'TÜRKIYE',
  'TÜRKİYE', // tr-TR toLocaleUpperCase: i -> İ (U+0130)
]);

/**
 * Verilen string bilinen bir ülke adı mı (Türkiye, Turkey vb.).
 * İl alanında ülke yazılmışsa il/ilçe yeniden yorumlamak için kullanılır.
 */
export function isCountryName(s: string): boolean {
  if (s == null || typeof s !== 'string') return false;
  const key = s.trim().toLocaleUpperCase('tr-TR');
  return key.length > 0 && COUNTRY_NAMES.has(key);
}
