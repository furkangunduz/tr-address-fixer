"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadIndices = loadIndices;
exports.getIndices = getIndices;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const normalize_1 = require("./normalize");
const CSV_FILENAME = 'tr_postal_codes.csv';
const CSV_DELIMITER = ';';
const CSV_COL_IL = 0;
const CSV_COL_ILCE = 1;
/** Okuma parça boyutu (byte). Küçük = az bellek, çok syscall; büyük = çok bellek. 64KB dengeli. */
const CHUNK_SIZE = 65536;
function findDataDir() {
    const root = path.join(__dirname, '..', '..');
    const candidates = [path.join(root, 'src', 'data'), root];
    for (const dir of candidates) {
        try {
            fs.accessSync(path.join(dir, CSV_FILENAME));
            return dir;
        }
        catch {
            // continue
        }
    }
    return path.join(root, 'src', 'data');
}
const DEFAULT_DATA_DIR = findDataDir();
function norm(s) {
    return s.trim().toLocaleUpperCase('tr-TR');
}
function pairKey(il, ilce) {
    return `${norm(il)}|${norm(ilce)}`;
}
/**
 * Bir satırı parse edip il/ilçe çiftini döndürür; geçersizse null.
 */
function parseRow(cols) {
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
function loadIndicesFromCsv(dataDir) {
    const csvPath = path.join(dataDir, CSV_FILENAME);
    const fd = fs.openSync(csvPath, 'r');
    const stateSet = new Set();
    const stateListOrder = [];
    const stateToRegions = new Map();
    const stateRegionList = [];
    const seenPair = new Set();
    let leftover = '';
    let isFirstLine = true;
    const buf = Buffer.allocUnsafe(CHUNK_SIZE);
    try {
        for (;;) {
            const n = fs.readSync(fd, buf, 0, CHUNK_SIZE, null);
            if (n === 0)
                break;
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
                if (!row)
                    continue;
                const key = norm(row.il);
                const pk = pairKey(row.il, row.ilce);
                if (!stateSet.has(key)) {
                    stateSet.add(key);
                    stateListOrder.push(row.il);
                }
                if (!seenPair.has(pk)) {
                    seenPair.add(pk);
                    stateRegionList.push({ state: row.il, region: row.ilce });
                    if (!stateToRegions.has(key))
                        stateToRegions.set(key, []);
                    const list = stateToRegions.get(key);
                    if (!list.includes(row.ilce))
                        list.push(row.ilce);
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
                    if (!stateToRegions.has(key))
                        stateToRegions.set(key, []);
                    const list = stateToRegions.get(key);
                    if (!list.includes(row.ilce))
                        list.push(row.ilce);
                }
            }
        }
    }
    finally {
        fs.closeSync(fd);
    }
    const stateList = stateListOrder;
    const regionToState = new Map();
    const stateRegionPairToState = new Map();
    const stateRegionPairs = new Set();
    const fuzzyRegionToStateRegion = new Map();
    for (const { state: s, region: r } of stateRegionList) {
        const rUpper = norm(r);
        const pk = pairKey(s, r);
        stateRegionPairs.add(pk);
        stateRegionPairToState.set(pk, s);
        if (!regionToState.has(rUpper)) {
            regionToState.set(rUpper, s);
        }
        else {
            const existing = regionToState.get(rUpper);
            if (existing !== s)
                regionToState.delete(rUpper);
        }
        const fk = (0, normalize_1.normalizeFuzzyKey)(r);
        if (!fuzzyRegionToStateRegion.has(fk)) {
            fuzzyRegionToStateRegion.set(fk, { state: s, region: r });
        }
        else if (fuzzyRegionToStateRegion.get(fk).state !== s) {
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
function loadIndices(dataDir = DEFAULT_DATA_DIR) {
    return loadIndicesFromCsv(dataDir);
}
let cachedIndices = null;
/**
 * İndeksleri tekilleştirir; ilk çağrıda yükler, sonrakilerde önbelleği döner.
 */
function getIndices(dataDir) {
    if (cachedIndices)
        return cachedIndices;
    cachedIndices = loadIndices(dataDir);
    return cachedIndices;
}
//# sourceMappingURL=load.js.map