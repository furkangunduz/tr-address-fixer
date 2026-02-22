"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctAddress = correctAddress;
exports.correctAddressBatch = correctAddressBatch;
const load_1 = require("./load");
const normalize_1 = require("./normalize");
const match_1 = require("./match");
/**
 * Tek adres kaydı için il/ilçe düzeltmesi. Referans: State.json + Region.json.
 */
function correctAddress(input, dataDir) {
    const indices = (0, load_1.getIndices)(dataDir);
    const tamAdres = input.tamAdres != null ? input.tamAdres : '';
    const postaKodu = input.postaKodu != null ? input.postaKodu : '';
    let il = (input.il != null ? input.il : '').trim();
    let ilce = (input.ilce != null ? input.ilce : '').trim();
    let corrected = false;
    let confidence = 'unknown';
    const ilNorm = (0, normalize_1.normalizeForMatch)(il);
    const ilceNorm = (0, normalize_1.normalizeForMatch)(ilce);
    // 1) (İl, ilçe) çifti exact
    const pairState = ilNorm && ilceNorm ? (0, match_1.findStateByStateRegionPair)(indices, ilNorm, ilceNorm) : null;
    if (pairState) {
        const regions = indices.stateToRegions.get((0, normalize_1.normalizeForMatch)(pairState));
        const regionsList = regions !== undefined ? regions : [];
        const rn = regionsList.find((r) => (0, normalize_1.normalizeForMatch)(r) === ilceNorm);
        const regionName = rn !== undefined ? rn : regionsList[0];
        return {
            tamAdres,
            il: pairState,
            ilce: regionName != null ? regionName : ilce,
            postaKodu,
            corrected: il !== pairState || ilce !== (regionName != null ? regionName : ilce),
            confidence: 'exact',
        };
    }
    // 2) İl exact veya fuzzy
    const exactState = (0, match_1.findStateExact)(indices, il);
    const resolvedState = ilNorm ? (exactState != null ? exactState : (0, match_1.findStateFuzzy)(indices, il)) : null;
    const stateKey = resolvedState ? (0, normalize_1.normalizeForMatch)(resolvedState) : null;
    // 3) Sadece ilçe verilmiş (il eksik veya ilçe farklı ile ait)
    if (ilceNorm && (!stateKey || (!(0, match_1.findRegionExactInState)(indices, stateKey, ilce) && !(0, match_1.findRegionFuzzyInState)(indices, stateKey, ilce)))) {
        const byRegion = (0, match_1.findStateAndRegionByRegionFuzzy)(indices, ilce);
        if (byRegion) {
            il = byRegion.state;
            ilce = byRegion.region;
            corrected = true;
            confidence = ilNorm ? 'fuzzy' : 'resolved';
            return { tamAdres, il, ilce, postaKodu, corrected, confidence };
        }
    }
    // 4) İl bulundu, ilçeyi bu ile göre düzelt (veya tam adresten çıkar)
    if (stateKey) {
        const regionExact = ilceNorm ? (0, match_1.findRegionExactInState)(indices, stateKey, ilce) : null;
        const regionFuzzy = ilceNorm ? (0, match_1.findRegionFuzzyInState)(indices, stateKey, ilce) : null;
        let resolvedRegion = regionExact != null ? regionExact : regionFuzzy;
        if (!resolvedRegion && !ilceNorm && tamAdres.trim()) {
            const fromAddr = (0, match_1.resolveIlceFromTamAdres)(indices, tamAdres, resolvedState);
            resolvedRegion = fromAddr != null ? fromAddr : null;
            if (resolvedRegion)
                corrected = true;
        }
        if (resolvedState) {
            if (resolvedRegion) {
                const prevIl = il;
                const prevIlce = ilce;
                il = resolvedState;
                ilce = resolvedRegion;
                corrected = corrected || prevIl !== il || prevIlce !== ilce;
                confidence = regionExact ? 'exact' : regionFuzzy ? 'fuzzy' : 'resolved';
            }
            else {
                il = resolvedState;
                if (!ilceNorm) {
                    corrected = il !== (input.il != null ? input.il : '').trim();
                    confidence = 'exact';
                }
                else {
                    corrected = il !== (input.il != null ? input.il : '').trim();
                    confidence = 'fuzzy';
                }
            }
            return { tamAdres, il, ilce, postaKodu, corrected, confidence };
        }
    }
    // 5) Sadece ilçe verilmiş, il yok
    if (ilceNorm && !ilNorm) {
        const byRegion = (0, match_1.findStateAndRegionByRegionFuzzy)(indices, ilce);
        if (byRegion) {
            return {
                tamAdres,
                il: byRegion.state,
                ilce: byRegion.region,
                postaKodu,
                corrected: true,
                confidence: 'resolved',
            };
        }
    }
    return {
        tamAdres,
        il: il || (input.il != null ? input.il : ''),
        ilce: ilce || (input.ilce != null ? input.ilce : ''),
        postaKodu,
        corrected: false,
        confidence: 'unknown',
    };
}
/**
 * Toplu adres düzeltmesi; her kayıt için correctAddress çağrılır.
 */
function correctAddressBatch(records, dataDir) {
    return records.map((r) => correctAddress(r, dataDir));
}
//# sourceMappingURL=correct.js.map