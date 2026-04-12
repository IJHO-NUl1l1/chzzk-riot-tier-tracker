class Config {
  constructor() {
    this.settings = {
      region: 'kr',
      devMode: false,
      showLol: true,
      showTft: true
    };
    this.loadSettings();
  }

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

  getSetting(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }
  
  async setSetting(key, value) {
    this.settings[key] = value;
    return await this.saveSettings();
  }

  getRegion() {
    return this.settings.region || 'kr';
  }
  
  async setRegion(region) {
    return await this.setSetting('region', region);
  }

  isDevMode() {
    return this.settings.devMode || false;
  }
  
  async setDevMode(enabled) {
    return await this.setSetting('devMode', enabled);
  }
}

const config = new Config();
export default config;
