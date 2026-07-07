# Avrupa Gezi Sitesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Avrupa'nın 18 popüler şehri için Unsplash'ten gerçek fotoğraflar çeken, sunucu gerektirmeyen (çift tıklayıp açılabilen) statik bir gezi galerisi sitesi oluşturmak.

**Architecture:** Tamamen client-side, framework'süz HTML/CSS/JS. Sayfalar arasında paylaşılan mantık düz `<script>` etiketleriyle global scope'a yüklenir (ES modules kullanılmaz çünkü `file://` üzerinden açıldığında tarayıcılar modül script'lerini CORS hatasıyla engeller). Saf mantık fonksiyonları (`lib.js`, `cities.js`) Node.js'in `assert` modülüyle test edilir; DOM/fetch'e bağımlı kod (sayfa render'ı) tarayıcıda manuel olarak doğrulanır.

**Tech Stack:** Düz HTML5, CSS3, vanilla JavaScript (ES2017+), Unsplash Search API, `localStorage` (cache), Node.js (yalnızca geliştirme sırasında test çalıştırmak için — siteye dahil edilmez).

## Global Constraints

- Sunucu/backend yok; her sayfa `file://` üzerinden çift tıklanarak açılabilmeli (ES module script kullanılmaz).
- Harici framework/kütüphane yok (Bootstrap, Tailwind, jQuery, npm paketi vb. kullanılmaz).
- Arayüz metinleri Türkçe.
- Sabit 18 şehir listesi; kullanıcı tarafından arama/ekleme özelliği yok.
- Fotoğraf sonuçları `localStorage`'da 24 saat (`86400000` ms) cache'lenir.
- Unsplash API kullanım şartı: her fotoğrafın yanında fotoğrafçı adı + Unsplash profil linki gösterilmelidir.
- Bu makinede `git` kurulu değil — görev adımlarında commit yoktur, her görev kendi manuel/otomatik doğrulamasıyla biter.
- Node.js mevcut (`v24.17.0`) — yalnızca `lib.test.js` ve `cities.test.js` dosyalarını `node` ile çalıştırmak için kullanılır.

---

## Dosya Yapısı

```
avrupa-gezi/
  config.js        → UNSPLASH_ACCESS_KEY sabiti (kullanıcı kendi key'ini girer)
  cities.js         → CITIES veri dizisi (18 şehir)
  cities.test.js     → cities.js için Node testleri
  lib.js            → saf yardımcı fonksiyonlar (cache, URL, eşleme, hata sınıflandırma)
  lib.test.js        → lib.js için Node testleri
  photos.js          → fetch + cache birleştirici (tarayıcı-only, lib.js + config.js'e bağımlı)
  style.css          → ortak stil (koyu tema)
  index.html         → ana sayfa
  home.js            → ana sayfa render mantığı
  city.html          → şehir detay sayfası
  detail.js          → detay sayfası render mantığı
```

**Interface sözleşmesi (tüm görevler bunu referans alır):**
- `cities.js` → `CITIES`: `Array<{ name: string, country: string, slug: string, query: string }>`
- `lib.js` → `getCacheKey(query: string): string`, `isCacheFresh(timestamp: number, nowMs: number, ttlMs: number): boolean`, `buildSearchUrl(query: string, count: number): string`, `buildAuthHeader(accessKey: string): string`, `mapUnsplashResults(json: object): Array<{url: string, alt: string, photographerName: string, photographerLink: string}>`, `classifyFetchError(status: number|null|undefined): "rate_limit"|"missing_key"|"network"|"unknown"`, `findCityBySlug(cities: Array, slug: string): object|undefined`
- `photos.js` → `fetchCityPhotos(query: string, count: number): Promise<{photos: Array, error: string|null}>`
- `config.js` → global `UNSPLASH_ACCESS_KEY: string`

---

### Task 1: Proje iskeleti ve veri katmanı (`cities.js`)

