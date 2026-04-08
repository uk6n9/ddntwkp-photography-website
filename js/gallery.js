// ============================================================
// GALLERY PAGE — gallery.js
// ============================================================

// ---- State --------------------------------------------------
const state = {
  photos:   [],          // Array of photo objects from adobe-api.js
  selected: new Set(),   // IDs of selected photos
  lightbox: { open: false, index: 0 },
  allSelected: false,
};

// ---- Init ---------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  applyPhotographerBranding();
  const clientId = new URLSearchParams(window.location.search).get('id');
  const client   = clientId && CONFIG.clients[clientId];

  if (!client) {
    showError();
    return;
  }

  // Check expiry
  if (client.expiry && new Date(client.expiry) < new Date()) {
    showError('This gallery has expired. Please contact the photographer.');
    return;
  }

  populateHeader(client);
  showLoading();

  try {
    state.photos = await loadClientPhotos(client);
    renderGrid();
    showContent();
  } catch (err) {
    console.error('Failed to load photos:', err);
    showError('Could not load photos. Please try again or contact the photographer.');
  }
});

function applyPhotographerBranding() {
  const p = CONFIG.photographer;
  document.querySelectorAll('.nav-logo').forEach(el => el.textContent = p.name);
  document.title = 'Your Gallery · ' + p.name;
}

function populateHeader(client) {
  document.getElementById('galleryClientName').textContent = client.name;
  document.getElementById('galleryEvent').textContent = `${client.degree || 'Graduation'} · ${client.year || ''}`.trim().replace(/·\s*$/, '');
  document.getElementById('gallerySchool').textContent = client.school || '';
  document.title = `${client.name}'s Gallery · ${CONFIG.photographer.name}`;
}

// ---- State helpers ------------------------------------------
function showError(msg) {
  document.getElementById('galleryLoading').style.display = 'none';
  document.getElementById('galleryHeader').style.display  = 'none';
  const errEl = document.getElementById('galleryError');
  if (msg) errEl.querySelector('p').textContent = msg;
  errEl.style.display = 'flex';
}

function showLoading() {
  document.getElementById('galleryLoading').style.display = 'flex';
}

function showContent() {
  document.getElementById('galleryLoading').style.display  = 'none';
  document.getElementById('galleryContent').style.display  = 'block';
  document.getElementById('photoCount').textContent = `${state.photos.length} photo${state.photos.length !== 1 ? 's' : ''}`;
}

// ---- Grid rendering -----------------------------------------
function renderGrid() {
  const grid = document.getElementById('photoGrid');
  grid.innerHTML = '';

  state.photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card skeleton';
    card.dataset.id    = photo.id;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="photo-overlay">
        <div class="photo-checkbox" onclick="toggleSelect(event, '${photo.id}')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <button class="photo-dl-btn" title="Download" onclick="downloadSingle(event, ${index})">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6.5l3 3 3-3M1 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    // Lazy-load thumbnail
    card.addEventListener('click', (e) => {
      if (e.target.closest('.photo-checkbox') || e.target.closest('.photo-dl-btn')) return;
      openLightbox(index);
    });

    grid.appendChild(card);

    // Load thumbnail lazily
    loadThumbnail(card, photo);
  });
}

async function loadThumbnail(card, photo) {
  try {
    const url = await photo.getThumbnailUrl();
    const img = document.createElement('img');
    img.src = url;
    img.alt = photo.filename;
    img.loading = 'lazy';
    img.onload = () => card.classList.remove('skeleton');
    card.insertBefore(img, card.firstChild);
  } catch (e) {
    card.classList.remove('skeleton');
  }
}

// ---- Selection ----------------------------------------------
function toggleSelect(e, photoId) {
  e.stopPropagation();
  const card = document.querySelector(`.photo-card[data-id="${photoId}"]`);

  if (state.selected.has(photoId)) {
    state.selected.delete(photoId);
    card.classList.remove('selected');
  } else {
    state.selected.add(photoId);
    card.classList.add('selected');
  }

  updateSelectionUI();
}

function toggleSelectAll() {
  if (state.allSelected) {
    // Deselect all
    state.selected.clear();
    document.querySelectorAll('.photo-card').forEach(c => c.classList.remove('selected'));
    state.allSelected = false;
    document.getElementById('selectAllBtn').textContent = 'Select All';
  } else {
    // Select all
    state.photos.forEach(p => state.selected.add(p.id));
    document.querySelectorAll('.photo-card').forEach(c => c.classList.add('selected'));
    state.allSelected = true;
    document.getElementById('selectAllBtn').textContent = 'Deselect All';
  }
  updateSelectionUI();
}

function updateSelectionUI() {
  const count = state.selected.size;
  document.getElementById('selectedCount').textContent   = count;
  document.getElementById('downloadSelectedBtn').disabled = count === 0;

  // Keep lightbox select button in sync
  if (state.lightbox.open) {
    const photo = state.photos[state.lightbox.index];
    if (photo) syncLightboxSelectBtn(photo.id);
  }
}

