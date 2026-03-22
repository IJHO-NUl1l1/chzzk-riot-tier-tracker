/**
 * Configuration module for application settings
 */

class Config {
  constructor() {
    this.settings = {
      // Default settings
      region: 'kr',
      devMode: false,
      showLol: true,
      showTft: true
    };
    this.loadSettings();
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const data = await new Promise((resolve) => {
        chrome.storage.local.get(['settings'], (result) => {
          resolve(result.settings);
        });
      });
      
      if (data) {
        this.settings = { ...this.settings, ...data };
        console.log('Settings loaded successfully');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Save settings to storage
  async saveSettings() {
    try {
      await new Promise((resolve) => {
        chrome.storage.local.set({ settings: this.settings }, () => {
          resolve();
        });
      });
      console.log('Settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Get a setting value
  getSetting(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }
  
  // Set a setting value
  async setSetting(key, value) {
    this.settings[key] = value;
    return await this.saveSettings();
  }

  // Get region
  getRegion() {
    return this.settings.region || 'kr';
  }
  
  // Set region
  async setRegion(region) {
    return await this.setSetting('region', region);
  }

  // Get dev mode
  isDevMode() {
    return this.settings.devMode || false;
  }
  
  // Set dev mode
  async setDevMode(enabled) {
    return await this.setSetting('devMode', enabled);
  }
}

// Create and export a singleton instance
const config = new Config();
export default config;
