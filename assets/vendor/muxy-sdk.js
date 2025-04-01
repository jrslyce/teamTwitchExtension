/**
 * Simplified Muxy SDK mock for Steam Twitch Extension
 * This provides the bare minimum functionality needed when the actual SDK can't be loaded
 */

(function(window) {
  // Create a simplified Muxy object
  const Muxy = {
    /**
     * Setup the Muxy SDK
     */
    setup: function(config = {}) {
      console.log('Muxy SDK (local version) initialized with config:', config);
      this._config = config || {};
      
      // Try to get JWT from URL if present
      try {
        const params = new URLSearchParams(window.location.search);
        const jwt = params.get('jwt') || params.get('token');
        if (jwt) {
          this._jwt = jwt;
          console.log('JWT found in URL parameters');
        }
      } catch (e) {
        console.error('Error parsing URL params:', e);
      }
      
      // Signal that setup is complete
      if (typeof this._onSetupComplete === 'function') {
        this._onSetupComplete();
      }
      
      return this;
    },
    
    /**
     * Set JWT manually
     */
    setJWT: function(jwt) {
      if (!jwt) {
        throw new Error('Invalid JWT provided');
      }
      this._jwt = jwt;
      console.log('JWT set manually with setJWT');
      return this;
    },
    
    /**
     * Set token (alias for setJWT, as per documentation)
     */
    setToken: function(token) {
      if (!token) {
        throw new Error('Invalid token provided');
      }
      this._jwt = token;
      console.log('Token set manually with setToken');
      return this;
    },
    
    /**
     * Get the stored JWT
     */
    getJWT: function() {
      return this._jwt || null;
    },
    
    /**
     * State management methods
     */
    state: {
      _store: {},
      
      /**
       * Get extension state
       */
      getExtensionState: async function(key) {
        console.log('getExtensionState called for key:', key);
        return this._store[key] || null;
      },
      
      /**
       * Set extension state
       */
      setExtensionState: async function(key, value) {
        console.log('setExtensionState called for key:', key);
        this._store[key] = value;
        return { success: true };
      },
      
      /**
       * Broadcast extension state
       */
      broadcastExtensionState: async function(key, value) {
        console.log('broadcastExtensionState called for key:', key);
        this._store[key] = value;
        return { success: true };
      }
    },
    
    /**
     * User management
     */
    user: {
      _isLinked: false,
      _isAdmin: false,
      _jwt: null,
      
      /**
       * Check if user is linked
       */
      isLinked: function() {
        return this._isLinked;
      },
      
      /**
       * Check if user is admin
       */
      isAdmin: function() {
        // If we have a JWT from URL, assume admin
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('jwt') || urlParams.has('token')) {
          this._isAdmin = true;
          this._isLinked = true;
        }
        
        return this._isAdmin;
      },
      
      /**
       * Get JWT
       */
      getJWT: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const jwt = urlParams.get('jwt') || urlParams.get('token');
        return jwt || Muxy._jwt || this._jwt || 'mock-jwt-token';
      },
      
      /**
       * Authorize user
       */
      authorize: async function(scopes) {
        console.log('authorize called with scopes:', scopes);
        
        // If we have JWT in URL, assume already authorized
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('jwt') || urlParams.has('token')) {
          this._isAdmin = true;
          this._isLinked = true;
          return true;
        }
        
        // For admin page, if it includes "admin" scope, let's simulate admin access
        if (scopes && scopes.includes('admin') && window.location.pathname.includes('admin')) {
          this._isAdmin = true;
          this._isLinked = true;
          return true;
        }
        
        return false;
      }
    },
    
    /**
     * Debug methods
     */
    debug: function(message) {
      console.log('[Muxy Debug]', message);
    },
    
    /**
     * Set a callback for when setup is complete
     */
    onSetupComplete: function(callback) {
      this._onSetupComplete = callback;
    }
  };
  
  // Expose Muxy to the global scope
  window.Muxy = Muxy;
  
  console.log('Local Muxy SDK mock loaded successfully');
})(window);
