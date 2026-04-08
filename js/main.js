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

function setupNavSync() {
  // no scroll sync needed with crossfade approach
}

function setupNavClicks() {
  // nav items are display only, no click behaviour
}

// Background video loops automatically via HTML attributes
function setupDrag() {}
