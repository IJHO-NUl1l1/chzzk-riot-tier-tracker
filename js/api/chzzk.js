import proxyClient from '../proxy/client.js';

const chzzkApi = {
  async revokeToken(userId) {
    return proxyClient.post('/chzzk/auth/revoke', { userId });
  },

  async saveTierCache(chzzkChannelId, entries) {
    return proxyClient.post('/chzzk/tier-cache', { chzzkChannelId, entries });
  },

  async getTierCache(chzzkChannelId) {
    return proxyClient.get('/chzzk/tier-cache', { chzzkChannelId });
  },

  async deleteTierCache(chzzkChannelId, gameType) {
    const params = { chzzkChannelId };
    if (gameType) params.gameType = gameType;
    return proxyClient.delete('/chzzk/tier-cache', params);
  }
};

export default chzzkApi;
