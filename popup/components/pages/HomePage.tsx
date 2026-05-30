import React, { useEffect, useState } from 'react';
import ChzzkCard from '../ChzzkCard';
import RiotCard from '../RiotCard';
import { useChzzkAuth } from '../../hooks/useChzzkAuth';
import { useRiotAuth } from '../../hooks/useRiotAuth';
import { verifiedKey } from '../../hooks/useVerify';

export default function HomePage({ onGoToSearch }: { onGoToSearch?: () => void }) {
  const { auth, login, logout } = useChzzkAuth();
  const { lolEntry, tftEntry, loading, register, unlink, togglePrivacy, refreshTier, logout: riotLogout } = useRiotAuth(auth);

  const [lolSearch, setLolSearch] = useState<any>(null);
  const [tftSearch, setTftSearch] = useState<any>(null);
  const [lolVerified, setLolVerified] = useState(false);
  const [tftVerified, setTftVerified] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ['summonerData', 'tftData', verifiedKey('lol'), verifiedKey('tft')],
      (result) => {
        setLolSearch(result.summonerData ?? null);
        setTftSearch(result.tftData ?? null);
        setLolVerified(!!result[verifiedKey('lol')]);
        setTftVerified(!!result[verifiedKey('tft')]);
      }
    );

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.summonerData) setLolSearch(changes.summonerData.newValue ?? null);
      if (changes.tftData) setTftSearch(changes.tftData.newValue ?? null);
      if (changes[verifiedKey('lol')]) setLolVerified(!!changes[verifiedKey('lol')].newValue);
      if (changes[verifiedKey('tft')]) setTftVerified(!!changes[verifiedKey('tft')].newValue);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return (
    <>
      <ChzzkCard auth={auth} onLogin={login} onLogout={logout} />
      <RiotCard
        auth={auth}
        lolEntry={lolEntry}
        tftEntry={tftEntry}
        lolSearchData={lolSearch}
        tftSearchData={tftSearch}
        lolVerified={lolVerified}
        tftVerified={tftVerified}
        loading={loading}
        onRegister={register}
        onUnlink={unlink}
        onTogglePrivacy={togglePrivacy}
        onRefresh={refreshTier}
        onLogout={riotLogout}
        onGoToSearch={onGoToSearch}
      />
    </>
  );
}
