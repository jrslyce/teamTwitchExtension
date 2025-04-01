import express from 'express';
import axios from 'axios';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Enhanced CORS configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type,Authorization'
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// API request middleware to add CORS headers for all API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

// Root route - redirect to panel
app.get('/', (req, res) => {
  res.redirect('/panel');
});

// Steam API proxy endpoint
app.get('/api/steam/details', async (req, res) => {
  try {
    const { appids } = req.query;
    
    if (!appids) {
      return res.status(400).json({ error: 'Missing appids parameter' });
    }
    
    // Call the Steam Store API
    const response = await axios.get('https://store.steampowered.com/api/appdetails', {
      params: {
        appids,
        cc: 'us',  // Country code
        l: 'en'    // Language
      }
    });
    
    // Steam API returns data in a specific format with the app ID as the key
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Steam API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch game details from Steam',
      message: error.message 
    });
  }
});

// Route for the panel view
app.get('/panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'panel/panel.html'));
});

// Route for the config view
app.get('/config', (req, res) => {
  res.sendFile(path.join(__dirname, 'config/config.html'));
});

// Route for the component view
app.get('/component', (req, res) => {
  res.sendFile(path.join(__dirname, 'component/component.html'));
});

// Route for the mobile view
app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, 'mobile/mobile.html'));
});

// Admin route for Muxy SDK admin operations
app.get('/admin-auth', (req, res) => {
  // This route is specifically for admin authentication
  // The jwt parameter from Muxy will be handled by the client-side Muxy SDK
  res.redirect('/admin');
});

// Route for the admin view
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/admin.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Panel view: http://localhost:${PORT}/panel`);
  console.log(`Component view: http://localhost:${PORT}/component`);
  console.log(`Mobile view: http://localhost:${PORT}/mobile`);
  console.log(`Configuration page: http://localhost:${PORT}/config`);
  console.log(`Admin page: http://localhost:${PORT}/admin`);
});
