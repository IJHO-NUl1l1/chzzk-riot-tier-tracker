import proxyClient from '../proxy/client.js';

const chzzkApi = {
  async revokeToken(userId, chzzkChannelId, headers = {}) {
    return proxyClient.post('/chzzk/auth/revoke', { userId, chzzkChannelId }, { headers });
  },

  async saveTierCache(chzzkChannelId, entries, headers = {}) {
    return proxyClient.post('/chzzk/tier-cache', { chzzkChannelId, entries }, { headers });
  },

  async getTierCache(chzzkChannelId) {
    return proxyClient.get('/chzzk/tier-cache', { chzzkChannelId });
  },

  async deleteTierCache(chzzkChannelId, gameType, headers = {}) {
    const params = { chzzkChannelId };
    if (gameType) params.gameType = gameType;
    return proxyClient.delete('/chzzk/tier-cache', params, { headers });
  }
};

export default chzzkApi;