**Files:**
- Create: `C:\Users\erena\avrupa-gezi\config.js`
- Create: `C:\Users\erena\avrupa-gezi\cities.js`
- Test: `C:\Users\erena\avrupa-gezi\cities.test.js`

**Interfaces:**
- Produces: `CITIES` global array (browser) ve `module.exports.CITIES` (Node), 18 öğe, her öğe `{name, country, slug, query}`.

- [ ] **Step 1: `config.js` dosyasını oluştur**

```js
// Unsplash Access Key almak için:
// 1. https://unsplash.com/developers adresinden ücretsiz hesap oluşturun.
// 2. "New Application" ile bir uygulama oluşturun.
// 3. Aşağıdaki değeri kendi "Access Key"inizle değiştirin.
const UNSPLASH_ACCESS_KEY = "BURAYA_UNSPLASH_ACCESS_KEY_YAZIN";
```

- [ ] **Step 2: Başarısız olacak testi yaz — `cities.test.js`**

```js
const assert = require("assert");
const { CITIES } = require("./cities.js");

function run() {
  assert.strictEqual(CITIES.length, 18, "CITIES should contain exactly 18 cities");

  const slugs = new Set();
  CITIES.forEach(function (city) {
    assert.ok(city.name && city.name.length > 0, "city.name must be non-empty");
    assert.ok(city.country && city.country.length > 0, "city.country must be non-empty");
    assert.ok(city.slug && /^[a-z]+$/.test(city.slug), "city.slug must be lowercase a-z: " + city.slug);
    assert.ok(city.query && city.query.length > 0, "city.query must be non-empty");
    assert.ok(!slugs.has(city.slug), "duplicate slug: " + city.slug);
    slugs.add(city.slug);
  });

  console.log("cities.test.js: all assertions passed (" + CITIES.length + " cities)");
}

run();
```

- [ ] **Step 2b: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node cities.test.js`
Expected: `Error: Cannot find module './cities.js'`

- [ ] **Step 3: `cities.js` dosyasını oluştur**

```js
const CITIES = [
  { name: "Paris", country: "Fransa", slug: "paris", query: "Paris landmark eiffel tower" },
  { name: "Roma", country: "İtalya", slug: "roma", query: "Rome colosseum landmark" },
  { name: "Barcelona", country: "İspanya", slug: "barcelona", query: "Barcelona Sagrada Familia landmark" },
  { name: "Amsterdam", country: "Hollanda", slug: "amsterdam", query: "Amsterdam canal landmark" },
  { name: "Prag", country: "Çekya", slug: "prag", query: "Prague castle landmark" },
  { name: "Venedik", country: "İtalya", slug: "venedik", query: "Venice canal landmark" },
  { name: "Viyana", country: "Avusturya", slug: "viyana", query: "Vienna palace landmark" },
  { name: "İstanbul", country: "Türkiye", slug: "istanbul", query: "Istanbul mosque landmark" },
  { name: "Lizbon", country: "Portekiz", slug: "lizbon", query: "Lisbon tram landmark" },
  { name: "Budapeşte", country: "Macaristan", slug: "budapeste", query: "Budapest parliament landmark" },
  { name: "Atina", country: "Yunanistan", slug: "atina", query: "Athens acropolis landmark" },
  { name: "Floransa", country: "İtalya", slug: "floransa", query: "Florence duomo landmark" },
  { name: "Berlin", country: "Almanya", slug: "berlin", query: "Berlin brandenburg gate landmark" },
  { name: "Londra", country: "İngiltere", slug: "londra", query: "London big ben landmark" },
  { name: "Edinburgh", country: "İskoçya", slug: "edinburgh", query: "Edinburgh castle landmark" },
  { name: "Dubrovnik", country: "Hırvatistan", slug: "dubrovnik", query: "Dubrovnik old town landmark" },
  { name: "Salzburg", country: "Avusturya", slug: "salzburg", query: "Salzburg fortress landmark" },
  { name: "Brugge", country: "Belçika", slug: "brugge", query: "Bruges canal landmark" }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CITIES };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node cities.test.js`
Expected: `cities.test.js: all assertions passed (18 cities)`

---

### Task 2: `lib.js` — cache ve URL yardımcıları

**Files:**
- Create: `C:\Users\erena\avrupa-gezi\lib.js`
- Test: `C:\Users\erena\avrupa-gezi\lib.test.js`

**Interfaces:**
- Consumes: yok (saf fonksiyonlar).
- Produces: `getCacheKey(query)`, `isCacheFresh(timestamp, nowMs, ttlMs)`, `buildSearchUrl(query, count)`, `buildAuthHeader(accessKey)` — Task 4'te `photos.js` tarafından kullanılacak.

- [ ] **Step 1: Başarısız olacak testi yaz — `lib.test.js`**

```js
const assert = require("assert");
const { getCacheKey, isCacheFresh, buildSearchUrl, buildAuthHeader } = require("./lib.js");

