/**
 * Extension Service - Connects our Twitch extension with the MCP client
 */

import { getMcpClient } from './mcpClient.js';
import { extractAppIdFromUrl, fetchGameDetails } from './steamApi.js';

// Path to MCP config file
const MCP_CONFIG_PATH = '/Users/jared/.codeium/windsurf/mcp_config.json';

// Singleton instance
let extensionServiceInstance = null;

class ExtensionService {
  constructor() {
    this.mcpClient = null;
    this.extensionId = null;
    this.initialized = false;
  }

  /**
   * Initialize the extension service
   */
  async initialize() {
    try {
      console.log('Initializing Extension Service with MCP integration');
      
      // Get MCP client instance
      this.mcpClient = getMcpClient(MCP_CONFIG_PATH);
      await this.mcpClient.initialize();
      await this.mcpClient.authenticate();
      
      // Get extension info
      const extensionsResult = await this.mcpClient.invoke('listExtensions');
      if (extensionsResult.extensions && extensionsResult.extensions.length > 0) {
        this.extensionId = extensionsResult.extensions[0].id;
        console.log(`Found extension with ID: ${this.extensionId}`);
      } else {
        console.log('No existing extension found, will need to create one');
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Extension Service:', error);
      return false;
    }
  }

  /**
   * Create a new extension if one doesn't exist
   * @param {Object} extensionData - Extension metadata
   */
  async createExtensionIfNeeded(extensionData) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (this.extensionId) {
      console.log('Extension already exists, skipping creation');
      return this.extensionId;
    }
    
    try {
      // Create extension through MCP
      const newExtension = await this.mcpClient.invoke('createExtension', {
        body: {
          name: extensionData.name || 'Steam Game Showcase',
          description: extensionData.description || 'Displays Steam game information with wishlist and follow buttons',
          viewerTypes: extensionData.viewerTypes || ['panel', 'component', 'mobile']
        }
      });
      
      this.extensionId = newExtension.id;
      console.log(`Created new extension with ID: ${this.extensionId}`);
      return this.extensionId;
    } catch (error) {
      console.error('Failed to create extension:', error);
      throw error;
    }
  }

  /**
   * Deploy the extension
   * @param {Object} deploymentData - Deployment assets and metadata
   */
  async deployExtension(deploymentData) {
    if (!this.extensionId) {
      throw new Error('No extension ID available. Create an extension first.');
    }
    
    try {
      const deployResult = await this.mcpClient.invoke('deployExtension', {
        extensionId: this.extensionId,
        body: {
          version: deploymentData.version || '1.0.0',
          assets: deploymentData.assets || {
            panel: 'https://localhost:8080/panel',
            component: 'https://localhost:8080/component',
            config: 'https://localhost:8080/config',
            mobile: 'https://localhost:8080/mobile'
          }
        }
      });
      
      console.log('Deployment result:', deployResult);
      return deployResult;
    } catch (error) {
      console.error('Failed to deploy extension:', error);
      throw error;
    }
  }

  /**
   * Validate a Steam URL and check if game data can be retrieved
   * @param {string} steamUrl - Steam game URL
   */
  async validateSteamUrl(steamUrl) {
    const appId = extractAppIdFromUrl(steamUrl);
    if (!appId) {
      return { valid: false, message: 'Invalid Steam URL format' };
    }
    
    const gameData = await fetchGameDetails(appId);
    if (!gameData) {
      return { valid: false, message: 'Could not retrieve game data' };
    }
    
    return { 
      valid: true, 
      message: 'Valid Steam game URL',
      gameData
    };
  }
}

/**
 * Get the Extension Service instance
 */
export function getExtensionService() {
  if (!extensionServiceInstance) {
    extensionServiceInstance = new ExtensionService();
  }
  return extensionServiceInstance;
}

export default ExtensionService;
