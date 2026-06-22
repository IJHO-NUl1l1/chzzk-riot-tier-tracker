import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import ObsOverlayCard from '../ObsOverlayCard';

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
        </div>
      </div>

      <ObsOverlayCard />

      <div className="card">
        <div className="card-title">About</div>
        <div className="card-content">
          <div className="about-info">
            <span className="about-label">Version</span>
            <span className="about-value">1.1.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