function run() {
  assert.strictEqual(getCacheKey("Paris landmark"), "unsplash_cache_paris landmark");
  assert.strictEqual(getCacheKey("  Roma  "), "unsplash_cache_roma");

  assert.strictEqual(isCacheFresh(1000, 1500, 1000), true);
  assert.strictEqual(isCacheFresh(1000, 2500, 1000), false);

  assert.strictEqual(
    buildSearchUrl("Paris landmark", 12),
    "https://api.unsplash.com/search/photos?query=Paris%20landmark&per_page=12"
  );

  assert.strictEqual(buildAuthHeader("abc123"), "Client-ID abc123");

  console.log("lib.test.js (cache/url): all assertions passed");
}

run();
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node lib.test.js`
Expected: `Error: Cannot find module './lib.js'`

- [ ] **Step 3: `lib.js` dosyasını oluştur**

```js
function getCacheKey(query) {
  return "unsplash_cache_" + query.trim().toLowerCase();
}

function isCacheFresh(timestamp, nowMs, ttlMs) {
  return (nowMs - timestamp) < ttlMs;
}

function buildSearchUrl(query, count) {
  return "https://api.unsplash.com/search/photos?query=" + encodeURIComponent(query) + "&per_page=" + count;
}

function buildAuthHeader(accessKey) {
  return "Client-ID " + accessKey;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getCacheKey, isCacheFresh, buildSearchUrl, buildAuthHeader };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node lib.test.js`
Expected: `lib.test.js (cache/url): all assertions passed`

---

### Task 3: `lib.js` — API yanıt eşleme ve hata sınıflandırma

**Files:**
- Modify: `C:\Users\erena\avrupa-gezi\lib.js`
- Modify: `C:\Users\erena\avrupa-gezi\lib.test.js`

**Interfaces:**
- Consumes: Task 2'deki `lib.js` (aynı dosyaya ekleme yapılıyor).
- Produces: `mapUnsplashResults(json)`, `classifyFetchError(status)`, `findCityBySlug(cities, slug)` — Task 4 ve 5'te `photos.js`/`detail.js` tarafından kullanılacak.

- [ ] **Step 1: `lib.test.js` dosyasını yeni assertion'larla güncelle (tam içerik)**

```js
const assert = require("assert");
const {
  getCacheKey,
  isCacheFresh,
  buildSearchUrl,
  buildAuthHeader,
  mapUnsplashResults,
  classifyFetchError,
  findCityBySlug
} = require("./lib.js");

