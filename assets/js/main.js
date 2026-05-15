/* ============================================================
   Appogio — Main JavaScript
   ============================================================ */

/* --- Navbar scroll effect --- */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* --- Mobile menu --- */
const toggleBtn = document.querySelector('.nav-mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (toggleBtn && mobileMenu) {
  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const icon = toggleBtn.querySelector('svg');
    if (mobileMenu.classList.contains('open')) {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
    } else {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
    }
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* --- Scroll reveal animations --- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* --- Counter animation --- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();
  const decimals = target % 1 !== 0 ? 1 : 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const value = eased * target;
    el.textContent = prefix + value.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* --- Tabs --- */
document.querySelectorAll('.tabs').forEach(tabGroup => {
  const buttons = tabGroup.querySelectorAll('.tab-btn');
  const panels = tabGroup.closest('.tab-container')?.querySelectorAll('.tab-panel');
  if (!panels) return;
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      if (panels[i]) panels[i].classList.add('active');
    });
  });
});

/* --- Particle Canvas --- */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 160;
  const MOUSE = { x: -9999, y: -9999 };

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    MOUSE.x = e.clientX - rect.left;
    MOUSE.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { MOUSE.x = -9999; MOUSE.y = -9999; });

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      radius: Math.random() * 1.5 + .5,
      alpha: Math.random() * .5 + .2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repulsion
      const md = dist(p, MOUSE);
      if (md < 100) {
        const force = (100 - md) / 100;
        p.vx += (p.x - MOUSE.x) / md * force * .3;
        p.vy += (p.y - MOUSE.y) / md * force * .3;
        // clamp speed
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(136,64,200,${p.alpha * 0.5})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = dist(particles[i], particles[j]);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.10;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(136,64,200,${alpha})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
})();

/* --- Smooth active nav link (single-page sections) --- */
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => activeObserver.observe(s));
}

/* --- App cards — toda la tarjeta es clickeable --- */
document.querySelectorAll('.app-card').forEach(card => {
  const link = card.querySelector('.app-card-link');
  if (link) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
      if (!e.target.closest('a')) window.location.href = link.href;
    });
  }
});

/* --- Video placeholder click-to-play --- */
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrapper = btn.closest('.video-placeholder');
    const video = wrapper?.querySelector('video');
    if (video) {
      video.play();
      btn.closest('.play-btn-overlay')?.remove();
    }
  });
});
