"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const load_1 = require("../src/load");
const DATA_DIR = path_1.default.join(process.cwd(), 'src', 'data');
describe('load', () => {
    test('CSV yüklenir, il set dolu', () => {
        const indices = (0, load_1.loadIndices)(DATA_DIR);
        expect(indices.stateSet.size).toBeGreaterThanOrEqual(80);
        expect(indices.stateList.length).toBeGreaterThanOrEqual(80);
        expect(indices.stateToRegions.size).toBeGreaterThanOrEqual(80);
        expect(indices.stateRegionList.length).toBeGreaterThanOrEqual(900);
    });
    test('bilinen il ve ilçe var', () => {
        const indices = (0, load_1.loadIndices)(DATA_DIR);
        const ilKey = 'ADANA';
        expect(indices.stateSet.has(ilKey)).toBe(true);
        const regions = indices.stateToRegions.get(ilKey);
        expect(Array.isArray(regions) && regions.length > 0).toBe(true);
        expect(regions.some((r) => r === 'ALADAG' || r === 'CEYHAN')).toBe(true);
    });
    test('(il, ilçe) çifti pair key ile bulunur', () => {
        const indices = (0, load_1.loadIndices)(DATA_DIR);
        const pk = 'ISTANBUL|KADIKOY';
        expect(indices.stateRegionPairs.has(pk)).toBe(true);
        expect(indices.stateRegionPairToState.get(pk)).toBe('ISTANBUL');
    });
    test('regionToState tekilleşmiş ilçe', () => {
        const indices = (0, load_1.loadIndices)(DATA_DIR);
        expect(indices.regionToState.size).toBeGreaterThan(0);
    });
    test('fuzzyRegionToStateRegion Kadıköy tek ile ait', () => {
        const indices = (0, load_1.loadIndices)(DATA_DIR);
        expect(indices.fuzzyRegionToStateRegion).toBeDefined();
        const kadikoy = indices.fuzzyRegionToStateRegion.get('KADIKOY');
        expect(kadikoy).toBeDefined();
        expect(kadikoy.state).toBe('ISTANBUL');
        expect(kadikoy.region).toBe('KADIKOY');
    });
    test('stateList unique ve stateSet ile uyumlu', () => {
        const indices = (0, load_1.loadIndices)(DATA_DIR);
        const fromList = new Set(indices.stateList.map((s) => s.toLocaleUpperCase('tr-TR')));
        expect(fromList.size).toBe(indices.stateList.length);
        for (const key of indices.stateSet) {
            expect(indices.stateList.some((s) => s.toLocaleUpperCase('tr-TR') === key)).toBe(true);
        }
    });
});
//# sourceMappingURL=load.test.js.map