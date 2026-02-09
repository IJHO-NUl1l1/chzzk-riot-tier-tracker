/**
 * API module integration for Riot API server
 */

import summonerApi from './summoner.js';
import rankApi from './rank.js';
import tftApi from './tft.js';

const api = {
  /**
   * Summoner API methods
   */
  summoner: summonerApi,

  /**
   * Rank and game data API methods
   */
  rank: rankApi,

  /**
   * Match history methods (alias to rank.getMatchHistory)
   */
  match: {
    getHistory: rankApi.getMatchHistory,
    getDetails: rankApi.getMatchDetails
  },

  /**
   * Champion mastery methods (alias to rank.getChampionMastery)
   */
  mastery: {
    getChampionMastery: rankApi.getChampionMastery
  },

  /**
   * Spectator methods (alias to rank.getActiveGame)
   */
  spectator: {
    getActiveGame: rankApi.getActiveGame
  },

  /**
   * TFT API methods
   */
  tft: tftApi
};

export default api;