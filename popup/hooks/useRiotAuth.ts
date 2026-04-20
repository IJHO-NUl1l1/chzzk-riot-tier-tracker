import { useState, useEffect } from 'react';
import api from '../../js/api/index.js';
import { withAuth, getLiveId } from '../lib/auth';
import { dbEntryToData } from '../lib/tier';
import type { ChzzkAuth, TierEntry, GameType } from '../types';

export function useRiotAuth(auth: ChzzkAuth | null) {
  const [lolEntry, setLolEntry] = useState<TierEntry | null>(null);
  const [tftEntry, setTftEntry] = useState<TierEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (chzzkAuth: ChzzkAuth) => {
    setLoading(true);
    try {
      const dbResult = await api.chzzk.getTierCache(chzzkAuth.channelId);
      if (dbResult.entries) {
        const lol = dbResult.entries.find((e: any) => e.game_type === 'lol') ?? null;
        const tft = dbResult.entries.find((e: any) => e.game_type === 'tft') ?? null;
        setLolEntry(dbEntryToData(lol));
        setTftEntry(dbEntryToData(tft));
      }
    } catch (e) {
      console.error('Failed to load tier cache:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.channelId) {
      load(auth);
    } else {
      setLolEntry(null);
      setTftEntry(null);
    }
  }, [auth?.channelId]);

  // storage 변경 감지 (Search 페이지에서 저장 시 재로드)
  useEffect(() => {
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if ((changes.summonerData || changes.tftData) && auth?.channelId) {
        load(auth);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [auth]);

  const register = async (gameType: GameType) => {
    if (!auth?.channelId) return;
    const storageKey = gameType === 'lol' ? 'summonerData' : 'tftData';
    const result = await new Promise<any>((resolve) =>
      chrome.storage.local.get([storageKey], resolve)
    );
    const data = result[storageKey];
    if (!data?.puuid) throw new Error('No search data');

    const entry = {
      riotPuuid: data.puuid,
      gameType,
      queueType: gameType === 'lol' ? 'RANKED_SOLO_5x5' : 'RANKED_TFT',
      tier: data.tier ?? null,
      rank: data.rank ?? null,
      leaguePoints: data.lp ?? 0,
      wins: 0,
      losses: 0,
      gameName: data.gameName ?? null,
      tagLine: data.tagLine ?? null,
    };

    const liveId = await getLiveId();
    await withAuth((headers) => api.chzzk.saveTierCache(auth.channelId, [entry], headers, liveId));

    const newEntry: TierEntry = {
      gameName: data.gameName ?? null,
      tagLine: data.tagLine ?? null,
      puuid: data.puuid,
      tier: data.tier ?? null,
      rank: data.rank ?? null,
      lp: data.lp ?? 0,
      isPublic: true,
      gameType,
    };
    if (gameType === 'lol') setLolEntry(newEntry);
    else setTftEntry(newEntry);
  };

  const unlink = async (gameType: GameType) => {
    if (!auth?.channelId) return;
    const liveId = await getLiveId();
    await withAuth((headers) =>
      api.chzzk.deleteTierCache(auth.channelId, gameType, headers, liveId)
    );
    if (gameType === 'lol') setLolEntry(null);
    else setTftEntry(null);
  };

  const togglePrivacy = async (gameType: GameType, isPublic: boolean) => {
    if (!auth?.channelId) return;
    const liveId = await getLiveId();
    await withAuth((headers) =>
      api.chzzk.updatePrivacy(auth.channelId, gameType, isPublic, headers, liveId)
    );
    if (gameType === 'lol') setLolEntry((prev) => prev ? { ...prev, isPublic } : prev);
    else setTftEntry((prev) => prev ? { ...prev, isPublic } : prev);
  };

  const logout = async () => {
    if (!auth?.channelId) return;
    const liveId = await getLiveId();
    await withAuth((headers) =>
      api.chzzk.deleteTierCache(auth.channelId, undefined, headers, liveId)
    );
    chrome.storage.local.remove(['summonerData', 'tftData']);
    setLolEntry(null);
    setTftEntry(null);
  };

  return { lolEntry, tftEntry, loading, register, unlink, togglePrivacy, logout };
}
