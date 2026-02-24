import path from 'path';
import { loadIndices } from '../src/load';
import {
  findStateExact,
  findStateFuzzy,
  findStateByStateRegionPair,
  findStateAndRegionByRegionFuzzy,
  findRegionExactInState,
  resolveIlceFromTamAdres,
  extractIlIlceFromLongText,
} from '../src/match';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

describe('match', () => {
  const indices = loadIndices(DATA_DIR);

  describe('findStateExact', () => {
    test('bilinen il exact döner', () => {
      expect(findStateExact(indices, 'ANKARA')).toBe('ANKARA');
      expect(findStateExact(indices, 'ISTANBUL')).toBe('ISTANBUL');
    });
    test('tanınmayan il null', () => {
      expect(findStateExact(indices, 'Xyz')).toBeNull();
    });
    test('boş string null', () => {
      expect(findStateExact(indices, '')).toBeNull();
    });
  });

  describe('findStateFuzzy', () => {
    test('typo düzeltir', () => {
      expect(findStateFuzzy(indices, 'Anakra')).toBe('ANKARA');
      expect(findStateFuzzy(indices, 'İstambul')).toBe('ISTANBUL');
    });
    test('exact varsa onu döner', () => {
      expect(findStateFuzzy(indices, 'ADANA')).toBe('ADANA');
    });
    test('tanınmayan null', () => {
      expect(findStateFuzzy(indices, 'AbcXyz123')).toBeNull();
    });
  });

  describe('findStateByStateRegionPair', () => {
    test('geçerli (il, ilçe) çifti il döner', () => {
      expect(findStateByStateRegionPair(indices, 'ANKARA', 'CANKAYA')).toBe('ANKARA');
      expect(findStateByStateRegionPair(indices, 'ISTANBUL', 'KADIKOY')).toBe('ISTANBUL');
    });
    test('yanlış çift null', () => {
      expect(findStateByStateRegionPair(indices, 'ANKARA', 'KADIKOY')).toBeNull();
    });
  });

  describe('findStateAndRegionByRegionFuzzy', () => {
    test('tek ile ait ilçe → il + ilçe', () => {
      const r = findStateAndRegionByRegionFuzzy(indices, 'Kadıköy');
      expect(r).not.toBeNull();
      expect(r!.state).toBe('ISTANBUL');
      expect(r!.region).toBe('KADIKOY');
    });
    test('typo ilçe düzeltir', () => {
      const r = findStateAndRegionByRegionFuzzy(indices, 'Seyhan');
      expect(r).not.toBeNull();
      expect(r!.state).toBe('ADANA');
      expect(r!.region).toBe('SEYHAN');
    });
    test('birden fazla ilde olan ilçe (MERKEZ) null veya tek il', () => {
      const r = findStateAndRegionByRegionFuzzy(indices, 'MERKEZ');
      expect(r === null || (r.state.length > 0 && r.region === 'MERKEZ')).toBe(true);
    });
  });

  describe('findRegionExactInState', () => {
    test('il içinde ilçe exact', () => {
      const stateKey = 'ANKARA';
      expect(findRegionExactInState(indices, stateKey, 'CANKAYA')).toBe('CANKAYA');
      expect(findRegionExactInState(indices, stateKey, 'ETIMESGUT')).toBe('ETIMESGUT');
    });
    test('yanlış ilçe null', () => {
      expect(findRegionExactInState(indices, 'ANKARA', 'KADIKOY')).toBeNull();
    });
  });

  describe('resolveIlceFromTamAdres', () => {
    test('tam adreste ilçe varsa döner', () => {
      expect(resolveIlceFromTamAdres(indices, 'Kadıköy Mah. No:5', 'ISTANBUL')).toBe('KADIKOY');
      expect(resolveIlceFromTamAdres(indices, 'Çankaya Kızılay', 'ANKARA')).toBe('CANKAYA');
    });
    test('ilçe yoksa null', () => {
      expect(resolveIlceFromTamAdres(indices, 'Bilinmeyen Mah.', 'ANKARA')).toBeNull();
    });
    test('boş adres null', () => {
      expect(resolveIlceFromTamAdres(indices, '', 'ANKARA')).toBeNull();
    });
  });

  describe('extractIlIlceFromLongText', () => {
    test('ilçe/İl pattern bulunursa döner', () => {
      const r = extractIlIlceFromLongText(indices, 'Etimesgut/ANKARA');
      expect(r).not.toBeNull();
      expect(r!.il).toBe('ANKARA');
      expect(r!.ilce).toBe('ETIMESGUT');
    });
    test('slash yoksa null', () => {
      expect(extractIlIlceFromLongText(indices, 'Etimesgut ANKARA')).toBeNull();
    });
    test('geçersiz il null', () => {
      expect(extractIlIlceFromLongText(indices, 'Etimesgut/XYZ')).toBeNull();
    });
    test('boş string null', () => {
      expect(extractIlIlceFromLongText(indices, '')).toBeNull();
    });
  });
});
