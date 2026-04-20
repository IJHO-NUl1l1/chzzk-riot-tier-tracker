import React, { useState } from 'react';
import type { ChzzkAuth } from '../types';

interface Props {
  auth: ChzzkAuth | null;
  onLogin: () => void;
  onLogout: () => Promise<void>;
}

export default function ChzzkCard({ auth, onLogin, onLogout }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await onLogout();
    setLoading(false);
  };

  if (auth?.channelId) {
    return (
      <div className="auth-card auth-card--connected">
        <div className="auth-card-visual auth-card-visual--active">
          <div className="auth-orb auth-orb--active" />
          <svg className="auth-logo auth-logo--active" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="auth-card-body">
          <span className="auth-label">Chzzk Account</span>
          <div className="auth-channel">
            <span className="auth-channel-dot" />
            <span className="auth-channel-name">{auth.channelName || auth.channelId}</span>
          </div>
        </div>
        <button
          type="button"
          className="btn-disconnect"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-visual">
        <div className="auth-orb" />
        <svg className="auth-logo" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
      <div className="auth-card-body">
        <span className="auth-label">Chzzk Account</span>
        <span className="auth-sublabel">Not connected</span>
      </div>
      <button type="button" className="btn-auth" onClick={onLogin}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Connect
      </button>
      <p className="auth-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          1. 버튼을 누르면 로그인 창이 열리고 팝업이 닫힙니다<br />
          2. 치지직에 로그인 상태면 자동 로그인 진행<br />
          3. 이 팝업을 다시 열어 연동을 확인하세요
        </span>
      </p>
    </div>
  );
}
