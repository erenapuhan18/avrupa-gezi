// Ziyaret edilen şehirleri localStorage'da tutar (pasaport & küre renklendirmesi için).
// Hem index.html (küre/harita) hem city.html (detay) tarafından yüklenir.
const VISITED_KEY = "avrupa_visited_v1";

function getVisitedCities() {
  try {
    const raw = window.localStorage.getItem(VISITED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function markCityVisited(slug) {
  if (!slug) return;
  const list = getVisitedCities();
  if (list.indexOf(slug) === -1) {
    list.push(slug);
    try {
      window.localStorage.setItem(VISITED_KEY, JSON.stringify(list));
    } catch (e) { /* yoksay */ }
  }
}

function unmarkCityVisited(slug) {
  const list = getVisitedCities().filter(function (s) { return s !== slug; });
  try {
    window.localStorage.setItem(VISITED_KEY, JSON.stringify(list));
  } catch (e) { /* yoksay */ }
}

// İşaretliyse kaldırır, değilse ekler. Yeni durumu (boolean) döner.
function toggleCityVisited(slug) {
  if (isCityVisited(slug)) {
    unmarkCityVisited(slug);
    return false;
  }
  markCityVisited(slug);
  return true;
}

function isCityVisited(slug) {
  return getVisitedCities().indexOf(slug) !== -1;
}
