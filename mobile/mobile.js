import { extractAppIdFromUrl, fetchGameDetails, generateSteamLinks } from '../common/steamApi.js';

// Extension state
let twitch = null;
let gameData = null;
let steamAppId = null;

// Initialize the extension
const init = async () => {
  // Initialize Twitch Helper
  twitch = window.Twitch ? window.Twitch.ext : null;
  
  if (!twitch) {
    showError('Could not initialize Twitch extension helper');
    return;
  }

  // Listen for authentication events
  twitch.onAuthorized(async () => {
    // Listen for configuration changes
    twitch.configuration.onChanged(() => {
      if (twitch.configuration.broadcaster) {
        try {
          const config = JSON.parse(twitch.configuration.broadcaster.content);
          if (config.steamUrl) {
            loadGameFromUrl(config.steamUrl);
          }
        } catch (e) {
          console.error('Error parsing configuration:', e);
          showError('Failed to load extension configuration');
        }
      }
    });
  });
};

// Load game data from a Steam URL
const loadGameFromUrl = async (steamUrl) => {
  showLoading();
  
  steamAppId = extractAppIdFromUrl(steamUrl);
  if (!steamAppId) {
    showError('Invalid Steam URL');
    return;
  }
  
  gameData = await fetchGameDetails(steamAppId);
  if (!gameData) {
    showError('Could not load game data');
    return;
  }
  
  renderGameInfo();
};

// Render the game information in the UI (mobile-optimized)
const renderGameInfo = () => {
  if (!gameData) return;
  
  const gameInfoContainer = document.getElementById('gameInfo');
  const steamLinks = generateSteamLinks(steamAppId);
  
  const releaseDate = gameData.release_date?.date || 'Unknown';
  const price = gameData.is_free ? 'Free to Play' : 
    (gameData.price_overview ? gameData.price_overview.final_formatted : 'Price not available');
  
  gameInfoContainer.innerHTML = `
    <img class="game-image" src="${gameData.header_image}" alt="${gameData.name}">
    <div class="game-header">
      <div class="game-title">${gameData.name}</div>
      <div class="game-meta">
        <span>${releaseDate}</span>
        <span class="game-price">${price}</span>
      </div>
    </div>
    <div class="game-details">
      <div class="game-description">${gameData.short_description}</div>
      <div class="button-container">
        <a href="${steamLinks.wishlist}" target="_blank" class="steam-button">
          Wishlist
        </a>
        <a href="${steamLinks.follow}" target="_blank" class="steam-button">
          Follow
        </a>
        <a href="${steamLinks.store}" target="_blank" class="steam-button">
          View
        </a>
      </div>
    </div>
  `;
};

// Show loading state
const showLoading = () => {
  const gameInfoContainer = document.getElementById('gameInfo');
  gameInfoContainer.innerHTML = '<div class="loading">Loading game information...</div>';
};

// Show error message
const showError = (message) => {
  const gameInfoContainer = document.getElementById('gameInfo');
  gameInfoContainer.innerHTML = `<div class="error">${message}</div>`;
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
