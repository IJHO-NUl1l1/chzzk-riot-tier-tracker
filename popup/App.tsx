import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import HomePage from './components/pages/HomePage';
import SearchPage from './components/pages/SearchPage';
import SettingsPage from './components/pages/SettingsPage';

type Page = 'home' | 'search' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <>
      <main id="app">
        <h1>Riot Tier Tracker</h1>
        <section className="page active">
          {page === 'home' && <HomePage />}
          {page === 'search' && <SearchPage />}
          {page === 'settings' && <SettingsPage />}
        </section>
      </main>
      <BottomNav current={page} onChange={setPage} />
    </>
  );
}
