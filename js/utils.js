// UI test simplified version
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

const TierUtils = {
  getTierColor(tier) {
    return TIER_COLORS[tier] || '#72767d';
  },
  
  formatTierText(tier, division) {
    if (!tier) return 'UNRANKED';
    
    const needsDivision = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'].includes(tier);
    return needsDivision && division ? `${tier} ${division}` : tier;
  },
  
  formatTierDisplayText(tier, division) {
    const tierText = this.formatTierText(tier, division);
    return `[${tierText}]`;
  },
  
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
  async set(key, data) {
    console.log('UI test mode DataCache.set call:', key, data);
    return true;
  },
  
  async get(key) {
    console.log('UI test mode DataCache.get call:', key);
    return null;
  },
  
  async remove(key) {
    console.log('UI test mode DataCache.remove call:', key);
    return true;
  },
  
  async clear() {
    console.log('UI test mode DataCache.clear call');
    return 0;
  }
};

export { TierUtils, DataCache, TIER_COLORS };