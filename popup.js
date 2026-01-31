import api from './js/api/index.js';
import config from './js/config.js';

// CSS 변수에서 티어 색상을 가져오는 함수
function getTierColor(tier) {
  if (!tier) return 'var(--tier-unranked)';
  
  // 에메랄드 티어 추가
  if (tier.toLowerCase() === 'emerald') {
    return '#0ac3a6'; // 에메랄드 티어 색상
  }
  
  const tierLower = tier.toLowerCase();
  return `var(--tier-${tierLower})`;
}

// 티어 이미지 URL을 가져오는 함수
function getTierImageUrl(tier) {
  // 티어 이름 처리
  if (!tier || tier.toUpperCase() === 'UNRANKED') {
    return 'images/Ranked Emblems Latest/Rank=Iron.png';
  }
  
  // 티어에 따른 이미지 경로 반환
  switch(tier.toUpperCase()) {
    case 'IRON':
      return 'images/Ranked Emblems Latest/Rank=Iron.png';
    case 'BRONZE':
      return 'images/Ranked Emblems Latest/Rank=Bronze.png';
    case 'SILVER':
      return 'images/Ranked Emblems Latest/Rank=Silver.png';
    case 'GOLD':
      return 'images/Ranked Emblems Latest/Rank=Gold.png';
    case 'PLATINUM':
      return 'images/Ranked Emblems Latest/Rank=Platinum.png';
    case 'EMERALD':
      return 'images/Ranked Emblems Latest/Rank=Emerald.png';
    case 'DIAMOND':
      return 'images/Ranked Emblems Latest/Rank=Diamond.png';
    case 'MASTER':
      return 'images/Ranked Emblems Latest/Rank=Master.png';
    case 'GRANDMASTER':
      return 'images/Ranked Emblems Latest/Rank=Grandmaster.png';
    case 'CHALLENGER':
      return 'images/Ranked Emblems Latest/Rank=Challenger.png';
    default:
      return 'images/Ranked Emblems Latest/Rank=Iron.png';
  }
}

// Global variables
let currentSummonerData = null;
let currentRankData = null;
let currentPuuid = null;

// Region options
const regions = {
  kr: 'asia',
  jp1: 'asia',
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  oc1: 'sea',
  ph2: 'sea',
  sg2: 'sea',
  th2: 'sea',
  tw2: 'sea',
  vn2: 'sea',
  euw1: 'europe',
  eun1: 'europe',
  tr1: 'europe',
  ru: 'europe'
};

/**
 * 상태 메시지 표시 함수
 * @param {HTMLElement} element - 메시지를 표시할 요소
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 (info, success, error)
 */
function showStatusMessage(element, message, type = '') {
  if (!element) return;
  
  // 이전 클래스 제거
  element.classList.remove('info', 'success', 'error');
  
  if (message) {
    element.textContent = message;
    if (type) {
      element.classList.add(type);
    }
  } else {
    element.textContent = '';
  }
}

// 페이지 로드 시 실행
/**
 * 소환사 정보 조회 함수
 */
async function handleSummonerLookup() {
  console.log('handleSummonerLookup called');
  
  const riotStatusMessage = document.getElementById('riot-status-message');
  const summonerNameInput = document.getElementById('summoner-name-input');
  const tagLineInput = document.getElementById('tag-line-input');
  const regionSelect = document.getElementById('region-select');
  const connectRiotBtn = document.getElementById('connect-riot');
  
  try {
    // Clear previous status
    showStatusMessage(riotStatusMessage, '', '');
    
    // Validate inputs
    const gameName = summonerNameInput.value.trim();
    const tagLine = tagLineInput.value.trim() || 'KR1';
    const region = regionSelect.value;
    
    console.log('Looking up summoner:', gameName, tagLine, region);
    
    if (!gameName) {
      showStatusMessage(riotStatusMessage, 'Please enter a summoner name', 'error');
      return;
    }
    
    // Show loading state
    connectRiotBtn.disabled = true;
    showStatusMessage(riotStatusMessage, 'Looking up summoner...', 'info');
    
    // Fetch summoner data by Riot ID
    console.log('Calling getSummonerByRiotId...');
    const accountInfo = await api.summoner.getSummonerByRiotId(gameName, tagLine);
    console.log('API response:', accountInfo);
    
    if (accountInfo.error) {
      throw new Error(accountInfo.error);
    }
    
    // Save PUUID for later use
    currentPuuid = accountInfo.puuid;
    
    // Save summoner data to storage
    await saveSummonerData({
      gameName: accountInfo.gameName,
      tagLine: accountInfo.tagLine,
      puuid: accountInfo.puuid,
      region: regionSelect.value
    });
    
    // Fetch additional data
    await fetchSummonerDetails();
    
    // Update UI
    updateUIWithSummonerData();
    showStatusMessage(riotStatusMessage, 'Summoner found!', 'success');
  } catch (error) {
    console.error('Summoner lookup error:', error);
    showStatusMessage(riotStatusMessage, `Error: ${error.message || 'Failed to find summoner'}`, 'error');
  } finally {
    connectRiotBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded event fired');
  
  // DOM 요소 직접 참조
  const connectRiotBtn = document.getElementById('connect-riot');
  const regionSelect = document.getElementById('region-select');
  
  console.log('Direct button reference:', connectRiotBtn);
  
  if (connectRiotBtn) {
    console.log('Adding click event to button');
    
    // 버튼 클릭 이벤트 등록
    connectRiotBtn.addEventListener('click', async function() {
      console.log('Button clicked');
      handleSummonerLookup();
    });
  } else {
    console.error('Button element not found!');
  }
  
  // 기존 이벤트 리스너 설정
  setupEventListeners();
  console.log('Event listeners set up');
  
  // 저장된 데이터 로드
  await loadSavedSummonerData();
  console.log('Saved summoner data loaded');
});

