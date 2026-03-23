import api from './js/api/index.js';
import config from './js/config.js';

// ==================== JWT ====================

async function getAuthHeaders() {
  const { jwt_token } = await chrome.storage.local.get(['jwt_token']);
  return jwt_token ? { 'Authorization': `Bearer ${jwt_token}` } : {};
}

async function getLiveId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url?.match(/\/live\/([^/?#]+)/)?.[1] ?? null;
}

// ==================== Chzzk Auth ====================

function setButtonLoading(btn, loading, loadingText) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText;
    btn.classList.add('is-loading');
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.classList.remove('is-loading');
    btn.disabled = false;
  }
}

function handleChzzkLogin() {
  const btn = document.getElementById('btn-chzzk-login');
  setButtonLoading(btn, true, 'Connecting...');
  chrome.runtime.sendMessage({ action: 'chzzk_login' });
}

async function handleChzzkLogout() {
  const btn = document.getElementById('btn-chzzk-logout');
  setButtonLoading(btn, true, 'Disconnecting...');

  try {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['chzzkAuth'], (result) => resolve(result.chzzkAuth));
    });

    if (data && data.userId) {
      const headers = await getAuthHeaders();
      await api.chzzk.revokeToken(data.userId, data.channelId, headers);
    }
  } catch (e) {
    console.error('Revoke failed:', e);
  }

  chrome.storage.local.remove(['chzzkAuth', 'jwt_token']);
  setButtonLoading(btn, false);
  updateChzzkAuthUI(null);
}

function updateChzzkAuthUI(authData) {
  const disconnected = document.getElementById('chzzk-disconnected');
  const connected = document.getElementById('chzzk-connected');
  const channelName = document.getElementById('chzzk-channel-name');

  const isConnected = authData && authData.channelId;

  if (isConnected) {
    disconnected.style.display = 'none';
    connected.style.display = 'flex';
    channelName.textContent = authData.channelName || authData.channelId;
  } else {
    disconnected.style.display = 'flex';
    connected.style.display = 'none';
    channelName.textContent = '-';
  }

  // Riot UI depends on Chzzk state
  loadRiotAuthData();
}

async function loadChzzkAuthData() {
  const data = await new Promise((resolve) => {
    chrome.storage.local.get(['chzzkAuth'], (result) => resolve(result.chzzkAuth));
  });
  updateChzzkAuthUI(data || null);
}

// ==================== Riot Auth (Beta — 3단계) ====================

function showRiotLoading(show) {
  const loading = document.getElementById('riot-loading');
  const disconnected = document.getElementById('riot-disconnected');
  const connected = document.getElementById('riot-connected');
  if (show) {
    loading.style.display = 'flex';
    disconnected.style.display = 'none';
    connected.style.display = 'none';
  } else {
    loading.style.display = 'none';
  }
}

// Fill a single column (LoL or TFT) with tier data
function fillTierColumn(prefix, data) {
  const nameEl = document.getElementById(`riot-${prefix}-name`);
  const tierEl = document.getElementById(`riot-${prefix}-tier`);
  const tierImg = document.getElementById(`riot-${prefix}-tier-img`);

  if (!nameEl) return;

  nameEl.textContent = data && data.gameName
    ? `${data.gameName}#${data.tagLine}`
    : '-';

  if (data && data.tier) {
    tierEl.textContent = `${data.tier} ${data.rank || ''}`.trim();
    tierEl.style.backgroundColor = getTierColor(data.tier);
    tierEl.style.display = '';
    tierImg.src = getTierImageUrl(data.tier);
    tierImg.alt = data.tier;
    tierImg.hidden = false;
  } else if (data && data.puuid) {
    tierEl.textContent = 'UNRANKED';
    tierEl.style.backgroundColor = '#444';
    tierEl.style.display = '';
    tierImg.hidden = true;
  } else {
    tierEl.textContent = '-';
    tierEl.style.display = 'none';
    tierImg.hidden = true;
  }
}

