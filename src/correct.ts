import { getIndices } from './load';
import { normalizeForMatch, isCountryName } from './normalize';
import {
  findStateExact,
  findStateFuzzy,
  findRegionExactInState,
  findRegionFuzzyInState,
  findStateByStateRegionPair,
  findStateAndRegionByRegionFuzzy,
  resolveIlceFromTamAdres,
  extractIlIlceFromLongText,
} from './match';

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
export function correctAddress(input: AddressInput, dataDir?: string): CorrectedAddress {
  const indices = getIndices(dataDir);
  const tamAdres = input.tamAdres != null ? input.tamAdres : '';
  const postaKodu = input.postaKodu != null ? input.postaKodu : '';
  let il = (input.il != null ? input.il : '').trim();
  let ilce = (input.ilce != null ? input.ilce : '').trim();

  // Ön normalizasyon: kullanıcı il/ilçe yerine ülke veya tam adres girmiş olabilir
  let preNormalized = false;

  // 1) İlçe veya tam adres uzun metin ise "ilçe/İl" pattern'ından il–ilçe çıkar
  const longTextMinLen = 50;
  const combinedLong = ilce.length >= longTextMinLen ? ilce : (tamAdres.length >= longTextMinLen ? tamAdres : '');
  if (combinedLong) {
    const extracted = extractIlIlceFromLongText(indices, combinedLong);
    if (extracted) {
      il = extracted.il;
      ilce = extracted.ilce;
      preNormalized = true;
    }
  }

  // 2) İl alanı ülke adı ise (Türkiye vb.): ilçe aslında il olabilir, ilçe tam adresten
  if (isCountryName(il)) {
    const ilceAsStateExact = findStateExact(indices, ilce);
    const ilceAsState = ilceAsStateExact != null ? ilceAsStateExact : findStateFuzzy(indices, ilce);
    if (ilceAsState) {
      il = ilceAsState;
      const fromAddr = resolveIlceFromTamAdres(indices, tamAdres, ilceAsState);
      ilce = fromAddr != null ? fromAddr : '';
      preNormalized = true;
    } else {
      il = '';
    }
  }

  // 3) İl alanı aslında ilçe adı ise (örn. Etimesgut): il+ilçe çöz
  if (il && findStateExact(indices, il) == null && findStateFuzzy(indices, il) == null) {
    const byRegion = findStateAndRegionByRegionFuzzy(indices, il);
    if (byRegion) {
      il = byRegion.state;
      ilce = byRegion.region;
      preNormalized = true;
    }
  }

  let corrected = preNormalized;
  let confidence: Confidence = 'unknown';

  const ilNorm = normalizeForMatch(il);
  const ilceNorm = normalizeForMatch(ilce);

  // 1) (İl, ilçe) çifti exact
  const pairState = ilNorm && ilceNorm ? findStateByStateRegionPair(indices, ilNorm, ilceNorm) : null;
  if (pairState) {
    const regions = indices.stateToRegions.get(normalizeForMatch(pairState));
    const regionsList = regions !== undefined ? regions : [];
    const rn = regionsList.find((r) => normalizeForMatch(r) === ilceNorm);
    const regionName = rn !== undefined ? rn : regionsList[0];
    return {
      tamAdres,
      il: pairState,
      ilce: regionName != null ? regionName : ilce,
      postaKodu,
      corrected: corrected || il !== pairState || ilce !== (regionName != null ? regionName : ilce),
      confidence: 'exact',
    };
  }

  // 2) İl exact veya fuzzy
  const exactState = findStateExact(indices, il);
  const resolvedState = ilNorm ? (exactState != null ? exactState : findStateFuzzy(indices, il)) : null;
  const stateKey = resolvedState ? normalizeForMatch(resolvedState) : null;

  // 3) Sadece ilçe verilmiş (il eksik veya ilçe farklı ile ait)
  if (ilceNorm && (!stateKey || (!findRegionExactInState(indices, stateKey, ilce) && !findRegionFuzzyInState(indices, stateKey, ilce)))) {
    const byRegion = findStateAndRegionByRegionFuzzy(indices, ilce);
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
    const regionExact = ilceNorm ? findRegionExactInState(indices, stateKey, ilce) : null;
    const regionFuzzy = ilceNorm ? findRegionFuzzyInState(indices, stateKey, ilce) : null;
    let resolvedRegion = regionExact != null ? regionExact : regionFuzzy;
    if (!resolvedRegion && !ilceNorm && tamAdres.trim()) {
      const fromAddr = resolveIlceFromTamAdres(indices, tamAdres, resolvedState!);
      resolvedRegion = fromAddr != null ? fromAddr : null;
      if (resolvedRegion) corrected = true;
    }
    if (resolvedState) {
      if (resolvedRegion) {
        const prevIl = il;
        const prevIlce = ilce;
        il = resolvedState;
        ilce = resolvedRegion;
        corrected = corrected || prevIl !== il || prevIlce !== ilce;
        confidence = regionExact ? 'exact' : regionFuzzy ? 'fuzzy' : 'resolved';
      } else {
        il = resolvedState;
        if (!ilceNorm) {
          corrected = il !== (input.il != null ? input.il : '').trim();
          confidence = 'exact';
        } else {
          corrected = il !== (input.il != null ? input.il : '').trim();
          confidence = 'fuzzy';
        }
      }
      return { tamAdres, il, ilce, postaKodu, corrected, confidence };
    }
  }

  // 5) Sadece ilçe verilmiş, il yok
  if (ilceNorm && !ilNorm) {
    const byRegion = findStateAndRegionByRegionFuzzy(indices, ilce);
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
export function correctAddressBatch(records: AddressInput[], dataDir?: string): CorrectedAddress[] {
  return records.map((r) => correctAddress(r, dataDir));
}
