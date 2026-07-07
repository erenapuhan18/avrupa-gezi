const assert = require("assert");
const { CITIES } = require("./cities.js");

function run() {
  assert.strictEqual(CITIES.length, 32, "CITIES should contain exactly 32 cities");

  const slugs = new Set();
  CITIES.forEach(function (city) {
    assert.ok(city.name && city.name.length > 0, "city.name must be non-empty");
    assert.ok(city.country && city.country.length > 0, "city.country must be non-empty");
    assert.ok(city.slug && /^[a-z]+$/.test(city.slug), "city.slug must be lowercase a-z: " + city.slug);
    assert.ok(city.query && city.query.length > 0, "city.query must be non-empty");
    assert.ok(typeof city.lat === "number" && city.lat >= 34 && city.lat <= 61, "city.lat must be a valid Europe latitude: " + city.slug);
    assert.ok(typeof city.lng === "number" && city.lng >= -10 && city.lng <= 40, "city.lng must be a valid longitude: " + city.slug);
    assert.ok(!slugs.has(city.slug), "duplicate slug: " + city.slug);
    slugs.add(city.slug);

    assert.ok(Array.isArray(city.places) && city.places.length >= 6, "city.places must have at least 6 entries: " + city.slug);
    const placeNames = new Set();
    city.places.forEach(function (place) {
      assert.ok(place.name && place.name.length > 0, "place.name must be non-empty in " + city.slug);
      assert.ok(place.query && place.query.length > 0, "place.query must be non-empty in " + city.slug);
      assert.ok(place.category && place.category.length > 0, "place.category must be non-empty in " + city.slug + ": " + place.name);
      assert.ok(!placeNames.has(place.name), "duplicate place name in " + city.slug + ": " + place.name);
      placeNames.add(place.name);
    });
  });

  console.log("cities.test.js: all assertions passed (" + CITIES.length + " cities)");
}

run();
