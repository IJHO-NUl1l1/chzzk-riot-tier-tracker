import React, { useState } from 'react';
import TierColumn from './TierColumn';
import type { ChzzkAuth, TierEntry, GameType } from '../types';

interface Props {
  auth: ChzzkAuth | null;
  lolEntry: TierEntry | null;
  tftEntry: TierEntry | null;
  lolSearchData: { gameName: string; tier: string | null; rank: string | null; lp: number } | null;
  tftSearchData: { gameName: string; tier: string | null; rank: string | null; lp: number } | null;
  loading: boolean;
  onRegister: (gameType: GameType) => Promise<void>;
  onUnlink: (gameType: GameType) => Promise<void>;
  onTogglePrivacy: (gameType: GameType, isPublic: boolean) => Promise<void>;
  onLogout: () => Promise<void>;
}

export default function RiotCard({
  auth, lolEntry, tftEntry, lolSearchData, tftSearchData,
  loading, onRegister, onUnlink, onTogglePrivacy, onLogout,
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
        <button type="button" className="btn-auth btn-auth--riot" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Search로 계정 연결
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
          onRegister={() => handleRegister('lol')}
          onUnlink={() => handleUnlink('lol')}
          onTogglePrivacy={(v) => onTogglePrivacy('lol', v)}
        />
        <div className="riot-split-divider" />
        <TierColumn
          gameType="tft"
          entry={tftEntry}
          searchData={tftSearchData}
          isChzzkConnected={isChzzkConnected}
          onRegister={() => handleRegister('tft')}
          onUnlink={() => handleUnlink('tft')}
          onTogglePrivacy={(v) => onTogglePrivacy('tft', v)}
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
