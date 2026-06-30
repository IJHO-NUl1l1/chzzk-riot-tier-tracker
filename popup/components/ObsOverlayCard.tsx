import { useEffect, useRef, useState } from 'react';

const OVERLAY_BASE = 'https://chzzk-riot-tier-tracker-web.vercel.app/overlay';

type Game = 'lol' | 'tft';

function extractChannelId(url: string): string | null {
  const live = url.match(/chzzk\.naver\.com\/live\/([a-f0-9]{32})/);
  if (live) return live[1];
  const studio = url.match(/studio\.chzzk\.naver\.com\/([a-f0-9]{32})/);
  if (studio) return studio[1];
  return null;
}

const CheckIcon = () => (
  <span style={{ color: '#39ff85', textShadow: '0 0 6px #39ff85, 0 0 12px #39ff85', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>
);

function UrlRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="obs-url-row">
      <div className="obs-url-label-row">
        <span className="obs-url-label">{label}</span>
      </div>
      <div className="obs-url-input-row">
        <input className="obs-url-input" readOnly value={url} title={url} />
        <div className="obs-copy-wrap">
          <button className="obs-copy-btn" onClick={copy}>
            {copied
              ? <CheckIcon />
              : <img src={chrome.runtime.getURL('images/copy-icon.png')} alt="복사" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} />
            }
          </button>
          <span className={`obs-copy-tooltip${copied ? ' copied' : ''}`}>
            {copied ? 'Copied!' : 'Copy full OBS overlay URL'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ObsOverlayCard() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [game, setGame] = useState<Game>('lol');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      setChannelId(extractChannelId(url));
    });
  }, []);

  const makeUrl = (mode: 'list' | 'stats') =>
    `${OVERLAY_BASE}/${channelId}?mode=${mode}&game=${game}`;

  return (
    <div className="card">
      <div className="card-title">OBS 오버레이</div>
      <div className="card-content">
        {!channelId ? (
          <p className="obs-no-channel">치지직 방송 페이지에서 열어주세요</p>
        ) : (
          <>
            <div className="obs-section-header">
              <span className="obs-section-label">채팅창</span>
              <span className="obs-section-hint">자유 크기</span>
            </div>
            <UrlRow label="채팅 오버레이" url={`${OVERLAY_BASE}/${channelId}?mode=chat`} />

            <div className="obs-section-divider" />

            <div className="obs-section-header">
              <span className="obs-section-label">통계</span>
              <span className="obs-section-hint">너비 400px+</span>
            </div>
            <div className="obs-tab-row">
              <button
                className={`obs-tab${game === 'lol' ? ' active' : ''}`}
                onClick={() => setGame('lol')}
              >
                LoL
              </button>
              <button
                className={`obs-tab${game === 'tft' ? ' active' : ''}`}
                onClick={() => setGame('tft')}
              >
                TFT
              </button>
            </div>
            <UrlRow label="티어 랭킹" url={makeUrl('list')} />
            <UrlRow label="티어 분포" url={makeUrl('stats')} />
          </>
        )}
      </div>
    </div>
  );
}
