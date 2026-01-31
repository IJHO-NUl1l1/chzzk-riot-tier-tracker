/**
 * Rank API module for interacting with the Riot API server
 */

import proxyClient from '../proxy/client.js';
import config from '../config.js';

const rankApi = {
  /**
   * Get summoner's rank information by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @returns {Promise<Object>} League/Rank information
   */
  async getRankByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/league/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get rank info:', error);
      throw error;
    }
  },
  
  /**
   * Get match history by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @param {number} count - Number of matches to retrieve
   * @returns {Promise<Array>} Match IDs
   */
  async getMatchHistory(puuid, region = config.getRegion(), count = 5) {
    try {
      return await proxyClient.get(`/riot/match/${region}/history/${encodeURIComponent(puuid)}`, { count });
    } catch (error) {
      console.error('Failed to get match history:', error);
      throw error;
    }
  },
  
  /**
   * Get match details by match ID
   * @param {string} matchId - Match ID
   * @param {string} region - Region code
   * @returns {Promise<Object>} Match details
   */
  async getMatchDetails(matchId, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/match/${region}/${encodeURIComponent(matchId)}`);
    } catch (error) {
      console.error('Failed to get match details:', error);
      throw error;
    }
  },
  
  /**
   * Get champion mastery information by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @param {number} count - Number of champions to retrieve
   * @returns {Promise<Array>} Champion mastery information
   */
  async getChampionMastery(puuid, region = config.getRegion(), count = 5) {
    try {
      return await proxyClient.get(`/riot/mastery/${region}/${encodeURIComponent(puuid)}`, { count });
    } catch (error) {
      console.error('Failed to get champion mastery:', error);
      throw error;
    }
  },
  
  /**
   * Get active game information by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @returns {Promise<Object>} Active game information
   */
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