// Data storage and management module - UI test simplified version
const PersistentStorage = {
  async getRiotUserData() {
    console.log('UI test mode getRiotUserData call');
    return null;
  },
  
  async setRiotUserData(userData) {
    console.log('UI test mode setRiotUserData call:', userData);
    return true;
  },
  
  async removeRiotUserData() {
    console.log('UI test mode removeRiotUserData call');
    return true;
  },
  
  async getTierInfo() {
    console.log('UI test mode getTierInfo call');
    return {
      nickname: 'Test Summoner',
      tier: 'GOLD',
      division: 'IV',
      tierText: 'GOLD IV',
      tierColor: '#F1A64E'
    };
  },
  
  async setTierInfo(tierInfo) {
    console.log('UI test mode setTierInfo call:', tierInfo);
    return true;
  },
  
  async getSettings() {
    console.log('UI test mode getSettings call');
    return {
      enableTier: true,
      accountSectionCollapsed: false,
      optionsSectionCollapsed: false,
      riotSectionCollapsed: false
    };
  },
  
  async setSetting(key, value) {
    console.log('UI test mode setSetting call:', key, value);
    return true;
  }
};

export default PersistentStorage;