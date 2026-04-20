import { useState, useEffect } from 'react';
import api from '../../js/api/index.js';
import type { GameType, SearchData, RankData } from '../types';

export function useSearch(gameType: GameType) {
  const [result, setResult] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = gameType === 'lol' ? 'summonerData' : 'tftData';
    chrome.storage.local.get([storageKey], (r) => {
      if (r[storageKey]) setResult(r[storageKey]);
    });
  }, [gameType]);

  const search = async (gameName: string, tagLine: string, region: string) => {
    setError(null);
    setLoading(true);
    try {
      let puuid: string;
      let resolvedGameName: string;
      let resolvedTagLine: string;
      let rankData: RankData[] = [];

      if (gameType === 'lol') {
        const accountInfo = await api.summoner.getSummonerByRiotId(gameName, tagLine);
        if (accountInfo.error) throw new Error(accountInfo.error);
        puuid = accountInfo.puuid;
        resolvedGameName = accountInfo.gameName;
        resolvedTagLine = accountInfo.tagLine;

        const [, ranks] = await Promise.all([
          api.summoner.getSummonerByPuuid(puuid, region),
          api.rank.getRankByPuuid(puuid, region),
        ]);
        rankData = ranks ?? [];
      } else {
        const accountInfo = await api.tft.getAccountByRiotId(gameName, tagLine, region);
        if (accountInfo.error) throw new Error(accountInfo.error);
        puuid = accountInfo.puuid;
        resolvedGameName = accountInfo.gameName;
        resolvedTagLine = accountInfo.tagLine;

        const [, ranks] = await Promise.all([
          api.tft.getSummonerByPuuid(puuid, region),
          api.tft.getRankByPuuid(puuid, region),
        ]);
        rankData = ranks ?? [];
      }

      const queueType = gameType === 'lol' ? 'RANKED_SOLO_5x5' : 'RANKED_TFT';
      const soloRank = rankData.find((r) => r.queueType === queueType) ?? rankData[0] ?? null;

      const searchData: SearchData = {
        gameName: resolvedGameName,
        tagLine: resolvedTagLine,
        puuid,
        tier: soloRank?.tier ?? null,
        rank: soloRank?.rank ?? null,
        lp: soloRank?.leaguePoints ?? 0,
        wins: soloRank?.wins ?? 0,
        losses: soloRank?.losses ?? 0,
        region,
      };

      // storage에 저장 (Home 탭 Register 버튼에서 사용)
      const storageKey = gameType === 'lol' ? 'summonerData' : 'tftData';
      await new Promise<void>((resolve) =>
        chrome.storage.local.set({ [storageKey]: searchData }, resolve)
      );

      setResult(searchData);
    } catch (e: any) {
      setError(e.message ?? 'Failed to find summoner');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, search };
}
