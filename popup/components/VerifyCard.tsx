import React from 'react';
import type { GameType } from '../types';
import type { VerifyState } from '../hooks/useVerify';

const DDRAGON_VERSION = '14.24.1';

interface Props {
  gameType: GameType;
  puuid: string;
  region: string;
  state: VerifyState;
  iconId: number | null;
  error: string | null;
  onStart: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function VerifyCard({
  gameType, puuid, region, state, iconId, error,
  onStart, onConfirm, onCancel,
}: Props) {
  if (state === 'done') return null;

  const isStarting = state === 'starting';
  const isPending = state === 'pending' || state === 'confirming' || state === 'error';

  return (
    <div className="card">
      <div className="card-title">소유권 인증</div>
      <div className="card-content">
        {!isPending ? (
          <>
            <p className="auth-sublabel" style={{ marginBottom: 8 }}>
              이 계정을 등록하려면 소유권 인증이 필요합니다.
            </p>
            <button type="button" onClick={onStart} disabled={isStarting}>
              {isStarting ? '처리 중...' : '인증 시작'}
            </button>
          </>
        ) : (
          <>
            <p className="auth-sublabel" style={{ marginBottom: 8 }}>
              인게임 프로필 아이콘을 아래 아이콘으로 변경 후 버튼을 클릭하세요.
            </p>
            {iconId && (
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`}
                  alt={`아이콘 #${iconId}`}
                  width={64}
                  height={64}
                  style={{ borderRadius: 8, border: '2px solid var(--border-color)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  #{iconId}
                </div>
              </div>
            )}
            {error && (
              <div className="status-message error" style={{ marginBottom: 8 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={onConfirm}
                disabled={state === 'confirming'}
                style={{ flex: 1 }}
              >
                {state === 'confirming' ? '확인 중...' : '인증 완료'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={state === 'confirming'}
                style={{ flex: 1 }}
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
