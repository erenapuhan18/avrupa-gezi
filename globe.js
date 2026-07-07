const EARTH_TEXTURE_URL = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";

// Düz (equirectangular) harita yarı-boyutları: 12 x 6 birimlik 2:1 dünya haritası.
const FLAT_HALF_W = 6;
const FLAT_HALF_H = 3;

function flatX(lng) {
  return (lng / 180) * FLAT_HALF_W;
}

function flatY(lat) {
  return (lat / 90) * FLAT_HALF_H;
}

function vectorToLatLng(x, y, z) {
  const phi = Math.acos(Math.max(-1, Math.min(1, y)));
  const theta = Math.atan2(z, -x);
  const lat = 90 - (phi * 180) / Math.PI;
  let lng = (theta * 180) / Math.PI - 180;
  lng = ((lng + 180) % 360 + 360) % 360 - 180;
  return { lat: lat, lng: lng };
}

// (lat,lng) → küre üzerindeki birim/ölçekli konum. vectorToLatLng'in tersi:
// buildGlobeDots ile aynı eşlemeyi kullanır (şehir ışıklarını doğru yere koymak için).
function latLngToSphere(lat, lng, radius) {
  const la = lat * Math.PI / 180;
  const lo = lng * Math.PI / 180;
  return new THREE.Vector3(
    Math.cos(la) * Math.cos(lo) * radius,
    Math.sin(la) * radius,
    -Math.cos(la) * Math.sin(lo) * radius
  );
}

// Güneşin o tarihteki deklinasyonu (mevsimsel eğim): yazın kuzey, kışın güney
// yarımküre daha aydınlık olur. Yaklaşık formül, derece→radyan.
function solarDeclination(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return -23.44 * Math.PI / 180 * Math.cos(2 * Math.PI / 365 * (dayOfYear + 10));
}

// Güneşin tam tepede olduğu boylam (UTC öğlende 0°, her saatte 15° batıya kayar).
function subsolarLongitude(date) {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return -15 * (utcHours - 12);
}

// Yumuşak, yuvarlak parıltı dokusu (şehir ışıkları için additive nokta sprite'ı).
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  // Nötr beyaz parıltı: renk tonu noktanın vertex rengi (altın/ziyaret=yeşil) ile gelir.
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.30)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// Küre noktalarına gece-gündüz aydınlatması enjekte et (GPU'da, dönüşle birlikte
// terminatör yüzeyde gezinir). Gece tarafı kararır, terminatörde sıcak ton.
function applyDayNightShader(material, sunUniforms) {
  material.onBeforeCompile = function (shader) {
    shader.uniforms.uSunDir = sunUniforms.uSunDir;
    shader.uniforms.uNight = sunUniforms.uNight;
    shader.vertexShader =
      "varying float vDayNight;\nuniform vec3 uSunDir;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n vec3 _n = normalize(mat3(modelMatrix) * normalize(position + vec3(0.0001)));\n vDayNight = dot(_n, uSunDir);"
      );
    shader.fragmentShader =
      "varying float vDayNight;\nuniform float uNight;\n" +
      shader.fragmentShader.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\n float _day = smoothstep(-0.10, 0.18, vDayNight);\n float _bright = mix(0.17, 1.12, _day);\n diffuseColor.rgb *= mix(1.0, _bright, uNight);\n float _term = max(0.0, 1.0 - abs(vDayNight) / 0.20);\n diffuseColor.rgb += uNight * _term * vec3(0.34, 0.12, 0.02);"
      );
  };
}

