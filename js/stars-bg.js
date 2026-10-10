/* 萤火虫发光树 · 背景动画 */
(function () {
  var canvas = document.getElementById('stars-bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, DPR;

  // ===== 背景星星 =====
  var stars = [];
  function buildStars() {
    stars = [];
    var count = Math.floor((W * H) / 9000);
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.7,
        r: Math.random() * 1.1 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random() * 1.5
      });
    }
  }

  function drawStars(time) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(time * 0.001 * s.sp + s.tw));
      ctx.fillStyle = 'rgba(200, 215, 255, ' + a + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== 萤火虫 =====
  var fireflies = [];
  function buildFireflies() {
    fireflies = [];
    var count = 20;
    for (var i = 0; i < count; i++) {
      var x = Math.random() * W;
      var y = Math.random() * H;
      fireflies.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.18,
        size: 1.2 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        freq: 0.001 + Math.random() * 0.0025,
        hue: 45 + Math.random() * 15 // 暖黄
      });
    }
  }

  function drawFireflies(time) {
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < fireflies.length; i++) {
      var f = fireflies[i];
      // 缓慢漂移
      f.x += f.vx;
      f.y += f.vy;
      // 微风扰动
      f.x += Math.sin(time * 0.0005 + f.phase) * 0.15;
      // 边界回弹
      if (f.x < 0 || f.x > W) f.vx *= -1;
      if (f.y < 0 || f.y > H * 0.85) f.vy *= -1;

      // 闪烁：正弦明暗
      var pulse = 0.5 + 0.5 * Math.sin(time * f.freq * Math.PI * 2 + f.phase);
      var alpha = 0.15 + pulse * 0.85;

      // 光晕
      var glowR = f.size * 6;
      var grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR);
      grad.addColorStop(0, 'hsla(' + f.hue + ', 100%, 75%, ' + (alpha * 0.9) + ')');
      grad.addColorStop(0.3, 'hsla(' + f.hue + ', 100%, 60%, ' + (alpha * 0.35) + ')');
      grad.addColorStop(1, 'hsla(' + f.hue + ', 100%, 50%, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // 亮核
      ctx.fillStyle = 'hsla(' + f.hue + ', 100%, 92%, ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ===== 背景渐变 =====
  function drawBackground() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#03061a');
    g.addColorStop(0.5, '#0a1230');
    g.addColorStop(1, '#141a2e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 底部地面微光
    var gg = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, H * 0.5);
    gg.addColorStop(0, 'rgba(80, 90, 140, 0.15)');
    gg.addColorStop(1, 'rgba(80, 90, 140, 0)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, W, H);
  }

  // ===== 主循环 =====
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars();
    buildFireflies();
  }

  var rafId = 0;
  function loop(time) {
    drawBackground();
    drawStars(time);
    drawFireflies(time);
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();

  // reduced-motion 兜底：只画一帧静态
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawBackground();
    drawStars(0);
    drawFireflies(1000);
  } else {
    rafId = requestAnimationFrame(loop);
  }
})();
