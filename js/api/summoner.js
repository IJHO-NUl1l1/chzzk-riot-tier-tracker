import proxyClient from '../proxy/client.js';
import config from '../config.js';

const summonerApi = {
  async getSummonerByRiotId(gameName, tagLine) {
    try {
      const endpoint = `/riot/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      const result = await proxyClient.get(endpoint);
      return result;
    } catch (error) {
      console.error('Failed to get summoner info by Riot ID:', error);
      throw error;
    }
  },
  
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