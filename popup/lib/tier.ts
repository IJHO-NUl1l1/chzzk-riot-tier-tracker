import type { TierEntry } from '../types';

export function dbEntryToData(entry: any): TierEntry | null {
  if (!entry) return null;
  return {
    gameName: entry.riot_game_name ?? null,
    tagLine: entry.riot_tag_line ?? null,
    puuid: entry.riot_puuid,
    tier: entry.tier ?? null,
    rank: entry.rank ?? null,
    lp: entry.league_points ?? 0,
    isPublic: entry.is_public ?? true,
    gameType: entry.game_type,
  };
}

export function getTierColor(tier: string | null | undefined): string {
  if (!tier) return 'var(--tier-unranked)';
  if (tier.toLowerCase() === 'emerald') return '#0ac3a6';
  return `var(--tier-${tier.toLowerCase()})`;
}

export function getTierImageUrl(tier: string | null | undefined): string {
  if (!tier || tier.toUpperCase() === 'UNRANKED') {
    return chrome.runtime.getURL('images/RankedEmblemsLatest/Rank=Iron.png');
  }
  const tierMap: Record<string, string> = {
    IRON: 'Iron', BRONZE: 'Bronze', SILVER: 'Silver', GOLD: 'Gold',
    PLATINUM: 'Platinum', EMERALD: 'Emerald', DIAMOND: 'Diamond',
    MASTER: 'Master', GRANDMASTER: 'Grandmaster', CHALLENGER: 'Challenger',
  };
  const name = tierMap[tier.toUpperCase()] ?? 'Iron';
  return chrome.runtime.getURL(`images/RankedEmblemsLatest/Rank=${name}.png`);
}
