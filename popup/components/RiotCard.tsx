import React, { useState } from 'react';
import TierColumn from './TierColumn';
import type { ChzzkAuth, TierEntry, GameType } from '../types';

interface Props {
  auth: ChzzkAuth | null;
  lolEntry: TierEntry | null;
  tftEntry: TierEntry | null;
  lolSearchData: { gameName: string; tier: string | null; rank: string | null; lp: number } | null;
  tftSearchData: { gameName: string; tier: string | null; rank: string | null; lp: number } | null;
  lolVerified: boolean;
  tftVerified: boolean;
  loading: boolean;
  onRegister: (gameType: GameType) => Promise<void>;
  onUnlink: (gameType: GameType) => Promise<void>;
  onTogglePrivacy: (gameType: GameType, isPublic: boolean) => Promise<void>;
  onLogout: () => Promise<void>;
  onGoToSearch?: () => void;
}

export default function RiotCard({
  auth, lolEntry, tftEntry, lolSearchData, tftSearchData,
  lolVerified, tftVerified, loading, onRegister, onUnlink, onTogglePrivacy, onLogout, onGoToSearch,
}: Props) {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState<GameType | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState<GameType | null>(null);

  const isChzzkConnected = !!auth?.channelId;
  const isRiotConnected = !!(lolEntry || tftEntry || lolSearchData || tftSearchData);

  const handleRegister = async (gameType: GameType) => {
    setRegisterLoading(gameType);
    try { await onRegister(gameType); } catch (e) { console.error(e); }
    setRegisterLoading(null);
  };

  const handleUnlink = async (gameType: GameType) => {
    setUnlinkLoading(gameType);
    try { await onUnlink(gameType); } catch (e) { console.error(e); }
    setUnlinkLoading(null);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await onLogout();
    setLogoutLoading(false);
  };

  const shieldIcon = (connected: boolean) => (
    <svg className={`auth-logo${connected ? ' auth-logo--active' : ''}`} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {connected
        ? <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>
        : <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      }
    </svg>
  );

  if (loading) {
    return (
      <div className="auth-card">
        <div className="auth-card-visual">
          <div className="auth-orb auth-orb--riot" />
          {shieldIcon(false)}
        </div>
        <div className="auth-card-body">
          <span className="auth-label">Riot Account <span className="badge-beta">BETA</span></span>
          <span className="auth-sublabel auth-sublabel--loading">
            <span className="auth-spinner" />
            확인 중...
          </span>
        </div>
      </div>
    );
  }

  if (!isRiotConnected) {
    return (
      <div className="auth-card">
        <div className="auth-card-visual">
          <div className="auth-orb auth-orb--riot" />
          {shieldIcon(false)}
        </div>
        <div className="auth-card-body">
          <span className="auth-label">Riot Account <span className="badge-beta">BETA</span></span>
          <span className="auth-sublabel">Not connected</span>
        </div>
        <button type="button" className="btn-auth btn-auth--riot" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Riot으로 로그인
          <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>Coming Soon</span>
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', margin: '4px 0' }}>또는</div>
        <button type="button" className="btn-auth btn-auth--riot" onClick={onGoToSearch} disabled={!isChzzkConnected}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          소환사 검색으로 연결
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card auth-card--connected">
      <div className="auth-card-visual auth-card-visual--active">
        <div className="auth-orb auth-orb--riot auth-orb--active" />
        {shieldIcon(true)}
      </div>
      <div className="auth-card-body">
        <span className="auth-label">Riot Account <span className="badge-beta">BETA</span></span>
      </div>
      <div className="riot-split">
        <TierColumn
          gameType="lol"
          entry={lolEntry}
          searchData={lolSearchData}
          isChzzkConnected={isChzzkConnected}
          isVerifiedSearch={lolVerified}
          onRegister={() => handleRegister('lol')}
          onUnlink={() => handleUnlink('lol')}
          onTogglePrivacy={(v) => onTogglePrivacy('lol', v)}
          onGoToSearch={onGoToSearch}
        />
        <div className="riot-split-divider" />
        <TierColumn
          gameType="tft"
          entry={tftEntry}
          searchData={tftSearchData}
          isChzzkConnected={isChzzkConnected}
          isVerifiedSearch={tftVerified}
          onRegister={() => handleRegister('tft')}
          onUnlink={() => handleUnlink('tft')}
          onTogglePrivacy={(v) => onTogglePrivacy('tft', v)}
          onGoToSearch={onGoToSearch}
        />
      </div>
      <button
        type="button"
        className="btn-disconnect"
        onClick={handleLogout}
        disabled={logoutLoading}
      >
        {logoutLoading ? '...' : 'Logout'}
      </button>
    </div>
  );
}
