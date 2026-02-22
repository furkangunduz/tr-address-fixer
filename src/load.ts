import * as fs from 'fs';
import * as path from 'path';
import { normalizeFuzzyKey } from './normalize';

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
  stateRegionList: { state: string; region: string }[];
  /** Fuzzy ilçe anahtarı -> { state, region }; sadece tek ile ait ilçeler (Kadıköy vb. ASCII/TR eşleşmesi için). */
  fuzzyRegionToStateRegion: Map<string, { state: string; region: string }>;
}

const CSV_FILENAME = 'tr_postal_codes.csv';
const CSV_DELIMITER = ';';
const CSV_COL_IL = 0;
const CSV_COL_ILCE = 1;
/** Okuma parça boyutu (byte). Küçük = az bellek, çok syscall; büyük = çok bellek. 64KB dengeli. */
const CHUNK_SIZE = 65536;

function findDataDir(): string {
  const root = path.join(__dirname, '..', '..');
  const candidates = [path.join(root, 'src', 'data'), root];
  for (const dir of candidates) {
    try {
      fs.accessSync(path.join(dir, CSV_FILENAME));
      return dir;
    } catch {
      // continue
    }
  }
  return path.join(root, 'src', 'data');
}

const DEFAULT_DATA_DIR = findDataDir();

function norm(s: string): string {
  return s.trim().toLocaleUpperCase('tr-TR');
}

function pairKey(il: string, ilce: string): string {
  return `${norm(il)}|${norm(ilce)}`;
}

/**
 * Bir satırı parse edip il/ilçe çiftini döndürür; geçersizse null.
 */
function parseRow(cols: string[]): { il: string; ilce: string } | null {
  const il = (cols[CSV_COL_IL] != null ? cols[CSV_COL_IL] : '').trim();
  const ilce = (cols[CSV_COL_ILCE] != null ? cols[CSV_COL_ILCE] : '').trim();
  return il && ilce ? { il, ilce } : null;
}

/**
 * tr_postal_codes.csv dosyasından il/ilçe indekslerini oluşturur.
 * Dosya parça parça okunur; tüm içerik bir anda belleğe alınmaz.
 * CSV: il;ilçe;semt_bucak_belde;Mahalle;PK;Latitude;Longitude
 * Bellekte sadece ~81 il + ~970 (il,ilçe) çifti tutulur.
 */
function loadIndicesFromCsv(dataDir: string): AddressIndices {
  const csvPath = path.join(dataDir, CSV_FILENAME);
  const fd = fs.openSync(csvPath, 'r');
  const stateSet = new Set<string>();
  const stateListOrder: string[] = [];
  const stateToRegions = new Map<string, string[]>();
  const stateRegionList: { state: string; region: string }[] = [];
  const seenPair = new Set<string>();

  let leftover = '';
  let isFirstLine = true;
  const buf = Buffer.allocUnsafe(CHUNK_SIZE);

  try {
    for (;;) {
      const n = fs.readSync(fd, buf, 0, CHUNK_SIZE, null);
      if (n === 0) break;
      const chunk = leftover + buf.toString('utf-8', 0, n);
      const parts = chunk.split(/\r?\n/);
      const last = parts.pop();
      leftover = last !== undefined ? last : '';

      for (const line of parts) {
        if (isFirstLine) {
          isFirstLine = false;
          continue;
        }
        const row = parseRow(line.split(CSV_DELIMITER));
        if (!row) continue;

        const key = norm(row.il);
        const pk = pairKey(row.il, row.ilce);
        if (!stateSet.has(key)) {
          stateSet.add(key);
          stateListOrder.push(row.il);
        }
        if (!seenPair.has(pk)) {
          seenPair.add(pk);
          stateRegionList.push({ state: row.il, region: row.ilce });
          if (!stateToRegions.has(key)) stateToRegions.set(key, []);
          const list = stateToRegions.get(key)!;
          if (!list.includes(row.ilce)) list.push(row.ilce);
        }
      }
    }

    if (leftover.trim() && !isFirstLine) {
      const row = parseRow(leftover.split(CSV_DELIMITER));
      if (row) {
        const key = norm(row.il);
        const pk = pairKey(row.il, row.ilce);
        if (!stateSet.has(key)) {
          stateSet.add(key);
          stateListOrder.push(row.il);
        }
        if (!seenPair.has(pk)) {
          seenPair.add(pk);
          stateRegionList.push({ state: row.il, region: row.ilce });
          if (!stateToRegions.has(key)) stateToRegions.set(key, []);
          const list = stateToRegions.get(key)!;
          if (!list.includes(row.ilce)) list.push(row.ilce);
        }
      }
    }
  } finally {
    fs.closeSync(fd);
  }

  const stateList = stateListOrder;
  const regionToState = new Map<string, string>();
  const stateRegionPairToState = new Map<string, string>();
  const stateRegionPairs = new Set<string>();

  const fuzzyRegionToStateRegion = new Map<string, { state: string; region: string }>();

  for (const { state: s, region: r } of stateRegionList) {
    const rUpper = norm(r);
    const pk = pairKey(s, r);
    stateRegionPairs.add(pk);
    stateRegionPairToState.set(pk, s);

    if (!regionToState.has(rUpper)) {
      regionToState.set(rUpper, s);
    } else {
      const existing = regionToState.get(rUpper)!;
      if (existing !== s) regionToState.delete(rUpper);
    }

    const fk = normalizeFuzzyKey(r);
    if (!fuzzyRegionToStateRegion.has(fk)) {
      fuzzyRegionToStateRegion.set(fk, { state: s, region: r });
    } else if (fuzzyRegionToStateRegion.get(fk)!.state !== s) {
      fuzzyRegionToStateRegion.delete(fk);
    }
  }

  return {
    stateSet,
    stateToRegions,
    regionToState,
    stateRegionPairToState,
    stateRegionPairs,
    stateList,
    stateRegionList,
    fuzzyRegionToStateRegion,
  };
}

/**
 * İl/ilçe indekslerini yükler. Varsayılan kaynak: tr_postal_codes.csv.
 *
 * @param dataDir tr_postal_codes.csv dosyasının bulunduğu klasör (varsayılan: otomatik bulunur)
 */
export function loadIndices(dataDir: string = DEFAULT_DATA_DIR): AddressIndices {
  return loadIndicesFromCsv(dataDir);
}

let cachedIndices: AddressIndices | null = null;

/**
 * İndeksleri tekilleştirir; ilk çağrıda yükler, sonrakilerde önbelleği döner.
 */
export function getIndices(dataDir?: string): AddressIndices {
  if (cachedIndices) return cachedIndices;
  cachedIndices = loadIndices(dataDir);
  return cachedIndices;
}
