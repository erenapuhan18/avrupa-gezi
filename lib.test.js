const assert = require("assert");
const {
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
} = require("./lib.js");

function run() {
  assert.strictEqual(getCacheKey("Paris landmark"), "unsplash_cache_paris landmark");
  assert.strictEqual(getCacheKey("  Roma  "), "unsplash_cache_roma");

  assert.strictEqual(isCacheFresh(1000, 1500, 1000), true);
  assert.strictEqual(isCacheFresh(1000, 2500, 1000), false);

  assert.strictEqual(
    buildCommonsSearchUrl("Eiffel Tower", 12),
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=Eiffel%20Tower&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280&format=json&origin=*"
  );

  const sample = {
    query: {
      pages: {
        "111": {
          title: "File:Eiffel Tower at sunset.jpg",
          imageinfo: [
            {
              url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Eiffel_Tower_at_sunset.jpg",
              thumburl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Eiffel_Tower_at_sunset.jpg/800px-Eiffel_Tower_at_sunset.jpg",
              extmetadata: {
                Artist: { value: "<a href=\"//commons.wikimedia.org/wiki/User:JaneDoe\">Jane Doe</a>" }
              }
            }
          ]
        },
        "222": {
          title: "File:Empty.jpg",
          imageinfo: []
        }
      }
    }
  };
  const mapped = mapCommonsResults(sample);
  assert.strictEqual(mapped.length, 1);
  assert.strictEqual(
    mapped[0].url,
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Eiffel_Tower_at_sunset.jpg/800px-Eiffel_Tower_at_sunset.jpg"
  );
  assert.strictEqual(mapped[0].alt, "Eiffel Tower at sunset");
  assert.strictEqual(mapped[0].photographerName, "Jane Doe");
  assert.strictEqual(mapped[0].photographerLink, "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_at_sunset.jpg");
  assert.deepStrictEqual(mapCommonsResults({}), []);
  assert.deepStrictEqual(mapCommonsResults(null), []);

  assert.strictEqual(classifyFetchError(429), "rate_limit");
  assert.strictEqual(classifyFetchError(null), "network");
  assert.strictEqual(classifyFetchError(500), "unknown");

  const cities = [
    { name: "Paris", slug: "paris" },
    { name: "Roma", slug: "roma" }
  ];
  assert.strictEqual(findCityBySlug(cities, "paris").name, "Paris");
  assert.strictEqual(findCityBySlug(cities, "PARIS").name, "Paris");
  assert.strictEqual(findCityBySlug(cities, "berlin"), undefined);

  assert.strictEqual(
    buildWikiInfoUrl("Eyfel Kulesi"),
    "https://tr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=Eyfel%20Kulesi&gsrlimit=1&prop=extracts|info&exintro=1&explaintext=1&inprop=url&format=json&origin=*"
  );

  const wikiSample = {
    query: {
      pages: {
        "123": {
          title: "Eyfel Kulesi",
          fullurl: "https://tr.wikipedia.org/wiki/Eyfel_Kulesi",
          extract: "Eyfel Kulesi, Paris'te bulunan demir kafes kuledir."
        }
      }
    }
  };
  const wiki = mapWikiInfo(wikiSample);
  assert.strictEqual(wiki.title, "Eyfel Kulesi");
  assert.strictEqual(wiki.extract, "Eyfel Kulesi, Paris'te bulunan demir kafes kuledir.");
  assert.strictEqual(wiki.url, "https://tr.wikipedia.org/wiki/Eyfel_Kulesi");
  assert.strictEqual(mapWikiInfo({}), null);
  assert.strictEqual(mapWikiInfo(null), null);
  assert.strictEqual(mapWikiInfo({ query: { pages: { "1": { title: "X" } } } }), null);

  assert.strictEqual(
    buildWeatherUrl(48.8566, 2.3522),
    "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,weather_code&timezone=auto"
  );

  const weatherSample = {
    utc_offset_seconds: 7200,
    current: { time: "2026-06-24T15:00", temperature_2m: 14.7, weather_code: 3 }
  };
  const w = mapWeather(weatherSample);
  assert.strictEqual(w.temp, 15);
  assert.strictEqual(w.code, 3);
  assert.strictEqual(w.offsetSeconds, 7200);
  assert.strictEqual(mapWeather({}), null);
  assert.strictEqual(mapWeather(null), null);
  assert.strictEqual(mapWeather({ current: {} }), null);

  assert.strictEqual(weatherInfo(0).text, "Açık");
  assert.strictEqual(weatherInfo(95).icon, "⛈️");
  assert.strictEqual(weatherInfo(1234).text, "—");

  console.log("lib.test.js: all assertions passed");
}

run();
