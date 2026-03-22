(function () {
  'use strict';

  // ==================== Constants ====================

  const SERVER_URL = 'https://chzzk-riot-tier-tracker-fastify-production.up.railway.app';
  const API_ENDPOINT = `${SERVER_URL}/api/tier`;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const BATCH_DELAY = 300; // ms debounce
  const PROCESSED_ATTR = 'data-crtt-processed';

  const TIER_COLORS = {
    IRON: '#72767d',
    BRONZE: '#b97451',
    SILVER: '#7e8183',
    GOLD: '#f1a64d',
    PLATINUM: '#4fccc6',
    EMERALD: '#3eb489',
    DIAMOND: '#576ace',
    MASTER: '#9d4dc3',
    GRANDMASTER: '#ef4444',
    CHALLENGER: '#f4c873',
  };

  const TIER_SHORT = {
    IRON: 'I',
    BRONZE: 'B',
    SILVER: 'S',
    GOLD: 'G',
    PLATINUM: 'P',
    EMERALD: 'E',
    DIAMOND: 'D',
    MASTER: 'M',
    GRANDMASTER: 'GM',
    CHALLENGER: 'C',
  };

  const RANK_NUM = { I: 1, II: 2, III: 3, IV: 4 };

  const TIER_IMG_MAP = {
    IRON: 'Iron', BRONZE: 'Bronze', SILVER: 'Silver', GOLD: 'Gold',
    PLATINUM: 'Platinum', EMERALD: 'Emerald', DIAMOND: 'Diamond',
    MASTER: 'Master', GRANDMASTER: 'Grandmaster', CHALLENGER: 'Challenger',
  };

  // No rank suffix for Master+
  const NO_RANK_TIERS = new Set(['MASTER', 'GRANDMASTER', 'CHALLENGER']);

  // DOM selectors (partial match for CSS module hashes)
  const SEL = {
    chatWrapper: '[class*="live_chatting_list_wrapper"]',
    chatItem: '[class*="live_chatting_list_item"]',
    usernameWrapper: '[class*="live_chatting_username_container"]',
    nickname: '[class*="live_chatting_username_nickname"]',
  };

  // ==================== State ====================

  const tierCache = new Map(); // nickname -> { data: [], timestamp }
  const pendingNicknames = new Set();
  let batchTimer = null;
  let settings = { showLol: true, showTft: true };
  let tooltipEl = null;

  // ==================== Settings ====================

  function initSettings() {
    chrome.storage.local.get(['settings'], (result) => {
        const s = result.settings || {};
        settings.showLol = s.showLol !== false;
        settings.showTft = s.showTft !== false;
        rerenderAllBadges();
        console.log('[CRTT] 초기 설정 로드 완료:', settings);
      });
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      const s = changes.settings.newValue || {};
      settings.showLol = s.showLol !== false;
      settings.showTft = s.showTft !== false;
      rerenderAllBadges();
      console.log('[CRTT] 설정 변경 감지 및 rerender:', settings);
    }
  });

  // ==================== API ====================

  async function fetchTierData(nickname) {
    const cached = tierCache.get(nickname);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const url = `${API_ENDPOINT}?chzzk_name=${encodeURIComponent(nickname)}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json = await resp.json();
      const data = json.entries || [];
      tierCache.set(nickname, { data, timestamp: Date.now() });
      return data;
    } catch (e) {
      console.error('[CRTT] fetch error:', e);
      return null;
    }
  }

  // ==================== Batch Processing ====================

  function queueNickname(nickname) {
    pendingNicknames.add(nickname);
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(processBatch, BATCH_DELAY);
  }

  async function processBatch() {
    const nicknames = [...pendingNicknames];
    pendingNicknames.clear();
    batchTimer = null;

    await Promise.allSettled(
      nicknames.map(async (nick) => {
        const data = await fetchTierData(nick);
        injectBadgesForNickname(nick, data);
      })
    );
  }

  // ==================== Message Processing ====================

  function processNewMessage(msgEl) {
    if (msgEl.hasAttribute(PROCESSED_ATTR)) return;

    const nicknameEl = msgEl.querySelector(SEL.nickname);
    if (!nicknameEl) return;

    const nickname = nicknameEl.textContent.trim().replace(/:$/, '');
    if (!nickname) return;

    msgEl.setAttribute(PROCESSED_ATTR, '');
    msgEl.setAttribute('data-crtt-nick', nickname);

    // Check cache first
    const cached = tierCache.get(nickname);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      injectBadge(msgEl, cached.data);
      return;
    }

    // Queue for batch fetch
    queueNickname(nickname);
  }

  function injectBadgesForNickname(nickname, entries) {
    if (!entries) return;
    const escapedNick = CSS.escape(nickname);
    const messages = document.querySelectorAll(`[data-crtt-nick="${escapedNick}"]`);
    messages.forEach((msg) => {
      if (!msg.querySelector('.crtt-badge-wrapper')) {
        injectBadge(msg, entries);
      }
    });
  }

  // ==================== Badge Injection ====================

  function injectBadge(msgEl, entries) {
    if (!entries || entries.length === 0) return;

    const wrapperEl = msgEl.querySelector(SEL.usernameWrapper);
    const nicknameEl = msgEl.querySelector(SEL.nickname);
    if (!wrapperEl || !nicknameEl) return;

    const targetParent = nicknameEl.parentNode;
    if (!targetParent) return;

    const badgeContainer = document.createElement('span');
    badgeContainer.className = 'crtt-badge-wrapper';

    // entries를 순회하면서 **현재 settings에 따라** 필터링
    entries.forEach((entry) => {
      if (entry.game_type === 'lol' && !settings.showLol) return;
      if (entry.game_type === 'tft' && !settings.showTft) return;
      if (!entry.tier) return;

      const tierUpper = entry.tier.toUpperCase();
      const tierImgName = TIER_IMG_MAP[tierUpper];

      if (!tierImgName) return; // 매핑 없는 티어는 스킵

      const imgSrc = chrome.runtime.getURL(
        `images/RankedEmblemsLatest/Rank=${tierImgName}.png`
      );

      const badge = document.createElement('span');
      badge.className = 'crtt-tier-badge';  // 클래스 이름 변경 (CSS 구분용)
      badge.dataset.gameType = entry.game_type;
      badge._tierEntry = entry;

      // 이미지 요소 생성
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `${entry.tier} ${entry.rank || ''}`;
      img.width = 20;   // 크기 조절 (원하는 대로 변경)
      img.height = 20;
      img.style.verticalAlign = 'middle';
      img.style.marginRight = '2px';  // 배지 간 간격

      badge.appendChild(img);

      badge.addEventListener('mouseenter', onBadgeEnter);
      badge.addEventListener('mouseleave', onBadgeLeave);

      badgeContainer.appendChild(badge);
    });

    // 실제 배지가 하나라도 생겼을 때만 삽입
    if (badgeContainer.children.length > 0) {
      // 기존 배지 제거 후 새로 넣기 (중복 방지)
      const existing = targetParent.querySelector('.crtt-badge-wrapper');
      if (existing) existing.remove();

      targetParent.insertBefore(badgeContainer, nicknameEl);
    }
  }

  // ==================== Tooltip ====================

  function ensureTooltip() {
    if (tooltipEl) return;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'crtt-tooltip';
    document.body.appendChild(tooltipEl);
  }

  function onBadgeEnter(e) {
    const entry = e.currentTarget._tierEntry;
    if (!entry) return;
    showTooltip(e.currentTarget, entry);
  }

  function onBadgeLeave() {
    hideTooltip();
  }

  function showTooltip(badgeEl, entry) {
    ensureTooltip();

    const tierUpper = entry.tier ? entry.tier.toUpperCase() : '';
    const tierName = entry.tier ? `${entry.tier} ${entry.rank || ''}`.trim() : 'UNRANKED';
    const tierImgName = TIER_IMG_MAP[tierUpper] || '';
    const tierImgUrl = tierImgName
      ? chrome.runtime.getURL(`images/RankedEmblemsLatest/Rank=${tierImgName}.png`)
      : '';
    const gameLabel = entry.game_type === 'lol' ? 'League of Legends' : 'Teamfight Tactics';
    const lpText = entry.league_points != null ? `${entry.league_points} LP` : '';
    const nameText = entry.riot_game_name ? `${escapeHtml(entry.riot_game_name)}#${escapeHtml(entry.riot_tag_line || '')}` : '';

    tooltipEl.innerHTML = `
      <div class="crtt-tooltip-header">
        ${tierImgUrl ? `<img class="crtt-tooltip-tier-img" src="${tierImgUrl}" alt="${escapeHtml(tierName)}">` : ''}
        <div class="crtt-tooltip-info">
          <div class="crtt-tooltip-game">${escapeHtml(gameLabel)}</div>
          <div class="crtt-tooltip-tier-text" style="color:${TIER_COLORS[tierUpper] || '#fff'}">${escapeHtml(tierName)}</div>
          ${lpText ? `<div class="crtt-tooltip-lp">${escapeHtml(lpText)}</div>` : ''}
        </div>
      </div>
      ${nameText ? `<div class="crtt-tooltip-name">${nameText}</div>` : ''}
    `;

    // Position below the badge
    const rect = badgeEl.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 6;

    // Prevent overflow
    const tooltipWidth = 200;
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 8;
    }
    if (top + 120 > window.innerHeight) {
      top = rect.top - 6 - 100; // above
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    tooltipEl.classList.add('crtt-tooltip--visible');
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('crtt-tooltip--visible');
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Re-render ====================

  function rerenderAllBadges() {
    // 기존 배지만 제거 (캐시는 보존 — API 재호출 불필요)
    document.querySelectorAll('.crtt-badge-wrapper').forEach((el) => el.remove());

    // processed 메시지들에 대해 캐시에서 바로 배지 재삽입
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => {
      const nick = el.getAttribute('data-crtt-nick');
      if (!nick) return;
      const cached = tierCache.get(nick);
      if (cached) {
        injectBadge(el, cached.data);
      }
    });
  }

  // ==================== MutationObserver ====================

  let chatObserver = null;
  let attachTimer = null;

  function startObserver() {
    if (chatObserver) {
      chatObserver.disconnect();
      chatObserver = null;
    }
    if (attachTimer) {
      clearTimeout(attachTimer);
      attachTimer = null;
    }

    const tryAttach = () => {
      const chatContainer = document.querySelector(SEL.chatWrapper);
      if (!chatContainer) {
        attachTimer = setTimeout(tryAttach, 1000);
        return;
      }

      // Process existing messages
      chatContainer.querySelectorAll(SEL.chatItem).forEach(processNewMessage);

      // Observe new messages
      chatObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches && node.matches(SEL.chatItem)) {
              processNewMessage(node);
            }
            const items = node.querySelectorAll?.(SEL.chatItem);
            if (items) items.forEach(processNewMessage);
          }
        }
      });

      chatObserver.observe(chatContainer, { childList: true, subtree: true });
      console.log('[CRTT] MutationObserver attached to chat container');
    };

    tryAttach();
  }

  // ==================== SPA Route Change Detection ====================

  function initRouteObserver() {
    let lastUrl = location.href;

    new MutationObserver(() => {
      if (location.href === lastUrl) return;
      lastUrl = location.href;

      if (location.href.includes('/live/')) {
        console.log('[CRTT] Live page detected, restarting observer');
        startObserver();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // ==================== Init ====================

  initSettings();
  startObserver();
  initRouteObserver();
  console.log('%c[CRTT] Chzzk Riot Tier Tracker loaded', 'background: #1a73e8; color: white; padding: 4px 8px; border-radius: 3px;');
})();
