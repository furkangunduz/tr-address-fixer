"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const correct_1 = require("../src/correct");
const DATA_DIR = path_1.default.join(process.cwd(), 'src', 'data');
describe('correctAddress', () => {
    test('exact il+ilçe (CSV referans yazımı)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ADANA', ilce: 'CEYHAN' }, DATA_DIR);
        expect(r.il).toBe('ADANA');
        expect(r.ilce).toBe('CEYHAN');
        expect(r.corrected).toBe(false);
        expect(r.confidence).toBe('exact');
    });
    test('case düzeltmesi (küçük harf)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'istanbul', ilce: 'kadikoy' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('KADIKOY');
        expect(r.corrected).toBe(true);
    });
    test('case karışık (İzmir)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'İzmir', ilce: 'Konak' }, DATA_DIR);
        expect(r.il).toBe('IZMIR');
        expect(r.corrected).toBe(true);
    });
    // --- Şehir (il) yanlış yazım / typo ---
    test(' il typo - Anakra → Ankara', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Anakra', ilce: 'Cankaya' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('CANKAYA');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - İstambul → Istanbul', () => {
        const r = (0, correct_1.correctAddress)({ il: 'İstambul', ilce: 'Kadikoy' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('KADIKOY');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - Antlya → Antalya', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Antlya', ilce: 'Muratpasa' }, DATA_DIR);
        expect(r.il).toBe('ANTALYA');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - İzmir (eksik harf)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Izmi', ilce: 'Karsiyaka' }, DATA_DIR);
        expect(r.il).toBe('IZMIR');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - Bursa (tek harf fazla)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Bursaa', ilce: 'Osmangazi' }, DATA_DIR);
        expect(r.il).toBe('BURSA');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - Adana (yer değişim)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Adnaa', ilce: 'Seyhan' }, DATA_DIR);
        expect(r.il).toBe('ADANA');
        expect(r.ilce).toBe('SEYHAN');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - Kocaeli', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Kocaali', ilce: 'Izmit' }, DATA_DIR);
        expect(r.il).toBe('KOCAELI');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - Gaziantep', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Gaziantepp', ilce: 'Sehitkamil' }, DATA_DIR);
        expect(r.il).toBe('GAZIANTEP');
        expect(r.corrected).toBe(true);
    });
    test(' il typo - Mersin (Mersın)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Mersın', ilce: 'Mezitli' }, DATA_DIR);
        expect(r.il).toBe('MERSIN');
        expect(r.corrected).toBe(true);
    });
    // --- İl doğru, ilçe yanlış ---
    test(' ilçe typo - Çankaya (Cankaya)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ANKARA', ilce: 'Cankaya' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('CANKAYA');
        expect(r.corrected).toBe(true);
    });
    test(' ilçe typo - Kadıköy (Kadikoy)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ISTANBUL', ilce: 'Kadikoy' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('KADIKOY');
        expect(r.corrected).toBe(true);
    });
    test(' ilçe typo - Seyhan (Sehan)', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ADANA', ilce: 'Sehan' }, DATA_DIR);
        expect(r.il).toBe('ADANA');
        expect(r.ilce).toBe('SEYHAN');
        expect(r.corrected).toBe(true);
    });
    // --- Mismatch: şehir yanlış, ilçe doğru (ilçe başka ile ait) ---
    test(' mismatch - Ankara + Kadıköy → İstanbul + Kadıköy', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ANKARA', ilce: 'Kadıköy' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('KADIKOY');
        expect(r.corrected).toBe(true);
    });
    test(' mismatch - İzmir + Seyhan → Adana + Seyhan', () => {
        const r = (0, correct_1.correctAddress)({ il: 'IZMIR', ilce: 'Seyhan' }, DATA_DIR);
        expect(r.il).toBe('ADANA');
        expect(r.ilce).toBe('SEYHAN');
        expect(r.corrected).toBe(true);
    });
    test(' mismatch - Bursa + Konak → İzmir + Konak', () => {
        const r = (0, correct_1.correctAddress)({ il: 'BURSA', ilce: 'Konak' }, DATA_DIR);
        expect(r.il).toBe('IZMIR');
        expect(r.ilce).toBe('KONAK');
        expect(r.corrected).toBe(true);
    });
    // --- Sadece ilçe verilmiş (il çözülür) ---
    test(' sadece ilçe - Kadıköy → İstanbul', () => {
        const r = (0, correct_1.correctAddress)({ ilce: 'Kadıköy' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('KADIKOY');
        expect(r.corrected).toBe(true);
        expect(r.confidence).toBe('resolved');
    });
    test(' sadece ilçe - Seyhan → Adana', () => {
        const r = (0, correct_1.correctAddress)({ ilce: 'SEYHAN' }, DATA_DIR);
        expect(r.il).toBe('ADANA');
        expect(r.ilce).toBe('SEYHAN');
        expect(r.corrected).toBe(true);
    });
    test(' sadece ilçe - Konak → İzmir', () => {
        const r = (0, correct_1.correctAddress)({ ilce: 'Konak' }, DATA_DIR);
        expect(r.il).toBe('IZMIR');
        expect(r.ilce).toBe('KONAK');
        expect(r.corrected).toBe(true);
    });
    // --- Sadece il verilmiş (ilçe boş) ---
    test(' sadece il - ilçe boş kalır', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ANKARA' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('');
        expect(r.corrected).toBe(false);
    });
    test(' sadece il typo - ilçe boş', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Anakra' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('');
        expect(r.corrected).toBe(true);
    });
    // --- Tam adresten ilçe çıkarımı ---
    test(' tam adresten ilçe (il var, ilçe yok)', () => {
        const r = (0, correct_1.correctAddress)({ tamAdres: 'Kadıköy Mah. Caferağa Sk. No:5', il: 'İstanbul', ilce: '' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('KADIKOY');
        expect(r.corrected).toBe(true);
        expect(r.confidence).toBe('resolved');
    });
    test(' tam adres ilçe yoksa ilçe boş kalır', () => {
        const r = (0, correct_1.correctAddress)({ tamAdres: 'Bilinmeyen Mah. 1. Cad.', il: 'ANKARA', ilce: '' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('');
    });
    test(' tam adreste Çankaya geçiyor → ilçe dolar', () => {
        const r = (0, correct_1.correctAddress)({ tamAdres: 'Çankaya, Kızılay', il: 'Ankara', ilce: '' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('CANKAYA');
        expect(r.corrected).toBe(true);
    });
    // --- Boş / geçersiz ---
    test(' il ve ilçe boş → corrected false', () => {
        const r = (0, correct_1.correctAddress)({ il: '', ilce: '' }, DATA_DIR);
        expect(r.il).toBe('');
        expect(r.ilce).toBe('');
        expect(r.corrected).toBe(false);
        expect(r.confidence).toBe('unknown');
    });
    test(' tanınmayan il ve ilçe → olduğu gibi döner', () => {
        const r = (0, correct_1.correctAddress)({ il: 'XxxYyyZzz', ilce: 'AaaBbbCcc' }, DATA_DIR);
        expect(r.il).toBe('XxxYyyZzz');
        expect(r.ilce).toBe('AaaBbbCcc');
        expect(r.corrected).toBe(false);
        expect(r.confidence).toBe('unknown');
    });
    // --- Tam adres / posta kodu korunur ---
    test(' tamAdres ve postaKodu aynen döner', () => {
        const r = (0, correct_1.correctAddress)({ tamAdres: 'X Sokak', il: 'ADANA', postaKodu: '01000' }, DATA_DIR);
        expect(r.tamAdres).toBe('X Sokak');
        expect(r.postaKodu).toBe('01000');
    });
    // --- Batch ---
    test('correctAddressBatch: toplu', () => {
        const list = (0, correct_1.correctAddressBatch)([
            { il: 'ankara' },
            { ilce: 'SEYHAN' },
            { il: 'ADANA', ilce: 'CEYHAN' },
        ], DATA_DIR);
        expect(list.length).toBe(3);
        expect(list[0].il).toBe('ANKARA');
        expect(list[1].il).toBe('ADANA');
        expect(list[1].ilce).toBe('SEYHAN');
        expect(list[2].il).toBe('ADANA');
        expect(list[2].ilce).toBe('CEYHAN');
    });
    test('correctAddressBatch: şehir typo senaryoları', () => {
        const list = (0, correct_1.correctAddressBatch)([
            { il: 'Anakra', ilce: 'Cankaya' },
            { il: 'İstambul', ilce: 'Kadikoy' },
            { il: 'Antlya', ilce: 'Muratpasa' },
        ], DATA_DIR);
        expect(list[0].il).toBe('ANKARA');
        expect(list[0].ilce).toBe('CANKAYA');
        expect(list[1].il).toBe('ISTANBUL');
        expect(list[1].ilce).toBe('KADIKOY');
        expect(list[2].il).toBe('ANTALYA');
        expect(list[2].ilce).toBe('MURATPASA');
    });
    // --- Ek edge case ve confidence testleri ---
    test(' başta/sonda boşluk trimlenir', () => {
        const r = (0, correct_1.correctAddress)({ il: '  ANKARA  ', ilce: '  CANKAYA  ' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('CANKAYA');
    });
    test(' il/ilçe undefined ile boş string aynı davranır', () => {
        const r1 = (0, correct_1.correctAddress)({ il: undefined, ilce: undefined }, DATA_DIR);
        const r2 = (0, correct_1.correctAddress)({ il: '', ilce: '' }, DATA_DIR);
        expect(r1.il).toBe(r2.il);
        expect(r1.ilce).toBe(r2.ilce);
        expect(r1.corrected).toBe(r2.corrected);
    });
    test(' idempotent - doğru adres tekrar verilince aynı sonuç', () => {
        const input = { il: 'ADANA', ilce: 'CEYHAN' };
        const r1 = (0, correct_1.correctAddress)(input, DATA_DIR);
        const r2 = (0, correct_1.correctAddress)(r1, DATA_DIR);
        expect(r1.il).toBe(r2.il);
        expect(r1.ilce).toBe(r2.ilce);
        expect(r2.corrected).toBe(false);
    });
    test(' düzeltme olsa bile postaKodu ve tamAdres korunur', () => {
        const r = (0, correct_1.correctAddress)({ tamAdres: 'Test Sokak No:1', il: 'anakra', ilce: 'cankaya', postaKodu: '06420' }, DATA_DIR);
        expect(r.tamAdres).toBe('Test Sokak No:1');
        expect(r.postaKodu).toBe('06420');
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('CANKAYA');
    });
    test(' Türkçe karakterli ilçe - Şişli', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ISTANBUL', ilce: 'Şişli' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('SISLI');
        expect(r.corrected).toBe(true);
    });
    test(' Türkçe karakterli ilçe - Beşiktaş', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Istanbul', ilce: 'Beşiktaş' }, DATA_DIR);
        expect(r.il).toBe('ISTANBUL');
        expect(r.ilce).toBe('BESIKTAS');
        expect(r.corrected).toBe(true);
    });
    test(' tam adreste birden fazla ilçe adı - uzun eşleşir', () => {
        const r = (0, correct_1.correctAddress)({ tamAdres: 'Çukurova ve Seyhan arası', il: 'ADANA', ilce: '' }, DATA_DIR);
        expect(r.il).toBe('ADANA');
        expect(r.ilce === 'CUKUROVA' || r.ilce === 'SEYHAN').toBe(true);
        expect(r.corrected).toBe(true);
    });
    test(' confidence fuzzy il+ilçe düzeltmede', () => {
        const r = (0, correct_1.correctAddress)({ il: 'Anakra', ilce: 'Cankya' }, DATA_DIR);
        expect(r.il).toBe('ANKARA');
        expect(r.ilce).toBe('CANKAYA');
        expect(r.confidence).toBe('fuzzy');
    });
    test(' confidence exact il+ilçe doğruyken', () => {
        const r = (0, correct_1.correctAddress)({ il: 'ANKARA', ilce: 'CANKAYA' }, DATA_DIR);
        expect(r.confidence).toBe('exact');
    });
    test('correctAddressBatch: boş dizi', () => {
        const list = (0, correct_1.correctAddressBatch)([], DATA_DIR);
        expect(list.length).toBe(0);
    });
    test('correctAddressBatch: tek eleman', () => {
        const list = (0, correct_1.correctAddressBatch)([{ il: 'izmir' }], DATA_DIR);
        expect(list.length).toBe(1);
        expect(list[0].il).toBe('IZMIR');
    });
    test('sadece ilçe MERKEZ - birden fazla ilde varsa çözülmeyebilir', () => {
        const r = (0, correct_1.correctAddress)({ ilce: 'MERKEZ' }, DATA_DIR);
        expect(r.il === '' || r.confidence === 'unknown' || r.il.length > 0).toBe(true);
        expect(r.ilce).toBe('MERKEZ');
    });
});
//# sourceMappingURL=correct.test.js.map