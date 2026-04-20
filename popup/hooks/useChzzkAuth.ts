import { useState, useEffect } from 'react';
import api from '../../js/api/index.js';
import { getAuthHeaders } from '../lib/auth';
import type { ChzzkAuth } from '../types';

export function useChzzkAuth() {
  const [auth, setAuth] = useState<ChzzkAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['chzzkAuth'], (result) => {
      setAuth(result.chzzkAuth ?? null);
      setLoading(false);
    });

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.chzzkAuth) {
        setAuth(changes.chzzkAuth.newValue ?? null);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const login = () => {
    chrome.runtime.sendMessage({ action: 'chzzk_login' });
  };

  const logout = async () => {
    try {
      if (auth?.userId && auth?.channelId) {
        const headers = await getAuthHeaders();
        await api.chzzk.revokeToken(auth.userId, auth.channelId, headers);
      }
    } catch (e) {
      console.error('Revoke failed:', e);
    }
    chrome.storage.local.remove(['chzzkAuth', 'jwt_token']);
  };

  return { auth, loading, login, logout };
}