function run() {
  assert.strictEqual(getCacheKey("Paris landmark"), "unsplash_cache_paris landmark");
  assert.strictEqual(getCacheKey("  Roma  "), "unsplash_cache_roma");

  assert.strictEqual(isCacheFresh(1000, 1500, 1000), true);
  assert.strictEqual(isCacheFresh(1000, 2500, 1000), false);

  assert.strictEqual(
    buildSearchUrl("Paris landmark", 12),
    "https://api.unsplash.com/search/photos?query=Paris%20landmark&per_page=12"
  );

  assert.strictEqual(buildAuthHeader("abc123"), "Client-ID abc123");

  const sample = {
    results: [
      {
        alt_description: "Eiffel tower at sunset",
        urls: { regular: "https://images.unsplash.com/photo-1" },
        user: { name: "Jane Doe", links: { html: "https://unsplash.com/@janedoe" } }
      },
      {
        urls: {},
        user: {}
      }
    ]
  };
  const mapped = mapUnsplashResults(sample);
  assert.strictEqual(mapped.length, 2);
  assert.strictEqual(mapped[0].url, "https://images.unsplash.com/photo-1");
  assert.strictEqual(mapped[0].alt, "Eiffel tower at sunset");
  assert.strictEqual(mapped[0].photographerName, "Jane Doe");
  assert.strictEqual(mapped[0].photographerLink, "https://unsplash.com/@janedoe");
  assert.strictEqual(mapped[1].url, "");
  assert.deepStrictEqual(mapUnsplashResults({}), []);
  assert.deepStrictEqual(mapUnsplashResults(null), []);

  assert.strictEqual(classifyFetchError(429), "rate_limit");
  assert.strictEqual(classifyFetchError(401), "missing_key");
  assert.strictEqual(classifyFetchError(403), "missing_key");
  assert.strictEqual(classifyFetchError(null), "network");
  assert.strictEqual(classifyFetchError(500), "unknown");

  const cities = [
    { name: "Paris", slug: "paris" },
    { name: "Roma", slug: "roma" }
  ];
  assert.strictEqual(findCityBySlug(cities, "paris").name, "Paris");
  assert.strictEqual(findCityBySlug(cities, "PARIS").name, "Paris");
  assert.strictEqual(findCityBySlug(cities, "berlin"), undefined);

  console.log("lib.test.js: all assertions passed");
}

run();
```

- [ ] **Step 2: Testi çalıştır, yeni assertion'ların başarısız olduğunu doğrula**

Run: `node lib.test.js`
Expected: `TypeError: mapUnsplashResults is not a function` (ya da benzer — yeni fonksiyonlar henüz tanımlı değil)

- [ ] **Step 3: `lib.js` dosyasını üç yeni fonksiyonla güncelle (tam içerik)**

```js
function getCacheKey(query) {
  return "unsplash_cache_" + query.trim().toLowerCase();
}

function isCacheFresh(timestamp, nowMs, ttlMs) {
  return (nowMs - timestamp) < ttlMs;
}

function buildSearchUrl(query, count) {
  return "https://api.unsplash.com/search/photos?query=" + encodeURIComponent(query) + "&per_page=" + count;
}

function buildAuthHeader(accessKey) {
  return "Client-ID " + accessKey;
}

function mapUnsplashResults(apiResponseJson) {
  if (!apiResponseJson || !Array.isArray(apiResponseJson.results)) {
    return [];
  }
  return apiResponseJson.results.map(function (photo) {
    return {
      url: photo.urls && photo.urls.regular ? photo.urls.regular : "",
      alt: photo.alt_description || "",
      photographerName: photo.user && photo.user.name ? photo.user.name : "",
      photographerLink: photo.user && photo.user.links && photo.user.links.html ? photo.user.links.html : ""
    };
  });
}

function classifyFetchError(status) {
  if (status === 429) return "rate_limit";
  if (status === 401 || status === 403) return "missing_key";
  if (status === null || status === undefined) return "network";
  return "unknown";
}

