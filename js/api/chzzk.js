import proxyClient from '../proxy/client.js';

const chzzkApi = {
  async revokeToken(userId) {
    return proxyClient.post('/chzzk/auth/revoke', { userId });
  }
};

export default chzzkApi;
