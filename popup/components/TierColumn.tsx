import { getTierColor, getTierImageUrl } from '../lib/tier';
import type { TierEntry, GameType } from '../types';

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
}

export default function TierColumn({
  gameType, entry, searchData, isChzzkConnected, isVerifiedSearch,
  onUnlink, onTogglePrivacy, onGoToSearch, onRegister,
}: Props) {
  const display = entry ?? searchData ?? null;
  const isRegistered = !!entry;
  const hasSearchData = !!searchData && !isRegistered;
  const label = gameType.toUpperCase();

  return (
    <div className="riot-split-col">
      <div className="riot-split-col-header">
        <span className="riot-split-title">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isRegistered && (
            <span style={{ fontSize: 12 }}>
              {entry!.isVerified ? '✓' : '⚠'}
            </span>
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