// Set column button state: Register or Unlink
function setColumnButton(btnId, isRegistered, isEnabled) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (isRegistered) {
    btn.textContent = 'Unlink';
    btn.className = 'btn-riot-col-unlink';
    btn.disabled = false;
  } else {
    btn.textContent = 'Register';
    btn.className = 'btn-riot-register';
    btn.disabled = !isEnabled;
  }
}

// Main UI update — handles all 3 stages
function updateRiotUI(riotConnected, lolDbEntry, tftDbEntry, lolSearchData, tftSearchData, chzzkConnected) {
  document.getElementById('riot-loading').style.display = 'none';
  const disconnected = document.getElementById('riot-disconnected');
  const connected = document.getElementById('riot-connected');

  if (!riotConnected) {
    // Stage 1: disconnected
    disconnected.style.display = 'flex';
    connected.style.display = 'none';

    return;
  }

  // Stage 2/3: connected
  disconnected.style.display = 'none';
  connected.style.display = 'flex';

  const lolRegistered = !!lolDbEntry;
  const tftRegistered = !!tftDbEntry;

  // LoL column: DB data takes priority, fallback to search data
  fillTierColumn('lol', lolDbEntry || lolSearchData || null);
  setColumnButton('btn-lol-action', lolRegistered, chzzkConnected);

  // TFT column: same logic
  fillTierColumn('tft', tftDbEntry || tftSearchData || null);
  setColumnButton('btn-tft-action', tftRegistered, chzzkConnected);

  // Chzzk hint: always visible, icon changes dynamically
  const hintEl = document.getElementById('riot-hint-chzzk');
  const chzzkIcon = document.getElementById('riot-check-chzzk-icon');
  if (hintEl) {
    hintEl.style.display = '';
  }
  if (chzzkIcon) {
    chzzkIcon.className = `auth-check-icon ${chzzkConnected ? 'is-met' : 'is-unmet'}`;
    chzzkIcon.textContent = chzzkConnected ? '✔' : '✕';
  }
}

// Normalize DB entry to match search data shape
function dbEntryToData(entry) {
  if (!entry) return null;
  return {
    gameName: entry.riot_game_name,
    tagLine: entry.riot_tag_line,
    puuid: entry.riot_puuid,
    tier: entry.tier,
    rank: entry.rank,
    lp: entry.league_points,
  };
}

// Cached DB state for button handlers
let _riotDbState = { lolEntry: null, tftEntry: null };

async function loadRiotAuthData() {
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['summonerData', 'tftData', 'chzzkAuth'], resolve);
  });

  const chzzkAuth = result.chzzkAuth;
  const chzzkConnected = !!(chzzkAuth && chzzkAuth.channelId);
  const lolSearch = result.summonerData || null;
  const tftSearch = result.tftData || null;

  let lolDbEntry = null;
  let tftDbEntry = null;

  // riotConnected: search 데이터가 있으면 2단계 (chzzk 연결과 무관)
  // 1단계는 search 캐시가 없거나 유저가 직접 Logout 했을 때만
  let riotConnected = !!(lolSearch || tftSearch);

  if (chzzkConnected) {
    showRiotLoading(true);
    try {
      const dbResult = await api.chzzk.getTierCache(chzzkAuth.channelId);
      if (dbResult.entries) {
        lolDbEntry = dbResult.entries.find(e => e.game_type === 'lol') || null;
        tftDbEntry = dbResult.entries.find(e => e.game_type === 'tft') || null;
      }
      // DB에 데이터 있어도 riotConnected
      if (lolDbEntry || tftDbEntry) riotConnected = true;
    } catch (e) {
      console.error('Failed to check tier cache:', e);
    }
  }

  _riotDbState = { lolEntry: lolDbEntry, tftEntry: tftDbEntry };
  updateRiotUI(riotConnected, dbEntryToData(lolDbEntry), dbEntryToData(tftDbEntry), lolSearch, tftSearch, chzzkConnected);
}