/**
 * Set up event listeners
 */
/**
 * 이벤트 리스너 설정 함수
 */
function setupEventListeners() {
  // DOM element references
  const connectRiotBtn = document.getElementById('connect-riot');
  const regionSelect = document.getElementById('region-select');
  
  console.log('Button element in setupEventListeners:', connectRiotBtn);
  console.log('Region select element:', regionSelect);
  
  if (!connectRiotBtn || !regionSelect) {
    console.error('Required DOM elements not found in setupEventListeners');
    return;
  }
  
  // Region selection change event
  regionSelect.addEventListener('change', () => {
    console.log('Region changed');
    const selectedRegion = regionSelect.value;
    config.setSetting('region', selectedRegion);
    connectRiotBtn.disabled = !selectedRegion;
  });
  
  // Load saved region
  const savedRegion = config.getSetting('region', 'kr');
  regionSelect.value = savedRegion;
  connectRiotBtn.disabled = !savedRegion;
  
  // 버튼 클릭 이벤트는 DOMContentLoaded에서 직접 등록함
}

/**
 * Load saved summoner data from storage
 */
async function loadSavedSummonerData() {
  try {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['summonerData'], (result) => {
        resolve(result.summonerData);
      });
    });
    
    if (data && data.puuid) {
      // Update state
      currentPuuid = data.puuid;
      
      // Update UI with saved data
      const summonerNameInput = document.getElementById('summoner-name-input');
      const tagLineInput = document.getElementById('tag-line-input');
      const regionSelect = document.getElementById('region-select');
      
      if (summonerNameInput && data.gameName) {
        summonerNameInput.value = data.gameName;
      }
      
      if (tagLineInput && data.tagLine) {
        tagLineInput.value = data.tagLine;
      }
      
      if (regionSelect && data.region) {
        regionSelect.value = data.region;
        config.setSetting('region', data.region);
      }
      
      // Fetch additional data
      await fetchSummonerDetails();
      
      // Update UI
      updateUIWithSummonerData();
    }
  } catch (error) {
    console.error('Error loading saved summoner data:', error);
  }
}

/**
 * Save summoner data to storage
 * @param {Object} data - Summoner data to save
 */
async function saveSummonerData(data) {
  try {
    await new Promise((resolve) => {
      chrome.storage.local.set({ summonerData: data }, () => {
        resolve();
      });
    });
    console.log('Summoner data saved successfully');
  } catch (error) {
    console.error('Error saving summoner data:', error);
  }
}

/**
 * Fetch summoner details (profile, rank, etc.)
 */
async function fetchSummonerDetails() {
  if (!currentPuuid) return;
  
  try {
    const region = config.getSetting('region', 'kr');
    
    // Fetch summoner info
    const summonerInfo = await api.summoner.getSummonerByPuuid(currentPuuid, region);
    currentSummonerData = summonerInfo;
    
    // Fetch rank info
    const rankInfo = await api.rank.getRankByPuuid(currentPuuid, region);
    currentRankData = rankInfo;
    
    console.log('Summoner details fetched successfully:', { summonerInfo, rankInfo });
  } catch (error) {
    console.error('Error fetching summoner details:', error);
  }
}

/**
 * Update UI with summoner data
 */
function updateUIWithSummonerData() {
  // Update summoner info
  const summonerNameElement = document.getElementById('summoner-name');
  const tierImageElement = document.getElementById('tier-image');
  const tierBadgeElement = document.getElementById('tier-badge');
  const tierLpElement = document.getElementById('tier-lp');
  const winLossElement = document.getElementById('win-loss');
  const winRateElement = document.getElementById('win-rate');
  
  // PUUID는 계속 불러오지만 시각적으로 보이지 않도록 처리
  if (currentPuuid) {
    summonerNameElement.textContent = currentPuuid;
  } else if (currentSummonerData && currentSummonerData.puuid) {
    summonerNameElement.textContent = currentSummonerData.puuid;
  }
  
  if (currentRankData && currentRankData.length > 0) {
    // Find solo queue rank (RANKED_SOLO_5x5)
    const soloRank = currentRankData.find(rank => rank.queueType === 'RANKED_SOLO_5x5') || currentRankData[0];
    
    if (soloRank) {
      // Update tier badge
      const tier = soloRank.tier || 'UNRANKED';
      const rank = soloRank.rank || '';
      
      // 티어 배지에 티어와 랜크 표시
      tierBadgeElement.textContent = `${tier} ${rank}`;
      
      // Set background color based on tier
      tierBadgeElement.style.backgroundColor = getTierColor(tier);
      
      // 티어 이미지 업데이트
      tierImageElement.src = getTierImageUrl(tier);
      
      // Update LP - 포인트 표시
      tierLpElement.textContent = soloRank.tier ? `${soloRank.leaguePoints} LP` : '';
      
      // Update win/loss
      const wins = soloRank.wins || 0;
      const losses = soloRank.losses || 0;
      winLossElement.textContent = `${wins}W ${losses}L`;
      
      // Update win rate
      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
      winRateElement.textContent = `${winRate}%`;
    }
  } else {
    // No rank data
    tierBadgeElement.textContent = 'UNRANKED';
    tierBadgeElement.style.backgroundColor = getTierColor('UNRANKED');
    tierImageElement.src = getTierImageUrl('UNRANKED');
    tierLpElement.textContent = '';
    winLossElement.textContent = '-';
    winRateElement.textContent = '-';
  }
}

// 이 함수는 이미 위에서 정의되었으므로 삭제합니다.

// 이전 showStatusMessage 함수는 제거됨 (중복 선언)
