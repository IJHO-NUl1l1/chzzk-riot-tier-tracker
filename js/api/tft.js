import proxyClient from '../proxy/client.js';
import config from '../config.js';

const tftApi = {
  async getAccountByRiotId(gameName, tagLine, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, { region });
    } catch (error) {
      console.error('Failed to get TFT account info:', error);
      throw error;
    }
  },

  async getSummonerByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/summoner/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get TFT summoner info:', error);
      throw error;
    }
  },

  async getRankByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/league/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get TFT rank info:', error);
      throw error;
    }
  },

  async getMatchHistory(puuid, region = config.getRegion(), count = 5) {
    try {
      return await proxyClient.get(`/riot/tft/match/${region}/history/${encodeURIComponent(puuid)}`, { count });
    } catch (error) {
      console.error('Failed to get TFT match history:', error);
      throw error;
    }
  },

  async getMatchDetails(matchId, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/match/${region}/${encodeURIComponent(matchId)}`);
    } catch (error) {
      console.error('Failed to get TFT match details:', error);
      throw error;
    }
  },

  async getActiveGame(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/spectator/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get TFT active game:', error);
      throw error;
    }
  }
};

export default tftApi;
