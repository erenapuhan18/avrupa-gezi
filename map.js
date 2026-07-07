// Düz harita üzerinde ülke/şehir seçim katmanı.
// `api` globe.js tarafından sağlanır: api.project(lat,lng), api.focusCountry(cities),
// api.unfocus() — harita modunda koordinat→piksel ve kamera zoom'u için.
function createMapUI(api) {
  const overlay = document.getElementById("map-overlay");

  const groups = {};
  CITIES.forEach(function (city) {
    if (!groups[city.country]) {
      groups[city.country] = [];
    }
    groups[city.country].push(city);
  });

  let level = "country"; // "country" | "city"

  function cityMarked(slug) {
    return typeof isCityVisited === "function" && isCityVisited(slug);
  }

  let routeMode = false;
  const route = [];      // rota modunda seçilen şehirler (sıralı)
  const routePins = {};  // slug -> pin elemanı

  function center(cities) {
    let lat = 0, lng = 0;
    cities.forEach(function (c) {
      lat += c.lat;
      lng += c.lng;
    });
    return { lat: lat / cities.length, lng: lng / cities.length };
  }

  function makePin(name, lat, lng, isCountry, onClick) {
    const el = document.createElement("button");
    el.className = "map-pin " + (isCountry ? "is-country" : "is-city");
    el.dataset.lat = lat;
    el.dataset.lng = lng;
    el.innerHTML =
      '<span class="pin-dot"></span><span class="pin-label"></span>';
    el.querySelector(".pin-label").textContent = name;
    el.addEventListener("click", function (ev) {
      ev.stopPropagation();
      onClick();
    });
    return el;
  }

  // Üst üste gelen etiketleri dikey olarak iterek ayır (basit çakışma çözücü).
  // Pin kutusu: yatayda [x-w/2, x+w/2], dikeyde [y-h, y] (translate(-50%,-100%)).
  function deOverlap(items) {
    const GAP = 5;
    for (let iter = 0; iter < 10; iter++) {
      let moved = false;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          if (Math.abs(a.x - b.x) >= (a.w + b.w) / 2) continue;
          const top = Math.max(a.y - a.h, b.y - b.h);
          const bot = Math.min(a.y, b.y);
          const overlap = bot - top;
          if (overlap <= GAP) continue;
          const shift = (overlap + GAP) / 2;
          if (a.y <= b.y) { a.y -= shift; b.y += shift; }
          else { a.y += shift; b.y -= shift; }
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  function position() {
    if (routeMode) { positionRoute(); return; }
    const pins = Array.prototype.slice.call(overlay.querySelectorAll("[data-lat]"));
    const items = pins.map(function (el) {
      const p = api.project(parseFloat(el.dataset.lat), parseFloat(el.dataset.lng));
      return { el: el, x: p.x, y: p.y };
    });
    // Etiket boyutları konuma bağlı değil → bir kez ölç ve önbelleğe al (animasyonda reflow olmasın).
    items.forEach(function (it) {
      if (it.el._w === undefined) {
        const r = it.el.getBoundingClientRect();
        it.el._w = r.width;
        it.el._h = r.height;
      }
      it.w = it.el._w;
      it.h = it.el._h;
    });
    deOverlap(items);
    items.forEach(function (it) {
      it.el.style.left = it.x + "px";
      it.el.style.top = it.y + "px";
    });
  }

  function showCountries() {
    level = "country";
    overlay.innerHTML = "";
    Object.keys(groups).sort().forEach(function (country) {
      const c = center(groups[country]);
      const pin = makePin(country, c.lat, c.lng, true, function () {
        showCities(country);
      });
      pin.dataset.country = country;
      // Pasaportta en az bir şehri olan ülke farklı (yeşil) noktayla işaretli.
      if (groups[country].some(function (ct) { return cityMarked(ct.slug); })) {
        pin.classList.add("is-marked");
      }
      overlay.appendChild(pin);
    });
    position();
  }

  function backToCountries() {
    api.unfocus();      // haritayı Avrupa görünümüne geri zoomla
    showCountries();    // ülke pinleri zoom-out boyunca yeniden konumlanır
  }

  function showCities(country) {
    level = "city";
    overlay.innerHTML = "";

    const back = document.createElement("button");
    back.className = "map-back";
    back.textContent = "← Ülkeler";
    back.addEventListener("click", backToCountries);
    overlay.appendChild(back);

    groups[country].forEach(function (city) {
      const pin = makePin(city.name, city.lat, city.lng, false, function () {
        window.location.href = "city.html?city=" + encodeURIComponent(city.slug);
      });
      pin.dataset.slug = city.slug;
      if (cityMarked(city.slug)) pin.classList.add("is-marked"); // pasaporttaki şehir
      overlay.appendChild(pin);
    });
    position();
    api.focusCountry(groups[country]); // ülkeye zoom → şehirler arası açılır
  }

  // Pasaport değişince (kapanınca) görünür pinlerin işaretini güncelle.
  function refreshMarks() {
    overlay.querySelectorAll(".map-pin").forEach(function (pin) {
      let marked = false;
      if (pin.dataset.slug) {
        marked = cityMarked(pin.dataset.slug);
      } else if (pin.dataset.country && groups[pin.dataset.country]) {
        marked = groups[pin.dataset.country].some(function (c) { return cityMarked(c.slug); });
      }
      pin.classList.toggle("is-marked", marked);
    });
  }

  /* ---------- Rota planlayıcı ---------- */

  const SVG_NS = "http://www.w3.org/2000/svg";
  const routeSvg = document.createElementNS(SVG_NS, "svg");
  routeSvg.setAttribute("class", "route-svg");
  routeSvg.style.display = "none";
  document.body.appendChild(routeSvg);

  const routePanel = document.createElement("div");
  routePanel.className = "route-panel";
  routePanel.style.display = "none";
  document.body.appendChild(routePanel);

  const mapTools = document.createElement("div");
  mapTools.className = "map-tools";
  const routeToggle = document.createElement("button");
  routeToggle.className = "map-tool-btn route-toggle";
  routeToggle.innerHTML = "🧭 Rota planla";
  routeToggle.addEventListener("click", function () {
    if (routeMode) exitRoute(); else enterRoute();
  });
  mapTools.appendChild(routeToggle);
  const compareBtn = document.createElement("button");
  compareBtn.className = "map-tool-btn compare-toggle";
  compareBtn.innerHTML = "⚖️ Şehir kıyasla";
  compareBtn.addEventListener("click", openCompare);
  mapTools.appendChild(compareBtn);
  const passportBtn = document.createElement("button");
  passportBtn.className = "map-tool-btn passport-toggle";
  passportBtn.innerHTML = "📘 Pasaportum";
  passportBtn.addEventListener("click", openPassport);
  mapTools.appendChild(passportBtn);
  const quizBtn = document.createElement("button");
  quizBtn.className = "map-tool-btn quiz-toggle";
  quizBtn.innerHTML = "🎯 Burası neresi?";
  quizBtn.addEventListener("click", function () { window.location.href = "quiz.html"; });
  mapTools.appendChild(quizBtn);
  document.body.appendChild(mapTools);

  // İki şehir arası kuş uçuşu mesafe (km).
  function haversine(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180;
    const la2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function makeRoutePin(city) {
    const el = document.createElement("button");
    el.className = "route-pin";
    el.dataset.lat = city.lat;
    el.dataset.lng = city.lng;
    el.title = city.name;
    el.innerHTML =
      '<span class="rp-dot"></span><span class="rp-num"></span><span class="rp-name"></span>';
    el.querySelector(".rp-name").textContent = city.name;
    el.addEventListener("click", function (ev) {
      ev.stopPropagation();
      toggleRouteCity(city);
    });
    routePins[city.slug] = el;
    return el;
  }

  function toggleRouteCity(city) {
    const idx = route.findIndex(function (c) { return c.slug === city.slug; });
    if (idx === -1) route.push(city);
    else route.splice(idx, 1);
    redrawRoute();
  }

  function positionRoute() {
    // Rota pinleri tam koordinatta (çakışma çözmeden) dursun ki çizgiler otursun.
    Object.keys(routePins).forEach(function (slug) {
      const el = routePins[slug];
      const p = api.project(parseFloat(el.dataset.lat), parseFloat(el.dataset.lng));
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
    });
    redrawRoute();
  }

  function enterRoute() {
    routeMode = true;
    route.length = 0;
    level = "country";
    Object.keys(routePins).forEach(function (k) { delete routePins[k]; });
    document.body.classList.add("route-mode");
    routeToggle.innerHTML = "✕ Rotayı kapat";
    overlay.innerHTML = "";
    CITIES.forEach(function (city) { overlay.appendChild(makeRoutePin(city)); });
    routeSvg.style.display = "";
    routePanel.style.display = "";
    api.unfocus();   // Avrupa görünümüne çek (tüm şehirler görünür)
    position();
  }

  function exitRoute() {
    routeMode = false;
    route.length = 0;
    document.body.classList.remove("route-mode");
    routeToggle.innerHTML = "🧭 Rota planla";
    routeSvg.style.display = "none";
    routeSvg.innerHTML = "";
    routePanel.style.display = "none";
    showCountries();
  }

  function redrawRoute() {
    if (!routeMode) return;
    Object.keys(routePins).forEach(function (slug) {
      const el = routePins[slug];
      el.classList.remove("in-route");
      el.querySelector(".rp-num").textContent = "";
    });
    route.forEach(function (city, i) {
      const el = routePins[city.slug];
      if (el) {
        el.classList.add("in-route");
        el.querySelector(".rp-num").textContent = String(i + 1);
      }
    });

    const w = window.innerWidth;
    const h = window.innerHeight;
    routeSvg.setAttribute("width", w);
    routeSvg.setAttribute("height", h);
    routeSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
    const pts = route.map(function (c) { return api.project(c.lat, c.lng); });
    let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const bow = Math.min(len * 0.16, 80);
      const cx = mx + (-dy / len) * bow;
      const cy = my + (dx / len) * bow;
      d += "M " + a.x + " " + a.y + " Q " + cx + " " + cy + " " + b.x + " " + b.y + " ";
    }
    routeSvg.innerHTML =
      (d ? '<path d="' + d + '" class="route-path"/>' : "") +
      pts.map(function (p) {
        return '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" class="route-node"/>';
      }).join("");

    updateRoutePanel();
  }

  function updateRoutePanel() {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) total += haversine(route[i], route[i + 1]);
    let html = '<div class="route-head"><strong>🧭 Rotam</strong>' +
      '<button class="route-clear">Temizle</button></div>';
    if (!route.length) {
      html += '<p class="route-hint">Şehirlere tıklayarak rota oluştur — sırayla eklenir.</p>';
    } else {
      html += '<div class="route-list">' +
        route.map(function (c, i) {
          return '<span class="route-step">' + (i + 1) + ". " + c.name + "</span>";
        }).join('<span class="route-arrow">→</span>') +
        "</div>";
      html += '<div class="route-total">' + route.length + " şehir · ~" +
        Math.round(total).toLocaleString("tr-TR") + " km</div>";
    }
    routePanel.innerHTML = html;
    const clearBtn = routePanel.querySelector(".route-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () { route.length = 0; redrawRoute(); });
    }
  }

  /* ---------- Şehir kıyaslama ---------- */

  const COMPARE_CATEGORIES = [
    "Tarihi Yerler", "Müzeler & Sanat", "Dini Yapılar",
    "Meydanlar & Sokaklar", "Parklar & Doğa", "Modern & Eğlence", "Stadyumlar"
  ];

  const compareOverlay = document.createElement("div");
  compareOverlay.className = "compare-overlay";
  compareOverlay.style.display = "none";
  const sortedCities = CITIES.slice().sort(function (a, b) {
    return a.name.localeCompare(b.name, "tr");
  });
  const cityOptions = sortedCities.map(function (c) {
    return '<option value="' + c.slug + '">' + c.name + " (" + c.country + ")</option>";
  }).join("");
  compareOverlay.innerHTML =
    '<div class="compare-box">' +
      '<div class="compare-header"><strong>⚖️ Şehir Kıyaslama</strong>' +
        '<button class="compare-close" aria-label="Kapat">✕</button></div>' +
      '<div class="compare-selects">' +
        '<select class="compare-sel" id="cmp-a">' + cityOptions + "</select>" +
        '<span class="compare-vs">VS</span>' +
        '<select class="compare-sel" id="cmp-b">' + cityOptions + "</select>" +
      "</div>" +
      '<div class="compare-result" id="compare-result"></div>' +
    "</div>";
  document.body.appendChild(compareOverlay);

  compareOverlay.querySelector(".compare-close").addEventListener("click", closeCompare);
  compareOverlay.addEventListener("click", function (e) {
    if (e.target === compareOverlay) closeCompare();
  });
  compareOverlay.querySelector("#cmp-a").addEventListener("change", renderCompare);
  compareOverlay.querySelector("#cmp-b").addEventListener("change", renderCompare);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && compareOverlay.style.display !== "none") closeCompare();
  });

  function catCounts(city) {
    const m = {};
    COMPARE_CATEGORIES.forEach(function (c) { m[c] = 0; });
    city.places.forEach(function (p) {
      if (m[p.category] === undefined) m[p.category] = 0;
      m[p.category]++;
    });
    return m;
  }

  /* ---------- Pasaport & damga koleksiyonu ---------- */

  const passportOverlay = document.createElement("div");
  passportOverlay.className = "passport-overlay";
  passportOverlay.style.display = "none";
  passportOverlay.innerHTML = '<div class="passport-box"></div>';
  document.body.appendChild(passportOverlay);
  passportOverlay.addEventListener("click", function (e) {
    if (e.target === passportOverlay) closePassport();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && passportOverlay.style.display !== "none") closePassport();
  });

  function renderPassport() {
    const visited = (typeof getVisitedCities === "function") ? getVisitedCities() : [];
    const total = CITIES.length;
    const count = CITIES.filter(function (c) { return visited.indexOf(c.slug) !== -1; }).length;
    let html = '<div class="passport-header"><strong>📘 Pasaportum</strong>' +
      '<button class="passport-close" aria-label="Kapat">✕</button></div>';
    html += '<div class="passport-progress">' + count + " / " + total +
      " şehir işaretli</div>";
    html += '<div class="passport-bar"><span style="width:' +
      (count / total * 100) + '%"></span></div>';
    html += '<p class="passport-hint">İşaretlemek/çıkarmak için şehirlere tıkla.</p>';
    html += '<div class="passport-grid">';
    // İşaretlenenler en üstte, ardından alfabetik.
    const ordered = sortedCities.slice().sort(function (a, b) {
      const va = visited.indexOf(a.slug) !== -1;
      const vb = visited.indexOf(b.slug) !== -1;
      if (va !== vb) return va ? -1 : 1;
      return a.name.localeCompare(b.name, "tr");
    });
    ordered.forEach(function (c) {
      const v = visited.indexOf(c.slug) !== -1;
      html += '<button class="stamp ' + (v ? "stamped" : "") + '" data-slug="' +
        encodeURIComponent(c.slug) + '">' +
        '<span class="stamp-city">' + c.name + "</span>" +
        '<span class="stamp-country">' + c.country + "</span>" +
        '<span class="stamp-mark">' + (v ? "✓ işaretli" : "işaretle") + "</span>" +
        "</button>";
    });
    html += "</div>";
    passportOverlay.querySelector(".passport-box").innerHTML = html;
    passportOverlay.querySelector(".passport-close")
      .addEventListener("click", closePassport);
    passportOverlay.querySelectorAll(".stamp").forEach(function (el) {
      el.addEventListener("click", function () {
        if (typeof toggleCityVisited === "function") {
          toggleCityVisited(decodeURIComponent(el.dataset.slug));
          renderPassport();
        }
      });
    });
  }

  function openPassport() {
    renderPassport();
    passportOverlay.style.display = "flex";
  }

  function closePassport() {
    passportOverlay.style.display = "none";
    refreshMarks(); // haritadaki pinler pasaport değişikliğini yansıtsın
  }

  let compareInit = false;
  function openCompare() {
    const selA = compareOverlay.querySelector("#cmp-a");
    const selB = compareOverlay.querySelector("#cmp-b");
    // İlk açılışta iki farklı şehir seç (select'ler kendiliğinden ilk option'a düşer).
    if (!compareInit) {
      selA.value = sortedCities[0].slug;
      selB.value = sortedCities[1].slug;
      compareInit = true;
    }
    compareOverlay.style.display = "flex";
    renderCompare();
  }

  function closeCompare() {
    compareOverlay.style.display = "none";
  }

  function renderCompare() {
    const slugA = compareOverlay.querySelector("#cmp-a").value;
    const slugB = compareOverlay.querySelector("#cmp-b").value;
    const A = CITIES.find(function (c) { return c.slug === slugA; });
    const B = CITIES.find(function (c) { return c.slug === slugB; });
    if (!A || !B) return;

    const ca = catCounts(A), cb = catCounts(B);
    let maxN = 1;
    COMPARE_CATEGORIES.forEach(function (c) { maxN = Math.max(maxN, ca[c], cb[c]); });
    const dist = Math.round(haversine(A, B)).toLocaleString("tr-TR");

    let html = '<div class="cmp-distance">📍 ' + A.name + " ↔ " + B.name +
      " · kuş uçuşu ~" + dist + " km</div>";
    html += '<div class="cmp-heads">' +
      '<div class="cmp-head cmp-a-col"><div class="cmp-city">' + A.name + "</div>" +
        '<div class="cmp-sub">' + A.country + " · " + A.places.length + " yer</div></div>" +
      '<div class="cmp-head cmp-b-col"><div class="cmp-city">' + B.name + "</div>" +
        '<div class="cmp-sub">' + B.country + " · " + B.places.length + " yer</div></div>" +
      "</div>";
    COMPARE_CATEGORIES.forEach(function (c) {
      const na = ca[c], nb = cb[c];
      const wa = (na / maxN * 100), wb = (nb / maxN * 100);
      html += '<div class="cmp-row">' +
        '<div class="cmp-bar-wrap cmp-left">' +
          '<span class="cmp-count">' + (na || "") + "</span>" +
          '<span class="cmp-bar cmp-bar-a" style="width:' + wa + '%"></span></div>' +
        '<div class="cmp-cat">' + c + "</div>" +
        '<div class="cmp-bar-wrap cmp-right">' +
          '<span class="cmp-bar cmp-bar-b" style="width:' + wb + '%"></span>' +
          '<span class="cmp-count">' + (nb || "") + "</span></div>" +
        "</div>";
    });
    compareOverlay.querySelector("#compare-result").innerHTML = html;
  }

  return {
    show: showCountries,
    openCountry: function (country) {
      if (groups[country]) showCities(country);
    },
    hide: function () {
      if (routeMode) exitRoute();
      overlay.innerHTML = "";
      level = "country";
    },
    reposition: position,
    scrollUp: function () {
      // Rota modundaysak önce ondan çık.
      if (routeMode) { exitRoute(); return false; }
      // Şehir seviyesindeysek önce ülkelere dön (küreye geçme).
      if (level === "city") {
        backToCountries();
        return false;
      }
      return true;
    }
  };
}