// Stage 1 → Stage 2: OAuth button (Beta: just switch to connected view)
function handleRiotOAuth() {
  // Beta: 바로 2단계로 전환 — search 데이터 기반으로 표시
  const disconnected = document.getElementById('riot-disconnected');
  const connected = document.getElementById('riot-connected');
  disconnected.style.display = 'none';
  connected.style.display = 'flex';
}

// Register a single game type to DB
async function handleGameRegister(gameType) {
  const btnId = gameType === 'lol' ? 'btn-lol-action' : 'btn-tft-action';
  const prefix = gameType === 'lol' ? 'lol' : 'tft';
  const btn = document.getElementById(btnId);
  const storageKey = gameType === 'lol' ? 'summonerData' : 'tftData';

  setButtonLoading(btn, true, '...');
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get(['chzzkAuth', storageKey], resolve);
    });

    const chzzkAuth = result.chzzkAuth;
    if (!chzzkAuth || !chzzkAuth.channelId) throw new Error('Chzzk not connected');

    const data = result[storageKey];
    if (!data || !data.puuid) throw new Error('No search data');

    const entry = {
      riotPuuid: data.puuid,
      gameType,
      queueType: gameType === 'lol' ? 'RANKED_SOLO_5x5' : 'RANKED_TFT',
      tier: data.tier || null,
      rank: data.rank || null,
      leaguePoints: data.lp ?? 0,
      wins: 0,
      losses: 0,
      gameName: data.gameName || null,
      tagLine: data.tagLine || null,
    };

    const headers = await getAuthHeaders();
    const liveId = await getLiveId();
    await api.chzzk.saveTierCache(chzzkAuth.channelId, [entry], headers, liveId);

    // Brief success indicator then update only this column
    btn.textContent = '✔';
    btn.classList.remove('is-loading');
    btn.classList.add('is-success');
    setTimeout(() => {
      btn.classList.remove('is-success');
      fillTierColumn(prefix, data);
      setColumnButton(btnId, true, true);
    }, 600);
  } catch (e) {
    console.error(`Failed to register ${gameType}:`, e);
    setButtonLoading(btn, false);
  }
}

// Unlink a single game type from DB
async function handleGameUnlink(gameType) {
  const btnId = gameType === 'lol' ? 'btn-lol-action' : 'btn-tft-action';
  const prefix = gameType === 'lol' ? 'lol' : 'tft';
  const storageKey = gameType === 'lol' ? 'summonerData' : 'tftData';
  const btn = document.getElementById(btnId);

  setButtonLoading(btn, true, '...');
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get(['chzzkAuth', storageKey], resolve);
    });
    const chzzkAuth = result.chzzkAuth;
    const chzzkConnected = !!(chzzkAuth && chzzkAuth.channelId);

    if (chzzkConnected) {
      const headers = await getAuthHeaders();
      const liveId = await getLiveId();
      await api.chzzk.deleteTierCache(chzzkAuth.channelId, gameType, headers, liveId);
    }

    // Update only this column — fallback to search data
    const searchData = result[storageKey] || null;
    fillTierColumn(prefix, searchData);
    setColumnButton(btnId, false, chzzkConnected);
  } catch (e) {
    console.error(`Failed to unlink ${gameType}:`, e);
    setButtonLoading(btn, false);
  }
}

// Column button click dispatcher
function handleLolAction() {
  const btn = document.getElementById('btn-lol-action');
  if (btn && btn.classList.contains('btn-riot-col-unlink')) {
    handleGameUnlink('lol');
  } else {
    handleGameRegister('lol');
  }
}

function handleTftAction() {
  const btn = document.getElementById('btn-tft-action');
  if (btn && btn.classList.contains('btn-riot-col-unlink')) {
    handleGameUnlink('tft');
  } else {
    handleGameRegister('tft');
  }
}

