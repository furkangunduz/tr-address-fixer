import { distance } from 'fastest-levenshtein';
import type { AddressIndices } from './load';
import { normalizeForMatch, normalizeFuzzyKey } from './normalize';

/** Uzunluğa göre maksimum Levenshtein mesafesi: kısa isimlerde daha sıkı. */
function maxDistance(len: number): number {
  if (len <= 3) return 1;
  if (len <= 6) return 2;
  return 3;
}

/**
 * Aday listesi içinde en iyi fuzzy eşleşmeyi döner (Levenshtein).
 * Boş string veya eşik aşılıyorsa null.
 */
function bestFuzzy(normalizedInput: string, fuzzyInput: string, candidates: string[], getFuzzy: (c: string) => string): string | null {
  if (!normalizedInput || !candidates.length) return null;
  const threshold = maxDistance(normalizedInput.length);
  let best: string | null = null;
  let bestDist = Infinity;

  for (const c of candidates) {
    const d = distance(fuzzyInput, getFuzzy(c));
    if (d <= threshold && d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

/** İl için aday listesi: stateList (orijinal yazım). Exact eşleşme key ile Set'te. */
export function findStateExact(indices: AddressIndices, normalizedIl: string): string | null {
  if (!normalizedIl) return null;
  const key = normalizeForMatch(normalizedIl);
  if (indices.stateSet.has(key)) {
    const found = indices.stateList.find((s) => normalizeForMatch(s) === key);
  return found !== undefined ? found : null;
  }
  return null;
}

/** İl fuzzy: tüm iller arasında en yakın. */
export function findStateFuzzy(indices: AddressIndices, inputIl: string): string | null {
  const normalized = normalizeForMatch(inputIl);
  const fuzzy = normalizeFuzzyKey(inputIl);
  if (!normalized) return null;
  const exact = findStateExact(indices, inputIl);
  if (exact) return exact;
  return bestFuzzy(normalized, fuzzy, indices.stateList, (s) => normalizeFuzzyKey(s));
}

/**
 * Verilen il'in ilçe listesinde exact eşleşme.
 */
export function findRegionExactInState(indices: AddressIndices, normalizedStateKey: string, normalizedIlce: string): string | null {
  if (!normalizedIlce) return null;
  const regions = indices.stateToRegions.get(normalizedStateKey);
  if (!regions) return null;
  const key = normalizeForMatch(normalizedIlce);
  const found = regions.find((r) => normalizeForMatch(r) === key);
  return found !== undefined ? found : null;
}

/**
 * Verilen il'in ilçe listesinde fuzzy eşleşme.
 */
export function findRegionFuzzyInState(indices: AddressIndices, stateKey: string, inputIlce: string): string | null {
  const regions = indices.stateToRegions.get(stateKey);
  if (!regions || !inputIlce) return null;
  const normalized = normalizeForMatch(inputIlce);
  const fuzzy = normalizeFuzzyKey(inputIlce);
  const exact = findRegionExactInState(indices, stateKey, inputIlce);
  if (exact) return exact;
  return bestFuzzy(normalized, fuzzy, regions, (r) => normalizeFuzzyKey(r));
}

/**
 * İlçe adıyla il bul (sadece ilçe adı tek bir ile aitse).
 */
export function findStateByRegion(indices: AddressIndices, normalizedIlce: string): string | null {
  if (!normalizedIlce) return null;
  const s = indices.regionToState.get(normalizedIlce);
  return s !== undefined ? s : null;
}

/**
 * (İl, ilçe) çifti exact: stateRegionPairs ve stateRegionPairToState ile.
 * Dönen: il (state) orijinal yazım.
 */
export function findStateByStateRegionPair(indices: AddressIndices, normalizedIl: string, normalizedIlce: string): string | null {
  if (!normalizedIl || !normalizedIlce) return null;
  const key = `${normalizedIl}|${normalizedIlce}`;
  if (!indices.stateRegionPairs.has(key)) return null;
  const state = indices.stateRegionPairToState.get(key);
  return state !== undefined ? state : null;
}

/**
 * Tüm (il, ilçe) çiftleri arasında fuzzy ilçe eşleşmesi: önce il'e göre filtrele, sonra fuzzy.
 * stateKey: normalize edilmiş il (büyük harf).
 */
export function findRegionFuzzyGlobally(indices: AddressIndices, stateKey: string, inputIlce: string): string | null {
  return findRegionFuzzyInState(indices, stateKey, inputIlce);
}

/**
 * İlçe adıyla il (ve eşleşen ilçe adı) bul (fuzzy). İlçe birden fazla ile aitse (örn. MERKEZ) null.
 */
export function findStateAndRegionByRegionFuzzy(indices: AddressIndices, inputIlce: string): { state: string; region: string } | null {
  const normalized = normalizeForMatch(inputIlce);
  if (!normalized) return null;
  const exactState = indices.regionToState.get(normalized);
  const exactStateVal = exactState !== undefined ? exactState : null;
  if (exactStateVal) {
    const regions = indices.stateToRegions.get(normalizeForMatch(exactStateVal));
    const regionsList = regions !== undefined ? regions : [];
    const regionFound = regionsList.find((r) => normalizeForMatch(r) === normalized);
    const region = regionFound !== undefined ? regionFound : regionsList[0];
    return { state: exactStateVal, region };
  }

  const fuzzyKey = normalizeFuzzyKey(inputIlce);
  const byFuzzy = indices.fuzzyRegionToStateRegion.get(fuzzyKey);
  if (byFuzzy !== undefined) return byFuzzy;

  const fuzzy = fuzzyKey;
  const threshold = maxDistance(normalized.length);
  const matches: { state: string; region: string }[] = [];
  const seen = new Set<string>();

  for (const { state, region } of indices.stateRegionList) {
    const rFuzzy = normalizeFuzzyKey(region);
    const key = `${state}|${rFuzzy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (distance(fuzzy, rFuzzy) <= threshold) matches.push({ state, region });
  }

  if (matches.length === 0) return null;
  const firstState = matches[0].state;
  if (matches.every((m) => m.state === firstState)) return { state: firstState, region: matches[0].region };
  return null;
}

/** Uzun metinde "ilçe/İl" veya "ilçe / İl" formatında geçen il–ilçe çiftini bulur; referansla doğrular. */
export function extractIlIlceFromLongText(
  indices: AddressIndices,
  text: string
): { il: string; ilce: string } | null {
  const raw = (text != null ? text : '').trim();
  if (!raw) return null;
  const re = /([A-Za-zÇçĞğİıÖöŞşÜü\w]+)\s*\/\s*([A-Za-zÇçĞğİıÖöŞşÜü\w]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const part1 = m[1].trim();
    const part2 = m[2].trim();
    const p2Norm = normalizeForMatch(part2);
    if (!indices.stateSet.has(p2Norm)) continue;
    const stateName = indices.stateList.find((s) => normalizeForMatch(s) === p2Norm);
    if (!stateName) continue;
    const stateKey = normalizeForMatch(stateName);
    const regionExact = findRegionExactInState(indices, stateKey, part1);
    const region = regionExact != null ? regionExact : findRegionFuzzyInState(indices, stateKey, part1);
    if (region) return { il: stateName, ilce: region };
  }
  return null;
}
const MIN_REGION_LENGTH_IN_ADDRESS = 3;

export function resolveIlceFromTamAdres(indices: AddressIndices, tamAdres: string, resolvedIl: string): string | null {
  const addr = (tamAdres != null ? tamAdres : '').trim();
  if (!addr) return null;
  const stateKey = normalizeForMatch(resolvedIl);
  const regions = indices.stateToRegions.get(stateKey);
  if (!regions || regions.length === 0) return null;

  const addrNorm = normalizeForMatch(addr);
  const addrFuzzy = normalizeFuzzyKey(addr);

  const byLength = [...regions].sort((a, b) => b.length - a.length);
  for (const region of byLength) {
    if (region.length < MIN_REGION_LENGTH_IN_ADDRESS) continue;
    const rNorm = normalizeForMatch(region);
    const rFuzzy = normalizeFuzzyKey(region);
    if (addrNorm.includes(rNorm)) return region;
    if (addrFuzzy.includes(rFuzzy)) return region;
  }
  return null;
}
