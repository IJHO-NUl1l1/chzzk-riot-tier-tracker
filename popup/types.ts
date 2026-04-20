export type GameType = 'lol' | 'tft';

export interface ChzzkAuth {
  userId: string;
  channelId: string;
  channelName: string;
}

export interface TierEntry {
  gameName: string | null;
  tagLine: string | null;
  puuid: string;
  tier: string | null;
  rank: string | null;
  lp: number;
  isPublic: boolean;
  gameType: GameType;
}

export interface RankData {
  queueType: string;
  tier: string | null;
  rank: string | null;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface SearchData {
  gameName: string;
  tagLine: string;
  puuid: string;
  tier: string | null;
  rank: string | null;
  lp: number;
  wins: number;
  losses: number;
  region: string;
}

export interface Settings {
  showLol: boolean;
  showTft: boolean;
  region: string;
}
