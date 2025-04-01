/**
 * Extension Initialization Utility
 * Handles initializing the extension with the MCP configuration
 */

import { getExtensionService } from './extensionService.js';

/**
 * Initialize the extension with MCP integration
 * @returns {Promise<Boolean>} - Whether initialization was successful
 */
export async function initializeExtension() {
  console.log('Starting extension initialization with MCP integration');
  
  try {
    const extensionService = getExtensionService();
    await extensionService.initialize();
    
    // Create the extension if it doesn't exist
    await extensionService.createExtensionIfNeeded({
      name: 'Steam Game Showcase',
      description: 'Displays Steam game information with wishlist and follow buttons',
      viewerTypes: ['panel', 'component', 'mobile']
    });
    
    console.log('Extension initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Extension initialization failed:', error);
    return false;
  }
}

/**
 * Deploy the extension to Twitch through MCP
 * @param {Object} deploymentData - Deployment configuration
 * @returns {Promise<Object>} - Deployment result
 */
export async function deployExtension(deploymentData) {
  console.log('Deploying extension...');
  
  try {
    const extensionService = getExtensionService();
    if (!extensionService.initialized) {
      await extensionService.initialize();
    }
    
    const result = await extensionService.deployExtension(deploymentData);
    console.log('Extension deployed successfully');
    return result;
  } catch (error) {
    console.error('Extension deployment failed:', error);
    throw error;
  }
}

export default {
  initializeExtension,
  deployExtension
};
