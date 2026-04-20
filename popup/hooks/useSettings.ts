import { useState, useEffect } from 'react';
import config from '../../js/config.js';
import type { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    showLol: true,
    showTft: true,
    region: 'kr',
  });

  useEffect(() => {
    config.loadSettings().then(() => {
      setSettings({
        showLol: config.getSetting('showLol', true),
        showTft: config.getSetting('showTft', true),
        region: config.getSetting('region', 'kr'),
      });
    });
  }, []);

  const update = (key: keyof Settings, value: unknown) => {
    config.setSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, update };
}
