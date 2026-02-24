# tr-address-normalizer

Türkiye adres verisi için **il** (şehir) ve **ilçe** düzeltir.

## Ne yapar?

- **İl / ilçe normalizasyonu:** Büyük-küçük harf, Türkçe karakter (ı, ğ, ü, ş, ö, ç) ve yazım hatalarını referans veriye göre düzeltir.
- **İl–ilçe uyumsuzluğu:** Yanlış eşleşmeleri (örn. Ankara + Kadıköy) doğru ile düzeltir (İstanbul + Kadıköy).
- **Eksik il:** Sadece ilçe verildiğinde, ilçe tek bir ile aitse il’i doldurur.
- **Tam adresten ilçe:** İl verilip ilçe boşsa, tam adres metninde ilçe adı aranıp doldurulur.

Referans veri: `tr_postal_codes.csv` (il; ilçe; …). Dosya parça parça okunur; tüm CSV belleğe alınmaz.

## Gereksinimler

- **Node.js 16+**

## Kurulum

Repoyu klonlayıp bağımlılıkları yükleyin:

```bash
git clone https://github.com/furkangunduz/tr-address-fixer.git
cd tr-address-fixer
npm install
npm run build
```

Başka bir projede kullanacaksanız aşağıdaki yollardan birini kullanın.

**1) Yerel klasör (file:) – önerilen**

Bu repoyu diskte bir yere klonlayın veya kopyalayın, örneğin diğer projenizin yanında:

```
my-app/
tr-address-fixer/   ← bu repo
```

Diğer projenin `package.json` içine dependency ekleyin (yol kendi klasör yapınıza göre değişir):

```json
"dependencies": {
  "tr-address-normalizer": "file:../tr-address-fixer"
}
```

Ardından diğer projede:

```bash
cd my-app
npm install
```

Önce bu repoda `npm run build` çalıştırdığınızdan emin olun; paket `dist/` çıktısını kullanır.

**2) Geliştirme için npm link (symlink)**

Bu repoda değişiklik yapıp diğer projede anında denemek için:

```bash
# Bu repo (tr-address-fixer) içinde
cd /path/to/tr-address-fixer
npm run build
npm link

# Kullanan proje içinde
cd /path/to/my-app
npm link tr-address-normalizer
```

Bundan sonra tr-address-fixer’da yaptığınız build’ler my-app’te hemen yansır. Symlink kaldırmak için my-app’te: `npm unlink tr-address-normalizer`.

**3) GitHub’dan (npm paketi yayınlamadan)**

```json
"tr-address-normalizer": "github:furkangunduz/tr-address-fixer"
```

Ardından projede `npm install`.

## Kullanım

```js
const { correctAddress, correctAddressBatch } = require('tr-address-normalizer');

// Tek adres
const out = correctAddress({
  tamAdres: 'Kadıköy Mah. X Sokak No:5',
  il: 'İstanbul',
  ilce: 'Kadikoy',
  postaKodu: '34710',
});
// → { il: 'ISTANBUL', ilce: 'KADIKOY', corrected: true, confidence: 'fuzzy', ... }

// Toplu
const list = correctAddressBatch([
  { il: 'Anakra', ilce: 'Cankaya' },
  { ilce: 'Seyhan' },
]);
```

## Veri

`tr_postal_codes.csv` proje içinde `src/data/` altında veya `correctAddress(..., dataDir)` ile verilen klasörde aranır. Sütunlar: `il;ilçe;semt_bucak_belde;Mahalle;PK;...` — sadece il ve ilçe kullanılır.

## Scriptler

- `npm run build` — TypeScript derleme
- `npm test` — Testler (Jest 28, Node 16+ uyumlu)
