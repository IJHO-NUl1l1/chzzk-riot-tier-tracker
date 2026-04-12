import summonerApi from './summoner.js';
import rankApi from './rank.js';
import tftApi from './tft.js';
import chzzkApi from './chzzk.js';

const api = {
  summoner: summonerApi,
  rank: rankApi,
  match: {
    getHistory: rankApi.getMatchHistory,
    getDetails: rankApi.getMatchDetails
  },
  mastery: {
    getChampionMastery: rankApi.getChampionMastery
  },
  spectator: {
    getActiveGame: rankApi.getActiveGame
  },
  tft: tftApi,
  chzzk: chzzkApi
};

export default api;