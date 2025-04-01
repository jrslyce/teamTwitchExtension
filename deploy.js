/**
 * Extension Deployment Script
 * This script handles deploying the Steam Game Twitch Extension to Muxy via MCP
 */

import { deployExtension, initializeExtension } from './common/initExtension.js';

async function main() {
  console.log('Starting Steam Game Twitch Extension deployment process');
  
  try {
    // Initialize the extension with MCP
    await initializeExtension();
    
    // Get deployment target from command line (default: staging)
    const targetEnv = process.argv[2] || 'staging';
    const version = process.argv[3] || '1.0.0';
    
    let assetBaseUrl;
    if (targetEnv === 'production') {
      assetBaseUrl = 'https://production-assets.myextension.com';
    } else {
      assetBaseUrl = 'https://staging-assets.myextension.com';
      // For local development, you could use:
      // assetBaseUrl = 'https://localhost:8080';
    }
    
    // Deploy the extension
    const deploymentResult = await deployExtension({
      version: version,
      assets: {
        panel: `${assetBaseUrl}/panel/panel.html`,
        component: `${assetBaseUrl}/component/component.html`,
        config: `${assetBaseUrl}/config/config.html`,
        mobile: `${assetBaseUrl}/mobile/mobile.html`
      }
    });
    
    console.log(`Extension deployed to ${targetEnv} successfully:`);
    console.log(JSON.stringify(deploymentResult, null, 2));
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Execute deployment
main();
