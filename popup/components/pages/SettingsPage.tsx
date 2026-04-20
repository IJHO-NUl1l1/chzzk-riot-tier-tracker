import React from 'react';
import { useSettings } from '../../hooks/useSettings';

const REGIONS = [
  { value: 'kr', label: 'Korea (KR)' },
  { value: 'jp', label: 'Japan (JP)' },
  { value: 'na', label: 'North America (NA)' },
  { value: 'euw', label: 'Europe West (EUW)' },
  { value: 'eune', label: 'Europe Nordic & East (EUNE)' },
  { value: 'br', label: 'Brazil (BR)' },
];

export default function SettingsPage() {
  const { settings, update } = useSettings();

  return (
    <>
      <div className="card">
        <div className="card-title">Settings</div>
        <div className="card-content">
          <div className="settings-item">
            <span className="settings-label">LoL 배지 표시</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.showLol}
                onChange={(e) => update('showLol', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-item">
            <span className="settings-label">TFT 배지 표시</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.showTft}
                onChange={(e) => update('showTft', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-item">
            <span className="settings-label">Default region</span>
            <select
              className="settings-select"
              value={settings.region}
              onChange={(e) => update('region', e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">About</div>
        <div className="card-content">
          <div className="about-info">
            <span className="about-label">Version</span>
            <span className="about-value">0.1.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
