// ============================================================
// MAIN.JS — scroll-snapping gallery
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  setupImageFade();
  setupNavSync();
  setupNavClicks();
  setupDrag();
  setupOverlayScale();
});

// Dynamically scale the paper overlay with viewport size
function setupOverlayScale() {
  const overlay = document.querySelector('.site-overlay');
  // Base reference resolution — scale is 1.0 at this size
  const BASE_W = 1440;
  const BASE_H = 900;

  const PADDING = 15; // px gap from screen edges

  function update() {
    const scaleW = window.innerWidth  / BASE_W;
    const scaleH = window.innerHeight / BASE_H;
    const scale  = Math.sqrt(scaleW * scaleH);

    // After scaling from top-left origin, offset by padding
    // so the visible paper never touches any screen edge
    overlay.style.transform = `translate(${PADDING}px, ${PADDING}px) scale(${scale})`;
  }

  update();
  window.addEventListener('resize', update);
}

// Apply photographer name from config
function applyConfig() {
  const p = CONFIG.photographer;
  const nameEl = document.querySelector('.site-name');
  if (nameEl) nameEl.textContent = p.name.toUpperCase();

  document.title = p.name + ' — Photography';

  document.querySelectorAll('a[href^="mailto"]').forEach(el => {
    el.href = 'mailto:' + p.email;
  });
}

// Fade images in once loaded
function setupImageFade() {
  document.querySelectorAll('.slide img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
}

// Keep nav active state in sync with vertical scroll position
function setupNavSync() {
  const container = document.getElementById('scrollContainer');
  const navItems  = document.querySelectorAll('.nav-item');

  container.addEventListener('scroll', () => {
    const idx = Math.round(container.scrollTop / window.innerHeight);
    navItems.forEach(n => n.classList.remove('active'));
    const active = document.querySelector(`.nav-item[data-index="${idx}"]`);
    if (active) active.classList.add('active');
  }, { passive: true });
}

function setupNavClicks() {
  // nav items are display only, no click behaviour
}

// Seamless infinite auto-scroll — always moves downward
function setupDrag() {
  const container = document.getElementById('scrollContainer');
  const total     = document.querySelectorAll('.slide').length;
  let current     = 0;

  // Clone the first slide and append it at the end
  // When we scroll into the clone it looks identical to slide 1,
  // then we silently reset to the real slide 1 position.
  const firstClone = container.querySelector('.slide').cloneNode(true);
  firstClone.id = 'slide-clone';
  container.appendChild(firstClone);

  // Block all manual scrolling
  const block = e => e.preventDefault();
  container.addEventListener('wheel',      block, { passive: false });
  container.addEventListener('touchmove',  block, { passive: false });
  container.addEventListener('touchstart', block, { passive: false });
  document.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','Space','PageUp','PageDown'].includes(e.code)) e.preventDefault();
  });

  function smoothScrollTo(target, duration) {
    const start     = container.scrollTop;
    const distance  = target - start;
    let startTime   = null;

    function ease(t) {
      // ease in-out cubic
      return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = start + distance * ease(progress);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function nextSlide() {
    current++;
    const targetTop = current * window.innerHeight;
    smoothScrollTo(targetTop, 1800); // 1800ms = slow glide

    if (current === total) {
      setTimeout(() => {
        container.scrollTo({ top: 0, behavior: 'instant' });
        current = 0;
      }, 1900);
    }
  }

  setInterval(nextSlide, 5000);
}
