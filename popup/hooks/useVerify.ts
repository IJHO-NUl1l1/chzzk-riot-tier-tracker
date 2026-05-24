import { useState, useEffect } from 'react';
import api from '../../js/api/index.js';
import { withAuth } from '../lib/auth';
import type { GameType } from '../types';

export type VerifyState = 'idle' | 'starting' | 'pending' | 'confirming' | 'done' | 'error';

interface PersistedSession {
  iconId: number;
  expiresAt: string;
  puuid: string;
  region: string;
}

function sessionKey(gameType: GameType) {
  return `verifySession_${gameType}`;
}

export function verifiedKey(gameType: GameType) {
  return `isVerified_${gameType}`;
}

function saveSession(gameType: GameType, data: PersistedSession) {
  chrome.storage.local.set({ [sessionKey(gameType)]: data });
}

function clearSession(gameType: GameType) {
  chrome.storage.local.remove(sessionKey(gameType));
}

export function useVerify(chzzkChannelId: string | undefined, gameType: GameType) {
  const [state, setState] = useState<VerifyState>('idle');
  const [iconId, setIconId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 팝업 열릴 때 저장된 세션 복원
  useEffect(() => {
    chrome.storage.local.get([sessionKey(gameType)], (result) => {
      const session: PersistedSession | undefined = result[sessionKey(gameType)];
      if (!session) return;
      if (new Date(session.expiresAt) < new Date()) {
        clearSession(gameType);
        return;
      }
      setIconId(session.iconId);
      setState('pending');
    });
  }, [gameType]);

  const start = async (puuid: string, region: string) => {
    if (!chzzkChannelId) return;
    setState('starting');
    setError(null);
    try {
      const res = await withAuth((headers) =>
        api.verify.start(chzzkChannelId, puuid, gameType, region, headers)
      );
      if (res?.error) throw new Error(res.error);
      setIconId(res.iconId);
      setState('pending');
      saveSession(gameType, { iconId: res.iconId, expiresAt: res.expiresAt, puuid, region });
    } catch (e: any) {
      setError(e.message ?? '인증 시작에 실패했습니다.');
      setState('error');
    }
  };

  const confirm = async (puuid: string, region: string) => {
    if (!chzzkChannelId) return;
    setState('confirming');
    setError(null);
    try {
      const res = await withAuth((headers) =>
        api.verify.confirm(chzzkChannelId, puuid, gameType, region, headers)
      );
      if (res?.error) throw new Error(res.error);
      setState('done');
      clearSession(gameType);
      chrome.storage.local.set({ [verifiedKey(gameType)]: true });
    } catch (e: any) {
      setError(e.message ?? '인증에 실패했습니다. 아이콘을 변경했는지 확인해주세요.');
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setIconId(null);
    setError(null);
    clearSession(gameType);
  };

  return { state, iconId, error, start, confirm, reset };
}
