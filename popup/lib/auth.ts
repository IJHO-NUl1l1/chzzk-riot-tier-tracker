import api from '../../js/api/index.js';

const storage = {
  get: <T>(keys: string[]): Promise<T> =>
    new Promise((resolve) => chrome.storage.local.get(keys, resolve as any)),
  set: (items: Record<string, unknown>): Promise<void> =>
    new Promise((resolve) => chrome.storage.local.set(items, resolve)),
  remove: (keys: string[]): Promise<void> =>
    new Promise((resolve) => chrome.storage.local.remove(keys, resolve)),
};

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const result = await storage.get<{ jwt_token?: string }>(['jwt_token']);
  return result.jwt_token ? { Authorization: `Bearer ${result.jwt_token}` } : {};
}

export async function tryRefreshJwt(): Promise<boolean> {
  const result = await storage.get<{ chzzkAuth?: { userId: string; channelId: string } }>(['chzzkAuth']);
  const chzzkAuth = result.chzzkAuth;
  if (!chzzkAuth?.userId || !chzzkAuth?.channelId) return false;
  try {
    const resp = await api.chzzk.refreshToken(chzzkAuth.userId, chzzkAuth.channelId, await getAuthHeaders());
    if (resp?.jwt_token) {
      await storage.set({ jwt_token: resp.jwt_token });
      return true;
    }
  } catch {
    // refresh itself failed — user must re-login
  }
  return false;
}

export async function withAuth<T>(fn: (headers: Record<string, string>) => Promise<T>): Promise<T> {
  try {
    return await fn(await getAuthHeaders());
  } catch (e: any) {
    if (e?.message === 'Invalid token' || e?.message === 'Unauthorized') {
      const refreshed = await tryRefreshJwt();
      if (refreshed) return await fn(await getAuthHeaders());
      await storage.remove(['jwt_token']);
      alert('로그인이 만료되었습니다. 치지직 계정을 다시 연결해 주세요.');
    }
    throw e;
  }
}

export async function getLiveId(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url?.match(/\/live\/([^/?#]+)/)?.[1] ?? null;
}
