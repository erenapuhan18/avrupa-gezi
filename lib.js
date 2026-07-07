function getCacheKey(query) {
  return "unsplash_cache_" + query.trim().toLowerCase();
}

function isCacheFresh(timestamp, nowMs, ttlMs) {
  return (nowMs - timestamp) < ttlMs;
}

function buildCommonsSearchUrl(query, count) {
  return "https://commons.wikimedia.org/w/api.php" +
    "?action=query&generator=search&gsrnamespace=6" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrlimit=" + count +
    "&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280" +
    "&format=json&origin=*";
}

function stripHtmlTags(value) {
  return value.replace(/<[^>]*>/g, "").trim();
}

function mapCommonsResults(apiResponseJson) {
  if (!apiResponseJson || !apiResponseJson.query || !apiResponseJson.query.pages) {
    return [];
  }
  const pages = Object.values(apiResponseJson.query.pages);
  return pages
    .filter(function (page) {
      return page.imageinfo && page.imageinfo[0];
    })
    .filter(function (page) {
      return /\.(jpe?g|png)$/i.test(page.title);
    })
    .map(function (page) {
      const info = page.imageinfo[0];
      const extmeta = info.extmetadata || {};
      const artistRaw = extmeta.Artist && extmeta.Artist.value ? extmeta.Artist.value : "";
      const fileSlug = page.title.replace(/ /g, "_");
      return {
        // Yalnızca API'nin döndürdüğü geçerli thumb URL'i kullan (uydurma genişlik 400 verir).
        url: info.thumburl || info.url || "",
        alt: page.title.replace(/^File:/, "").replace(/\.[a-zA-Z]+$/, ""),
        photographerName: stripHtmlTags(artistRaw) || "Bilinmeyen",
        photographerLink: "https://commons.wikimedia.org/wiki/" + fileSlug
      };
    });
}

function classifyFetchError(status) {
  if (status === 429) return "rate_limit";
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

// Türkçe Vikipedi'de arayıp en iyi sonucun giriş özetini (tarihçe/özellik) getirir.
function buildWikiInfoUrl(query) {
  return "https://tr.wikipedia.org/w/api.php" +
    "?action=query&generator=search&gsrsearch=" + encodeURIComponent(query) +
    "&gsrlimit=1&prop=extracts|info&exintro=1&explaintext=1&inprop=url" +
    "&format=json&origin=*";
}

function mapWikiInfo(apiResponseJson) {
  if (!apiResponseJson || !apiResponseJson.query || !apiResponseJson.query.pages) {
    return null;
  }
  var pages = Object.values(apiResponseJson.query.pages);
  if (!pages.length) return null;
  var page = pages[0];
  if (!page.extract) return null;
  return {
    title: page.title || "",
    extract: page.extract,
    url: page.fullurl ||
      ("https://tr.wikipedia.org/wiki/" + encodeURIComponent((page.title || "").replace(/ /g, "_")))
  };
}

// Open-Meteo anlık hava durumu (API anahtarı gerektirmez, CORS açık, file://'den çalışır).
function buildWeatherUrl(lat, lng) {
  return "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + encodeURIComponent(lat) +
    "&longitude=" + encodeURIComponent(lng) +
    "&current=temperature_2m,weather_code&timezone=auto";
}

function mapWeather(apiResponseJson) {
  if (!apiResponseJson || !apiResponseJson.current) return null;
  var c = apiResponseJson.current;
  if (typeof c.temperature_2m !== "number") return null;
  return {
    temp: Math.round(c.temperature_2m),
    code: c.weather_code,
    offsetSeconds: apiResponseJson.utc_offset_seconds || 0
  };
}

// WMO hava kodu → ikon + Türkçe açıklama.
function weatherInfo(code) {
  var map = {
    0: ["☀️", "Açık"],
    1: ["🌤️", "Az bulutlu"],
    2: ["⛅", "Parçalı bulutlu"],
    3: ["☁️", "Bulutlu"],
    45: ["🌫️", "Sisli"],
    48: ["🌫️", "Kırağılı sis"],
    51: ["🌦️", "Hafif çisenti"],
    53: ["🌦️", "Çisenti"],
    55: ["🌦️", "Yoğun çisenti"],
    56: ["🌧️", "Donan çisenti"],
    57: ["🌧️", "Donan çisenti"],
    61: ["🌧️", "Hafif yağmur"],
    63: ["🌧️", "Yağmurlu"],
    65: ["🌧️", "Şiddetli yağmur"],
    66: ["🌧️", "Donan yağmur"],
    67: ["🌧️", "Donan yağmur"],
    71: ["🌨️", "Hafif kar"],
    73: ["🌨️", "Kar yağışlı"],
    75: ["❄️", "Yoğun kar"],
    77: ["🌨️", "Kar taneleri"],
    80: ["🌦️", "Hafif sağanak"],
    81: ["🌧️", "Sağanak"],
    82: ["⛈️", "Şiddetli sağanak"],
    85: ["🌨️", "Kar sağanağı"],
    86: ["🌨️", "Yoğun kar sağanağı"],
    95: ["⛈️", "Gök gürültülü fırtına"],
    96: ["⛈️", "Dolulu fırtına"],
    99: ["⛈️", "Şiddetli dolulu fırtına"]
  };
  var e = map[code] || ["🌡️", "—"];
  return { icon: e[0], text: e[1] };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getCacheKey,
    isCacheFresh,
    buildCommonsSearchUrl,
    mapCommonsResults,
    classifyFetchError,
    findCityBySlug,
    buildWikiInfoUrl,
    mapWikiInfo,
    buildWeatherUrl,
    mapWeather,
    weatherInfo
  };
}
