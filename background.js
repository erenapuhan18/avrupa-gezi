function initBackground() {
  const canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  let width, height;

  const STAR_COLORS = ["#ffffff", "#cfe3ff", "#9fc4ff", "#fff2cc", "#ffd9c2"];

  // Üç derinlik katmanı: uzak küçük/sönük, orta, yakın büyük/parlak.
  const layers = [
    { count: 0, density: 0.00032, size: [0.3, 1.0], speed: 0.2, alpha: 0.7, glow: false, par: 0.06, stars: [] },
    { count: 0, density: 0.00017, size: [0.7, 1.6], speed: 0.45, alpha: 0.9, glow: false, par: 0.14, stars: [] },
    { count: 0, density: 0.00008, size: [1.3, 2.7], speed: 0.8, alpha: 1.0, glow: true, par: 0.24, stars: [] }
  ];

  // Samanyolu benzeri çapraz bant: yoğun küçük yıldız kümesi.
  let bandStars = [];

  // Yumuşak renkli nebula bulutları (ekran oranına göre konumlanır).
  const nebulae = [
    { xr: 0.20, yr: 0.30, r: 0.55, color: "70,90,195", a: 0.16 },
    { xr: 0.80, yr: 0.22, r: 0.48, color: "155,70,175", a: 0.13 },
    { xr: 0.62, yr: 0.82, r: 0.52, color: "40,135,155", a: 0.11 },
    { xr: 0.42, yr: 0.55, r: 0.40, color: "95,60,165", a: 0.08 }
  ];

  const shootingStars = [];

  function makeStar(layer) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      tw: 0.5 + Math.random() * 0.5
    };
  }

  function build() {
    layers.forEach(function (layer) {
      layer.count = Math.round(width * height * layer.density);
      layer.stars = [];
      for (let i = 0; i < layer.count; i++) layer.stars.push(makeStar(layer));
    });

    // Bant: sol-üstten sağ-alta uzanan diyagonal şerit boyunca yıldızlar.
    bandStars = [];
    const bandCount = Math.round(width * height * 0.0002);
    for (let i = 0; i < bandCount; i++) {
      const t = Math.random();
      const cx = t * width;
      const cy = height * 0.15 + t * height * 0.7;
      const spread = height * 0.16;
      bandStars.push({
        x: cx + (Math.random() - 0.5) * spread * 2,
        y: cy + (Math.random() - 0.5) * spread,
        r: 0.3 + Math.random() * 0.8,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        tw: 0.4 + Math.random() * 0.5
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    build();
  }
  resize();
  window.addEventListener("resize", resize);

  function spawnShootingStar() {
    const startX = Math.random() * width * 0.7;
    const startY = Math.random() * height * 0.4;
    const angle = Math.PI * (0.18 + Math.random() * 0.12); // sağ-aşağı yönde
    const speed = 9 + Math.random() * 6;
    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 90 + Math.random() * 80,
      life: 0,
      maxLife: 60 + Math.random() * 30
    });
  }

  function drawNebulae(offsetY) {
    nebulae.forEach(function (n) {
      const cx = n.xr * width;
      const cy = n.yr * height - (offsetY || 0);
      const rad = n.r * Math.max(width, height);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, "rgba(" + n.color + "," + n.a + ")");
      g.addColorStop(1, "rgba(" + n.color + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function drawStar(s, time, baseAlpha, speedY, glow, parY) {
    s.y -= speedY;
    if (s.y < 0) {
      s.y = height;
      s.x = Math.random() * width;
    }
    let dy = s.y - (parY || 0);
    dy = ((dy % height) + height) % height;
    const twinkle = s.tw + (1 - s.tw) * Math.abs(Math.sin(time / 1100 + s.phase));
    ctx.globalAlpha = baseAlpha * twinkle;
    ctx.fillStyle = s.color;
    if (glow) {
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.r * 3.5;
    }
    ctx.beginPath();
    ctx.arc(s.x, dy, s.r, 0, Math.PI * 2);
    ctx.fill();
    if (glow) ctx.shadowBlur = 0;
  }

  function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const m = shootingStars[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life++;
      const fade = 1 - m.life / m.maxLife;
      if (fade <= 0 || m.x > width + 50 || m.y > height + 50) {
        shootingStars.splice(i, 1);
        continue;
      }
      const tailX = m.x - m.vx / Math.hypot(m.vx, m.vy) * m.len;
      const tailY = m.y - m.vy / Math.hypot(m.vx, m.vy) * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, "rgba(255,255,255," + fade + ")");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.4,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.72)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  function draw(time) {
    // Sayfa kaydırmasıyla parallax (giriş ekranı kaymadığı için orada 0).
    const scroll = window.scrollY || window.pageYOffset || 0;

    // Derinlik için dikey koyu degrade zemin (derin uzay — neredeyse siyah)
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#02030a");
    bg.addColorStop(1, "#04060f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    drawNebulae(scroll * 0.05);

    bandStars.forEach(function (s) {
      drawStar(s, time, 0.75, 0.05, false, scroll * 0.08);
    });

    layers.forEach(function (layer) {
      layer.stars.forEach(function (s) {
        drawStar(s, time, layer.alpha, layer.speed * 0.12, layer.glow, scroll * layer.par);
      });
    });
    ctx.globalAlpha = 1;

    if (Math.random() < 0.009) spawnShootingStar();
    drawShootingStars();

    drawVignette();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

document.addEventListener("DOMContentLoaded", initBackground);
