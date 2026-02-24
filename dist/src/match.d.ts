import type { AddressIndices } from './load';
/** İl için aday listesi: stateList (orijinal yazım). Exact eşleşme key ile Set'te. */
export declare function findStateExact(indices: AddressIndices, normalizedIl: string): string | null;
/** İl fuzzy: tüm iller arasında en yakın. */
export declare function findStateFuzzy(indices: AddressIndices, inputIl: string): string | null;
/**
 * Verilen il'in ilçe listesinde exact eşleşme.
 */
export declare function findRegionExactInState(indices: AddressIndices, normalizedStateKey: string, normalizedIlce: string): string | null;
/**
 * Verilen il'in ilçe listesinde fuzzy eşleşme.
 */
export declare function findRegionFuzzyInState(indices: AddressIndices, stateKey: string, inputIlce: string): string | null;
/**
 * İlçe adıyla il bul (sadece ilçe adı tek bir ile aitse).
 */
export declare function findStateByRegion(indices: AddressIndices, normalizedIlce: string): string | null;
/**
 * (İl, ilçe) çifti exact: stateRegionPairs ve stateRegionPairToState ile.
 * Dönen: il (state) orijinal yazım.
 */
export declare function findStateByStateRegionPair(indices: AddressIndices, normalizedIl: string, normalizedIlce: string): string | null;
/**
 * Tüm (il, ilçe) çiftleri arasında fuzzy ilçe eşleşmesi: önce il'e göre filtrele, sonra fuzzy.
 * stateKey: normalize edilmiş il (büyük harf).
 */
export declare function findRegionFuzzyGlobally(indices: AddressIndices, stateKey: string, inputIlce: string): string | null;
/**
 * İlçe adıyla il (ve eşleşen ilçe adı) bul (fuzzy). İlçe birden fazla ile aitse (örn. MERKEZ) null.
 */
export declare function findStateAndRegionByRegionFuzzy(indices: AddressIndices, inputIlce: string): {
    state: string;
    region: string;
} | null;
/** Uzun metinde "ilçe/İl" veya "ilçe / İl" formatında geçen il–ilçe çiftini bulur; referansla doğrular. */
export declare function extractIlIlceFromLongText(indices: AddressIndices, text: string): {
    il: string;
    ilce: string;
} | null;
export declare function resolveIlceFromTamAdres(indices: AddressIndices, tamAdres: string, resolvedIl: string): string | null;
//# sourceMappingURL=match.d.ts.map