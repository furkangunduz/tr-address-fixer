import path from 'path';
import { loadIndices } from '../src/load';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

describe('load', () => {
  test('CSV yüklenir, il set dolu', () => {
    const indices = loadIndices(DATA_DIR);
    expect(indices.stateSet.size).toBeGreaterThanOrEqual(80);
    expect(indices.stateList.length).toBeGreaterThanOrEqual(80);
    expect(indices.stateToRegions.size).toBeGreaterThanOrEqual(80);
    expect(indices.stateRegionList.length).toBeGreaterThanOrEqual(900);
  });

  test('bilinen il ve ilçe var', () => {
    const indices = loadIndices(DATA_DIR);
    const ilKey = 'ADANA';
    expect(indices.stateSet.has(ilKey)).toBe(true);
    const regions = indices.stateToRegions.get(ilKey);
    expect(Array.isArray(regions) && regions!.length > 0).toBe(true);
    expect(regions!.some((r) => r === 'ALADAG' || r === 'CEYHAN')).toBe(true);
  });

  test('(il, ilçe) çifti pair key ile bulunur', () => {
    const indices = loadIndices(DATA_DIR);
    const pk = 'ISTANBUL|KADIKOY';
    expect(indices.stateRegionPairs.has(pk)).toBe(true);
    expect(indices.stateRegionPairToState.get(pk)).toBe('ISTANBUL');
  });

  test('regionToState tekilleşmiş ilçe', () => {
    const indices = loadIndices(DATA_DIR);
    expect(indices.regionToState.size).toBeGreaterThan(0);
  });

  test('fuzzyRegionToStateRegion Kadıköy tek ile ait', () => {
    const indices = loadIndices(DATA_DIR);
    expect(indices.fuzzyRegionToStateRegion).toBeDefined();
    const kadikoy = indices.fuzzyRegionToStateRegion.get('KADIKOY');
    expect(kadikoy).toBeDefined();
    expect(kadikoy!.state).toBe('ISTANBUL');
    expect(kadikoy!.region).toBe('KADIKOY');
  });

  test('stateRegionList her elemanın state ve region geçerli', () => {
    const indices = loadIndices(DATA_DIR);
    const stateKeys = new Set(indices.stateList.map((s) => s.toLocaleUpperCase('tr-TR')));
    for (const { state, region } of indices.stateRegionList) {
      expect(stateKeys.has(state.toLocaleUpperCase('tr-TR'))).toBe(true);
      const regions = indices.stateToRegions.get(state.toLocaleUpperCase('tr-TR'));
      expect(regions).toBeDefined();
      expect(regions!.some((r) => r.toLocaleUpperCase('tr-TR') === region.toLocaleUpperCase('tr-TR'))).toBe(true);
    }
  });

  test('stateRegionPairs ve stateRegionList tutarlı', () => {
    const indices = loadIndices(DATA_DIR);
    const fromList = new Set(
      indices.stateRegionList.map(({ state, region }) =>
        `${state.trim().toLocaleUpperCase('tr-TR')}|${region.trim().toLocaleUpperCase('tr-TR')}`
      )
    );
    expect(indices.stateRegionPairs.size).toBe(fromList.size);
    for (const key of indices.stateRegionPairs) {
      expect(fromList.has(key)).toBe(true);
    }
  });
});
