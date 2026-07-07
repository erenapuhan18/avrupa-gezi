const CATEGORY_ORDER = [
  "Tarihi Yerler",
  "Müzeler & Sanat",
  "Dini Yapılar",
  "Meydanlar & Sokaklar",
  "Parklar & Doğa",
  "Modern & Eğlence",
  "Stadyumlar"
];

const PHOTOS_PER_PLACE = 6;

/* ---------- Lightbox (tam ekran galeri) ---------- */

let lightboxState = { photos: [], index: 0, name: "" };
let pageCityName = "";
let infoToken = 0;

function ensureLightbox() {
  let lb = document.getElementById("lightbox");
  if (lb) return lb;

  lb = document.createElement("div");
  lb.id = "lightbox";
  lb.className = "lightbox";
  lb.hidden = true;
  lb.innerHTML =
    '<button class="lightbox-close" aria-label="Kapat">&times;</button>' +
    '<button class="lightbox-nav lightbox-prev" aria-label="Önceki">&#10094;</button>' +
    '<div class="lightbox-stage">' +
      '<figure class="lightbox-figure">' +
        '<img class="lightbox-img" alt="">' +
        '<figcaption class="lightbox-caption"></figcaption>' +
      '</figure>' +
      '<aside class="lightbox-info">' +
        '<h3 class="lightbox-info-title"></h3>' +
        '<div class="lightbox-info-body"></div>' +
        '<a class="lightbox-info-link" target="_blank" rel="noopener" hidden>Vikipedi\'de oku &rarr;</a>' +
      '</aside>' +
    '</div>' +
    '<button class="lightbox-nav lightbox-next" aria-label="Sonraki">&#10095;</button>';
  document.body.appendChild(lb);

  lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lightbox-prev").addEventListener("click", function (e) {
    e.stopPropagation();
    stepLightbox(-1);
  });
  lb.querySelector(".lightbox-next").addEventListener("click", function (e) {
    e.stopPropagation();
    stepLightbox(1);
  });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLightbox();
  });
  return lb;
}

function renderLightbox() {
  const lb = document.getElementById("lightbox");
  const photo = lightboxState.photos[lightboxState.index];
  const img = lb.querySelector(".lightbox-img");
  img.src = photo.url;
  img.alt = lightboxState.name;

  const counter = (lightboxState.index + 1) + " / " + lightboxState.photos.length;
  let credit = "";
  if (photo.photographerName) {
    credit = ' · Foto: <a href="' + photo.photographerLink +
      '" target="_blank" rel="noopener">' + photo.photographerName + '</a> / Wikimedia Commons';
  }
  lb.querySelector(".lightbox-caption").innerHTML =
    '<strong>' + lightboxState.name + '</strong>' +
    '<span class="lightbox-counter">' + counter + '</span>' + credit;

  const single = lightboxState.photos.length <= 1;
  lb.querySelector(".lightbox-prev").style.display = single ? "none" : "";
  lb.querySelector(".lightbox-next").style.display = single ? "none" : "";
}

function loadLightboxInfo(placeName) {
  const lb = document.getElementById("lightbox");
  const titleEl = lb.querySelector(".lightbox-info-title");
  const bodyEl = lb.querySelector(".lightbox-info-body");
  const linkEl = lb.querySelector(".lightbox-info-link");

  titleEl.textContent = placeName;
  bodyEl.textContent = "Bilgi yükleniyor…";
  bodyEl.classList.add("is-loading");
  linkEl.hidden = true;

  // Parantezli ekleri at, şehir adını ekle (aynı adlı yerleri ayırmak için).
  const query = placeName.replace(/\s*\([^)]*\)\s*/g, " ").trim() +
    (pageCityName ? " " + pageCityName : "");
  const myToken = ++infoToken;

  fetchPlaceInfo(query).then(function (info) {
    if (myToken !== infoToken) return; // başka bir yer açıldıysa bırak
    bodyEl.classList.remove("is-loading");
    if (info && info.extract) {
      bodyEl.textContent = info.extract;
      linkEl.href = info.url;
      linkEl.hidden = false;
    } else {
      bodyEl.textContent = "Bu yer için Vikipedi'de ek bilgi bulunamadı.";
    }
  });
}

function openLightbox(name, photos, index) {
  if (!photos || photos.length === 0) return;
  lightboxState = { photos: photos, index: index || 0, name: name };
  const lb = ensureLightbox();
  lb.hidden = false;
  document.body.classList.add("lightbox-open");
  renderLightbox();
  loadLightboxInfo(name);
}

