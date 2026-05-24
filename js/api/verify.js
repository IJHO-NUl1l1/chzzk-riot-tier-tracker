import proxyClient from '../proxy/client.js';

const verifyApi = {
  async start(chzzkChannelId, puuid, gameType, region, headers = {}) {
    return proxyClient.post('/verify/start', { chzzkChannelId, puuid, gameType, region }, { headers });
  },

  async confirm(chzzkChannelId, puuid, gameType, region, headers = {}) {
    return proxyClient.post('/verify/confirm', { chzzkChannelId, puuid, gameType, region }, { headers });
  },
};

export default verifyApi;
