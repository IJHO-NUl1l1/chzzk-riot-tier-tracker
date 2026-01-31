/**
 * Summoner API module for interacting with the Riot API server
 */

import proxyClient from '../proxy/client.js';
import config from '../config.js';

const summonerApi = {
  /**
   * Get summoner information by Riot ID (game name and tag line)
   * @param {string} gameName - Game name
   * @param {string} tagLine - Tag line
   * @returns {Promise<Object>} Account information
   */
  async getSummonerByRiotId(gameName, tagLine) {
    try {
      const endpoint = `/riot/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      console.log('Calling API endpoint:', endpoint);
      console.log('Full URL:', `${proxyClient.getBaseUrl()}${endpoint}`);
      
      const result = await proxyClient.get(endpoint);
      console.log('API result:', result);
      return result;
    } catch (error) {
      console.error('Failed to get summoner info by Riot ID:', error);
      throw error;
    }
  },
  
  /**
   * Get summoner information by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @returns {Promise<Object>} Summoner information
   */
  async getSummonerByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/summoner/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get summoner info by PUUID:', error);
      throw error;
    }
  }
};

export default summonerApi;