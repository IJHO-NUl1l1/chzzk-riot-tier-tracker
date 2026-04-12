import proxyClient from '../proxy/client.js';
import config from '../config.js';

const rankApi = {
  async getRankByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/league/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get rank info:', error);
      throw error;
    }
  },
  
  async getMatchHistory(puuid, region = config.getRegion(), count = 5) {
    try {
      return await proxyClient.get(`/riot/match/${region}/history/${encodeURIComponent(puuid)}`, { count });
    } catch (error) {
      console.error('Failed to get match history:', error);
      throw error;
    }
  },
  
  async getMatchDetails(matchId, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/match/${region}/${encodeURIComponent(matchId)}`);
    } catch (error) {
      console.error('Failed to get match details:', error);
      throw error;
    }
  },
  
  async getChampionMastery(puuid, region = config.getRegion(), count = 5) {
    try {
      return await proxyClient.get(`/riot/mastery/${region}/${encodeURIComponent(puuid)}`, { count });
    } catch (error) {
      console.error('Failed to get champion mastery:', error);
      throw error;
    }
  },
  
  async getActiveGame(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/spectator/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get active game:', error);
      throw error;
    }
  }
};

export default rankApi;