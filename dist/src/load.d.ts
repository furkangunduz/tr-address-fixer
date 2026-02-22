export interface AddressIndices {
    /** Normalize edilmiş (trim + büyük harf) il adları. */
    stateSet: Set<string>;
    /** İl -> o ile ait ilçe adları (referanstaki orijinal yazım). */
    stateToRegions: Map<string, string[]>;
    /** İlçe adı -> il (tek ilçe adı sadece bir ile aitse). */
    regionToState: Map<string, string>;
    /** (il, ilçe) çifti -> kullanım: aynı isimde birden fazla ilçe varsa (örn. MERKEZ). */
    stateRegionPairToState: Map<string, string>;
    /** Tüm (il, ilçe) çiftleri - key: "il|ilce" normalize. */
    stateRegionPairs: Set<string>;
    /** Orijinal il listesi (sıralı, referans yazım). */
    stateList: string[];
    /** Orijinal (state, region) çiftleri - region yazımı için. */
    stateRegionList: {
        state: string;
        region: string;
    }[];
    /** Fuzzy ilçe anahtarı -> { state, region }; sadece tek ile ait ilçeler (Kadıköy vb. ASCII/TR eşleşmesi için). */
    fuzzyRegionToStateRegion: Map<string, {
        state: string;
        region: string;
    }>;
}
/**
 * İl/ilçe indekslerini yükler. Varsayılan kaynak: tr_postal_codes.csv.
 *
 * @param dataDir tr_postal_codes.csv dosyasının bulunduğu klasör (varsayılan: otomatik bulunur)
 */
export declare function loadIndices(dataDir?: string): AddressIndices;
/**
 * İndeksleri tekilleştirir; ilk çağrıda yükler, sonrakilerde önbelleği döner.
 */
export declare function getIndices(dataDir?: string): AddressIndices;
//# sourceMappingURL=load.d.ts.map