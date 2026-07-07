document.addEventListener("DOMContentLoaded", function () {
  const hint = document.getElementById("globe-hint");
  const api = initGlobe("globe-container");
  // api objesi doğrudan geçilir; map.js çağrı anında güncel api.project/focusCountry/
  // unfocus'u kullanır (bunlar küre yüklendikten sonra gerçek fonksiyonlarla değişir).
  const mapUI = createMapUI(api);

  api.onMapReady(function () {
    if (window.g2hide) window.g2hide();   // yeni küre sönsün, harita görünsün
    mapUI.show();
    document.body.classList.add("map-mode");
    hint.textContent = "Bir ülke seç · geri dönmek için yukarı kaydır";
  });

  api.onMapHidden(function () {
    mapUI.hide();
    document.body.classList.remove("map-mode");
    if (window.g2show) window.g2show();    // yukarı dönünce yeni küre geri gelsin
    hint.textContent = "Keşfetmek için aşağı kaydır ⌄";
  });

  api.onProjectionChange(function () {
    mapUI.reposition();
  });

  api.setScrollUpHandler(function () {
    return mapUI.scrollUp();
  });

  // İpucu metnine tıklamak da haritaya geçişi tetikler (mobil/erişilebilirlik).
  hint.style.pointerEvents = "auto";
  hint.style.cursor = "pointer";
  hint.addEventListener("click", function () {
    if (!document.body.classList.contains("map-mode")) {
      if (window.g2hide) window.g2hide();
      api.toMap();
    }
  });

  // globe_2'nin "Haritayı keşfet" butonu da haritaya geçirir
  const g2explore = document.getElementById("g2-explore");
  if (g2explore) {
    g2explore.addEventListener("click", function () {
      if (!document.body.classList.contains("map-mode")) {
        if (window.g2hide) window.g2hide();
        api.toMap();
      }
    });
  }

  setupSearch(api, mapUI);
  setupSurprise(api);
});

// "Beni şaşırt": küre hızla döner, ardından rastgele bir şehre ışınlanır.
function setupSurprise(api) {
  const btn = document.getElementById("surprise-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = "🎲 Işınlanıyor…";
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const go = function () {
      window.location.href = "city.html?city=" + encodeURIComponent(city.slug);
    };
    if (api.surprise) api.surprise(go);
    else go();
  });
}

// Harita üzerindeki arama: ülke/şehir yazınca anında sonuç, tıklayınca git/odaklan.
function setupSearch(api, mapUI) {
  const box = document.getElementById("map-search");
  const input = document.getElementById("map-search-input");
  const results = document.getElementById("map-search-results");
  if (!box || !input || !results) return;

  function norm(s) {
    return s.toLocaleLowerCase("tr")
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u");
  }

  function matches(query) {
    const nq = norm(query.trim());
    if (!nq) return [];
    const out = [];
    CITIES.forEach(function (c) {
      if (norm(c.name).indexOf(nq) !== -1) {
        out.push({ type: "city", name: c.name, sub: c.country, slug: c.slug });
      }
    });
    const seen = {};
    CITIES.forEach(function (c) {
      if (seen[c.country]) return;
      if (norm(c.country).indexOf(nq) !== -1) {
        seen[c.country] = true;
        out.push({ type: "country", name: c.country });
      }
    });
    return out.slice(0, 8);
  }

  function go(item) {
    if (item.type === "city") {
      window.location.href = "city.html?city=" + encodeURIComponent(item.slug);
    } else {
      input.value = "";
      render([]);
      if (!document.body.classList.contains("map-mode")) {
        api.toMap();
      }
      if (mapUI.openCountry) mapUI.openCountry(item.name);
    }
  }

  function render(items) {
    results.innerHTML = "";
    if (!items.length) {
      results.classList.remove("open");
      return;
    }
    items.forEach(function (it) {
      const row = document.createElement("button");
      row.className = "map-search-item";
      const sub = it.type === "city" ? it.sub : "ülke";
      row.innerHTML = '<span class="msi-name"></span><span class="msi-sub"></span>';
      row.querySelector(".msi-name").textContent = it.name;
      row.querySelector(".msi-sub").textContent = sub;
      row.addEventListener("click", function () { go(it); });
      results.appendChild(row);
    });
    results.classList.add("open");
  }

  input.addEventListener("input", function () {
    render(matches(input.value));
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const items = matches(input.value);
      if (items.length) go(items[0]);
    } else if (e.key === "Escape") {
      input.value = "";
      render([]);
      input.blur();
    }
  });
  document.addEventListener("click", function (e) {
    if (!box.contains(e.target)) render([]);
  });
}