// ---- Downloads ----------------------------------------------
async function downloadSingle(e, index) {
  e.stopPropagation();
  const photo = state.photos[index];
  if (!photo) return;
  await triggerDownload(photo);
}

async function downloadFromLightbox() {
  const photo = state.photos[state.lightbox.index];
  if (!photo) return;
  await triggerDownload(photo);
}

async function downloadSelected() {
  const photos = state.photos.filter(p => state.selected.has(p.id));
  if (!photos.length) return;
  if (photos.length === 1) { await triggerDownload(photos[0]); return; }
  await downloadAsZip(photos);
}

async function downloadAll() {
  if (!state.photos.length) return;
  if (state.photos.length === 1) { await triggerDownload(state.photos[0]); return; }
  await downloadAsZip(state.photos);
}

async function triggerDownload(photo) {
  try {
    const blob = await photo.getDownloadBlob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = photo.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error('Download failed:', err);
    alert('Download failed. Please try again.');
  }
}

async function downloadAsZip(photos) {
  if (typeof JSZip === 'undefined') {
    alert('ZIP library not loaded. Please check your internet connection.');
    return;
  }

  showDownloadModal('Preparing your photos…', 0, photos.length);
  const zip = new JSZip();

  for (let i = 0; i < photos.length; i++) {
    updateDownloadModal(`Packing ${i + 1} of ${photos.length}…`, i, photos.length);
    try {
      const blob = await photos[i].getDownloadBlob();
      zip.file(photos[i].filename, blob);
    } catch (err) {
      console.warn(`Failed to fetch ${photos[i].filename}:`, err);
    }
  }

  updateDownloadModal('Creating ZIP file…', photos.length, photos.length);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = 'graduation-photos.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  hideDownloadModal();
}

// ---- Download modal helpers ---------------------------------
function showDownloadModal(title, current, total) {
  document.getElementById('dlModalTitle').textContent = title;
  document.getElementById('dlModalSub').textContent   = `${current} of ${total} photos`;
  document.getElementById('dlProgressBar').style.width = '0%';
  document.getElementById('dlModal').classList.add('visible');
  document.getElementById('dlModalOverlay').style.opacity = '1';
  document.getElementById('dlModalOverlay').style.pointerEvents = 'all';
}

function updateDownloadModal(title, current, total) {
  document.getElementById('dlModalTitle').textContent  = title;
  document.getElementById('dlModalSub').textContent    = `${current} of ${total} photos`;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  document.getElementById('dlProgressBar').style.width = pct + '%';
}

function hideDownloadModal() {
  document.getElementById('dlModal').classList.remove('visible');
  document.getElementById('dlModalOverlay').style.opacity = '0';
  document.getElementById('dlModalOverlay').style.pointerEvents = 'none';
}

// ---- Lightbox -----------------------------------------------
function openLightbox(index) {
  state.lightbox.index = index;
  state.lightbox.open  = true;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  loadLightboxPhoto(index);
  updateLightboxNav();
}

function closeLightbox() {
  state.lightbox.open = false;
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  const newIndex = state.lightbox.index + dir;
  if (newIndex < 0 || newIndex >= state.photos.length) return;
  state.lightbox.index = newIndex;
  loadLightboxPhoto(newIndex);
  updateLightboxNav();
}

async function loadLightboxPhoto(index) {
  const photo  = state.photos[index];
  const img    = document.getElementById('lightboxImg');
  const spinner = document.getElementById('lightboxSpinner');

  img.classList.add('loading');
  spinner.classList.add('visible');

  document.getElementById('lightboxCounter').textContent = `${index + 1} / ${state.photos.length}`;
  syncLightboxSelectBtn(photo.id);

  try {
    const url = await photo.getFullUrl();
    img.src   = url;
    img.onload = () => {
      img.classList.remove('loading');
      spinner.classList.remove('visible');
    };
  } catch {
    spinner.classList.remove('visible');
  }
}

function updateLightboxNav() {
  document.getElementById('lightboxPrev').disabled = state.lightbox.index === 0;
  document.getElementById('lightboxNext').disabled = state.lightbox.index === state.photos.length - 1;
}

function syncLightboxSelectBtn(photoId) {
  const btn = document.getElementById('lightboxSelectBtn');
  if (state.selected.has(photoId)) {
    btn.textContent = 'Selected ✓';
    btn.classList.add('selected');
  } else {
    btn.textContent = 'Select';
    btn.classList.remove('selected');
  }
}

function toggleSelectFromLightbox() {
  const photo = state.photos[state.lightbox.index];
  if (!photo) return;
  toggleSelect({ stopPropagation: () => {} }, photo.id);
}

// ---- Keyboard navigation ------------------------------------
document.addEventListener('keydown', (e) => {
  if (!state.lightbox.open) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigateLightbox(-1);
  if (e.key === 'ArrowRight')  navigateLightbox(1);
  if (e.key === 's' || e.key === 'S') toggleSelectFromLightbox();
});
