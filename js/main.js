/* =============================================
   HERO CANVAS MESH
   ============================================= */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let particles = [];
  let W, H;
  let mouse = { x: -9999, y: -9999 };

  const COUNT       = 130;
  const MAX_DIST    = 170;
  const MOUSE_DIST  = 200;
  const REPEL_DIST  = 70;
  const GOLD        = '255,213,0';
  const WHITE       = '255,255,255';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.vx   = (Math.random() - 0.5) * 0.55;
    this.vy   = (Math.random() - 0.5) * 0.55;
    this.r    = Math.random() * 1.8 + 0.7;
    this.gold = Math.random() > 0.42;
  }

  Particle.prototype.update = function () {
    const dx   = this.x - mouse.x;
    const dy   = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_DIST && dist > 0) {
      const force = (MOUSE_DIST - dist) / MOUSE_DIST;
      if (dist < REPEL_DIST) {
        this.vx += (dx / dist) * force * 1.2;
        this.vy += (dy / dist) * force * 1.2;
      } else {
        this.vx -= (dx / dist) * force * 0.12;
        this.vy -= (dy / dist) * force * 0.12;
      }
    }

    this.vx *= 0.97;
    this.vy *= 0.97;

    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd < 0.08) {
      this.vx += (Math.random() - 0.5) * 0.12;
      this.vy += (Math.random() - 0.5) * 0.12;
    }

    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  Particle.prototype.draw = function () {
    const dx   = this.x - mouse.x;
    const dy   = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = dist < MOUSE_DIST ? (MOUSE_DIST - dist) / MOUSE_DIST : 0;

    if (glow > 0.25) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD},${glow * 0.18})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r + glow * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = this.gold
      ? `rgba(${GOLD},${0.72 + glow * 0.28})`
      : `rgba(${WHITE},${0.48 + glow * 0.3})`;
    ctx.fill();
  };

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      // Particle-to-particle connections
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_DIST) continue;
        const alpha = (1 - dist / MAX_DIST) * 0.38;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${GOLD},${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // Particle-to-mouse connections
      const mx   = particles[i].x - mouse.x;
      const my   = particles[i].y - mouse.y;
      const mdist = Math.sqrt(mx * mx + my * my);
      if (mdist < MOUSE_DIST) {
        const alpha = (1 - mdist / MOUSE_DIST) * 0.55;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(${GOLD},${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Mouse glow aura
    if (mouse.x > 0 && mouse.x < W) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
      grad.addColorStop(0, `rgba(${GOLD},0.1)`);
      grad.addColorStop(0.5, `rgba(${GOLD},0.04)`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(draw);
  }

  // Listen on hero section so canvas pointer-events:none stays intact
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  hero.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('touchend', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  draw();
})();

/* =============================================
   NAVBAR — scroll effect + hamburger
   ============================================= */

const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navDrawer = document.querySelector('.nav-drawer');
const navOverlay = document.querySelector('.nav-overlay');

// Transparent on hero, solid on scroll
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  });
}

// Hamburger toggle
function openDrawer() {
  hamburger?.classList.add('open');
  navDrawer?.classList.add('open');
  navOverlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  hamburger?.classList.remove('open');
  navDrawer?.classList.remove('open');
  navOverlay?.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeDrawer() : openDrawer();
});

navOverlay?.addEventListener('click', closeDrawer);

// Close drawer on nav link click
navDrawer?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* =============================================
   SCROLL REVEAL
   ============================================= */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Timeline items — fire one by one, not all at once */
const schedObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const items = Array.from(document.querySelectorAll('.sched-reveal'));
      const idx   = items.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 120);
      schedObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.sched-reveal').forEach(el => schedObserver.observe(el));

/* =============================================
   COUNTER ANIMATION
   ============================================= */

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* =============================================
   GRADE TABS (Academics page)
   ============================================= */

document.querySelectorAll('.grade-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const grade = tab.dataset.grade;

    document.querySelectorAll('.grade-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.grade-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.getElementById('grade-' + grade);
    if (panel) panel.classList.add('active');
  });
});

/* =============================================
   FAQ ACCORDION
   ============================================= */

document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const ans = item.querySelector('.faq-a');
  if (!btn || !ans) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = '0';
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

/* =============================================
   SCROLL TO TOP
   ============================================= */

(function () {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