// Logout: delete all tier_cache + go back to stage 1
async function handleRiotLogout() {
  const btn = document.getElementById('btn-riot-logout');
  setButtonLoading(btn, true, '...');
  try {
    const chzzkAuth = await new Promise((resolve) => {
      chrome.storage.local.get(['chzzkAuth'], (r) => resolve(r.chzzkAuth));
    });
    if (chzzkAuth && chzzkAuth.channelId) {
      const headers = await getAuthHeaders();
      const liveId = await getLiveId();
      await api.chzzk.deleteTierCache(chzzkAuth.channelId, undefined, headers, liveId);
    }
  } catch (e) {
    console.error('Logout error:', e);
  }
  chrome.storage.local.remove(['summonerData', 'tftData']);
  setButtonLoading(btn, false);
  await loadRiotAuthData();
}

// Auto-update UI when storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.chzzkAuth) {
    updateChzzkAuthUI(changes.chzzkAuth.newValue || null);
  }
  if (changes.summonerData || changes.tftData) {
    loadRiotAuthData();
  }
});

// CSS 변수에서 티어 색상을 가져오는 함수
function getTierColor(tier) {
  if (!tier) return 'var(--tier-unranked)';
  if (tier.toLowerCase() === 'emerald') return '#0ac3a6';
  return `var(--tier-${tier.toLowerCase()})`;
}

// 티어 이미지 URL을 가져오는 함수
function getTierImageUrl(tier) {
  if (!tier || tier.toUpperCase() === 'UNRANKED') {
    return 'images/RankedEmblemsLatest/Rank=Iron.png';
  }
  const tierMap = {
    'IRON': 'Iron', 'BRONZE': 'Bronze', 'SILVER': 'Silver', 'GOLD': 'Gold',
    'PLATINUM': 'Platinum', 'EMERALD': 'Emerald', 'DIAMOND': 'Diamond',
    'MASTER': 'Master', 'GRANDMASTER': 'Grandmaster', 'CHALLENGER': 'Challenger'
  };
  const name = tierMap[tier.toUpperCase()] || 'Iron';
  return `images/RankedEmblemsLatest/Rank=${name}.png`;
}

// Global variables
let currentSummonerData = null;
let currentRankData = null;
let currentPuuid = null;

// TFT global variables
let tftSummonerData = null;
let tftRankData = null;
let tftPuuid = null;

/**
 * 상태 메시지 표시 함수
 */
function showStatusMessage(element, message, type = '') {
  if (!element) return;
  element.classList.remove('info', 'success', 'error');
  if (message) {
    element.textContent = message;
    if (type) element.classList.add(type);
  } else {
    element.textContent = '';
  }
}

// ==================== Page Navigation ====================

function setupPageNav() {
  const navItems = document.querySelectorAll('.nav-item');
  const bubble = document.querySelector('.nav-bubble');

  function moveBubble(target) {
    const nav = target.closest('.bottom-nav');
    const navRect = nav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const left = targetRect.left - navRect.left;
    bubble.style.transform = `translateX(${left}px)`;
    bubble.style.width = `${targetRect.width}px`;
  }

  // Initial position
  const activeItem = document.querySelector('.nav-item.active');
  if (activeItem && bubble) {
    requestAnimationFrame(() => {
      bubble.style.transition = 'none';
      moveBubble(activeItem);
      requestAnimationFrame(() => {
        bubble.style.transition = '';
      });
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${page}`).classList.add('active');
      moveBubble(item);
    });
  });
}

// ==================== Tab Navigation ====================

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      // Update buttons
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      // Update content
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${tab}-content`).classList.add('active');
    });
  });
}

// ==================== LoL Functions ====================

