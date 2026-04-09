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
  const BASE_W = 1440;
  const BASE_H = 900;
  const PADDING = 15;

  function update() {
    const scale = Math.sqrt((window.innerWidth / BASE_W) * (window.innerHeight / BASE_H));
    overlay.style.transform = `translate(${PADDING}px, ${PADDING}px) scale(${scale})`;
    // Reveal only after correct scale is applied — prevents size-jump on load
    overlay.style.visibility = 'visible';
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

// ----------------------------------------------------------
// CLOUDINARY HELPERS
// ----------------------------------------------------------

// Returns the CDN URL for a single image
// e.g. cloudinaryUrl('graduation', 3) →
//   https://res.cloudinary.com/doailynuq/image/upload/q_auto,f_auto/graduation_3.jpg
function cloudinaryUrl(category, index) {
  const cloud = CONFIG.cloudinary.cloudName;
  return `https://res.cloudinary.com/${cloud}/image/upload/${category}_${index}.jpg`;
}

// Returns an array of all URLs for a category
function cloudinaryCategoryUrls(category) {
  const count = CONFIG.cloudinary.photosPerCategory;
  return Array.from({ length: count }, (_, i) => cloudinaryUrl(category, i + 1));
}

// Builds and injects <img> tags into a container element
function loadCloudinaryImages(category, containerEl, extraClass = '') {
  if (!CONFIG.cloudinary.categories[category]) return;
  cloudinaryCategoryUrls(category).forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.loading = 'eager';
    if (extraClass) img.className = extraClass;
    containerEl.appendChild(img);
  });
}