// Şehir konumlarında, yalnızca gece tarafında ve kameraya bakan yüzde parlayan
// sıcak ışıklar (additive). Küre döndükçe ışıklar karanlığa girince yanar.
function buildCityLights(radius, sunUniforms) {
  const n = CITIES.length;
  const positions = new Float32Array(n * 3);
  const phases = new Float32Array(n);
  const colors = new Float32Array(n * 3);
  const visitedAvailable = (typeof isCityVisited === "function");
  CITIES.forEach(function (c, i) {
    const p = latLngToSphere(c.lat, c.lng, radius * 1.012);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    phases[i] = Math.random() * Math.PI * 2; // her şehir farklı fazda nabız atsın
    // Ziyaret edilen şehir yeşil, diğerleri altın sarısı.
    const visited = visitedAvailable && isCityVisited(c.slug);
    const col = visited ? [0.40, 1.0, 0.55] : [1.0, 0.82, 0.50];
    colors[i * 3] = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    vertexColors: true,
    size: 0.27,
    sizeAttenuation: true,
    map: makeGlowTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 1
  });
  mat.onBeforeCompile = function (shader) {
    shader.uniforms.uSunDir = sunUniforms.uSunDir;
    shader.uniforms.uCityFade = sunUniforms.uCityFade;
    shader.uniforms.uTime = sunUniforms.uTime;
    shader.vertexShader =
      "attribute float phase;\nvarying float vPhase;\nvarying float vDayNight;\nvarying float vFront;\nuniform vec3 uSunDir;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n vPhase = phase;\n vec3 _wn = normalize(mat3(modelMatrix) * normalize(position));\n vDayNight = dot(_wn, uSunDir);\n vFront = (modelViewMatrix * vec4(normalize(position), 0.0)).z;"
      );
    shader.fragmentShader =
      "varying float vPhase;\nvarying float vDayNight;\nvarying float vFront;\nuniform float uCityFade;\nuniform float uTime;\n" +
      shader.fragmentShader.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\n float _night = smoothstep(0.08, -0.28, vDayNight);\n float _front = smoothstep(-0.05, 0.20, vFront);\n float _glow = mix(0.45, 1.0, _night);\n float _pulse = 0.6 + 0.4 * sin(uTime * 2.2 + vPhase);\n diffuseColor.a *= _glow * _pulse * _front * uCityFade;"
      );
  };
  return new THREE.Points(geo, mat);
}

// Earth dokusundan örneklenen rengi kara/deniz olarak sınıflandırıp bölgeleri
// netleştir: karalar parlatılır, denizler belirgin ama geri planda kalan bir maviye sabitlenir.
function mapDotColor(c) {
  const r = c[0], g = c[1], b = c[2];
  const isLand = (r > 0.24) || (g > 0.26 && g >= b * 0.95);
  if (isLand) {
    return [
      Math.min(1, r * 1.5 + 0.18),
      Math.min(1, g * 1.45 + 0.2),
      Math.min(1, b * 1.1 + 0.06)
    ];
  }
  return [0.07, 0.14, 0.27];
}

function loadEarthSampler(onReady) {
  const fallback = function () {
    return [0.18, 0.34, 0.55];
  };
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      onReady(function sampleColor(lat, lng) {
        const u = ((lng + 180) / 360) * canvas.width;
        const v = ((90 - lat) / 180) * canvas.height;
        const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(u)));
        const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(v)));
        const idx = (y * canvas.width + x) * 4;
        return [data[idx] / 255, data[idx + 1] / 255, data[idx + 2] / 255];
      });
    } catch (err) {
      onReady(fallback);
    }
  };
  img.onerror = function () {
    onReady(fallback);
  };
  img.src = EARTH_TEXTURE_URL;
}

function buildGlobeDots(radius, count, sampleColor) {
  const positions = new Float32Array(count * 3);
  const spherePositions = new Float32Array(count * 3);
  const flatPositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const latLng = vectorToLatLng(x, y, z);

    spherePositions[i * 3] = x * radius;
    spherePositions[i * 3 + 1] = y * radius;
    spherePositions[i * 3 + 2] = z * radius;

    flatPositions[i * 3] = flatX(latLng.lng);
    flatPositions[i * 3 + 1] = flatY(latLng.lat);
    flatPositions[i * 3 + 2] = 0;

    positions[i * 3] = spherePositions[i * 3];
    positions[i * 3 + 1] = spherePositions[i * 3 + 1];
    positions[i * 3 + 2] = spherePositions[i * 3 + 2];

    const color = mapDotColor(sampleColor(latLng.lat, latLng.lng));
    colors[i * 3] = color[0];
    colors[i * 3 + 1] = color[1];
    colors[i * 3 + 2] = color[2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 1
  });
  const points = new THREE.Points(geometry, material);
  points.userData.spherePositions = spherePositions;
  points.userData.flatPositions = flatPositions;
  return points;
}