async function handleSummonerLookup() {
  const riotStatusMessage = document.getElementById('riot-status-message');
  const summonerNameInput = document.getElementById('summoner-name-input');
  const tagLineInput = document.getElementById('tag-line-input');
  const regionSelect = document.getElementById('region-select');
  const connectRiotBtn = document.getElementById('connect-riot');

  try {
    showStatusMessage(riotStatusMessage, '', '');
    const gameName = summonerNameInput.value.trim();
    const tagLine = tagLineInput.value.trim();
    const region = regionSelect.value;

    if (!gameName && !tagLine) {
      showStatusMessage(riotStatusMessage, 'Please enter a summoner name and tag', 'error');
      return;
    }
    if (!gameName) {
      showStatusMessage(riotStatusMessage, 'Please enter a summoner name', 'error');
      return;
    }
    if (!tagLine) {
      showStatusMessage(riotStatusMessage, 'Please enter a tag', 'error');
      return;
    }

    connectRiotBtn.disabled = true;
    showStatusMessage(riotStatusMessage, 'Looking up summoner...', 'info');

    const accountInfo = await api.summoner.getSummonerByRiotId(gameName, tagLine);
    if (accountInfo.error) throw new Error(accountInfo.error);

    currentPuuid = accountInfo.puuid;
    await saveSummonerData({
      gameName: accountInfo.gameName,
      tagLine: accountInfo.tagLine,
      puuid: accountInfo.puuid,
      region: regionSelect.value
    });

    await fetchSummonerDetails();
    updateUIWithSummonerData();
    await saveSummonerTier();
    showStatusMessage(riotStatusMessage, 'Summoner found!', 'success');
  } catch (error) {
    console.error('Summoner lookup error:', error);
    showStatusMessage(riotStatusMessage, `Error: ${error.message || 'Failed to find summoner'}`, 'error');
  } finally {
    connectRiotBtn.disabled = false;
  }
}

async function fetchSummonerDetails() {
  if (!currentPuuid) return;
  try {
    const region = config.getSetting('region', 'kr');
    [currentSummonerData, currentRankData] = await Promise.all([
      api.summoner.getSummonerByPuuid(currentPuuid, region),
      api.rank.getRankByPuuid(currentPuuid, region),
    ]);
  } catch (error) {
    console.error('Error fetching summoner details:', error);
  }
}

function updateUIWithSummonerData() {
  const summonerNameElement = document.getElementById('summoner-name');
  const tierImageElement = document.getElementById('tier-image');
  const tierBadgeElement = document.getElementById('tier-badge');
  const tierLpElement = document.getElementById('tier-lp');
  const winLossElement = document.getElementById('win-loss');
  const winRateElement = document.getElementById('win-rate');

  if (currentPuuid) {
    summonerNameElement.textContent = currentPuuid;
  }

  if (currentRankData && currentRankData.length > 0) {
    const soloRank = currentRankData.find(rank => rank.queueType === 'RANKED_SOLO_5x5') || currentRankData[0];
    if (soloRank) {
      const tier = soloRank.tier || 'UNRANKED';
      const rank = soloRank.rank || '';
      tierBadgeElement.textContent = `${tier} ${rank}`;
      tierBadgeElement.style.backgroundColor = getTierColor(tier);
      tierImageElement.src = getTierImageUrl(tier);
      tierImageElement.alt = `${tier} ${rank}`;
      tierImageElement.hidden = false;
      tierLpElement.textContent = soloRank.tier ? `${soloRank.leaguePoints} LP` : '';
      const wins = soloRank.wins || 0;
      const losses = soloRank.losses || 0;
      winLossElement.textContent = `${wins}W ${losses}L`;
      const totalGames = wins + losses;
      winRateElement.textContent = totalGames > 0 ? `${Math.round((wins / totalGames) * 100)}%` : '0%';
    }
  } else {
    tierBadgeElement.textContent = 'UNRANKED';
    tierBadgeElement.style.backgroundColor = getTierColor('UNRANKED');
    tierImageElement.alt = 'Unranked';
    tierImageElement.hidden = true;
    tierLpElement.textContent = '';
    winLossElement.textContent = '-';
    winRateElement.textContent = '-';
  }
}

