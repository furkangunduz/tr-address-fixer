export type Confidence = 'exact' | 'fuzzy' | 'resolved' | 'unknown';
export interface AddressInput {
    tamAdres?: string;
    il?: string;
    ilce?: string;
    postaKodu?: string;
}
export interface CorrectedAddress extends AddressInput {
    il: string;
    ilce: string;
    corrected: boolean;
    confidence?: Confidence;
}
/**
 * Tek adres kaydı için il/ilçe düzeltmesi. Referans: State.json + Region.json.
 */
export declare function correctAddress(input: AddressInput, dataDir?: string): CorrectedAddress;
/**
 * Toplu adres düzeltmesi; her kayıt için correctAddress çağrılır.
 */
export declare function correctAddressBatch(records: AddressInput[], dataDir?: string): CorrectedAddress[];
//# sourceMappingURL=correct.d.ts.map