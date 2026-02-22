"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStateExact = findStateExact;
exports.findStateFuzzy = findStateFuzzy;
exports.findRegionExactInState = findRegionExactInState;
exports.findRegionFuzzyInState = findRegionFuzzyInState;
exports.findStateByRegion = findStateByRegion;
exports.findStateByStateRegionPair = findStateByStateRegionPair;
exports.findRegionFuzzyGlobally = findRegionFuzzyGlobally;
exports.findStateAndRegionByRegionFuzzy = findStateAndRegionByRegionFuzzy;
exports.resolveIlceFromTamAdres = resolveIlceFromTamAdres;
const fastest_levenshtein_1 = require("fastest-levenshtein");
const normalize_1 = require("./normalize");
/** Uzunluğa göre maksimum Levenshtein mesafesi: kısa isimlerde daha sıkı. */
function maxDistance(len) {
    if (len <= 3)
        return 1;
    if (len <= 6)
        return 2;
    return 3;
}
/**
 * Aday listesi içinde en iyi fuzzy eşleşmeyi döner (Levenshtein).
 * Boş string veya eşik aşılıyorsa null.
 */
function bestFuzzy(normalizedInput, fuzzyInput, candidates, getFuzzy) {
    if (!normalizedInput || !candidates.length)
        return null;
    const threshold = maxDistance(normalizedInput.length);
    let best = null;
    let bestDist = Infinity;
    for (const c of candidates) {
        const d = (0, fastest_levenshtein_1.distance)(fuzzyInput, getFuzzy(c));
        if (d <= threshold && d < bestDist) {
            bestDist = d;
            best = c;
        }
    }
    return best;
}
/** İl için aday listesi: stateList (orijinal yazım). Exact eşleşme key ile Set'te. */
function findStateExact(indices, normalizedIl) {
    if (!normalizedIl)
        return null;
    const key = (0, normalize_1.normalizeForMatch)(normalizedIl);
    if (indices.stateSet.has(key)) {
        const found = indices.stateList.find((s) => (0, normalize_1.normalizeForMatch)(s) === key);
        return found !== undefined ? found : null;
    }
    return null;
}
/** İl fuzzy: tüm iller arasında en yakın. */
function findStateFuzzy(indices, inputIl) {
    const normalized = (0, normalize_1.normalizeForMatch)(inputIl);
    const fuzzy = (0, normalize_1.normalizeFuzzyKey)(inputIl);
    if (!normalized)
        return null;
    const exact = findStateExact(indices, inputIl);
    if (exact)
        return exact;
    return bestFuzzy(normalized, fuzzy, indices.stateList, (s) => (0, normalize_1.normalizeFuzzyKey)(s));
}
/**
 * Verilen il'in ilçe listesinde exact eşleşme.
 */
function findRegionExactInState(indices, normalizedStateKey, normalizedIlce) {
    if (!normalizedIlce)
        return null;
    const regions = indices.stateToRegions.get(normalizedStateKey);
    if (!regions)
        return null;
    const key = (0, normalize_1.normalizeForMatch)(normalizedIlce);
    const found = regions.find((r) => (0, normalize_1.normalizeForMatch)(r) === key);
    return found !== undefined ? found : null;
}
/**
 * Verilen il'in ilçe listesinde fuzzy eşleşme.
 */
function findRegionFuzzyInState(indices, stateKey, inputIlce) {
    const regions = indices.stateToRegions.get(stateKey);
    if (!regions || !inputIlce)
        return null;
    const normalized = (0, normalize_1.normalizeForMatch)(inputIlce);
    const fuzzy = (0, normalize_1.normalizeFuzzyKey)(inputIlce);
    const exact = findRegionExactInState(indices, stateKey, inputIlce);
    if (exact)
        return exact;
    return bestFuzzy(normalized, fuzzy, regions, (r) => (0, normalize_1.normalizeFuzzyKey)(r));
}
/**
 * İlçe adıyla il bul (sadece ilçe adı tek bir ile aitse).
 */
