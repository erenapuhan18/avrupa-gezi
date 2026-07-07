// globe2.js — yeni giriş küresi (globe_2.html'den uyarlandı).
// index.html'de globe.js'ten SONRA yüklenir; global THREE'yi kullanır.
// #globe2 (sahne) + #globe2-labels (şehir etiketleri) içine çizer.
// Mevcut küre→harita morph sistemi üstte kalır: aşağı kaydırınca bu küre söner
// (window.g2hide), yukarı dönünce geri gelir (window.g2show; intro.js çağırır).
(function () {
  if (typeof THREE === "undefined") return;
  const host = document.getElementById("globe2");
  const labelHost = document.getElementById("globe2-labels");
  if (!host || !labelHost) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = () => window.innerWidth, H = () => window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100);
  camera.position.set(0, 0, 13.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W(), H());
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  const R = 4;
  const COL_TEAL = new THREE.Color("#3FE0C5");
  const COL_CYAN = new THREE.Color("#7FF0E6");
  const COL_AMBER = new THREE.Color("#F2B65C");

  const world = new THREE.Group();
  scene.add(world);

  // solid dark globe
  world.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.992, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x070B14 })
  ));

  // graticule grid
  const gridMat = new THREE.LineBasicMaterial({ color: 0x16384A, transparent: true, opacity: .55 });
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = []; const phi = (90 - lat) * Math.PI / 180;
    for (let lon = 0; lon <= 360; lon += 4) { const th = lon * Math.PI / 180;
      pts.push(new THREE.Vector3(R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th))); }
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const pts = []; const th = lon * Math.PI / 180;
    for (let lat = -90; lat <= 90; lat += 4) { const phi = (90 - lat) * Math.PI / 180;
      pts.push(new THREE.Vector3(R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th))); }
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }

  // atmosphere rim glow
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.16, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
      uniforms: { c: { value: new THREE.Color("#2BBBA7") } },
      vertexShader: "varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "varying vec3 vN; uniform vec3 c; void main(){ float i=pow(.62-dot(vN,vec3(0.,0.,1.)),3.2); gl_FragColor=vec4(c,1.0)*clamp(i,0.,1.)*1.1; }"
    })
  ));

  function ll(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  }

  const cities = {
    istanbul:[41.0,28.98], london:[51.5,-0.12], newyork:[40.7,-74.0], tokyo:[35.68,139.69],
    paris:[48.85,2.35], lagos:[6.52,3.37], mumbai:[19.07,72.87], saopaulo:[-23.55,-46.63],
    sydney:[-33.86,151.2], cairo:[30.04,31.23], berlin:[52.52,13.4], mexico:[19.43,-99.13],
    nairobi:[-1.29,36.82], seoul:[37.56,126.97], la:[34.05,-118.24], buenos:[-34.6,-58.38],
    singapore:[1.35,103.82], toronto:[43.65,-79.38], bangkok:[13.75,100.5], reykjavik:[64.13,-21.9],
    capetown:[-33.92,18.42], dubai:[25.2,55.27], chicago:[41.88,-87.63], washington:[38.9,-77.04],
    atlanta:[33.75,-84.39], miami:[25.76,-80.19], sanfran:[37.77,-122.42], madrid:[40.42,-3.7],
    rome:[41.9,12.5], moscow:[55.75,37.62], delhi:[28.61,77.21], shanghai:[31.23,121.47],
    hongkong:[22.32,114.17], jakarta:[-6.21,106.85], accra:[5.6,-0.19], lima:[-12.05,-77.04],
    auckland:[-36.85,174.76], dublin:[53.35,-6.26], nuuk:[64.18,-51.69]
  };
  const names = {
    istanbul:"İstanbul", london:"London", newyork:"New York", tokyo:"Tokyo", paris:"Paris",
    lagos:"Lagos", mumbai:"Mumbai", saopaulo:"São Paulo", sydney:"Sydney", cairo:"Cairo",
    berlin:"Berlin", mexico:"Mexico City", nairobi:"Nairobi", seoul:"Seoul", la:"Los Angeles",
    buenos:"Buenos Aires", singapore:"Singapore", toronto:"Toronto", bangkok:"Bangkok",
    reykjavik:"Reykjavík", capetown:"Cape Town", dubai:"Dubai", chicago:"Chicago",
    washington:"Washington DC", atlanta:"Atlanta", miami:"Miami", sanfran:"San Francisco",
    madrid:"Madrid", rome:"Rome", moscow:"Moscow", delhi:"Delhi", shanghai:"Shanghai",
    hongkong:"Hong Kong", jakarta:"Jakarta", accra:"Accra", lima:"Lima", auckland:"Auckland",
    dublin:"Dublin", nuuk:"Nuuk"
  };

  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6FE8D6, transparent: true, opacity: .8 });
  const nodes = {}, labels = {};
  for (const k in cities) {
    const p = ll(cities[k][0], cities[k][1], R * 1.002);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), nodeMat);
    m.position.copy(p); world.add(m); nodes[k] = m;
    const el = document.createElement("div");
    el.className = "citylabel";
    el.appendChild(document.createTextNode(names[k] || k));
    labelHost.appendChild(el); labels[k] = el;
  }

  const routes = [
    ["istanbul","london"],["istanbul","cairo"],["istanbul","dubai"],["istanbul","paris"],
    ["london","newyork"],["london","lagos"],["london","berlin"],["london","mumbai"],
    ["newyork","la"],["newyork","saopaulo"],["newyork","toronto"],["newyork","paris"],
    ["tokyo","seoul"],["tokyo","la"],["tokyo","singapore"],["tokyo","sydney"],
    ["paris","berlin"],["paris","cairo"],["lagos","nairobi"],["lagos","saopaulo"],
    ["mumbai","dubai"],["mumbai","singapore"],["mumbai","nairobi"],["cairo","nairobi"],
    ["saopaulo","buenos"],["saopaulo","mexico"],["sydney","singapore"],["bangkok","singapore"],
    ["bangkok","tokyo"],["mexico","la"],["reykjavik","london"],["reykjavik","toronto"],
    ["capetown","nairobi"],["capetown","saopaulo"],["dubai","singapore"],["seoul","la"],
    ["newyork","chicago"],["newyork","washington"],["newyork","miami"],["chicago","atlanta"],
    ["atlanta","miami"],["miami","saopaulo"],["miami","lima"],["sanfran","tokyo"],["sanfran","la"],
    ["madrid","london"],["madrid","saopaulo"],["rome","cairo"],["rome","berlin"],["moscow","berlin"],
    ["moscow","seoul"],["delhi","dubai"],["delhi","singapore"],["shanghai","tokyo"],["shanghai","singapore"],
    ["hongkong","singapore"],["hongkong","sydney"],["jakarta","singapore"],["accra","lagos"],
    ["lima","saopaulo"],["auckland","sydney"],["dublin","newyork"],["dublin","london"],
    ["nuuk","reykjavik"],["nuuk","toronto"],["washington","london"]
  ];

  const arcs = [];
  routes.forEach(([a, b]) => {
    const va = ll(cities[a][0], cities[a][1], R).normalize();
    const vb = ll(cities[b][0], cities[b][1], R).normalize();
    const omega = Math.acos(THREE.MathUtils.clamp(va.dot(vb), -1, 1));
    const lift = 0.18 + 0.42 * (omega / Math.PI);
    const N = 46, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const s1 = Math.sin((1 - t) * omega) / Math.sin(omega), s2 = Math.sin(t * omega) / Math.sin(omega);
      const p = new THREE.Vector3().addScaledVector(va, s1).addScaledVector(vb, s2).normalize();
      p.multiplyScalar(R * (1 + lift * Math.sin(Math.PI * t)));
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    world.add(new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, 0.012, 6, false),
      new THREE.MeshBasicMaterial({ color: COL_TEAL, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10),
      new THREE.MeshBasicMaterial({ color: COL_CYAN, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    world.add(pulse);
    arcs.push({ curve, pulse, t: Math.random(), speed: 0.05 + Math.random() * 0.06 });
  });

  // starfield
  const starGeo = new THREE.BufferGeometry(); const sv = [];
  for (let i = 0; i < 1100; i++) {
    const r = 26 + Math.random() * 22, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    sv.push(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sv, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8FA6BC, size: 0.05, transparent: true, opacity: .6 })));

  // featured city highlight
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.18, 32),
    new THREE.MeshBasicMaterial({ color: COL_AMBER, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
  world.add(ring);
  const flag = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), new THREE.MeshBasicMaterial({ color: COL_AMBER }));
  world.add(flag);

  // pointer drag
  let tx = 0.35, ty = -0.15, rx = 0.35, ry = -0.15, drag = false, px = 0, py = 0, idle = true;
  const el = renderer.domElement;
  el.style.cursor = "grab";
  function down(x, y) { drag = true; idle = false; px = x; py = y; el.style.cursor = "grabbing"; }
  function move(x, y) { if (!drag) return; ty += (x - px) * 0.005; tx += (y - py) * 0.005; tx = Math.max(-1.1, Math.min(1.1, tx)); px = x; py = y; }
  function up() { drag = false; el.style.cursor = "grab"; }
  el.addEventListener("mousedown", e => down(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", up);
  el.addEventListener("touchstart", e => down(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  el.addEventListener("touchmove", e => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  el.addEventListener("touchend", up);

  // rotating story (updates the #globe2-ui text + featured ring)
  const stories = [
    ["istanbul","İstanbul","Kahvehane kültürü buradan dünyaya açıldı, 1554."],
    ["newyork","New York","Hip-hop, Bronx'tan nehri aşıp yayıldı, 1973."],
    ["lagos","Lagos","Afrobeats artık haftada 40+ şehirde listelerde."],
    ["tokyo","Tokyo","City pop küresel çalma listelerine geri döndü."],
    ["paris","Paris","Yeni Dalga sineması dünyanın kurgusunu değiştirdi."],
    ["saopaulo","São Paulo","Bossa nova bu hatlar boyunca kuzeye süzüldü."],
    ["seoul","Seoul","Tasarım dili 6 kıtaya ihraç edildi."],
    ["capetown","Cape Town","Amapiano basları güney rotalarında dolaştı."]
  ];
  let si = 0, targetCity = "istanbul";
  const cityEl = document.getElementById("storyCity"), blurbEl = document.getElementById("storyBlurb");
  function tellStory() {
    const [key, name, blurb] = stories[si]; targetCity = key;
    if (cityEl && blurbEl) {
      cityEl.style.opacity = 0; blurbEl.style.opacity = 0;
      setTimeout(() => { cityEl.textContent = name; blurbEl.textContent = blurb; cityEl.style.opacity = 1; blurbEl.style.opacity = 1; }, 220);
    }
    si = (si + 1) % stories.length;
  }
  tellStory();
  if (!reduce) setInterval(tellStory, 4200);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta(), t = clock.elapsedTime;
    if (idle && !reduce) ty += dt * 0.08;
    rx += (tx - rx) * 0.06; ry += (ty - ry) * 0.06;
    world.rotation.x = rx; world.rotation.y = ry;

    arcs.forEach(a => {
      if (!reduce) a.t = (a.t + dt * a.speed) % 1;
      const p = a.curve.getPointAt(a.t); a.pulse.position.copy(p);
      a.pulse.material.opacity = 0.5 + 0.5 * Math.sin(t * 3 + a.t * 6);
    });

    const fp = nodes[targetCity].position;
    flag.position.copy(fp).multiplyScalar(1.01);
    ring.position.copy(fp).multiplyScalar(1.01);
    ring.lookAt(0, 0, 0);
    const pl = 1 + 0.12 * Math.sin(t * 3);
    ring.scale.set(pl, pl, pl);
    flag.material.opacity = 0.85;

    const w = W(), h = H();
    for (const k in labels) {
      const wp = nodes[k].getWorldPosition(new THREE.Vector3());
      const front = wp.z;
      const proj = wp.clone().project(camera);
      const x = (proj.x * 0.5 + 0.5) * w, y = (-proj.y * 0.5 + 0.5) * h;
      const lel = labels[k];
      let op = THREE.MathUtils.clamp((front + 0.6) / 2.2, 0, 1); op = op * op;
      if (op < 0.04) { lel.style.opacity = 0; }
      else { lel.style.opacity = op.toFixed(2); lel.style.left = x + "px"; lel.style.top = (y - 12) + "px"; }
      lel.classList.toggle("feat", k === targetCity);
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H());
  });

  // --- bridge to the existing globe→map scroll system ---
  const uiHost = document.getElementById("globe2-ui");
  window.g2show = function () { host.classList.remove("hidden"); labelHost.classList.remove("hidden"); if (uiHost) uiHost.classList.remove("hidden"); };
  window.g2hide = function () { host.classList.add("hidden"); labelHost.classList.add("hidden"); if (uiHost) uiHost.classList.add("hidden"); };
  // aşağı kaydırınca (haritaya gidişte) küreyi söndür; geri dönüşü intro.js (onMapHidden) yapar
  window.addEventListener("wheel", function (e) {
    if (!document.body.classList.contains("map-mode") && e.deltaY > 0) window.g2hide();
  }, { passive: true });
})();
