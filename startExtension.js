/**
 * Start Extension Script
 * Initializes the MCP integration and starts the local development server
 */

import path from 'path';
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to MCP config
const MCP_CONFIG_PATH = '/Users/jared/.codeium/windsurf/mcp_config.json';

// Function to verify MCP config exists
function verifyMcpConfig() {
  if (!fs.existsSync(MCP_CONFIG_PATH)) {
    console.error(`ERROR: MCP configuration not found at ${MCP_CONFIG_PATH}`);
    console.error('Please ensure you have created the MCP configuration first.');
    process.exit(1);
  }
  
  console.log('MCP configuration found. Using credentials from config file.');
  
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, 'utf8'));
    console.log(`Using MCP configuration for: ${mcpConfig.name}`);
    console.log(`Client ID: ${mcpConfig.authentication.clientId}`);
    console.log('Authentication method:', mcpConfig.authentication.type);
    return mcpConfig;
  } catch (error) {
    console.error('Error parsing MCP configuration:', error.message);
    process.exit(1);
  }
}

// Function to start the local development server
function startServer() {
  console.log('Starting local development server...');
  try {
    // Start server.js using node
    const nodeProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      detached: false
    });
    
    console.log('Server started! You can access your extension at:');
    console.log('  - Panel view:     http://localhost:8081/panel');
    console.log('  - Component view: http://localhost:8081/component');
    console.log('  - Mobile view:    http://localhost:8081/mobile');
    console.log('  - Config view:    http://localhost:8081/config');
    console.log('  - Admin view:     http://localhost:8081/admin');
    console.log('\nPress Ctrl+C to stop the server.');
    
    // Handle process termination
    nodeProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      nodeProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Main function
function main() {
  console.log('==============================================');
  console.log('Steam Game Twitch Extension - Development Mode');
  console.log('==============================================');
  
  // Verify MCP configuration
  const mcpConfig = verifyMcpConfig();
  
  // Check if required dependencies are installed
  try {
    console.log('Checking dependencies...');
    execSync('npm list express axios cors dotenv', { stdio: 'ignore' });
  } catch (error) {
    console.warn('Some dependencies may be missing. Installing now...');
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Start the development server
  startServer();
}

// Run the main function
main();