function findStateByRegion(indices, normalizedIlce) {
    if (!normalizedIlce)
        return null;
    const s = indices.regionToState.get(normalizedIlce);
    return s !== undefined ? s : null;
}
/**
 * (İl, ilçe) çifti exact: stateRegionPairs ve stateRegionPairToState ile.
 * Dönen: il (state) orijinal yazım.
 */
function findStateByStateRegionPair(indices, normalizedIl, normalizedIlce) {
    if (!normalizedIl || !normalizedIlce)
        return null;
    const key = `${normalizedIl}|${normalizedIlce}`;
    if (!indices.stateRegionPairs.has(key))
        return null;
    const state = indices.stateRegionPairToState.get(key);
    return state !== undefined ? state : null;
}
/**
 * Tüm (il, ilçe) çiftleri arasında fuzzy ilçe eşleşmesi: önce il'e göre filtrele, sonra fuzzy.
 * stateKey: normalize edilmiş il (büyük harf).
 */
function findRegionFuzzyGlobally(indices, stateKey, inputIlce) {
    return findRegionFuzzyInState(indices, stateKey, inputIlce);
}
/**
 * İlçe adıyla il (ve eşleşen ilçe adı) bul (fuzzy). İlçe birden fazla ile aitse (örn. MERKEZ) null.
 */
function findStateAndRegionByRegionFuzzy(indices, inputIlce) {
    const normalized = (0, normalize_1.normalizeForMatch)(inputIlce);
    if (!normalized)
        return null;
    const exactState = indices.regionToState.get(normalized);
    const exactStateVal = exactState !== undefined ? exactState : null;
    if (exactStateVal) {
        const regions = indices.stateToRegions.get((0, normalize_1.normalizeForMatch)(exactStateVal));
        const regionsList = regions !== undefined ? regions : [];
        const regionFound = regionsList.find((r) => (0, normalize_1.normalizeForMatch)(r) === normalized);
        const region = regionFound !== undefined ? regionFound : regionsList[0];
        return { state: exactStateVal, region };
    }
    const fuzzyKey = (0, normalize_1.normalizeFuzzyKey)(inputIlce);
    const byFuzzy = indices.fuzzyRegionToStateRegion.get(fuzzyKey);
    if (byFuzzy !== undefined)
        return byFuzzy;
    const fuzzy = fuzzyKey;
    const threshold = maxDistance(normalized.length);
    const matches = [];
    const seen = new Set();
    for (const { state, region } of indices.stateRegionList) {
        const rFuzzy = (0, normalize_1.normalizeFuzzyKey)(region);
        const key = `${state}|${rFuzzy}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        if ((0, fastest_levenshtein_1.distance)(fuzzy, rFuzzy) <= threshold)
            matches.push({ state, region });
    }
    if (matches.length === 0)
        return null;
    const firstState = matches[0].state;
    if (matches.every((m) => m.state === firstState))
        return { state: firstState, region: matches[0].region };
    return null;
}
/** Tam adres metninde, verilen ile ait ilçe adı aranır; bulunursa referanstaki ilçe adı döner. */
const MIN_REGION_LENGTH_IN_ADDRESS = 3;
function resolveIlceFromTamAdres(indices, tamAdres, resolvedIl) {
    const addr = (tamAdres != null ? tamAdres : '').trim();
    if (!addr)
        return null;
    const stateKey = (0, normalize_1.normalizeForMatch)(resolvedIl);
    const regions = indices.stateToRegions.get(stateKey);
    if (!regions || regions.length === 0)
        return null;
    const addrNorm = (0, normalize_1.normalizeForMatch)(addr);
    const addrFuzzy = (0, normalize_1.normalizeFuzzyKey)(addr);
    const byLength = [...regions].sort((a, b) => b.length - a.length);
    for (const region of byLength) {
        if (region.length < MIN_REGION_LENGTH_IN_ADDRESS)
            continue;
        const rNorm = (0, normalize_1.normalizeForMatch)(region);
        const rFuzzy = (0, normalize_1.normalizeFuzzyKey)(region);
        if (addrNorm.includes(rNorm))
            return region;
        if (addrFuzzy.includes(rFuzzy))
            return region;
    }
    return null;
}
//# sourceMappingURL=match.js.map