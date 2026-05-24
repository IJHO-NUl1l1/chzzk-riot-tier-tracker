import React, { useState, useEffect } from 'react';
import SearchResult from '../SearchResult';
import VerifyCard from '../VerifyCard';
import { useSearch } from '../../hooks/useSearch';
import { useVerify } from '../../hooks/useVerify';
import { useChzzkAuth } from '../../hooks/useChzzkAuth';
import { useRiotAuth } from '../../hooks/useRiotAuth';
import config from '../../../js/config.js';
import type { GameType } from '../../types';

const REGIONS = [
  { value: 'kr', label: 'Korea (KR)' },
  { value: 'jp', label: 'Japan (JP)' },
  { value: 'na', label: 'North America (NA)' },
  { value: 'euw', label: 'Europe West (EUW)' },
  { value: 'eune', label: 'Europe Nordic & East (EUNE)' },
  { value: 'br', label: 'Brazil (BR)' },
];

interface GameSearchProps {
  gameType: GameType;
  onVerifyDone: () => void;
}

function GameSearch({ gameType, onVerifyDone }: GameSearchProps) {
  const { auth } = useChzzkAuth();
  const { register } = useRiotAuth(auth);
  const { result, loading, error, search } = useSearch(gameType);
  const { state, iconId, error: verifyError, start, confirm, reset } = useVerify(auth?.channelId);

  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState(config.getSetting('region', 'kr'));

  useEffect(() => {
    const storageKey = gameType === 'lol' ? 'summonerData' : 'tftData';
    chrome.storage.local.get([storageKey], (r) => {
      const d = r[storageKey];
      if (d) {
        setGameName(d.gameName ?? '');
        setTagLine(d.tagLine ?? '');
        if (d.region) setRegion(d.region);
      }
    });
  }, [gameType]);

  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await register(gameType);
      onVerifyDone();
    } catch (e) {
      console.error(e);
    }
    setRegistering(false);
  };

  const handleSearch = () => {
    if (!gameName.trim() || !tagLine.trim()) return;
    reset();
    search(gameName.trim(), tagLine.trim(), region);
  };

  const isLol = gameType === 'lol';

  return (
    <>
      <div className="card">
        <div className="card-title">Riot ID Lookup</div>
        <div className="card-content">
          <div className="form-group">
            <label>Region</label>
            <select value={region} onChange={(e) => { setRegion(e.target.value); config.setSetting('region', e.target.value); }}>
              <option value="">Select Region</option>
              {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group form-group-large">
              <label>Summoner Name</label>
              <input
                type="text"
                value={gameName}
                placeholder="Enter summoner name"
                onChange={(e) => setGameName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="form-group form-group-small">
              <label>Tag</label>
              <input
                type="text"
                value={tagLine}
                placeholder="KR1"
                onChange={(e) => setTagLine(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button type="button" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {error && <div className="status-message error">{error}</div>}
          {result && !error && (
            <div className="status-message success">
              {isLol ? 'Summoner found!' : 'TFT info found!'}
            </div>
          )}
        </div>
      </div>

      <SearchResult gameType={gameType} data={result} />

      {result && auth?.channelId && (
        <VerifyCard
          gameType={gameType}
          puuid={result.puuid}
          region={region}
          state={state}
          iconId={iconId}
          error={verifyError}
          onStart={() => start(result.puuid, gameType, region)}
          onConfirm={() => confirm(result.puuid, gameType, region)}
          onCancel={reset}
        />
      )}
      {result && (
        <button
          type="button"
          className="btn-riot-register"
          onClick={handleRegister}
          disabled={state !== 'done' || registering}
          style={{ marginTop: 8, width: '100%' }}
        >
          {registering ? '등록 중...' : 'Register'}
        </button>
      )}
    </>
  );
}

export default function SearchPage({ onVerifyDone }: { onVerifyDone: () => void }) {
  const [tab, setTab] = useState<GameType>('lol');

  return (
    <>
      <div className="tab-nav" role="tablist">
        {(['lol', 'tft'] as GameType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tab-btn${tab === t ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className={`tab-content${tab === 'lol' ? ' active' : ''}`}>
        {tab === 'lol' && <GameSearch gameType="lol" onVerifyDone={onVerifyDone} />}
      </div>
      <div className={`tab-content${tab === 'tft' ? ' active' : ''}`}>
        {tab === 'tft' && <GameSearch gameType="tft" onVerifyDone={onVerifyDone} />}
      </div>
    </>
  );
}