// ==================== TFT Functions ====================

async function handleTftLookup() {
  const statusMessage = document.getElementById('tft-status-message');
  const nameInput = document.getElementById('tft-summoner-name-input');
  const tagInput = document.getElementById('tft-tag-line-input');
  const regionSelect = document.getElementById('tft-region-select');
  const connectBtn = document.getElementById('connect-tft');

  try {
    showStatusMessage(statusMessage, '', '');
    const gameName = nameInput.value.trim();
    const tagLine = tagInput.value.trim();
    const region = regionSelect.value;

    if (!gameName && !tagLine) {
      showStatusMessage(statusMessage, 'Please enter a summoner name and tag', 'error');
      return;
    }
    if (!gameName) {
      showStatusMessage(statusMessage, 'Please enter a summoner name', 'error');
      return;
    }
    if (!tagLine) {
      showStatusMessage(statusMessage, 'Please enter a tag', 'error');
      return;
    }

    connectBtn.disabled = true;
    showStatusMessage(statusMessage, 'Looking up TFT info...', 'info');

    const accountInfo = await api.tft.getAccountByRiotId(gameName, tagLine, region);
    if (accountInfo.error) throw new Error(accountInfo.error);

    tftPuuid = accountInfo.puuid;
    await saveTftData({
      gameName: accountInfo.gameName,
      tagLine: accountInfo.tagLine,
      puuid: accountInfo.puuid,
      region: region
    });

    await fetchTftDetails(region);
    updateUIWithTftData();
    await saveTftTier();
    showStatusMessage(statusMessage, 'TFT info found!', 'success');
  } catch (error) {
    console.error('TFT lookup error:', error);
    showStatusMessage(statusMessage, `Error: ${error.message || 'Failed to find TFT info'}`, 'error');
  } finally {
    connectBtn.disabled = false;
  }
}

async function fetchTftDetails(region) {
  if (!tftPuuid) return;
  try {
    const r = region || config.getSetting('region', 'kr');
    [tftSummonerData, tftRankData] = await Promise.all([
      api.tft.getSummonerByPuuid(tftPuuid, r),
      api.tft.getRankByPuuid(tftPuuid, r),
    ]);
  } catch (error) {
    console.error('Error fetching TFT details:', error);
  }
}

function updateUIWithTftData() {
  const tierImageElement = document.getElementById('tft-tier-image');
  const tierBadgeElement = document.getElementById('tft-tier-badge');
  const tierLpElement = document.getElementById('tft-tier-lp');
  const winLossElement = document.getElementById('tft-win-loss');
  const winRateElement = document.getElementById('tft-win-rate');

  if (tftRankData && tftRankData.length > 0) {
    const tftRank = tftRankData.find(rank => rank.queueType === 'RANKED_TFT') || tftRankData[0];
    if (tftRank) {
      const tier = tftRank.tier || 'UNRANKED';
      const rank = tftRank.rank || '';
      tierBadgeElement.textContent = `${tier} ${rank}`;
      tierBadgeElement.style.backgroundColor = getTierColor(tier);
      tierImageElement.src = getTierImageUrl(tier);
      tierImageElement.alt = `${tier} ${rank}`;
      tierImageElement.hidden = false;
      tierLpElement.textContent = tftRank.tier ? `${tftRank.leaguePoints} LP` : '';
      const wins = tftRank.wins || 0;
      const losses = tftRank.losses || 0;
      winLossElement.textContent = `${wins}W ${losses}L`;
      const totalGames = wins + losses;
      winRateElement.textContent = totalGames > 0 ? `${Math.round((wins / totalGames) * 100)}%` : '0%';
    }
  } else {
    tierBadgeElement.textContent = 'UNRANKED';
    tierBadgeElement.style.backgroundColor = getTierColor('UNRANKED');
    tierImageElement.alt = 'Unranked';
    tierImageElement.hidden = true;
    tierLpElement.textContent = '';
    winLossElement.textContent = '-';
    winRateElement.textContent = '-';
  }
}

