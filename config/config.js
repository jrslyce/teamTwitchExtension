import { extractAppIdFromUrl, fetchGameDetails, generateSteamLinks } from '../common/steamApi.js';

// Extension state
let twitch = null;
let channelId = null;
let savedSteamUrl = '';

// Initialize the extension
const init = async () => {
  // Initialize Twitch Helper
  twitch = window.Twitch ? window.Twitch.ext : null;
  
  if (!twitch) {
    showStatus('Could not initialize Twitch extension helper', 'error');
    return;
  }

  // Listen for authentication events
  twitch.onAuthorized(async (auth) => {
    channelId = auth.channelId;
    
    // Load any existing configuration
    twitch.configuration.onChanged(() => {
      if (twitch.configuration.broadcaster) {
        try {
          const config = JSON.parse(twitch.configuration.broadcaster.content);
          if (config.steamUrl) {
            savedSteamUrl = config.steamUrl;
            document.getElementById('steamUrl').value = savedSteamUrl;
          }
        } catch (e) {
          console.error('Error parsing configuration:', e);
        }
      }
    });
  });

  // Set up UI event listeners
  document.getElementById('saveButton').addEventListener('click', saveConfiguration);
  document.getElementById('previewButton').addEventListener('click', previewGame);
};

// Preview the game data for the entered URL
const previewGame = async () => {
  const steamUrlInput = document.getElementById('steamUrl');
  const steamUrl = steamUrlInput.value.trim();
  
  if (!steamUrl) {
    showStatus('Please enter a valid Steam URL', 'error');
    return;
  }
  
  const previewContainer = document.getElementById('previewContainer');
  const gamePreview = document.getElementById('gamePreview');
  
  // Show loading
  gamePreview.innerHTML = '<div class="loading">Loading game information...</div>';
  previewContainer.style.display = 'block';
  
  const appId = extractAppIdFromUrl(steamUrl);
  if (!appId) {
    gamePreview.innerHTML = '<div class="error">Invalid Steam URL. Please enter a valid Steam store URL.</div>';
    return;
  }
  
  const gameData = await fetchGameDetails(appId);
  if (!gameData) {
    gamePreview.innerHTML = '<div class="error">Could not load game data. Please check the URL and try again.</div>';
    return;
  }
  
  const steamLinks = generateSteamLinks(appId);
  const price = gameData.is_free ? 'Free to Play' : 
    (gameData.price_overview ? gameData.price_overview.final_formatted : 'Price not available');
  
  gamePreview.innerHTML = `
    <img class="game-image" src="${gameData.header_image}" alt="${gameData.name}">
    <div class="game-header">
      <div class="game-title">${gameData.name}</div>
      <div class="game-meta">
        <span>Released: ${gameData.release_date?.date || 'Unknown'}</span>
        <span class="game-price">${price}</span>
      </div>
    </div>
    <div class="game-details">
      <div class="game-description">${gameData.short_description}</div>
      <div class="button-container">
        <button class="steam-button">Wishlist</button>
        <button class="steam-button">Follow</button>
      </div>
    </div>
  `;
};

// Save the configuration to the Twitch Configuration Service
const saveConfiguration = async () => {
  if (!twitch || !channelId) {
    showStatus('Extension not fully initialized', 'error');
    return;
  }
  
  const steamUrlInput = document.getElementById('steamUrl');
  const steamUrl = steamUrlInput.value.trim();
  
  if (!steamUrl) {
    showStatus('Please enter a valid Steam URL', 'error');
    return;
  }
  
  // Validate the URL by checking if we can extract an app ID
  const appId = extractAppIdFromUrl(steamUrl);
  if (!appId) {
    showStatus('Invalid Steam URL. Please enter a valid Steam store URL.', 'error');
    return;
  }
  
  // Validate by trying to fetch game data
  const gameData = await fetchGameDetails(appId);
  if (!gameData) {
    showStatus('Could not load game data. Please check the URL and try again.', 'error');
    return;
  }
  
  // Save the configuration
  try {
    twitch.configuration.set('broadcaster', channelId, JSON.stringify({
      steamUrl: steamUrl
    }));
    
    showStatus(`Configuration saved successfully! Game set to: ${gameData.name}`, 'success');
  } catch (error) {
    console.error('Error saving configuration:', error);
    showStatus('Failed to save configuration due to an error', 'error');
  }
};

// Show status message
const showStatus = (message, type) => {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `status-message status-${type}`;
  statusElement.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 5000);
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
