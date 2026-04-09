// ============================================================
// PHOTOGRAPHY WEBSITE CONFIGURATION
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  // PHOTOGRAPHER INFO
  // ----------------------------------------------------------
  photographer: {
    name: 'Ukana Odpurev',
    tagline: 'Graduation & Portrait Photography',
    email: 'hello@yourdomain.com',
    instagram: '@yourhandle',
    location: 'Your City, State',
  },

  // ----------------------------------------------------------
  // CLOUDINARY
  // Cloud name from your Cloudinary dashboard.
  // Images must be named: graduation_1.jpg, portrait_1.jpg etc.
  // Upload 15 per category. Add more categories as you go.
  // ----------------------------------------------------------
  cloudinary: {
    cloudName: 'doailynuq',
    // Number of photos per category + which photo to use as the category cover
    categories: {
      graduation: { count: 15, cover: 7 },  // cover: which photo # to feature (1–15)
      portrait:   { count: 15, cover: 15 },
      wedding:    { count:  0, cover: 1 },
      cars:       { count:  0, cover: 1 },
      events:     { count:  0, cover: 1 },
      street:     { count:  0, cover: 1 },
    },
  },

  // ----------------------------------------------------------
  // ADOBE LIGHTROOM API
  // How to set up:
  //  1. Go to https://developer.adobe.com/console
  //  2. Create a new project → Add API → Lightroom
  //  3. Copy your Client ID (API Key) below
  //  4. Generate an OAuth 2.0 access token (see README below)
  //  5. Set demoMode: false
  //
  // NOTE: For production, move accessToken to a serverless
  // function (Netlify Function / Vercel) to keep it private.
  // ----------------------------------------------------------
  adobe: {
    apiKey:      'YOUR_ADOBE_API_KEY',      // Client ID from Adobe Console
    accessToken: 'YOUR_ACCESS_TOKEN',        // OAuth 2.0 Bearer Token
    catalogId:   'YOUR_CATALOG_ID',          // Auto-fetched if left blank
    apiBase:     'https://lr.adobe.io',
  },

  // ----------------------------------------------------------
  // DEMO MODE
  // Set to true to preview the site with sample photos
  // before connecting your Adobe Lightroom account.
  // ----------------------------------------------------------
  demoMode: true,

  // ----------------------------------------------------------
  // CLIENT GALLERIES
  //
  // Each key is a unique ID you choose — share a link like:
  //   https://yoursite.com/gallery.html?id=KEY
  //
  // albumId: the Lightroom album (project) ID for that client
  // ----------------------------------------------------------
  clients: {
    'sample-smith-2024': {
      name: 'Emily Smith',
      school: 'State University',
      degree: 'Bachelor of Science',
      year: '2024',
      albumId: 'LIGHTROOM_ALBUM_ID_HERE',
      // expiry: '2024-12-31',  // Optional: hide gallery after this date
    },
    'sample-jones-2024': {
      name: 'Marcus Jones',
      school: 'City College',
      degree: 'Bachelor of Arts',
      year: '2024',
      albumId: 'LIGHTROOM_ALBUM_ID_HERE_2',
    },
  },

};
