// ============================================================
// ADOBE LIGHTROOM API WRAPPER
// ============================================================
//
// Adobe Lightroom API docs:
//   https://developer.adobe.com/lightroom/lightroom-api-docs/
//
// To get credentials:
//   1. Go to https://developer.adobe.com/console
//   2. Create a project → Add API → Lightroom
//   3. Set up OAuth 2.0 (Authorization Code or Server-to-Server)
//   4. Copy the API Key and Access Token into config.js
//
// NOTE: For production use, proxy these API calls through a
// serverless function (Netlify Functions / Vercel Edge) to
// avoid exposing your access token in client-side code.
// ============================================================

class AdobeLightroomAPI {
  constructor({ apiKey, accessToken, catalogId, apiBase }) {
    this.apiKey       = apiKey;
    this.accessToken  = accessToken;
    this.catalogId    = catalogId;
    this.apiBase      = apiBase || 'https://lr.adobe.io';
  }

  // Default headers for every request
  get headers() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'X-API-Key':     this.apiKey,
      'Accept':        'application/json',
    };
  }

  // ---- Catalog ---------------------------------------------------

  // Get the first available catalog ID (call once, cache the result)
  async getCatalogId() {
    if (this.catalogId) return this.catalogId;

    const res = await fetch(`${this.apiBase}/v2/catalogs`, { headers: this.headers });
    if (!res.ok) throw new Error(`Adobe API error ${res.status}: ${res.statusText}`);

    const data = await res.json();
    const catalogs = data.resources || data.catalogs || [];
    if (!catalogs.length) throw new Error('No Lightroom catalogs found.');

    this.catalogId = catalogs[0].id;
    return this.catalogId;
  }

  // ---- Albums (Projects) ----------------------------------------

  // List all albums in the catalog
  async getAlbums() {
    const catalogId = await this.getCatalogId();
    const url = `${this.apiBase}/v2/catalogs/${catalogId}/albums?subtype=project&limit=100`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`Adobe API error ${res.status}`);
    const data = await res.json();
    return data.resources || [];
  }

  // ---- Assets ---------------------------------------------------

  // Get all assets (photos) in a specific album
  async getAlbumAssets(albumId) {
    const catalogId = await this.getCatalogId();
    let allAssets = [];
    let url = `${this.apiBase}/v2/catalogs/${catalogId}/albums/${albumId}/assets?limit=100&order_by=captureDate`;

    while (url) {
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Adobe API error ${res.status}`);
      const data = await res.json();
      const resources = data.resources || [];
      allAssets = allAssets.concat(resources);

      // Pagination: follow next link if present
      url = data.links && data.links.next ? this.apiBase + data.links.next.href : null;
    }

    return allAssets;
  }

  // ---- Renditions -----------------------------------------------

  // Rendition types: 'thumbnail2x' (fast preview), '2048' (lightbox), 'fullsize' (download)
  async fetchRenditionBlob(assetId, type = 'thumbnail2x') {
    const catalogId = await this.getCatalogId();
    const url = `${this.apiBase}/v2/catalogs/${catalogId}/assets/${assetId}/renditions/${type}`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`Rendition fetch error ${res.status}`);
    return res.blob();
  }

  // Convenience: get a blob URL for use in <img src="...">
  async getRenditionObjectUrl(assetId, type = 'thumbnail2x') {
    const blob = await this.fetchRenditionBlob(assetId, type);
    return URL.createObjectURL(blob);
  }

  // ---- Helpers --------------------------------------------------

  // Convert raw API asset into our internal photo object
  async buildPhotoObject(asset) {
    const id = asset.id;
    const filename = (asset.payload && asset.payload.importSource && asset.payload.importSource.fileName)
      || `photo-${id}.jpg`;

    // We build URL builders that fetch on-demand (lazy)
    return {
      id,
      filename,
      width:  asset.payload && asset.payload.develop && asset.payload.develop.croppedWidth,
      height: asset.payload && asset.payload.develop && asset.payload.develop.croppedHeight,
      // Lazy loaders — call these to get blob URLs
      getThumbnailUrl: () => this.getRenditionObjectUrl(id, 'thumbnail2x'),
      getFullUrl:      () => this.getRenditionObjectUrl(id, '2048'),
      getDownloadBlob: () => this.fetchRenditionBlob(id, 'fullsize'),
    };
  }
}

// ============================================================
// DEMO PHOTOS (used when CONFIG.demoMode = true)
// ============================================================
const DEMO_SEEDS = [
  'grad01','grad02','grad03','grad04','grad05','grad06',
  'grad07','grad08','grad09','grad10','grad11','grad12',
  'grad13','grad14','grad15','grad16','grad17','grad18',
];

function buildDemoPhotos(clientName = 'Sample') {
  return DEMO_SEEDS.map((seed, i) => ({
    id: `demo-${seed}`,
    filename: `${clientName.replace(/\s+/g,'-').toLowerCase()}-photo-${String(i+1).padStart(2,'0')}.jpg`,
    width: 800,
    height: 1200,
    getThumbnailUrl: () => Promise.resolve(`https://picsum.photos/seed/${seed}/400/600`),
    getFullUrl:      () => Promise.resolve(`https://picsum.photos/seed/${seed}/1200/1800`),
    getDownloadBlob: () => fetch(`https://picsum.photos/seed/${seed}/2400/3600`).then(r => r.blob()),
  }));
}

// Factory: returns photos for a given client config
async function loadClientPhotos(client) {
  if (CONFIG.demoMode) {
    return buildDemoPhotos(client.name);
  }

  const api = new AdobeLightroomAPI(CONFIG.adobe);
  const assets = await api.getAlbumAssets(client.albumId);
  return Promise.all(assets.map(a => api.buildPhotoObject(a)));
}
