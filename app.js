// Initialize Universal Custom Plyr Engine Configuration
const player = new Plyr('#player', {
  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
  tooltips: { controls: true, seek: true }
});

// UI Target Nodes Selector Reference list
const animeGrid = document.getElementById('anime-grid');
const videoModal = document.getElementById('video-modal');
const closeVideoBtn = document.getElementById('close-video');
const videoElement = document.getElementById('player');
const searchInput = document.getElementById('search-input');
const redeemModal = document.getElementById('redeem-modal');
const couponInput = document.getElementById('coupon-code');
const redeemMessage = document.getElementById('redeem-message');
const premiumBtn = document.getElementById('premium-status-btn');
const premiumBadge = document.getElementById('badge-container');

// State Cache Values Tracking Control
let completeAnimeDataset = [];
let executionFilterType = 'all';

// Preserved Hardcoded Working Access Redeem Keys
const SECURE_PREMIUM_KEYS = ["ANISTREAM2026", "PREMIUMPASS", "OTAKUFREE"];

// Initialize Application Lifecycles
document.addEventListener("DOMContentLoaded", () => {
  fetchGlobalMediaCatalog();
  initializeActionListeners();
  verifySavedAccountTiers();
});

// Setup Events Core Registrations
function initializeActionListeners() {
  // Input live execution query filter binding
  searchInput.addEventListener('input', (e) => {
    executeFilterPipelines(e.target.value);
  });

  // Safe window-close execution sequence trigger
  closeVideoBtn.addEventListener('click', () => {
    videoModal.classList.add('hidden');
    player.stop();
    videoElement.removeAttribute('src');
  });
}

// Fetch Main Stream Lists via Public Open Wrapper Jikan Pipeline
async function fetchGlobalMediaCatalog() {
  try {
    animeGrid.innerHTML = `<div class="text-zinc-500 col-span-full text-center py-12 text-sm">Parsing master server index catalogs...</div>`;
    const response = await fetch('https://jikan.moe');
    const result = await response.json();
    completeAnimeDataset = result.data || [];
    executeFilterPipelines('');
  } catch (error) {
    console.error("Critical Catalog Parse Fault: ", error);
    animeGrid.innerHTML = `<p class="text-red-400 col-span-full text-center text-xs">Failed to communicate with catalog feeds. Try reloading.</p>`;
  }
}

// Global Search Filtering and Sorting Layer
function executeFilterPipelines(queryText) {
  const normalizedQuery = queryText.toLowerCase().trim();
  
  const processResult = completeAnimeDataset.filter(anime => {
    const matchesSearch = anime.title.toLowerCase().includes(normalizedQuery);
    const matchesType = (executionFilterType === 'all') || (anime.type?.toLowerCase() === executionFilterType);
    return matchesSearch && matchesType;
  });

  renderGridStructure(processResult);
}

// Render dynamic card containers onto screen framework
function renderGridStructure(dataset) {
  animeGrid.innerHTML = '';
  
  if (dataset.length === 0) {
    animeGrid.innerHTML = `<div class="text-zinc-600 col-span-full text-center py-12 text-sm">No items found matching the selected parameters.</div>`;
    return;
  }

  dataset.forEach(anime => {
    const streamSourceUrl = anime.trailer?.embed_url || "https://w3schools.com";
    const cardNode = document.createElement('div');
    cardNode.className = "bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-md cursor-pointer group hover:border-amber-500 transition-all flex flex-col justify-between";
    
    cardNode.innerHTML = `
      <div>
        <div class="relative aspect-[3/4] overflow-hidden bg-zinc-800">
          <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" loading="lazy">
          <div class="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-zinc-800">★ ${anime.score || '8.1'}</div>
        </div>
        <div class="p-3">
          <h3 class="font-bold text-sm truncate text-zinc-100 group-hover:text-amber-400 transition-colors">${anime.title}</h3>
          <p class="text-zinc-500 text-xs mt-0.5 uppercase tracking-wide font-semibold">${anime.type || 'TV'} • ${anime.duration || '24 min'}</p>
        </div>
      </div>
    `;

    cardNode.addEventListener('click', () => bootStreamingPlayer(streamSourceUrl));
    animeGrid.appendChild(cardNode);
  });
}

// Type Navigation Routing Filter Hooks
function filterType(typeKey) {
  executionFilterType = typeKey;
  document.getElementById('section-title').innerText = `${typeKey === 'all' ? 'Trending' : typeKey.toUpperCase()} Library`;
  executeFilterPipelines(searchInput.value);
}

// Upgraded Streaming Engine targeting a public Hindi/English Scraper Endpoint
async function bootStreamingPlayer(sourceUrl) {
  videoModal.classList.remove('hidden');
  
  // Show a helpful placeholder while the free API extracts the video links
  videoElement.poster = "https://unsplash.com";
  
  try {
    // For this free project, we use a public community AniWatch scraper router
    const publicScraperEndpoint = "https://vercel.app";
    
    // Fetch the real video stream link (.m3u8 or .mp4 format)
    const response = await fetch(publicScraperEndpoint);
    const data = await response.json();
    
    // Inject the real episode source into your Plyr video player canvas
    if (data.sources && data.sources.length > 0) {
      videoElement.src = data.sources.url; // Loads high-res server source
    } else {
      videoElement.src = "https://googleapis.com";
    }
    
    player.play();
  } catch (error) {
    console.error("Scraper Error, falling back to server default:", error);
    // Secure fallback: plays default test media if the public api server is busy
    videoElement.src = "https://googleapis.com";
    player.play();
  }
}


// Modal Layer View Toggles
function openRedeemModal() {
  redeemModal.classList.remove('hidden');
  redeemMessage.innerText = '';
  couponInput.value = '';
}

function closeRedeemModal() {
  redeemModal.classList.add('hidden');
}

// Redeem Code Validation Core Logic
function validateCouponCode() {
  const enteredCode = couponInput.value.toUpperCase().trim();
  
  if (SECURE_PREMIUM_KEYS.includes(enteredCode)) {
    localStorage.setItem('ANISTREAM_PREMIUM', 'true');
    applyPremiumAccessSettings();
    redeemMessage.className = "text-xs text-center font-bold text-emerald-400 mt-2";
    redeemMessage.innerText = "✓ Premium Unlocked Successfully!";
    setTimeout(closeRedeemModal, 1500);
  } else {
    redeemMessage.className = "text-xs text-center font-bold text-red-400 mt-2";
    redeemMessage.innerText = "✕ Invalid or expired structural redeem code.";
  }
}

// LocalStorage Persistent Verification Checks
function verifySavedAccountTiers() {
  if (localStorage.getItem('ANISTREAM_PREMIUM') === 'true') {
    applyPremiumAccessSettings();
  }
}

// Modify Layout elements relative to User Access Tiers
function applyPremiumAccessSettings() {
  premiumBtn.innerText = "👑 PREMIUM";
  premiumBtn.className = "whitespace-nowrap bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black px-4 py-2 rounded-lg text-xs tracking-wide shadow-lg cursor-default";
  premiumBtn.removeAttribute('onclick');
  premiumBadge.classList.remove('hidden');
}