function stepLightbox(dir) {
  const n = lightboxState.photos.length;
  if (n === 0) return;
  lightboxState.index = (lightboxState.index + dir + n) % n;
  renderLightbox();
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.hidden = true;
  document.body.classList.remove("lightbox-open");
}

document.addEventListener("keydown", function (e) {
  const ss = document.getElementById("slideshow");
  if (ss && !ss.hidden) {
    if (e.key === "Escape") closeSlideshow();
    else if (e.key === " ") { e.preventDefault(); toggleSlideshow(); }
    return;
  }
  const lb = document.getElementById("lightbox");
  if (!lb || lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") stepLightbox(1);
  else if (e.key === "ArrowLeft") stepLightbox(-1);
});

/* ---------- Ken Burns slayt gösterisi ---------- */

let slideState = { photos: [], index: 0, timer: null, layer: 0, playing: false };
const SLIDE_MS = 6000;

function ensureSlideshow() {
  let ss = document.getElementById("slideshow");
  if (ss) return ss;
  ss = document.createElement("div");
  ss.id = "slideshow";
  ss.className = "slideshow";
  ss.hidden = true;
  ss.innerHTML =
    '<div class="ss-layer ss-a"></div>' +
    '<div class="ss-layer ss-b"></div>' +
    '<div class="ss-vignette"></div>' +
    '<div class="ss-caption"></div>' +
    '<div class="ss-controls">' +
      '<button class="ss-btn ss-playpause" aria-label="Duraklat">❚❚</button>' +
      '<button class="ss-btn ss-close" aria-label="Kapat">✕</button>' +
    '</div>';
  document.body.appendChild(ss);
  ss.querySelector(".ss-close").addEventListener("click", closeSlideshow);
  ss.querySelector(".ss-playpause").addEventListener("click", toggleSlideshow);
  ss.addEventListener("click", function (e) {
    if (e.target === ss) toggleSlideshow();
  });
  return ss;
}

function showSlide(i) {
  const ss = document.getElementById("slideshow");
  const layers = ss.querySelectorAll(".ss-layer");
  const photo = slideState.photos[i];
  slideState.layer = 1 - slideState.layer;
  const active = layers[slideState.layer];
  const other = layers[1 - slideState.layer];
  active.style.backgroundImage = "url('" + photo.url + "')";
  // Ken Burns animasyonunu yeniden başlat (her karede farklı yön).
  active.classList.remove("kb0", "kb1", "kb2", "kb3");
  void active.offsetWidth;
  active.classList.add("kb" + (i % 4));
  active.classList.add("is-active");
  other.classList.remove("is-active");
  ss.querySelector(".ss-caption").textContent = photo.place;
}

function nextSlide() {
  slideState.index = (slideState.index + 1) % slideState.photos.length;
  showSlide(slideState.index);
}

function startSlideshow(photos) {
  if (!photos || !photos.length) return;
  slideState.photos = photos;
  slideState.index = 0;
  slideState.layer = 1;
  const ss = ensureSlideshow();
  ss.hidden = false;
  document.body.classList.add("slideshow-open");
  showSlide(0);
  slideState.playing = true;
  ss.querySelector(".ss-playpause").textContent = "❚❚";
  if (slideState.timer) clearInterval(slideState.timer);
  slideState.timer = setInterval(nextSlide, SLIDE_MS);
}

function toggleSlideshow() {
  const ss = document.getElementById("slideshow");
  if (!ss || ss.hidden) return;
  const btn = ss.querySelector(".ss-playpause");
  if (slideState.playing) {
    clearInterval(slideState.timer);
    slideState.timer = null;
    slideState.playing = false;
    btn.textContent = "▶";
    btn.setAttribute("aria-label", "Oynat");
  } else {
    slideState.timer = setInterval(nextSlide, SLIDE_MS);
    slideState.playing = true;
    btn.textContent = "❚❚";
    btn.setAttribute("aria-label", "Duraklat");
  }
}

function closeSlideshow() {
  const ss = document.getElementById("slideshow");
  if (ss) ss.hidden = true;
  document.body.classList.remove("slideshow-open");
  if (slideState.timer) clearInterval(slideState.timer);
  slideState.timer = null;
  slideState.playing = false;
}

/* ---------- Kartlar ---------- */

function createPlaceCard(placeName, photos) {
  const card = document.createElement("div");
  card.className = "photo-card photo-card-clickable reveal";

  const img = document.createElement("img");
  img.src = photos[0].url;
  img.alt = placeName;
  card.appendChild(img);

  if (photos.length > 1) {
    const badge = document.createElement("span");
    badge.className = "photo-count-badge";
    badge.textContent = photos.length + " foto";
    card.appendChild(badge);
  }

  const info = document.createElement("div");
  info.className = "photo-card-info";

  const title = document.createElement("strong");
  title.className = "photo-card-place";
  title.textContent = placeName;
  info.appendChild(title);

  const hint = document.createElement("span");
  hint.className = "photo-card-credit";
  hint.textContent = "Galeriyi açmak için tıkla";
  info.appendChild(hint);

  card.appendChild(info);

  card.addEventListener("click", function () {
    openLightbox(placeName, photos, 0);
  });
  return card;
}

function createPlaceEmptyCard(placeName) {
  const card = document.createElement("div");
  card.className = "photo-card photo-card-empty reveal";

  const title = document.createElement("strong");
  title.className = "photo-card-place";
  title.textContent = placeName;
  card.appendChild(title);

  const note = document.createElement("span");
  note.className = "photo-card-credit";
  note.textContent = "Fotoğraf bulunamadı";
  card.appendChild(note);

  return card;
}

function setHeroBg(url) {
  const heroBg = document.getElementById("hero-bg");
  if (!heroBg) return;
  const img = new Image();
  img.onload = function () {
    heroBg.style.backgroundImage = "url('" + url + "')";
    heroBg.classList.add("loaded");
  };
  img.src = url;
}

function initHeroParallax() {
  const heroBg = document.getElementById("hero-bg");
  const heroContent = document.getElementById("hero-content");
  if (!heroBg || !heroContent) return;
  let ticking = false;
  function update() {
    const y = window.scrollY || window.pageYOffset || 0;
    // Foto yavaş kayar (parallax), yazı daha hızlı kayıp solar → sinematik.
    heroBg.style.transform = "translateY(" + (y * 0.4) + "px) scale(1.12)";
    heroContent.style.transform = "translateY(" + (y * -0.12) + "px)";
    heroContent.style.opacity = Math.max(0, 1 - y / 460);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

// Şehrin yerel saati (Open-Meteo'nun verdiği UTC ofsetiyle), canlı tik tak.
let clockTimer = null;
function cityClock(offsetSeconds) {
  const d = new Date(Date.now() + offsetSeconds * 1000);
  const p = function (n) { return String(n).padStart(2, "0"); };
  return p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + ":" + p(d.getUTCSeconds());
}

// Hero'ya canlı hava durumu + yerel saat rozetleri ekler.
async function initHeroMeta(city) {
  const meta = document.getElementById("hero-meta");
  if (!meta) return;
  const weather = await fetchWeather(city.lat, city.lng);
  const clockHtml =
    '<span class="hero-chip hero-clock">🕐 <span class="clock-time"></span> · yerel saat</span>';
  let weatherHtml = "";
  if (weather) {
    const w = weatherInfo(weather.code);
    weatherHtml = '<span class="hero-chip hero-weather">' + w.icon + " " +
      weather.temp + "°C · " + w.text + "</span>";
  }
  meta.innerHTML = weatherHtml + clockHtml;

  // Havaya göre canlı görsel efekt (yağmur/kar/güneş/sis/fırtına).
  if (weather) startWeatherFx(weather.code);

  const clockEl = meta.querySelector(".clock-time");
  // Hava verisi yoksa boylamdan kaba bir saat dilimi tahmini (15° = 1 saat).
  const offset = weather ? weather.offsetSeconds : Math.round(city.lng / 15) * 3600;
  function tick() { clockEl.textContent = cityClock(offset); }
  tick();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(tick, 1000);
  meta.classList.add("is-ready");
}

/* ---------- Havaya göre canlı efekt (hero üzerinde) ---------- */

function weatherFxType(code) {
  if (code === 0 || code === 1) return "sun";
  if (code === 2 || code === 3) return "clouds";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "thunder";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  return "none";
}

let weatherFxRaf = null;

function startWeatherFx(code) {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const type = weatherFxType(code);
  let canvas = document.getElementById("weather-fx");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "weather-fx";
    canvas.className = "weather-fx";
    hero.insertBefore(canvas, document.getElementById("hero-content"));
  }
  const ctx = canvas.getContext("2d");
  if (weatherFxRaf) cancelAnimationFrame(weatherFxRaf);

  let w = 0, h = 0;
  function resize() {
    w = canvas.width = hero.clientWidth;
    h = canvas.height = hero.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  if (type === "none") { ctx.clearRect(0, 0, w, h); return; }

  const heavy = (code === 65 || code === 67 || code === 82 || code >= 95 ||
    code === 75 || code === 86 || code === 73);
  const drops = [], flakes = [], clouds = [], fogBands = [];
  let flash = 0;

  function newDrop() {
    return { x: Math.random() * w, y: Math.random() * h, len: 9 + Math.random() * 14,
      sp: 8 + Math.random() * 7, a: 0.16 + Math.random() * 0.24 };
  }
  function newFlake() {
    return { x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2.4,
      sp: 0.6 + Math.random() * 1.3, ph: Math.random() * Math.PI * 2 };
  }

  if (type === "rain" || type === "thunder") {
    const n = heavy ? 220 : 130;
    for (let i = 0; i < n; i++) drops.push(newDrop());
  } else if (type === "snow") {
    const n = heavy ? 170 : 110;
    for (let i = 0; i < n; i++) flakes.push(newFlake());
  } else if (type === "clouds") {
    for (let i = 0; i < 4; i++) {
      clouds.push({ x: Math.random() * w, y: h * (0.08 + Math.random() * 0.32),
        r: 90 + Math.random() * 120, sp: 0.08 + Math.random() * 0.12,
        a: 0.05 + Math.random() * 0.06 });
    }
  } else if (type === "fog") {
    for (let i = 0; i < 4; i++) {
      fogBands.push({ y: h * (0.18 + i * 0.2), x: Math.random() * w, sp: 0.25 + Math.random() * 0.35 });
    }
  }

  function frame(now) {
    ctx.clearRect(0, 0, w, h);

    if (type === "rain" || type === "thunder") {
      ctx.lineWidth = heavy ? 1.5 : 1.1;
      ctx.lineCap = "round";
      drops.forEach(function (d) {
        d.y += d.sp;
        d.x += d.sp * 0.22;
        if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
        ctx.strokeStyle = "rgba(200,218,240," + d.a + ")";
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.22, d.y - d.len);
        ctx.stroke();
      });
      if (type === "thunder") {
        if (flash > 0) {
          ctx.fillStyle = "rgba(255,255,255," + (flash * 0.5) + ")";
          ctx.fillRect(0, 0, w, h);
          flash -= 0.045;
        } else if (Math.random() < 0.004) {
          flash = 1;
        }
      }
    } else if (type === "snow") {
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.85;
      flakes.forEach(function (f) {
        f.y += f.sp;
        f.x += Math.sin(f.ph + f.y * 0.02) * 0.7;
        if (f.y > h) { f.y = -4; f.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    } else if (type === "clouds") {
      clouds.forEach(function (c) {
        c.x += c.sp;
        if (c.x - c.r > w) c.x = -c.r;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, "rgba(255,255,255," + c.a + ")");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
      });
    } else if (type === "fog") {
      fogBands.forEach(function (b) {
        b.x += b.sp;
        if (b.x > w) b.x = -w;
        const g = ctx.createLinearGradient(b.x - w, 0, b.x, 0);
        g.addColorStop(0, "rgba(210,220,235,0)");
        g.addColorStop(0.5, "rgba(210,220,235,0.12)");
        g.addColorStop(1, "rgba(210,220,235,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, b.y - 75, w, 150);
      });
    } else if (type === "sun") {
      const t = now / 1000;
      const cx = w * 0.82, cy = h * 0.15, big = Math.max(w, h);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, big * 0.6);
      glow.addColorStop(0, "rgba(255,224,150,0.20)");
      glow.addColorStop(0.5, "rgba(255,210,120,0.05)");
      glow.addColorStop(1, "rgba(255,210,120,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.04);
      const rays = 9;
      for (let i = 0; i < rays; i++) {
        ctx.rotate(Math.PI * 2 / rays);
        const grad = ctx.createLinearGradient(0, 0, 0, -big);
        grad.addColorStop(0, "rgba(255,232,175,0.10)");
        grad.addColorStop(1, "rgba(255,232,175,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(16, 0);
        ctx.lineTo(70, -big);
        ctx.lineTo(-70, -big);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    weatherFxRaf = requestAnimationFrame(frame);
  }
  weatherFxRaf = requestAnimationFrame(frame);
}

function setupScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (el) { observer.observe(el); });
}

function showError(message) {
  const container = document.getElementById("photo-grid");
  const errorBox = document.createElement("div");
  errorBox.className = "error-message";
  errorBox.textContent = message;
  container.replaceWith(errorBox);
}

function cardFor(entry) {
  const photos = entry.result.photos;
  if (entry.result.error || !photos || photos.length === 0) {
    return createPlaceEmptyCard(entry.place.name);
  }
  return createPlaceCard(entry.place.name, photos);
}

function guideItem(ico, key, val) {
  return '<div class="guide-item"><span class="guide-ico">' + ico + "</span>" +
    '<span class="guide-k">' + key + "</span>" +
    '<span class="guide-v">' + val + "</span></div>";
}

async function renderCityPage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("city");
  const city = findCityBySlug(CITIES, slug);
  const heroTitle = document.getElementById("hero-title");
  const heroSub = document.getElementById("hero-sub");
  const grid = document.getElementById("photo-grid");

  if (!city) {
    heroTitle.textContent = "Şehir bulunamadı";
    showError("Geçersiz şehir. Ana sayfaya dönüp tekrar deneyin.");
    return;
  }

  pageCityName = city.name;
  heroTitle.textContent = city.name;
  heroSub.textContent = city.country + " · " + city.places.length + " gezilecek yer";
  initHeroParallax();
  initHeroMeta(city);

  const entries = await Promise.all(
    city.places.map(function (place) {
      return fetchCityPhotos(place.query, PHOTOS_PER_PLACE).then(function (result) {
        return { place: place, result: result };
      });
    })
  );

  // Kapak fotoğrafı: ilk önemli yerin (farklı bir karesi varsa onun) fotoğrafı.
  const firstWithPhoto = entries.find(function (e) {
    return e.result.photos && e.result.photos.length;
  });
  if (firstWithPhoto) {
    const fp = firstWithPhoto.result.photos;
    setHeroBg((fp[1] || fp[0]).url);
  }

  // Slayt gösterisi için tüm fotoğrafları (yer adıyla birlikte) topla.
  const allPhotos = [];
  entries.forEach(function (e) {
    if (e.result.photos) {
      e.result.photos.forEach(function (p) {
        allPhotos.push({ url: p.url, place: e.place.name });
      });
    }
  });
  const ssBtn = document.getElementById("ss-launch");
  if (ssBtn && allPhotos.length) {
    ssBtn.hidden = false;
    ssBtn.textContent = "▶ Slayt gösterisi (" + allPhotos.length + " foto)";
    ssBtn.addEventListener("click", function () { startSlideshow(allPhotos); });
  }

  // Yerleri kategoriye göre grupla.
  const byCategory = {};
  entries.forEach(function (entry) {
    const cat = entry.place.category || "Diğer";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(entry);
  });

  const order = CATEGORY_ORDER.slice();
  Object.keys(byCategory).forEach(function (cat) {
    if (order.indexOf(cat) === -1) order.push(cat);
  });

  grid.innerHTML = "";

  // Pratik gezi rehberi kartı (ülkeye göre).
  const guide = (typeof COUNTRY_GUIDE !== "undefined") ? COUNTRY_GUIDE[city.country] : null;
  if (guide) {
    const gsec = document.createElement("section");
    gsec.className = "guide-card reveal";
    gsec.innerHTML =
      '<h2 class="guide-title">🧭 ' + city.name + " Gezi Rehberi</h2>" +
      '<div class="guide-grid">' +
        guideItem("💶", "Para birimi", guide.currency) +
        guideItem("🗣️", "Dil", guide.language) +
        guideItem("🗓️", "En iyi mevsim", guide.season) +
        guideItem("🔌", "Priz tipi", guide.plug) +
      "</div>";
    grid.appendChild(gsec);
  }

  order.forEach(function (cat) {
    if (!byCategory[cat]) return;

    const section = document.createElement("section");
    section.className = "category-section";

    const heading = document.createElement("h2");
    heading.className = "category-title reveal";
    heading.textContent = cat;
    section.appendChild(heading);

    const inner = document.createElement("div");
    inner.className = "photo-grid-inner";
    byCategory[cat].forEach(function (entry, i) {
      const card = cardFor(entry);
      // Aynı satırdaki kartlar kademeli (stagger) belirsin.
      card.style.transitionDelay = Math.min(i * 0.06, 0.36) + "s";
      inner.appendChild(card);
    });
    section.appendChild(inner);

    grid.appendChild(section);
  });

  setupScrollReveal();
}

document.addEventListener("DOMContentLoaded", renderCityPage);
