// Foto-quiz "Burası neresi?": rastgele bir şehir fotoğrafı + 4 şık, skor tutulur.
let quizScore = { correct: 0, total: 0 };
let quizAnswer = null;
let quizBusy = false;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

async function nextQuestion() {
  if (quizBusy) return;
  quizBusy = true;

  const photoEl = document.getElementById("quiz-photo");
  const optsEl = document.getElementById("quiz-options");
  const fbEl = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("quiz-next");

  fbEl.textContent = "";
  fbEl.className = "quiz-feedback";
  nextBtn.hidden = true;
  optsEl.innerHTML = "";
  photoEl.classList.remove("loaded");
  photoEl.style.backgroundImage = "";
  photoEl.innerHTML = '<span class="quiz-loading">Fotoğraf yükleniyor…</span>';

  // Fotoğrafı olan rastgele bir şehir bul.
  let city = null, photos = null;
  for (let tries = 0; tries < 6; tries++) {
    const cand = CITIES[Math.floor(Math.random() * CITIES.length)];
    const res = await fetchCityPhotos(cand.query, 4);
    if (res.photos && res.photos.length) { city = cand; photos = res.photos; break; }
  }
  if (!city) {
    photoEl.innerHTML = '<span class="quiz-loading">Fotoğraf bulunamadı. Tekrar deneyin.</span>';
    nextBtn.hidden = false;
    quizBusy = false;
    return;
  }

  quizAnswer = city.slug;
  const photo = photos[Math.floor(Math.random() * photos.length)];
  const img = new Image();
  img.onload = function () {
    photoEl.style.backgroundImage = "url('" + photo.url + "')";
    photoEl.classList.add("loaded");
    photoEl.innerHTML = "";
  };
  img.onerror = function () { photoEl.innerHTML = '<span class="quiz-loading">Fotoğraf yüklenemedi.</span>'; };
  img.src = photo.url;

  // Şıklar: doğru şehir + 3 rastgele çeldirici, karışık.
  const distractors = shuffle(CITIES.filter(function (c) { return c.slug !== city.slug; })).slice(0, 3);
  const options = shuffle([city].concat(distractors));
  options.forEach(function (opt) {
    const btn = document.createElement("button");
    btn.className = "quiz-opt";
    btn.dataset.slug = opt.slug;
    btn.textContent = opt.name + " · " + opt.country;
    btn.addEventListener("click", function () { guess(opt.slug, btn); });
    optsEl.appendChild(btn);
  });

  quizBusy = false;
}

function guess(slug, btn) {
  const optsEl = document.getElementById("quiz-options");
  const fbEl = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("quiz-next");
  const buttons = optsEl.querySelectorAll(".quiz-opt");
  if (buttons[0] && buttons[0].disabled) return; // zaten cevaplandı

  buttons.forEach(function (b) {
    b.disabled = true;
    if (b.dataset.slug === quizAnswer) b.classList.add("correct");
  });

  quizScore.total++;
  const correctCity = CITIES.find(function (c) { return c.slug === quizAnswer; });
  if (slug === quizAnswer) {
    quizScore.correct++;
    fbEl.textContent = "✓ Doğru! " + correctCity.name + ", " + correctCity.country;
    fbEl.classList.add("ok");
  } else {
    btn.classList.add("wrong");
    fbEl.textContent = "✗ Yanlış. Doğru cevap: " + correctCity.name + ", " + correctCity.country;
    fbEl.classList.add("no");
  }
  document.getElementById("quiz-score").textContent =
    "Doğru: " + quizScore.correct + " / " + quizScore.total;
  nextBtn.hidden = false;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("quiz-next").addEventListener("click", nextQuestion);
  nextQuestion();
});