function findCityBySlug(cities, slug) {
  if (!slug) return undefined;
  var target = slug.toLowerCase();
  return cities.find(function (city) {
    return city.slug.toLowerCase() === target;
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getCacheKey,
    isCacheFresh,
    buildSearchUrl,
    buildAuthHeader,
    mapUnsplashResults,
    classifyFetchError,
    findCityBySlug
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node lib.test.js`
Expected: `lib.test.js: all assertions passed`

---

### Task 4: Ana sayfa (`index.html`, `home.js`, `photos.js`, `style.css`)

**Files:**
- Create: `C:\Users\erena\avrupa-gezi\style.css`
- Create: `C:\Users\erena\avrupa-gezi\photos.js`
- Create: `C:\Users\erena\avrupa-gezi\index.html`
- Create: `C:\Users\erena\avrupa-gezi\home.js`

**Interfaces:**
- Consumes: `CITIES` (Task 1), `getCacheKey`/`isCacheFresh`/`buildSearchUrl`/`buildAuthHeader`/`mapUnsplashResults`/`classifyFetchError` (Task 2-3), `UNSPLASH_ACCESS_KEY` (config.js).
- Produces: `fetchCityPhotos(query, count): Promise<{photos, error}>` — Task 5'te `detail.js` tarafından da kullanılacak.

Bu görev için otomatik test yoktur (DOM ve `fetch`/`localStorage`'a bağımlı, gerçek bir API key gerektirir); doğrulama tarayıcıda manuel olarak yapılır.

- [ ] **Step 1: `style.css` dosyasını oluştur**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
  background: #0b132b;
  color: #ffffff;
}

.page-header {
  padding: 32px 24px 16px;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.api-key-warning {
  background: #5a1f1f;
  color: #ffd6d6;
  padding: 10px 16px;
  border-radius: 6px;
  display: inline-block;
  font-size: 0.9rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  padding: 24px;
}

.city-card {
  position: relative;
  display: block;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  background: #1c2541;
  aspect-ratio: 4 / 3;
}

.city-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #1c2541;
}

.city-card-img-placeholder {
  background: linear-gradient(135deg, #1c2541, #3a506b);
}

.city-card-label {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 12px 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);
}

.city-card-label strong {
  display: block;
  font-size: 1.1rem;
}

.city-card-label span {
  font-size: 0.85rem;
  color: #c9d6df;
}

.back-link {
  display: inline-block;
  margin: 24px 24px 0;
  color: #9fd3ff;
  text-decoration: none;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 24px;
}

.photo-card {
  background: #1c2541;
  border-radius: 10px;
  overflow: hidden;
}

.photo-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.photo-card-credit {
  padding: 8px 12px;
  font-size: 0.8rem;
  color: #c9d6df;
}

.photo-card-credit a {
  color: #9fd3ff;
}

.error-message {
  margin: 24px;
  padding: 16px;
  background: #5a1f1f;
  color: #ffd6d6;
  border-radius: 8px;
}
```

- [ ] **Step 2: `photos.js` dosyasını oluştur**

```js
const PHOTO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchCityPhotos(query, count) {
  const cacheKey = getCacheKey(query + "_" + count);
  const cachedRaw = window.localStorage.getItem(cacheKey);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw);
    if (isCacheFresh(cached.timestamp, Date.now(), PHOTO_CACHE_TTL_MS)) {
      return { photos: cached.photos, error: null };
    }
  }

  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "BURAYA_UNSPLASH_ACCESS_KEY_YAZIN") {
    return { photos: [], error: "missing_key" };
  }

  let response;
  try {
    response = await fetch(buildSearchUrl(query, count), {
      headers: { Authorization: buildAuthHeader(UNSPLASH_ACCESS_KEY) }
    });
  } catch (networkErr) {
    return { photos: [], error: classifyFetchError(null) };
  }

  if (!response.ok) {
    return { photos: [], error: classifyFetchError(response.status) };
  }

  const json = await response.json();
  const photos = mapUnsplashResults(json);
  window.localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), photos: photos }));
  return { photos: photos, error: null };
}
```

- [ ] **Step 3: `index.html` dosyasını oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Avrupa'da Gezilecek En Güzel Yerler</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="page-header">
    <h1>Avrupa'da Gezilecek En Güzel Yerler</h1>
    <p id="api-key-warning" class="api-key-warning" hidden>
      Unsplash API key tanımlı değil. Fotoğrafların yüklenmesi için
      <code>config.js</code> dosyasındaki <code>UNSPLASH_ACCESS_KEY</code>
      değerini kendi Unsplash Access Key'inizle değiştirin.
    </p>
  </header>
  <main id="city-grid" class="card-grid"></main>

  <script src="config.js"></script>
  <script src="cities.js"></script>
  <script src="lib.js"></script>
  <script src="photos.js"></script>
  <script src="home.js"></script>
</body>
</html>
```

- [ ] **Step 4: `home.js` dosyasını oluştur**

```js
function createCityCard(city) {
  const card = document.createElement("a");
  card.className = "city-card";
  card.href = "city.html?city=" + encodeURIComponent(city.slug);

  const img = document.createElement("img");
  img.className = "city-card-img";
  img.alt = city.name;
  card.appendChild(img);

  const label = document.createElement("div");
  label.className = "city-card-label";
  label.innerHTML = "<strong>" + city.name + "</strong><span>" + city.country + "</span>";
  card.appendChild(label);

  return { card, img };
}

async function renderHomePage() {
  const grid = document.getElementById("city-grid");
  const warning = document.getElementById("api-key-warning");

  CITIES.forEach(function (city) {
    const { card, img } = createCityCard(city);
    grid.appendChild(card);

    fetchCityPhotos(city.query, 1).then(function (result) {
      if (result.error === "missing_key") {
        warning.hidden = false;
        img.classList.add("city-card-img-placeholder");
        return;
      }
      if (result.error || result.photos.length === 0) {
        img.classList.add("city-card-img-placeholder");
        return;
      }
      img.src = result.photos[0].url;
    });
  });
}

document.addEventListener("DOMContentLoaded", renderHomePage);
```

- [ ] **Step 5: Manuel doğrulama**

Run: `start C:\Users\erena\avrupa-gezi\index.html` (PowerShell'de bu komut dosyayı varsayılan tarayıcıda açar)

Expected (config.js içindeki key hâlâ yer tutucu olduğu için):
- Sayfa başlığı "Avrupa'da Gezilecek En Güzel Yerler" görünür.
- "Unsplash API key tanımlı değil..." uyarısı görünür.
- 18 şehir kartı, her biri gradient placeholder arka planla ve şehir adı/ülke etiketiyle grid halinde görünür.
- Tarayıcı DevTools konsolunda yakalanmamış (uncaught) hata olmamalı.

---

### Task 5: Şehir detay sayfası (`city.html`, `detail.js`)

**Files:**
- Create: `C:\Users\erena\avrupa-gezi\city.html`
- Create: `C:\Users\erena\avrupa-gezi\detail.js`

**Interfaces:**
- Consumes: `CITIES`, `findCityBySlug` (Task 1, 3), `fetchCityPhotos` (Task 4).
- Produces: yok (son kullanıcı sayfası).

- [ ] **Step 1: `city.html` dosyasını oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Şehir Detayı - Avrupa Gezi</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html" class="back-link">&larr; Ana sayfaya dön</a>
  <header class="page-header" id="city-title"></header>
  <main id="photo-grid" class="photo-grid"></main>

  <script src="config.js"></script>
  <script src="cities.js"></script>
  <script src="lib.js"></script>
  <script src="photos.js"></script>
  <script src="detail.js"></script>
</body>
</html>
```

- [ ] **Step 2: `detail.js` dosyasını oluştur**

```js
function createPhotoCard(photo) {
  const card = document.createElement("div");
  card.className = "photo-card";

  const img = document.createElement("img");
  img.src = photo.url;
  img.alt = photo.alt || "";
  card.appendChild(img);

  const credit = document.createElement("div");
  credit.className = "photo-card-credit";
  if (photo.photographerName) {
    credit.innerHTML = "Fotoğraf: <a href=\"" + photo.photographerLink + "\" target=\"_blank\" rel=\"noopener\">" +
      photo.photographerName + "</a> / Unsplash";
  }
  card.appendChild(credit);

  return card;
}

function showError(message) {
  const container = document.getElementById("photo-grid");
  const errorBox = document.createElement("div");
  errorBox.className = "error-message";
  errorBox.textContent = message;
  container.replaceWith(errorBox);
}

const ERROR_MESSAGES = {
  missing_key: "Unsplash API key tanımlı değil. config.js dosyasındaki UNSPLASH_ACCESS_KEY değerini ayarlayın.",
  rate_limit: "Çok fazla istek yapıldı, biraz sonra tekrar deneyin.",
  network: "Fotoğraflar yüklenemedi, internet bağlantınızı kontrol edin.",
  unknown: "Fotoğraflar yüklenirken bir hata oluştu."
};

async function renderCityPage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("city");
  const city = findCityBySlug(CITIES, slug);
  const titleEl = document.getElementById("city-title");
  const grid = document.getElementById("photo-grid");

  if (!city) {
    titleEl.textContent = "Şehir bulunamadı";
    showError("Geçersiz şehir. Ana sayfaya dönüp tekrar deneyin.");
    return;
  }

  titleEl.innerHTML = "<strong>" + city.name + "</strong><span> " + city.country + "</span>";

  const result = await fetchCityPhotos(city.query, 12);
  if (result.error) {
    showError(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.unknown);
    return;
  }
  if (result.photos.length === 0) {
    showError("Bu şehir için fotoğraf bulunamadı.");
    return;
  }

  result.photos.forEach(function (photo) {
    grid.appendChild(createPhotoCard(photo));
  });
}

document.addEventListener("DOMContentLoaded", renderCityPage);
```

- [ ] **Step 3: Manuel doğrulama — geçerli şehir**

Run: `start "C:\Users\erena\avrupa-gezi\city.html?city=paris"`

Expected (key hâlâ yer tutucuyken):
- Başlıkta "Paris Fransa" görünür.
- "Unsplash API key tanımlı değil..." hata kutusu görünür.
- Konsolda yakalanmamış hata olmamalı.

- [ ] **Step 4: Manuel doğrulama — geçersiz şehir**

Run: `start "C:\Users\erena\avrupa-gezi\city.html?city=doesnotexist"`

Expected:
- Başlıkta "Şehir bulunamadı" görünür.
- "Geçersiz şehir. Ana sayfaya dönüp tekrar deneyin." hata kutusu görünür.

---

## Son Adım — Gerçek Unsplash Key (Plan Dışı, Kullanıcı Tarafından Yapılır)

Yukarıdaki 5 görev tamamlandığında site, **API key olmadan dahi** doğru şekilde hata/placeholder gösteren çalışan bir iskelet halindedir. Gerçek fotoğrafları görmek için:

1. https://unsplash.com/developers adresinden ücretsiz hesap oluşturun, "New Application" ile bir uygulama açın.
2. Aldığınız Access Key'i `config.js` içindeki `UNSPLASH_ACCESS_KEY` değerine yapıştırın.
3. `index.html`'i yeniden açın: 18 kartın gerçek fotoğraflarla dolduğunu görmelisiniz.
4. 2-3 şehir kartına tıklayıp detay sayfalarında 10-12 fotoğraf + fotoğrafçı atıf linkinin göründüğünü doğrulayın.
5. Sayfayı yenileyip DevTools → Network sekmesinde, aynı sorgular için 24 saat içinde tekrar `api.unsplash.com` isteği gitmediğini (cache'ten okunduğunu) doğrulayın.

Bu adım gerçek bir gizli anahtar gerektirdiği için otomatikleştirilemez/test edilemez; planın bir parçası olarak görev haline getirilmemiştir.
