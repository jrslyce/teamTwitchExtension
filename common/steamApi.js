/**
 * Steam Game API utilities for Twitch Extension
 */

// Since we can't directly call the Steam API from the client due to CORS,
// we'll need a proxy server. This would be your backend endpoint.
const API_PROXY = 'https://your-backend-server.com/api/steam';

/**
 * Extract the Steam App ID from a Steam store URL
 * @param {string} url - Steam store URL
 * @return {string|null} - The Steam App ID or null if not found
 */
function extractAppIdFromUrl(url) {
  if (!url) return null;
  
  // Handle different URL formats
  // Example: https://store.steampowered.com/app/1172470/Apex_Legends/
  const appIdMatch = url.match(/\/app\/(\d+)/);
  if (appIdMatch && appIdMatch[1]) {
    return appIdMatch[1];
  }
  return null;
}

/**
 * Fetch game details from Steam API
 * @param {string} appId - Steam App ID
 * @return {Promise<Object>} - Steam game details
 */
async function fetchGameDetails(appId) {
  try {
    const response = await fetch(`${API_PROXY}/details?appids=${appId}`);
    if (!response.ok) {
      throw new Error(`Steam API returned ${response.status}`);
    }
    const data = await response.json();
    return data[appId].data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
}

/**
 * Generate Steam store links
 * @param {string} appId - Steam App ID
 * @return {Object} - Object containing various Steam links
 */
function generateSteamLinks(appId) {
  if (!appId) return null;
  
  return {
    store: `https://store.steampowered.com/app/${appId}/`,
    wishlist: `https://store.steampowered.com/app/${appId}/?snr=twitch_wishlist`,
    follow: `https://store.steampowered.com/app/${appId}/?snr=twitch_follow`,
  };
}

export {
  extractAppIdFromUrl,
  fetchGameDetails,
  generateSteamLinks
};
