# Avrupa Gezi Sitesi — Tasarım

**Tarih:** 2026-06-21

## Amaç

Avrupa'daki popüler şehirlerin en güzel gezilecek yerlerinin fotoğraflarını gösteren,
sade ve pratik bir statik web sitesi. Sunucu kurulumu gerektirmez; dosyaya çift
tıklayıp doğrudan tarayıcıda açılabilir.

## Kapsam

- Sabit, önceden seçilmiş ~18 popüler Avrupa şehri.
- Her şehir için Unsplash'ten otomatik çekilen gerçek fotoğraflar.
- Ana sayfa (şehir kartları) + her şehir için detay sayfası (10-12 fotoğraf).
- Fotoğraf kaynağı: Unsplash API (ücretsiz, client-side `fetch`).

## Dosya yapısı

```
avrupa-gezi/
  index.html      → ana sayfa, şehir kartları grid'i
  city.html        → tek şablon, ?city=Paris query param ile çalışır
  style.css        → ortak stil (koyu tema)
  app.js           → şehir listesi + Unsplash fetch + render mantığı
  config.js        → UNSPLASH_ACCESS_KEY (kullanıcı kendi key'ini girer)
```

## Veri modeli

`app.js` içinde sabit dizi:

```js
const CITIES = [
  { name: "Paris", country: "Fransa", query: "Paris landmark eiffel tower" },
  { name: "Roma", country: "İtalya", query: "Rome colosseum landmark" },
  // ...
];
```

Önerilen 18 şehir: Paris, Roma, Barcelona, Amsterdam, Prag, Venedik, Viyana,
İstanbul, Lizbon, Budapeşte, Atina, Floransa, Berlin, Londra, Edinburgh,
Dubrovnik, Salzburg, Brugge.

## Sayfa akışı

- **index.html**: Başlık + responsive CSS Grid (`auto-fill, minmax(260px, 1fr)`)
  içinde 18 şehir kartı. Her kart 1 Unsplash fotoğrafı + şehir adı/ülke overlay'i.
  Karta tıklayınca `city.html?city=Paris`'e gider.
- **city.html**: Geri dön linki + şehir adı/ülke başlığı + 10-12 fotoğraflık grid.
  Her fotoğrafın altında (varsa) `alt_description` ve fotoğrafçı atıf linki
  (Unsplash API kullanım şartı gereği).

## Unsplash entegrasyonu

- Tek fonksiyon `fetchPhotos(query, count)`, `/search/photos` endpoint'ine
  `Authorization: Client-ID <ACCESS_KEY>` header'ı ile istek atar.
- Ana sayfada şehir başına `count=1`, detay sayfasında `count=12`.

## Cache stratejisi

- Sonuçlar `localStorage`'a `unsplash_cache_<query>` anahtarıyla zaman damgasıyla
  birlikte kaydedilir.
- 24 saatten eski değilse cache'ten okunur, API'ye gidilmez.
- Amaç: ücretsiz Unsplash demo tier'ının saatlik istek limitine (50/saat) takılma
  riskini azaltmak — özellikle ana sayfanın 18 istek atması nedeniyle önemli.

## Hata yönetimi

- `config.js` içinde API key tanımsız/boşsa: sayfada "Unsplash API key'inizi
  `config.js` dosyasına ekleyin" uyarısı gösterilir, fotoğraf kutuları boş/gri
  placeholder kalır.
- Tekil istek başarısız olursa (ağ hatası, eksik veri): o kart için "fotoğraf
  yüklenemedi" placeholder'ı gösterilir; diğer kartlar etkilenmez.
- 429 (rate limit) özel olarak yakalanır, kullanıcıya "Çok fazla istek, biraz
  sonra tekrar deneyin" mesajı gösterilir.

## Görsel tasarım

- Koyu temalı (lacivert/siyah arka plan, beyaz yazı), modern seyahat sitesi
  görünümü.
- Tek `style.css`, ekstra framework yok (Bootstrap/Tailwind kullanılmıyor).
- Detay sayfasında sade grid (masonry değil).

## Kurulum

Kullanıcı, ücretsiz bir Unsplash hesabıyla (unsplash.com/developers) bir
"Application" oluşturup Access Key alır ve bunu `config.js` içine yapıştırır.
Bu adımlar `config.js` içinde yorum satırı olarak da belirtilecek.

## Kapsam dışı

- Çoklu dil desteği yok (sadece Türkçe arayüz metinleri).
- Kullanıcı tarafından şehir ekleme/arama özelliği yok (sabit liste).
- Backend/sunucu yok; tamamen client-side.