function europeBounds() {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  CITIES.forEach(function (c) {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  });
  return { minLat: minLat, maxLat: maxLat, minLng: minLng, maxLng: maxLng };
}

function boundsOf(cities) {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  cities.forEach(function (c) {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  });
  return { minLat: minLat, maxLat: maxLat, minLng: minLng, maxLng: maxLng };
}

function initGlobe(containerId) {
  const api = {
    _hooks: {},
    onMapReady: function (cb) { this._hooks.mapReady = cb; },
    onMapHidden: function (cb) { this._hooks.mapHidden = cb; },
    onProjectionChange: function (cb) { this._hooks.projectionChange = cb; },
    setScrollUpHandler: function (cb) { this._hooks.scrollUp = cb; },
    project: function () { return { x: 0, y: 0 }; },
    toMap: function () {},
    toGlobe: function () {},
    focusCountry: function () {},
    unfocus: function () {}
  };

  const container = document.getElementById(containerId);
  loadEarthSampler(function (sampleColor) {
    startScene(container, sampleColor, api);
  });
  return api;
}

function startScene(container, sampleColor, api) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  const GLOBE_DIR = new THREE.Vector3(0, 5, 7.5).normalize();
  const GLOBE_BASE_DIST = new THREE.Vector3(0, 5, 7.5).length(); // ~9.01
  const GLOBE_DOT_SIZE = 0.05;
  const GLOBE_REF_DIST = GLOBE_BASE_DIST;

  // Küre kamerası: portre (dik/telefon) ekranda küre yanlardan taşmasın diye
  // kamerayı geri çekip küreyi yatay genişliğe sığdırır.
  function globeCamPos() {
    let dist = GLOBE_BASE_DIST;
    if (camera.aspect < 1) {
      const vfov = 50 * Math.PI / 180;
      const need = (3 * 1.32) / (Math.tan(vfov / 2) * camera.aspect);
      dist = Math.max(dist, need);
    }
    return GLOBE_DIR.clone().multiplyScalar(dist);
  }

  camera.position.copy(globeCamPos());
  camera.lookAt(0, 0, 0);

  function flatDotSize(dist) {
    return GLOBE_DOT_SIZE * dist / GLOBE_REF_DIST;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const globeRadius = 3;

  // Gerçek zamanlı güneş: dünya çapında sabit yön (+x), tarihe göre mevsimsel
  // eğimle. Küre döndükçe gece-gündüz sınırı yüzeyde gezinir.
  const now = new Date();
  const decl = solarDeclination(now);
  const sunDir = new THREE.Vector3(Math.cos(decl), Math.sin(decl), 0).normalize();
  const sunUniforms = {
    uSunDir: { value: sunDir },
    uNight: { value: 1.0 },     // 1 = küre modu (aydınlatma açık), 0 = harita modu
    uTime: { value: 0 },        // şehir ışıklarının nabzı için geçen süre
    uCityFade: { value: 1.0 }   // şehir ışıkları yalnızca küre tam oluşunca belirsin
  };

  const globeGroup = new THREE.Group();
  const globeDots = buildGlobeDots(globeRadius, 50000, sampleColor);
  applyDayNightShader(globeDots.material, sunUniforms);
  globeGroup.add(globeDots);

  const cityLights = buildCityLights(globeRadius, sunUniforms);
  globeGroup.add(cityLights);

  // Açılışta, o anki gerçek güneş boylamı aydınlık tarafa denk gelsin.
  globeGroup.rotation.y = -subsolarLongitude(now) * Math.PI / 180;

  scene.add(globeGroup);

  // Gerçekçi düz harita: dünya uydu dokusuyla kaplı, equirectangular düzlem.
  // Noktalar küre→düz açılırken bu düzlem solarak (crossfade) gerçek haritaya geçilir.
  let mapTextureLoaded = false;
  const mapTexture = new THREE.TextureLoader().load(EARTH_TEXTURE_URL, function () {
    mapTextureLoaded = true;
  });
  mapTexture.encoding = THREE.sRGBEncoding;
  const mapPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(FLAT_HALF_W * 2, FLAT_HALF_H * 2),
    new THREE.MeshBasicMaterial({
      map: mapTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  mapPlane.position.set(0, 0, -0.03);
  scene.add(mapPlane);

  let mode = "globe"; // "globe" | "morphing" | "map"
  let mapBusy = false; // harita içi kamera animasyonu sürerken true
  let morphT = 0;
  let rotating = true;
  let lookTarget = new THREE.Vector3(0, 0, 0);
  let mapCamFn = europeViewCam; // harita modunda aktif kamera çerçevesi

  // Verilen coğrafi sınırları düz harita üzerinde çerçeveleyen kamera.
  function frameBounds(b, padFactor, minSpan) {
    const cx = flatX((b.minLng + b.maxLng) / 2);
    const cy = flatY((b.minLat + b.maxLat) / 2);
    const spanW = Math.max(flatX(b.maxLng) - flatX(b.minLng), minSpan);
    const spanH = Math.max(flatY(b.maxLat) - flatY(b.minLat), minSpan);
    const vFov = camera.fov * Math.PI / 180;
    const tan = Math.tan(vFov / 2);
    const aspect = container.clientWidth / container.clientHeight;
    const halfH = spanH * padFactor + 0.4;
    const halfW = spanW * padFactor + 0.4;
    const dist = Math.max(halfH / tan, halfW / (tan * aspect));
    return { pos: new THREE.Vector3(cx, cy, dist), look: new THREE.Vector3(cx, cy, 0) };
  }

  function europeViewCam() {
    // Avrupa'yı çevresindeki deniz/karayla birlikte göster.
    const cam = frameBounds(europeBounds(), 1.1, 0);
    // Telefon (dar/portre) ekranda Avrupa çok küçük kalıp ülkeler iç içe
    // giriyordu → yakınlaş, böylece ülkeler birbirinden ayrılır.
    if (container.clientWidth <= 600) {
      cam.pos.z *= 0.62;
    }
    return cam;
  }

  function countryViewCam(cities) {
    const cam = frameBounds(boundsOf(cities), 1.6, 0.2);
    const euroDist = europeViewCam().pos.z;
    // Ülkeye yakınlaş ama tek şehirli ülkelerde aşırı zoom yapma.
    cam.pos.z = Math.max(euroDist * 0.34, Math.min(euroDist * 0.72, cam.pos.z));
    return cam;
  }

  function applyMorph(t) {
    const pos = globeDots.geometry.attributes.position.array;
    const s = globeDots.userData.spherePositions;
    const f = globeDots.userData.flatPositions;
    for (let i = 0; i < pos.length; i++) {
      pos[i] = s[i] + (f[i] - s[i]) * t;
    }
    globeDots.geometry.attributes.position.needsUpdate = true;
  }

  function project(lat, lng) {
    // Kamera bu kareye henüz render edilmemiş olabilir; projeksiyon doğru olsun
    // diye dünya/ters-dünya matrislerini tazele.
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    const v = new THREE.Vector3(flatX(lng), flatY(lat), 0);
    v.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: (v.x * 0.5 + 0.5) * rect.width,
      y: (-v.y * 0.5 + 0.5) * rect.height
    };
  }
  api.project = project;

  // Harita modunda kamerayı yeni bir çerçeveye yumuşakça taşı; her karede
  // pinlerin yeniden konumlanması için projectionChange tetiklenir.
  function animateCameraTo(target, duration, onDone) {
    const startCam = camera.position.clone();
    const startLook = lookTarget.clone();
    const start = performance.now();
    mapBusy = true;

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      camera.position.lerpVectors(startCam, target.pos, e);
      const lk = new THREE.Vector3().lerpVectors(startLook, target.look, e);
      camera.lookAt(lk);
      lookTarget = lk;
      globeDots.material.size = flatDotSize(camera.position.z);
      if (api._hooks.projectionChange) api._hooks.projectionChange();
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        camera.position.copy(target.pos);
        camera.lookAt(target.look);
        lookTarget = target.look.clone();
        globeDots.material.size = flatDotSize(target.pos.z);
        if (api._hooks.projectionChange) api._hooks.projectionChange();
        mapBusy = false;
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(step);
  }

  api.focusCountry = function (cities) {
    if (mode !== "map" || mapBusy) return;
    mapCamFn = function () { return countryViewCam(cities); };
    animateCameraTo(mapCamFn(), 900);
  };

  api.unfocus = function () {
    if (mode !== "map" || mapBusy) return;
    mapCamFn = europeViewCam;
    animateCameraTo(mapCamFn(), 900);
  };

  function startMorph(toMap, onDone) {
    if (mode === "morphing" || mapBusy) return;
    if (toMap && mode !== "globe") return;
    if (!toMap && mode !== "map") return;

    mode = "morphing";
    rotating = false;
    if (toMap) mapCamFn = europeViewCam;

    const startT = morphT;
    const endT = toMap ? 1 : 0;
    const startCam = camera.position.clone();
    const startLook = lookTarget.clone();
    const target = toMap
      ? europeViewCam()
      : { pos: globeCamPos(), look: new THREE.Vector3(0, 0, 0) };
    const endCam = target.pos;
    const endLook = target.look;
    const startSize = globeDots.material.size;
    const endSize = toMap ? flatDotSize(endCam.z) : GLOBE_DOT_SIZE;
    const startRot = globeGroup.rotation.y;
    const endRot = toMap ? Math.round(startRot / (2 * Math.PI)) * 2 * Math.PI : startRot;
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      morphT = startT + (endT - startT) * e;
      applyMorph(morphT);
      globeDots.material.size = startSize + (endSize - startSize) * e;
      // Noktalar büyük ölçüde düzleşince gerçek haritaya crossfade.
      const planeOp = Math.min(1, Math.max(0, (morphT - 0.55) / 0.45));
      mapPlane.material.opacity = planeOp;
      globeDots.material.opacity = 1 - planeOp;
      camera.position.lerpVectors(startCam, endCam, e);
      camera.lookAt(new THREE.Vector3().lerpVectors(startLook, endLook, e));
      globeGroup.rotation.y = startRot + (endRot - startRot) * e;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        morphT = endT;
        applyMorph(endT);
        globeDots.material.size = endSize;
        mapPlane.material.opacity = toMap ? 1 : 0;
        globeDots.material.opacity = toMap ? 0 : 1;
        camera.position.copy(endCam);
        camera.lookAt(endLook);
        lookTarget = endLook.clone();
        if (toMap) {
          globeGroup.rotation.y = 0;
          mode = "map";
          if (api._hooks.mapReady) api._hooks.mapReady();
        } else {
          mode = "globe";
          rotating = true;
          if (api._hooks.mapHidden) api._hooks.mapHidden();
        }
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(step);
  }

  api.toMap = function () { startMorph(true); };
  api.toGlobe = function () { startMorph(false); };

  // "Beni şaşırt": küreyi hızlanarak birkaç tur döndür, sonra onDone'u çağır.
  api.spinBurst = function (onDone) {
    if (mode !== "globe" || mapBusy) { if (onDone) onDone(); return; }
    rotating = false;
    const startRot = globeGroup.rotation.y;
    const spins = Math.PI * 2 * 3.2; // ~3 tur
    const duration = 1300;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = t * t; // hızlanarak (ease-in)
      globeGroup.rotation.y = startRot + spins * e;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        rotating = true;
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(step);
  };

  // "Beni şaşırt": küre ekranındaysa hemen döndür; haritadaysa önce küreye geri
  // dön (morph), sonra döndür. Bitince onDone (rastgele şehre git) çağrılır.
  api.surprise = function (onDone) {
    if (mode === "morphing" || mapBusy) return;
    if (mode === "map") {
      startMorph(false, function () {
        api.spinBurst(onDone);
      });
    } else if (mode === "globe") {
      api.spinBurst(onDone);
    } else if (onDone) {
      onDone();
    }
  };

  // Animasyonsuz, doğrudan harita durumuna geç (ör. bir şehirden geri dönünce).
  function jumpToMap() {
    if (mode !== "globe") return;
    rotating = false;
    morphT = 1;
    applyMorph(1);
    mapCamFn = europeViewCam;
    const cam = europeViewCam();
    globeDots.material.size = flatDotSize(cam.pos.z);
    globeDots.material.opacity = 0;
    mapPlane.material.opacity = 1;
    camera.position.copy(cam.pos);
    camera.lookAt(cam.look);
    lookTarget = cam.look.clone();
    globeGroup.rotation.y = 0;
    mode = "map";
    if (api._hooks.mapReady) api._hooks.mapReady();
  }
  api.jumpToMap = jumpToMap;

  window.addEventListener("wheel", function (event) {
    if (mode === "morphing" || mapBusy) {
      event.preventDefault();
      return;
    }
    if (event.deltaY > 0 && mode === "globe") {
      event.preventDefault();
      startMorph(true);
    } else if (event.deltaY < 0 && mode === "map") {
      const allow = api._hooks.scrollUp ? api._hooks.scrollUp() : true;
      if (allow) {
        event.preventDefault();
        startMorph(false);
      }
    }
  }, { passive: false });

  // Dokunmatik (telefon/tablet): dikey kaydırma jesti = fare tekerleği karşılığı.
  // Yukarı kaydır → haritaya, aşağı kaydır → küreye/geri. Modal/araç çubuğu/arama
  // gibi kaydırılabilir alanlarda jest yoksayılır (morph tetiklenmesin).
  let touchStartY = null;
  window.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) { touchStartY = null; return; }
    const t = event.target;
    if (t && t.closest && t.closest(
      ".compare-overlay, .passport-overlay, .map-search, .map-tools, .route-panel, .map-back, .surprise-btn")) {
      touchStartY = null;
      return;
    }
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", function (event) {
    if (touchStartY === null) return;
    const endY = event.changedTouches[0] ? event.changedTouches[0].clientY : touchStartY;
    const dy = touchStartY - endY; // pozitif = parmak yukarı (içerik aşağı kaydı)
    touchStartY = null;
    if (Math.abs(dy) < 50) return;            // küçük dokunuş/kaydırma → yoksay
    if (mode === "morphing" || mapBusy) return;
    if (dy > 0 && mode === "globe") {
      startMorph(true);
    } else if (dy < 0 && mode === "map") {
      const allow = api._hooks.scrollUp ? api._hooks.scrollUp() : true;
      if (allow) startMorph(false);
    }
  }, { passive: true });

  function handleResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    if (mode === "map" && !mapBusy) {
      const cam = mapCamFn();
      camera.position.copy(cam.pos);
      camera.lookAt(cam.look);
      lookTarget = cam.look.clone();
      globeDots.material.size = flatDotSize(cam.pos.z);
    } else if (mode === "globe") {
      camera.position.copy(globeCamPos()); // portre/yön değişiminde küreyi sığdır
      camera.lookAt(0, 0, 0);
    }
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (mode === "map" && api._hooks.projectionChange) {
      api._hooks.projectionChange();
    }
  }
  window.addEventListener("resize", handleResize);

  function animate() {
    requestAnimationFrame(animate);
    if (rotating) {
      globeGroup.rotation.y += 0.0025;
    }
    // Harita moduna geçerken gece-gündüz aydınlatmasını söndür.
    sunUniforms.uNight.value = 1 - morphT;
    // Şehir ışıkları yalnızca küre neredeyse tam oluşunca (morph'un son ~%20'si)
    // belirsin; aksi halde küre içinde uçuşur gibi görünüyorlardı.
    sunUniforms.uCityFade.value = Math.max(0, 1 - morphT * 5);
    sunUniforms.uTime.value = performance.now() / 1000;
    renderer.render(scene, camera);
  }
  animate();

  // Bir şehirden "Haritaya dön" ile gelindiğinde doğrudan haritaya düş. Bayrak
  // sessionStorage'da; bir kez okunup silinir → sayfa yenilenince küre gelir.
  let wantMap = /[?&](harita|map)\b/.test(location.search); // eski bağlantılarla uyum
  try {
    if (window.sessionStorage && window.sessionStorage.getItem("avrupa_return_map") === "1") {
      wantMap = true;
      window.sessionStorage.removeItem("avrupa_return_map");
    }
  } catch (e) { /* yoksay */ }
  if (wantMap) {
    let tries = 0;
    const tryJump = function () {
      tries++;
      if (mapTextureLoaded || tries > 30) {
        jumpToMap();
      } else {
        setTimeout(tryJump, 50);
      }
    };
    tryJump();
  }
}
