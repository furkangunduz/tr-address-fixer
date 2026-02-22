/**
 * Trim ve Türkçe büyük harf normalizasyonu.
 * Çıktı referans veriyle karşılaştırmada kullanılır; Türkçe karakterler korunur.
 */
export declare function normalizeForMatch(s: string): string;
/**
 * Fuzzy eşleştirme için anahtar: Türkçe karakterler ASCII karşılıklara dönüştürülür (ı→i, ğ→g, ü→u, ş→s, ö→o, ç→c).
 * Sadece eşleştirme aşamasında kullanılır; çıktıda orijinal referans değeri döndürülür.
 */
export declare function normalizeFuzzyKey(s: string): string;
//# sourceMappingURL=normalize.d.ts.map