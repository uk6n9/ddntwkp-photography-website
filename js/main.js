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
  const BASE_W  = 1440;
  const BASE_H  = 900;
  const PAD_X   = 24;
  // The overlay is at top:-60px with 85px padding before content.
  // On small screens the scale shrinks the padding, so content creeps above
  // the viewport. We compute the minimum translateY needed to keep it visible.
  const ELEM_TOP    = 60;  // absolute value of top:-60px
  const PAD_TOP     = 85;  // padding-top on the overlay
  const SAFE_MARGIN = 24;  // px breathing room from top edge

  function update() {
    const scale  = Math.sqrt((window.innerWidth / BASE_W) * (window.innerHeight / BASE_H));
    // Minimum Y so first text pixel sits at least SAFE_MARGIN below viewport top
    const minY   = Math.max(PAD_X, ELEM_TOP - (PAD_TOP * scale) + SAFE_MARGIN);
    overlay.style.transform  = `translate(${PAD_X}px, ${minY}px) scale(${scale})`;
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
