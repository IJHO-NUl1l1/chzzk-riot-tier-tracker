import React from 'react';
import { getTierColor, getTierImageUrl } from '../lib/tier';
import type { SearchData, GameType } from '../types';

interface Props {
  gameType: GameType;
  data: SearchData | null;
}

export default function SearchResult({ gameType, data }: Props) {
  if (!data) return null;

  const queueType = gameType === 'lol' ? 'RANKED_SOLO_5x5' : 'RANKED_TFT';
  const tier = data.tier ?? 'UNRANKED';
  const rank = data.rank ?? '';
  const totalGames = data.wins + data.losses;
  const winRate = totalGames > 0 ? `${Math.round((data.wins / totalGames) * 100)}%` : '0%';

  return (
    <div id={`${gameType === 'lol' ? '' : 'tft-'}summoner-info`} className="card">
      <div className="card-title">Ranked Info</div>
      <div className="card-content">
        <div className="info-container">
          <div className="info-row">
            <span className="info-label">Tier</span>
            <div className="info-value">
              <div className="tier-container">
                {tier !== 'UNRANKED' && (
                  <img
                    className="tier-image"
                    src={getTierImageUrl(tier)}
                    alt={`${tier} ${rank}`}
                  />
                )}
                <div className="tier-text">
                  <div className="tier-row">
                    <span
                      className="tier-badge"
                      style={{ backgroundColor: getTierColor(tier) }}
                    >
                      {`${tier} ${rank}`.trim()}
                    </span>
                    <span>{data.lp ? `${data.lp} LP` : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="info-row">
            <span className="info-label">W / L</span>
            <span className="info-value">{`${data.wins}W ${data.losses}L`}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Win Rate</span>
            <span className="info-value">{winRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
