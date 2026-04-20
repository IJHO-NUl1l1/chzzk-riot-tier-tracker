import React, { useEffect, useState } from 'react';
import ChzzkCard from '../ChzzkCard';
import RiotCard from '../RiotCard';
import { useChzzkAuth } from '../../hooks/useChzzkAuth';
import { useRiotAuth } from '../../hooks/useRiotAuth';

export default function HomePage() {
  const { auth, login, logout } = useChzzkAuth();
  const { lolEntry, tftEntry, loading, register, unlink, togglePrivacy, logout: riotLogout } = useRiotAuth(auth);

  const [lolSearch, setLolSearch] = useState<any>(null);
  const [tftSearch, setTftSearch] = useState<any>(null);

  useEffect(() => {
    chrome.storage.local.get(['summonerData', 'tftData'], (result) => {
      setLolSearch(result.summonerData ?? null);
      setTftSearch(result.tftData ?? null);
    });

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.summonerData) setLolSearch(changes.summonerData.newValue ?? null);
      if (changes.tftData) setTftSearch(changes.tftData.newValue ?? null);
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
        loading={loading}
        onRegister={register}
        onUnlink={unlink}
        onTogglePrivacy={togglePrivacy}
        onLogout={riotLogout}
      />
    </>
  );
}