// ==================== Tier Storage ====================

async function saveSummonerTier() {
  try {
    const existing = await new Promise((resolve) => {
      chrome.storage.local.get(['summonerData'], (result) => resolve(result.summonerData));
    });
    if (!existing) return;

    let tier = null;
    let rank = null;
    let lp = null;
    if (currentRankData && currentRankData.length > 0) {
      const soloRank = currentRankData.find(r => r.queueType === 'RANKED_SOLO_5x5') || currentRankData[0];
      if (soloRank) {
        tier = soloRank.tier || null;
        rank = soloRank.rank || null;
        lp = soloRank.leaguePoints ?? null;
      }
    }
    await new Promise((resolve) => {
      chrome.storage.local.set({ summonerData: { ...existing, tier, rank, lp } }, resolve);
    });
  } catch (e) {
    console.error('Error saving summoner tier:', e);
  }
}

async function saveTftTier() {
  try {
    const existing = await new Promise((resolve) => {
      chrome.storage.local.get(['tftData'], (result) => resolve(result.tftData));
    });
    if (!existing) return;

    let tier = null;
    let rank = null;
    let lp = null;
    if (tftRankData && tftRankData.length > 0) {
      const tftRank = tftRankData.find(r => r.queueType === 'RANKED_TFT') || tftRankData[0];
      if (tftRank) {
        tier = tftRank.tier || null;
        rank = tftRank.rank || null;
        lp = tftRank.leaguePoints ?? null;
      }
    }
    await new Promise((resolve) => {
      chrome.storage.local.set({ tftData: { ...existing, tier, rank, lp } }, resolve);
    });
  } catch (e) {
    console.error('Error saving TFT tier:', e);
  }
}

// ==================== Server Sync ====================


// ==================== Storage ====================

async function saveSummonerData(data) {
  try {
    await new Promise((resolve) => {
      chrome.storage.local.set({ summonerData: data }, resolve);
    });
  } catch (error) {
    console.error('Error saving summoner data:', error);
  }
}

async function saveTftData(data) {
  try {
    await new Promise((resolve) => {
      chrome.storage.local.set({ tftData: data }, resolve);
    });
  } catch (error) {
    console.error('Error saving TFT data:', error);
  }
}

async function loadSavedSummonerData() {
  try {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['summonerData'], (result) => resolve(result.summonerData));
    });

    if (data && data.puuid) {
      currentPuuid = data.puuid;
      const summonerNameInput = document.getElementById('summoner-name-input');
      const tagLineInput = document.getElementById('tag-line-input');
      const regionSelect = document.getElementById('region-select');

      if (summonerNameInput && data.gameName) summonerNameInput.value = data.gameName;
      if (tagLineInput && data.tagLine) tagLineInput.value = data.tagLine;
      if (regionSelect && data.region) {
        regionSelect.value = data.region;
        config.setSetting('region', data.region);
      }

      await fetchSummonerDetails();
      updateUIWithSummonerData();
      await saveSummonerTier();
    }
  } catch (error) {
    console.error('Error loading saved summoner data:', error);
  }
}

async function loadSavedTftData() {
  try {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['tftData'], (result) => resolve(result.tftData));
    });

    if (data && data.puuid) {
      tftPuuid = data.puuid;
      const nameInput = document.getElementById('tft-summoner-name-input');
      const tagInput = document.getElementById('tft-tag-line-input');
      const regionSelect = document.getElementById('tft-region-select');

      if (nameInput && data.gameName) nameInput.value = data.gameName;
      if (tagInput && data.tagLine) tagInput.value = data.tagLine;
      if (regionSelect && data.region) regionSelect.value = data.region;

      await fetchTftDetails(data.region);
      updateUIWithTftData();
      await saveTftTier();
    }
  } catch (error) {
    console.error('Error loading saved TFT data:', error);
  }
}

