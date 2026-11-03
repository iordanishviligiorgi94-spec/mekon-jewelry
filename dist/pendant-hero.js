/** Small, surface-anchored reflections over the approved front photograph. */
export function initPendantHero(reducedMotion) {
  const hero = document.querySelector('#top');
  const stage = document.querySelector('#pendant-stage');
  const photo = stage.querySelector('img');
  const canvas = document.querySelector('#pendant-sparkles');
  const toggle = document.querySelector('#motion-toggle');
  const context = canvas.getContext('2d');
  if (!context) return;

  // Normalized coordinates on the source image; never scatter outside the jewelry.
  const highlights = [
    {x:.778, y:.207, phase:0.00, radius:18, warm:false}, // Upper diamond
    {x:.363, y:.414, phase:0.08, radius:16, warm:false},
    {x:.714, y:.678, phase:0.16, radius:18, warm:false},
    {x:.207, y:.138, phase:0.24, radius:12, warm:true},
    {x:.413, y:.723, phase:0.32, radius:15, warm:false},
    {x:.673, y:.396, phase:0.40, radius:16, warm:false},
    {x:.366, y:.816, phase:0.48, radius:18, warm:false}, // Lower diamond
    {x:.395, y:.318, phase:0.56, radius:11, warm:true},
    {x:.688, y:.318, phase:0.64, radius:17, warm:false},
    {x:.325, y:.689, phase:0.72, radius:16, warm:false},
    {x:.891, y:.192, phase:0.80, radius:12, warm:true},
    {x:.561, y:.699, phase:0.88, radius:14, warm:false},
    {x:.508, y:.518, phase:0.96, radius:12, warm:true},
  ];
  let paused = reducedMotion.matches;
  let visible = false;
  let ready = false;
  let requestId = null;
  let previousTime = 0;
  let elapsed = 0;
  let lastPaint = -1;
  let size = 0;
  let ratio = 1;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;

  const updateToggle = () => {
    toggle.setAttribute('aria-label', paused ? 'მოძრაობისა და ბრწყინვის ჩართვა' : 'მოძრაობისა და ბრწყინვის შეჩერება');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
    stage.dataset.paused = String(paused);
  };

  function drawHighlight(point, strength) {
    const x = point.x * size, y = point.y * size;
    const radius = point.radius * size / 500 * (.65 + strength * .35);
    context.save();
    context.translate(x, y);
    context.globalAlpha = strength;
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius * .8);
    glow.addColorStop(0, 'rgba(255,255,255,.95)');
    glow.addColorStop(.18, point.warm ? 'rgba(255,244,206,.55)' : 'rgba(216,243,255,.6)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.rotate((point.warm ? 0 : .18) + Math.sin(elapsed * .3) * .08);
    const core = radius * .085;
    context.fillStyle = '#fff';
    context.beginPath();
    context.moveTo(0, -radius);
    context.quadraticCurveTo(core, -core, radius * .72, 0);
    context.quadraticCurveTo(core, core, 0, radius);
    context.quadraticCurveTo(-core, core, -radius * .72, 0);
    context.quadraticCurveTo(-core, -core, 0, -radius);
    context.fill();
    context.globalAlpha = strength * .45;
    context.rotate(Math.PI / 4);
    context.fillRect(-radius * .4, -.35, radius * .8, .7);
    context.fillRect(-.35, -radius * .4, .7, radius * .8);
    context.restore();
  }

  function draw() {
    context.clearRect(0, 0, size, size);
    if (paused || !ready) return;
    for (const point of highlights) {
      const phase = (elapsed / 8.6 + point.phase) % 1;
      if (phase >= .17) continue;
      const strength = Math.pow(Math.sin(phase / .17 * Math.PI), 2);
      drawHighlight(point, strength);
    }
  }

  function resize() {
    size = stage.clientWidth;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * ratio);
    canvas.height = Math.round(size * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function animate(time) {
    requestId = null;
    if (paused || !visible || !ready || document.hidden) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .06) : 0;
    previousTime = time;
    elapsed += delta;
    const smoothing = 1 - Math.exp(-delta * 3.8);
    pointerX += (targetX - pointerX) * smoothing;
    pointerY += (targetY - pointerY) * smoothing;
    const float = Math.sin(elapsed * .67) * 5;
    const turn = Math.sin(elapsed * .43) * .8;
    // Both layers share this transform; the white image itself blends with the wash.
    stage.style.setProperty('--pendant-transform', `perspective(1200px) translate3d(${pointerX * 5}px,${float + pointerY * 3}px,0) rotateX(${-pointerY * 3}deg) rotateY(${pointerX * 4}deg) rotate(${turn}deg)`);
    if (elapsed - lastPaint >= 1 / 30) { draw(); lastPaint = elapsed; }
    requestId = requestAnimationFrame(animate);
  }

  function stop() {
    if (requestId !== null) cancelAnimationFrame(requestId);
    requestId = null;
    previousTime = 0;
  }

  function resume() {
    if (!paused && visible && ready && !document.hidden && requestId === null) {
      previousTime = 0;
      requestId = requestAnimationFrame(animate);
    }
  }

  function setPaused(value) {
    paused = value;
    updateToggle();
    if (paused) { stop(); context.clearRect(0, 0, size, size); }
    else resume();
  }

  toggle.addEventListener('click', () => setPaused(!paused));
  reducedMotion.addEventListener('change', event => {
    setPaused(event.matches);
    if (event.matches) {
      targetX = targetY = pointerX = pointerY = 0;
      stage.style.removeProperty('--pendant-transform');
    }
  });
  hero.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
  }, {passive:true});
  hero.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : resume());
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? resume() : stop();
  }).observe(stage);
  new ResizeObserver(resize).observe(stage);

  const loaded = () => {
    if (!photo.naturalWidth) return;
    ready = true;
    resize();
    toggle.hidden = false;
    canvas.dataset.ready = 'true';
    resume();
  };
  photo.addEventListener('load', loaded, {once:true});
  if (photo.complete) loaded();
  updateToggle();
}
