import { useState } from 'react';
import { getTierColor, getTierImageUrl } from '../lib/tier';
import type { TierEntry, GameType } from '../types';

const COOLDOWN_MS = 5 * 60 * 1000;
const ARROW_ICON = chrome.runtime.getURL('images/arrow-circle.png');

interface Props {
  gameType: GameType;
  entry: TierEntry | null;
  searchData: { gameName: string; tier: string | null; rank: string | null; lp: number } | null;
  isChzzkConnected: boolean;
  isVerifiedSearch: boolean;
  onUnlink: () => void;
  onTogglePrivacy: (isPublic: boolean) => void;
  onGoToSearch?: () => void;
  onRegister: () => void;
  onRefresh: () => Promise<{ changed: boolean } | null>;
}

export default function TierColumn({
  gameType, entry, searchData, isChzzkConnected, isVerifiedSearch,
  onUnlink, onTogglePrivacy, onGoToSearch, onRegister, onRefresh,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  const display = entry ?? searchData ?? null;
  const isRegistered = !!entry;
  const hasSearchData = !!searchData && !isRegistered;
  const label = gameType.toUpperCase();

  const remainingSecs = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  const isCoolingDown = remainingSecs > 0;

  const handleRefresh = async () => {
    if (refreshing || isCoolingDown) return;
    setRefreshing(true);
    try {
      await onRefresh();
      setCooldownUntil(Date.now() + COOLDOWN_MS);
    } catch (e: any) {
      if (e?.message?.startsWith('COOLDOWN:')) {
        const secs = parseInt(e.message.split(':')[1], 10);
        setCooldownUntil(Date.now() + secs * 1000);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="riot-split-col">
      <div className="riot-split-col-header">
        <span className="riot-split-title">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isRegistered && (
            <img
              src={ARROW_ICON}
              alt="refresh"
              title={isCoolingDown ? `${remainingSecs}초 후 갱신 가능` : '티어 갱신'}
              onClick={handleRefresh}
              style={{
                width: 13,
                height: 13,
                cursor: isCoolingDown ? 'not-allowed' : 'pointer',
                opacity: isCoolingDown ? 0.2 : 0.5,
                filter: 'invert(1)',
                animation: refreshing ? 'crtt-spin 0.7s linear infinite' : 'none',
                transition: 'opacity 0.15s',
                display: 'block',
                flexShrink: 0,
                background: 'none',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => { if (!isCoolingDown) (e.currentTarget as HTMLImageElement).style.opacity = '0.9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = isCoolingDown ? '0.2' : '0.5'; }}
            />
          )}
          {isRegistered && (
            <label className="toggle toggle--sm" title="공개/비공개">
              <input
                type="checkbox"
                checked={entry!.isPublic}
                onChange={(e) => onTogglePrivacy(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          )}
        </div>
      </div>

      {display?.tier ? (
        <img
          className="riot-split-tier-img"
          src={getTierImageUrl(display.tier)}
          alt={display.tier}
        />
      ) : (
        <img className="riot-split-tier-img" hidden />
      )}

      <span className="riot-split-value">
        {display ? `${display.gameName ?? '-'}` : '-'}
      </span>

      {display ? (
        <span
          className="riot-split-tier"
          style={{ backgroundColor: getTierColor(display.tier), display: '' }}
        >
          {display.tier ? `${display.tier} ${display.rank ?? ''}`.trim() : 'UNRANKED'}
        </span>
      ) : (
        <span className="riot-split-tier" style={{ display: 'none' }}>-</span>
      )}

      {isRegistered && display?.lp != null && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text)',
          letterSpacing: '0.02em',
          marginTop: 1,
        }}>
          <span style={{ color: 'var(--color-accent-bright)' }}>{display.lp}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 11, marginLeft: 2 }}>LP</span>
        </span>
      )}

      {isRegistered ? (
        <button type="button" className="btn-riot-col-unlink" onClick={onUnlink}>
          Unlink
        </button>
      ) : (
        <>
          <button
            type="button"
            className="btn-riot-register"
            disabled={!isVerifiedSearch || !isChzzkConnected}
            onClick={onRegister}
          >
            Register
          </button>
          {hasSearchData && isChzzkConnected && !isVerifiedSearch && (
            <span
              onClick={onGoToSearch}
              style={{
                display: 'block',
                marginTop: 4,
                fontSize: 10,
                color: '#ef4444',
                cursor: 'pointer',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              ⚠ 인증 후 등록할 수 있습니다
            </span>
          )}
        </>
      )}
    </div>
  );
}
