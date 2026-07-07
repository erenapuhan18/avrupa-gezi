const PHOTO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchCityPhotos(query, count) {
  const cacheKey = getCacheKey(query + "_" + count + "_w1280");
  const cachedRaw = window.localStorage.getItem(cacheKey);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw);
    if (isCacheFresh(cached.timestamp, Date.now(), PHOTO_CACHE_TTL_MS)) {
      return { photos: cached.photos, error: null };
    }
  }

  let response;
  try {
    response = await fetch(buildCommonsSearchUrl(query, count));
  } catch (networkErr) {
    return { photos: [], error: classifyFetchError(null) };
  }

  if (!response.ok) {
    return { photos: [], error: classifyFetchError(response.status) };
  }

  const json = await response.json();
  const photos = mapCommonsResults(json);
  window.localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), photos: photos }));
  return { photos: photos, error: null };
}

const INFO_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 hafta

// Bir yerin tarihçe/özellik özetini Türkçe Vikipedi'den çeker (cache'li).
// Sonuç bulunamazsa null döner (null da cache'lenir ki tekrar denenmesin).
async function fetchPlaceInfo(searchQuery) {
  const cacheKey = "wiki_info_" + searchQuery.trim().toLowerCase();
  const cachedRaw = window.localStorage.getItem(cacheKey);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw);
    if (isCacheFresh(cached.timestamp, Date.now(), INFO_CACHE_TTL_MS)) {
      return cached.info;
    }
  }

  let response;
  try {
    response = await fetch(buildWikiInfoUrl(searchQuery));
  } catch (networkErr) {
    return null;
  }
  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  const info = mapWikiInfo(json);
  window.localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), info: info }));
  return info;
}

const WEATHER_CACHE_TTL_MS = 20 * 60 * 1000; // 20 dk (hava güncel kalsın)

// Şehrin anlık hava durumunu Open-Meteo'dan çeker (cache'li). Hata olursa null.
async function fetchWeather(lat, lng) {
  const cacheKey = "weather_" + lat + "_" + lng;
  const cachedRaw = window.localStorage.getItem(cacheKey);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw);
    if (isCacheFresh(cached.timestamp, Date.now(), WEATHER_CACHE_TTL_MS)) {
      return cached.weather;
    }
  }

  let response;
  try {
    response = await fetch(buildWeatherUrl(lat, lng));
  } catch (networkErr) {
    return null;
  }
  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  const weather = mapWeather(json);
  window.localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), weather: weather }));
  return weather;
}
