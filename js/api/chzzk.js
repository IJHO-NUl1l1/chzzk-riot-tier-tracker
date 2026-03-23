import proxyClient from '../proxy/client.js';

const chzzkApi = {
  async revokeToken(userId, chzzkChannelId, headers = {}) {
    return proxyClient.post('/chzzk/auth/revoke', { userId, chzzkChannelId }, { headers });
  },

  async saveTierCache(chzzkChannelId, entries, headers = {}, liveId = null) {
    const body = { chzzkChannelId, entries };
    if (liveId) body.liveId = liveId;
    return proxyClient.post('/chzzk/tier-cache', body, { headers });
  },

  async getTierCache(chzzkChannelId) {
    return proxyClient.get('/chzzk/tier-cache', { chzzkChannelId });
  },

  async deleteTierCache(chzzkChannelId, gameType, headers = {}, liveId = null) {
    const params = { chzzkChannelId };
    if (gameType) params.gameType = gameType;
    if (liveId) params.liveId = liveId;
    return proxyClient.delete('/chzzk/tier-cache', params, { headers });
  },

  async updatePrivacy(chzzkChannelId, gameType, isPublic, headers = {}, liveId = null) {
    const body = { chzzkChannelId, isPublic };
    if (gameType) body.gameType = gameType;
    if (liveId) body.liveId = liveId;
    return proxyClient.post('/privacy/update', body, { headers });
  }
};

export default chzzkApi;