// ==================== Init ====================

document.addEventListener('DOMContentLoaded', async () => {
  // Page navigation
  setupPageNav();

  // Tab navigation
  setupTabs();

  // Chzzk auth buttons
  const btnChzzkLogin = document.getElementById('btn-chzzk-login');
  if (btnChzzkLogin) btnChzzkLogin.addEventListener('click', handleChzzkLogin);
  const btnChzzkLogout = document.getElementById('btn-chzzk-logout');
  if (btnChzzkLogout) btnChzzkLogout.addEventListener('click', handleChzzkLogout);

  // Riot auth buttons (3-stage)
  const btnRiotOAuth = document.getElementById('btn-riot-oauth');
  if (btnRiotOAuth) btnRiotOAuth.addEventListener('click', handleRiotOAuth);
  const btnLolAction = document.getElementById('btn-lol-action');
  if (btnLolAction) btnLolAction.addEventListener('click', handleLolAction);
  const btnTftAction = document.getElementById('btn-tft-action');
  if (btnTftAction) btnTftAction.addEventListener('click', handleTftAction);
  const btnRiotLogout = document.getElementById('btn-riot-logout');
  if (btnRiotLogout) btnRiotLogout.addEventListener('click', handleRiotLogout);

  // LoL button + Enter key
  const connectRiotBtn = document.getElementById('connect-riot');
  if (connectRiotBtn) {
    connectRiotBtn.addEventListener('click', handleSummonerLookup);
  }
  document.querySelectorAll('#summoner-name-input, #tag-line-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSummonerLookup();
    });
  });

  // TFT button + Enter key
  const connectTftBtn = document.getElementById('connect-tft');
  if (connectTftBtn) {
    connectTftBtn.addEventListener('click', handleTftLookup);
  }
  document.querySelectorAll('#tft-summoner-name-input, #tft-tag-line-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleTftLookup();
    });
  });

  // Region change events
  const regionSelect = document.getElementById('region-select');
  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      config.setSetting('region', regionSelect.value);
    });
    const savedRegion = config.getSetting('region', 'kr');
    regionSelect.value = savedRegion;
  }

  const tftRegionSelect = document.getElementById('tft-region-select');
  if (tftRegionSelect) {
    const savedRegion = config.getSetting('region', 'kr');
    tftRegionSelect.value = savedRegion;
  }

  // Badge display settings
  const showLolToggle = document.getElementById('setting-show-lol');
  const showTftToggle = document.getElementById('setting-show-tft');

  chrome.storage.local.get(['settings'], (result) => {
    const s = result.settings || {};
    if (showLolToggle) showLolToggle.checked = s.showLol !== false;
    if (showTftToggle) showTftToggle.checked = s.showTft !== false;
  });

  if (showLolToggle) {
    showLolToggle.addEventListener('change', () => {
      config.setSetting('showLol', showLolToggle.checked);
    });
  }
  if (showTftToggle) {
    showTftToggle.addEventListener('change', () => {
      config.setSetting('showTft', showTftToggle.checked);
    });
  }

  // Default region setting
  const defaultRegionSelect = document.getElementById('setting-default-region');
  if (defaultRegionSelect) {
    const savedRegion = config.getSetting('region', 'kr');
    defaultRegionSelect.value = savedRegion;

    defaultRegionSelect.addEventListener('change', () => {
      const newRegion = defaultRegionSelect.value;
      config.setSetting('region', newRegion);
      // Search 페이지의 region select도 동기화
      if (regionSelect) regionSelect.value = newRegion;
      if (tftRegionSelect) tftRegionSelect.value = newRegion;
    });
  }

  // Load Chzzk auth first (Riot button state depends on it), then rest in parallel
  await loadChzzkAuthData();
  await Promise.all([loadRiotAuthData(), loadSavedSummonerData(), loadSavedTftData()]);
});
