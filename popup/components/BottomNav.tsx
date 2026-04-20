import React, { useEffect, useRef } from 'react';

type Page = 'home' | 'search' | 'settings';

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  {
    page: 'home',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    page: 'search',
    label: 'Search',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    page: 'settings',
    label: 'Settings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface Props {
  current: Page;
  onChange: (page: Page) => void;
}

export default function BottomNav({ current, onChange }: Props) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const moveBubble = (index: number) => {
    const nav = navRef.current;
    const bubble = bubbleRef.current;
    if (!nav || !bubble) return;
    const buttons = nav.querySelectorAll('.nav-item');
    const target = buttons[index] as HTMLElement;
    if (!target) return;
    const navRect = nav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    bubble.style.transform = `translateX(${targetRect.left - navRect.left}px)`;
    bubble.style.width = `${targetRect.width}px`;
  };

  useEffect(() => {
    const index = NAV_ITEMS.findIndex((n) => n.page === current);
    requestAnimationFrame(() => {
      if (bubbleRef.current) bubbleRef.current.style.transition = 'none';
      moveBubble(index);
      requestAnimationFrame(() => {
        if (bubbleRef.current) bubbleRef.current.style.transition = '';
      });
    });
  }, [current]);

  return (
    <div className="bottom-nav-wrapper">
      <nav className="bottom-nav" ref={navRef}>
        <div className="nav-bubble" ref={bubbleRef} />
        {NAV_ITEMS.map(({ page, label, icon }) => (
          <button
            key={page}
            type="button"
            className={`nav-item${current === page ? ' active' : ''}`}
            onClick={() => onChange(page)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
