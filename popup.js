import api from './js/api/index.js';
import config from './js/config.js';

// CSS 변수에서 티어 색상을 가져오는 함수
function getTierColor(tier) {
  if (!tier) return 'var(--tier-unranked)';
  if (tier.toLowerCase() === 'emerald') return '#0ac3a6';
  return `var(--tier-${tier.toLowerCase()})`;
}

// 티어 이미지 URL을 가져오는 함수
function getTierImageUrl(tier) {
  if (!tier || tier.toUpperCase() === 'UNRANKED') {
    return 'images/Ranked Emblems Latest/Rank=Iron.png';
  }
  const tierMap = {
    'IRON': 'Iron', 'BRONZE': 'Bronze', 'SILVER': 'Silver', 'GOLD': 'Gold',
    'PLATINUM': 'Platinum', 'EMERALD': 'Emerald', 'DIAMOND': 'Diamond',
    'MASTER': 'Master', 'GRANDMASTER': 'Grandmaster', 'CHALLENGER': 'Challenger'
  };
  const name = tierMap[tier.toUpperCase()] || 'Iron';
  return `images/Ranked Emblems Latest/Rank=${name}.png`;
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

// ==================== Tab Navigation ====================

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      // Update buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
    const tagLine = tagLineInput.value.trim() || 'KR1';
    const region = regionSelect.value;

    if (!gameName) {
      showStatusMessage(riotStatusMessage, 'Please enter a summoner name', 'error');
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
    currentSummonerData = await api.summoner.getSummonerByPuuid(currentPuuid, region);
    currentRankData = await api.rank.getRankByPuuid(currentPuuid, region);
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
    tierImageElement.src = getTierImageUrl('UNRANKED');
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
    const tagLine = tagInput.value.trim() || 'KR1';
    const region = regionSelect.value;

    if (!gameName) {
      showStatusMessage(statusMessage, 'Please enter a summoner name', 'error');
      return;
    }

    connectBtn.disabled = true;
    showStatusMessage(statusMessage, 'Looking up TFT info...', 'info');

    // TFT 키로 Account 조회 → PUUID 획득
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
    tftSummonerData = await api.tft.getSummonerByPuuid(tftPuuid, r);
    tftRankData = await api.tft.getRankByPuuid(tftPuuid, r);
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
    // TFT ranked queue type: RANKED_TFT
    const tftRank = tftRankData.find(rank => rank.queueType === 'RANKED_TFT') || tftRankData[0];
    if (tftRank) {
      const tier = tftRank.tier || 'UNRANKED';
      const rank = tftRank.rank || '';
      tierBadgeElement.textContent = `${tier} ${rank}`;
      tierBadgeElement.style.backgroundColor = getTierColor(tier);
      tierImageElement.src = getTierImageUrl(tier);
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
    tierImageElement.src = getTierImageUrl('UNRANKED');
    tierLpElement.textContent = '';
    winLossElement.textContent = '-';
    winRateElement.textContent = '-';
  }
}

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
    }
  } catch (error) {
    console.error('Error loading saved TFT data:', error);
  }
}

// ==================== Init ====================

document.addEventListener('DOMContentLoaded', async () => {
  // Tab navigation
  setupTabs();

  // LoL button
  const connectRiotBtn = document.getElementById('connect-riot');
  if (connectRiotBtn) {
    connectRiotBtn.addEventListener('click', handleSummonerLookup);
  }

  // TFT button
  const connectTftBtn = document.getElementById('connect-tft');
  if (connectTftBtn) {
    connectTftBtn.addEventListener('click', handleTftLookup);
  }

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

  // Load saved data
  await loadSavedSummonerData();
  await loadSavedTftData();
});
