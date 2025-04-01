# Steam Twitch Extension

A Twitch Extension that displays Steam game information with wishlist and follow buttons. This extension supports panel, component, and mobile views.

## Features

- Display Steam game information in Twitch streams
- Show game title, image, price, and description
- Provide wishlist and follow buttons for viewers
- Allow broadcasters to change the featured game through a configuration page
- Works across panel, component, and mobile views

## Project Structure

- `/panel`: Panel view files - appears in the panel section below the stream
- `/component`: Component view files - appears as an overlay on the stream
- `/mobile`: Mobile view files - optimized for mobile devices
- `/config`: Configuration view files - for broadcasters to set the Steam game
- `/common`: Shared code and styles
- `/assets`: Images and other static assets
- `server.js`: Express server that proxies Steam API requests to avoid CORS issues

## Setup and Development

### Prerequisites

- Node.js 16+ and npm
- A Twitch developer account
- A Twitch extension created in the [Twitch Developer Console](https://dev.twitch.tv/console/extensions)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your configuration (see `.env` example)

### Development

1. Start the development server:
   ```
   npm start
   ```
2. Access the different views:
   - Panel: http://localhost:8080/panel
   - Component: http://localhost:8080/component
   - Mobile: http://localhost:8080/mobile
   - Config: http://localhost:8080/config

### Building for Production

1. Build the production bundle:
   ```
   npm run build
   ```
2. The bundled files will be in the `/dist` directory

## Deploying Your Extension

1. Host your built files on a secure (HTTPS) server
2. In the Twitch Developer Console:
   - Set your extension views to point to your hosted files
   - Complete the required information and assets
   - Submit for review

## Testing with Local Test

For local testing:

1. Use the Twitch Developer Rig from the Twitch Developer site
2. Set up HTTPS for your local server (required for Twitch extensions)
3. Point your views to your local server in the Developer Rig

## Using the MCP Configuration

This extension uses the MCP model context protocol for integration with dev.muxy.io. The configuration is stored in the MCP config file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# teamTwitchExtension
