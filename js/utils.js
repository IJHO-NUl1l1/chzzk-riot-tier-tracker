// Tier related utility functions - UI test simplified version

// Tier color mapping
const TIER_COLORS = {
  'IRON': '#72767d',
  'BRONZE': '#b97451',
  'SILVER': '#7e8183',
  'GOLD': '#f1a64d',
  'PLATINUM': '#4fccc6',
  'EMERALD': '#3eb489',
  'DIAMOND': '#576ace',
  'MASTER': '#9d4dc3',
  'GRANDMASTER': '#ef4444',
  'CHALLENGER': '#f4c873'
};

// Tier utility object
const TierUtils = {
  // Get tier color
  getTierColor(tier) {
    return TIER_COLORS[tier] || '#72767d';
  },
  
  // Format tier text
  formatTierText(tier, division) {
    if (!tier) return 'UNRANKED';
    
    // Master and above have no division
    const needsDivision = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'].includes(tier);
    return needsDivision && division ? `${tier} ${division}` : tier;
  },
  
  // Create tier display text (with brackets)
  formatTierDisplayText(tier, division) {
    const tierText = this.formatTierText(tier, division);
    return `[${tierText}]`;
  },
  
  // Extract tier info from rank data
  extractTierInfo(rankData) {
    if (!rankData) return null;
    
    return {
      tier: rankData.rank_tier || rankData.tier,
      division: rankData.rank_division || rankData.rank,
      leaguePoints: rankData.rank_lp || rankData.leaguePoints || 0
    };
  }
};

// Data caching utility - UI test simplified
const DataCache = {
  // Store data (test mode)
  async set(key, data) {
    console.log('UI test mode DataCache.set call:', key, data);
    return true;
  },
  
  // Get data (test mode)
  async get(key) {
    console.log('UI test mode DataCache.get call:', key);
    return null;
  },
  
  // Remove data (test mode)
  async remove(key) {
    console.log('UI test mode DataCache.remove call:', key);
    return true;
  },
  
  // Clear all cache (test mode)
  async clear() {
    console.log('UI test mode DataCache.clear call');
    return 0;
  }
};

// Export module
export { TierUtils, DataCache, TIER_COLORS };