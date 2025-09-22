// 팝업 UI 관련 스크립트

// 기본 설정
const EXTENSION_CONFIG = {
  // 내 티어 정보 (하드코딩)
  myNickname: '내 닉네임',
  myTier: 'CHALLENGER I',
  myTierColor: '#f4c873'
};

// 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
  // 티어 정보 표시
  const tierNameElement = document.querySelector('.tier-name');
  const tierValueElement = document.querySelector('.tier-value');
  
  if (tierNameElement) tierNameElement.textContent = EXTENSION_CONFIG.myNickname;
  if (tierValueElement) {
    tierValueElement.textContent = EXTENSION_CONFIG.myTier;
    tierValueElement.style.color = EXTENSION_CONFIG.myTierColor;
  }
  
  // 활성화 상태 불러오기
  chrome.storage.local.get('enableTier', (data) => {
    const enableTierCheckbox = document.getElementById('enable-tier');
    
    // 저장된 값이 있으면 그 값을 사용, 없으면 기본값 true 사용
    const isEnabled = data.enableTier !== undefined ? data.enableTier : true;
    enableTierCheckbox.checked = isEnabled;
    
    // 체크박스 변경 이벤트 리스너 추가
    enableTierCheckbox.addEventListener('change', () => {
      const newValue = enableTierCheckbox.checked;
      
      // 스토리지에 저장
      chrome.storage.local.set({ enableTier: newValue }, () => {
        // content script에 변경 사항 알리기
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url.includes('chzzk.naver.com')) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleTier', enabled: newValue });
          }
        });
      });
    });
  });
});
