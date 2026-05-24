import { useState } from 'react';
import api from '../../js/api/index.js';
import { withAuth } from '../lib/auth';
import type { GameType } from '../types';

export type VerifyState = 'idle' | 'starting' | 'pending' | 'confirming' | 'done' | 'error';

export function useVerify(chzzkChannelId: string | undefined) {
  const [state, setState] = useState<VerifyState>('idle');
  const [iconId, setIconId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (puuid: string, gameType: GameType, region: string) => {
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
    } catch (e: any) {
      setError(e.message ?? '인증 시작에 실패했습니다.');
      setState('error');
    }
  };

  const confirm = async (puuid: string, gameType: GameType, region: string) => {
    if (!chzzkChannelId) return;
    setState('confirming');
    setError(null);
    try {
      const res = await withAuth((headers) =>
        api.verify.confirm(chzzkChannelId, puuid, gameType, region, headers)
      );
      if (res?.error) throw new Error(res.error);
      setState('done');
    } catch (e: any) {
      setError(e.message ?? '인증에 실패했습니다. 아이콘을 변경했는지 확인해주세요.');
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setIconId(null);
    setError(null);
  };

  return { state, iconId, error, start, confirm, reset };
}
