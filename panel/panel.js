import { extractAppIdFromUrl, fetchGameDetails, generateSteamLinks } from '../common/steamApi.js';

// Default Steam game to display (Apex Legends as example)
const DEFAULT_STEAM_URL = 'https://store.steampowered.com/app/1172470/Apex_Legends/';

// Extension state
let twitch = null;
let gameData = null;
let steamAppId = null;
let channelId = null;

// Initialize the extension
const init = async () => {
  // Initialize Twitch Helper
  twitch = window.Twitch ? window.Twitch.ext : null;
  
  if (!twitch) {
    showError('Could not initialize Twitch extension helper');
    return;
  }

  // Listen for authentication events
  twitch.onAuthorized(async (auth) => {
    channelId = auth.channelId;
    
    // Load saved game URL from config service or use default
    try {
      const config = await new Promise((resolve) => {
        twitch.configuration.onChanged(() => {
          resolve(twitch.configuration.broadcaster ? twitch.configuration.broadcaster.content : null);
        });
      });
      
      let savedSteamUrl = DEFAULT_STEAM_URL;
      if (config) {
        try {
          const parsedConfig = JSON.parse(config);
          if (parsedConfig.steamUrl) {
            savedSteamUrl = parsedConfig.steamUrl;
          }
        } catch (e) {
          console.error('Error parsing configuration:', e);
        }
      }
      
      // Load the game data
      await loadGameFromUrl(savedSteamUrl);
    } catch (error) {
      console.error('Error loading configuration:', error);
      showError('Failed to load extension configuration');
    }
  });

  // Set up UI event listeners
  document.getElementById('updateGame').addEventListener('click', updateGameFromInput);
  document.getElementById('steamUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') updateGameFromInput();
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

// Update game from the input field
const updateGameFromInput = async () => {
  const steamUrlInput = document.getElementById('steamUrl');
  const newSteamUrl = steamUrlInput.value.trim();
  
  if (!newSteamUrl) {
    showError('Please enter a valid Steam URL');
    return;
  }
  
  // Save to configuration service if we're the broadcaster
  if (twitch && channelId) {
    try {
      twitch.configuration.set('broadcaster', channelId, JSON.stringify({
        steamUrl: newSteamUrl
      }));
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }
  
  await loadGameFromUrl(newSteamUrl);
};

// Render the game information in the UI
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
        <span>Released: ${releaseDate}</span>
        <span class="game-price">${price}</span>
      </div>
    </div>
    <div class="game-details">
      <div class="game-description">${gameData.short_description}</div>
      <div class="button-container">
        <a href="${steamLinks.wishlist}" target="_blank" class="steam-button">
          <img src="../assets/wishlist-icon.png" alt="Wishlist">
          Wishlist
        </a>
        <a href="${steamLinks.follow}" target="_blank" class="steam-button">
          <img src="../assets/follow-icon.png" alt="Follow">
          Follow
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
