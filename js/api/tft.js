/**
 * TFT API module for interacting with the Riot API server
 */

import proxyClient from '../proxy/client.js';
import config from '../config.js';

const tftApi = {
  /**
   * Get account info by Riot ID using TFT API key
   * @param {string} gameName - Game name
   * @param {string} tagLine - Tag line
   * @param {string} region - Region code
   * @returns {Promise<Object>} Account information (including PUUID)
   */
  async getAccountByRiotId(gameName, tagLine, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, { region });
    } catch (error) {
      console.error('Failed to get TFT account info:', error);
      throw error;
    }
  },

  /**
   * Get TFT summoner info by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @returns {Promise<Object>} TFT Summoner information
   */
  async getSummonerByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/summoner/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get TFT summoner info:', error);
      throw error;
    }
  },

  /**
   * Get TFT rank info by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @returns {Promise<Object>} TFT League/Rank information
   */
  async getRankByPuuid(puuid, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/league/${region}/${encodeURIComponent(puuid)}`);
    } catch (error) {
      console.error('Failed to get TFT rank info:', error);
      throw error;
    }
  },

  /**
   * Get TFT match history by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @param {number} count - Number of matches to retrieve
   * @returns {Promise<Array>} Match IDs
   */
  async getMatchHistory(puuid, region = config.getRegion(), count = 5) {
    try {
      return await proxyClient.get(`/riot/tft/match/${region}/history/${encodeURIComponent(puuid)}`, { count });
    } catch (error) {
      console.error('Failed to get TFT match history:', error);
      throw error;
    }
  },

  /**
   * Get TFT match details by match ID
   * @param {string} matchId - Match ID
   * @param {string} region - Region code
   * @returns {Promise<Object>} Match details
   */
  async getMatchDetails(matchId, region = config.getRegion()) {
    try {
      return await proxyClient.get(`/riot/tft/match/${region}/${encodeURIComponent(matchId)}`);
    } catch (error) {
      console.error('Failed to get TFT match details:', error);
      throw error;
    }
  },

  /**
   * Get TFT active game info by PUUID
   * @param {string} puuid - Player Universally Unique IDentifier
   * @param {string} region - Region code
   * @returns {Promise<Object>} Active game information
   */
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
