// 치지직 채팅창에 내 롤 티어를 표시하는 스크립트

// 기본 설정
const EXTENSION_CONFIG = {
  // 내 티어 정보 (하드코딩)
  myTier: 'CHALLENGER I',
  myTierColor: '#f4c873', // 챠린저 색상
  // 활성화 상태 초기값
  isEnabled: true
};

// 전역 변수 정의
let isEnabled = EXTENSION_CONFIG.isEnabled;

// 초기화 상태 관리
let isInitialized = false;
let chatObserverInterval = null;

// 시작 메시지
console.log('%c치지직 롤 티어 익스텐션 로드됨', 'background: #1a73e8; color: white; padding: 5px; border-radius: 3px;');
console.log('현재 URL:', window.location.href);
console.log('EXTENSION_CONFIG:', EXTENSION_CONFIG);

// 채팅 입력창 감지 함수
function monitorChatInput() {
  // 이미 초기화된 경우 중복 실행 방지
  if (isInitialized) {
    console.log('이미 초기화되어 있습니다.');
    // 인터벌 중지
    if (chatObserverInterval) {
      clearInterval(chatObserverInterval);
      chatObserverInterval = null;
      console.log('채팅 감지 인터벌 중지');
    }
    return;
  }
  
  // 비활성화 상태이면 실행하지 않음
  if (!isEnabled) return;
  
  // 페이지 타입 확인
  const isStudioPage = window.location.href.includes('studio.chzzk.naver.com');
  console.log('페이지 타입:', isStudioPage ? '스튜디오 채팅 페이지' : '일반 채팅 페이지');

  // 채팅 입력창 선택자 배열 (스튜디오와 일반 페이지 모두 포함)
  const chatInputSelectors = [
    '.studio_chat_input textarea',
    '.studio_chat_area textarea',
    '.live_chatting_input_area textarea',
    '.live_chatting_input textarea',
    'textarea[placeholder*="채팅"]',
    'textarea.live_chatting_input_text',
    'div[class*="chat"] textarea',
    'div[class*="chatting"] textarea',
    'textarea',
    '[contenteditable="true"]'
  ];
  
  // 채팅 전송 버튼 선택자
  const chatSendButtonSelectors = [
    '.live_chatting_submit_button',
    'button[class*="chat"][class*="send"]',
    'button[class*="submit"]',
    'button[aria-label*="전송"]'
  ];

  // 채팅 입력창 찾기
  let foundInputs = [];
  for (const selector of chatInputSelectors) {
    const inputs = document.querySelectorAll(selector);
    if (inputs.length > 0) {
      foundInputs = Array.from(inputs);
      console.log(`채팅 입력창 발견: ${selector}, 개수: ${inputs.length}`);
      break;
    } else {
      console.log(`선택자로 입력창 찾지 못함: ${selector}`);
    }
  }

  if (foundInputs.length === 0) {
    console.log('채팅 입력창을 찾지 못했습니다.');
    return; // 입력창을 찾지 못하면 여기서 종료
  }
  
  // 채팅 입력창 처리
  foundInputs.forEach(input => {
    // 이미 처리된 입력창은 건너뛰기
    if (input.dataset.tierMonitored) return;
    
    // Enter 키 이벤트 리스너 추가
    input.addEventListener('keydown', function(e) {
      // Enter 키를 누르면 채팅 전송으로 간주 (시프트 키는 줄바꿈)
      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('채팅 입력 감지 (Enter 키)');
        
        // 잠시 후 채팅이 표시되면 티어 정보 추가
        setTimeout(() => {
          addTierToMyChat();
        }, 200); // 조금 더 길게 대기
      }
    });
    
    // 처리 완료 표시
    input.dataset.tierMonitored = 'true';
    console.log('채팅 입력창 감지 시작:', input);
  });
  
  // 채팅 전송 버튼 처리
  let foundButtons = [];
  for (const selector of chatSendButtonSelectors) {
    const buttons = document.querySelectorAll(selector);
    if (buttons.length > 0) {
      foundButtons = Array.from(buttons);
      console.log(`채팅 전송 버튼 발견: ${selector}, 개수: ${buttons.length}`);
      break;
    }
  }
  
  // 채팅 전송 버튼 처리
  foundButtons.forEach(button => {
    // 이미 처리된 버튼은 건너뛰기
    if (button.dataset.tierMonitored) return;
    
    // 버튼 클릭 이벤트 리스너 추가
    button.addEventListener('click', function() {
      console.log('채팅 입력 감지 (버튼 클릭)');
      
      // 잠시 후 채팅이 표시되면 티어 정보 추가
      setTimeout(() => {
        addTierToMyChat();
      }, 200); // 조금 더 길게 대기
    });
    
    // 처리 완료 표시
    button.dataset.tierMonitored = 'true';
    console.log('채팅 전송 버튼 감지 시작:', button);
  });
  
  // 채팅 메시지 영역 감지
  // 치지직 채팅 영역의 다양한 선택자 시도
  const chatAreaSelectors = [
    // 스튜디오 페이지 선택자
    '.studio_chat_area',                        // 스튜디오 채팅 영역
    '.studio_chat_message_list',                // 스튜디오 채팅 메시지 리스트
    '.studio_chat_container',                   // 스튜디오 채팅 컨테이너
    // 일반 채팅 페이지 선택자
    '.live_chatting_list',                      // 기본 채팅 리스트
    '.live_chatting_message_container',         // 메시지 컨테이너
    '.live_chatting_area',                      // 채팅 영역
    // 공통 선택자
    '[class*="chatting_list"]',                // 채팅 리스트 클래스
    '[class*="chat_list"]',                    // 채팅 리스트 클래스
    '[class*="message_container"]',            // 메시지 컨테이너 클래스
    '[class*="chat_area"]',                    // 채팅 영역 클래스
    '[class*="chat_message"]'                  // 채팅 메시지 클래스
  ];
  
  // 채팅 영역 찾기
  let chatListElement = null;
  for (const selector of chatAreaSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      chatListElement = element;
      console.log(`채팅 영역 발견: ${selector}`);
      break;
    } else {
      console.log(`선택자로 채팅 영역 찾지 못함: ${selector}`);
    }
  }
  
  if (!chatListElement) {
    console.log('채팅 영역을 찾지 못했습니다.');
  }
  
  if (chatListElement && !chatListElement.dataset.tierObserved) {
    console.log('채팅 영역 관찰 시작');
    // MutationObserver를 통해 채팅 메시지 추가 감지
    const chatObserver = new MutationObserver((mutations) => {
      if (isEnabled) {
        // 변경 내용 확인
        let hasNewMessages = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            hasNewMessages = true;
            console.log('새 채팅 메시지 추가됨:', mutation.addedNodes.length, '개');
            break;
          }
        }
        
        if (hasNewMessages) {
          console.log('채팅 메시지 변경 감지 - 티어 추가 시도');
          addTierToMyChat();
        }
      }
    });
    
    // 채팅 메시지 영역 관찰 시작
    chatObserver.observe(chatListElement, { childList: true, subtree: true });
    chatListElement.dataset.tierObserved = 'true';
    console.log('채팅 메시지 영역 관찰자 설정 완료');
    
    // 초기 채팅 메시지들에 티어 추가
    console.log('초기 채팅 메시지에 티어 추가 시도');
    addTierToMyChat();
  } else if (!chatListElement) {
    console.log('채팅 영역을 찾지 못해 관찰자를 설정할 수 없습니다.');
  } else {
    console.log('이미 채팅 영역 관찰자가 설정되어 있습니다.');
  }
  
  // 채팅 입력창과 채팅 영역이 모두 발견되었다면 초기화 완료로 표시
  if (foundInputs.length > 0 && chatListElement) {
    isInitialized = true;
    console.log('채팅 관찰 초기화 완료');
  }
}

// 페이지 활성화 상태 및 타입 확인 함수
function isPageEnabled() {
  // 비활성화 상태이면 false 반환
  if (!isEnabled) {
    console.log('티어 표시 기능이 비활성화되어 있습니다.');
    return { isEnabled: false };
  }
  
  // 페이지 타입 확인
  const isStudioPage = window.location.href.includes('studio.chzzk.naver.com');
  return { isEnabled: true, isStudioPage };
}

// 페이지 타입에 따른 채팅 메시지 선택자 반환 함수
function getChatMessageSelectors(isStudioPage) {
  return isStudioPage ? [
    // 스튜디오 페이지 선택자
    '.studio_chat_message',
    '.studio_chat_message_item',
    '.studio_chat_area .chat_message',
    '.studio_chat_message_list > div',
    '[class*="studio_chat"] [class*="message"]',
    '[class*="chat_message"]'
  ] : [
    // 일반 채팅 페이지 선택자 - 이미지에서 확인한 정확한 선택자
    '.live_chatting_list_item__dOmx',        // 이미지에서 확인한 정확한 채팅 메시지 클래스
    '.live_chatting_list_item_dOmx',         // 이전 버전의 클래스 이름(언더스코어 하나/두개 차이)
    '.live_chatting_message_container__JYlY', // 메시지 컨테이너 클래스
    '.live_chatting_message_item',
    '.live_chatting_message_area',
    '.live_chatting_message_container_item',
    '.live_chatting_message_container__item',
    '.live_chatting_list_item',
    '.live_chatting_list > div',
    '.live_chatting_message_container > div',
    '[class*="chatting_list_item"]',         // 클래스 패턴
    '[class*="chatting_list"] > div',
    '[class*="chatting_message_container"]',
    '[class*="chatting_message"]',
    '[class*="chat_message"]'
  ];
}

// 처리되지 않은 채팅 메시지 찾기 함수
function findUnprocessedMessages(selectors) {
  console.log('채팅 메시지 처리 시작');
  
  let unprocessedMessages = [];
  let foundSelector = '';
  
  // 각 선택자로 채팅 메시지 찾기 시도
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`선택자 '${selector}'로 채팅 메시지 발견: ${elements.length}개`);
        // 처리되지 않은 메시지만 필터링
        unprocessedMessages = Array.from(elements).filter(el => !el.dataset.tierProcessed);
        console.log(`처리되지 않은 메시지: ${unprocessedMessages.length}개`);
        
        if (unprocessedMessages.length > 0) {
          console.log('처리할 메시지 발견');
          foundSelector = selector;
          break;
        }
      } else {
        console.log(`선택자 '${selector}'로 채팅 메시지를 찾지 못함`);
      }
    } catch (error) {
      console.error(`선택자 ${selector} 처리 중 오류:`, error);
    }
  }
  
  return { unprocessedMessages, foundSelector };
}

// 내가 보낸 채팅에 티어 정보 추가
function addTierToMyChat() {
  console.log('티어 추가 함수 실행');
  
  // 페이지 활성화 상태 및 타입 확인
  const { isEnabled: pageEnabled, isStudioPage } = isPageEnabled();
  if (!pageEnabled) return;
  
  // 채팅 메시지 선택자 가져오기
  const chatMessageSelectors = getChatMessageSelectors(isStudioPage);
  
  // 처리되지 않은 채팅 메시지 찾기
  const { unprocessedMessages, foundSelector } = findUnprocessedMessages(chatMessageSelectors);
  
  // 이미 있는 티어 배지 스타일 업데이트
  updateExistingBadges();
  
  console.log(`채팅 메시지 발견 여부: ${unprocessedMessages.length > 0 ? '발견됨' : '발견되지 않음'}`);
  if (unprocessedMessages.length > 0) {
    console.log(`발견된 선택자: ${foundSelector}`);
    console.log(`${unprocessedMessages.length}개의 채팅 메시지 처리 시작`);
    
    // 각 채팅 메시지 처리
    unprocessedMessages.forEach((message, index) => {
      processChatMessage(message, index, isStudioPage);
    });
  }
}

// 닉네임 요소 찾기 함수
function getNicknameSelectors(isStudioPage) {
  return isStudioPage ? [
    // 스튜디오 페이지 선택자
    '.studio_chat_nickname',
    '.studio_chat_author',
    '.studio_chat_message_nickname',
    '.studio_chat_user_name',
    '[class*="studio"] [class*="nickname"]',
    '[class*="studio"] [class*="author"]',
    '[class*="chat_nickname"]',
    '[class*="user_name"]'
  ] : [
    // 일반 채팅 페이지 선택자 - 이미지에서 확인한 정확한 선택자
    '.live_chatting_username_nickname__dDbbj', // 이미지에서 확인한 가장 정확한 닉네임 클래스
    '.live_chatting_username_text__DvlH',     // 이미지에서 확인한 닉네임 텍스트 클래스
    '.live_chatting_username_icon__ODTb',     // 이미지에서 확인한 닉네임 아이콘 클래스
    '.live_chatting_nickname__RDPo',          // 이전 버전의 닉네임 클래스
    '.live_chatting_nickname_area__Hhb5',     // 이전 버전의 닉네임 영역 클래스
    '.live_chatting_nickname',
    '.live_chatting_nickname_text',
    '.live_chatting_message_nickname',
    '.live_chatting_message_nickname_text',
    '.live_chatting_message_nickname_area',
    '.live_chatting_author',
    '.live_chatting_user_name',
    '[class*="username_nickname"]',          // 클래스 패턴
    '[class*="username_text"]',              // 클래스 패턴
    '[class*="nickname"]',
    '[class*="chatting_nickname"]',
    '[class*="chat_nickname"]',
    '[class*="author"]',
    '[class*="user_name"]'
  ];
}

// 배지 영역 선택자 가져오기 함수
function getBadgeSelectors(isStudioPage) {
  return isStudioPage ? [
    // 스튜디오 페이지 선택자
    '.studio_chat_badge_container',
    '.studio_chat_badge_area',
    '.studio_chat_message_badge',
    '[class*="studio"] [class*="badge"]',
    '[class*="badge_container"]',
    '[class*="badge_area"]'
  ] : [
    // 일반 채팅 페이지 선택자 - 이미지에서 확인한 정확한 선택자
    '.badge_container__RDPo',                // 이미지에서 확인한 정확한 배지 컨테이너 클래스
    '.live_chatting_badge_container_right',
    '.live_chatting_badge_container',
    '.live_chatting_message_badge',
    '.live_chatting_message_badge_container',
    '.live_chatting_message_badge_area',
    '[class*="badge_container"]',
    '[class*="badge_area"]',
    '[class*="chatting_badge"]',
    '[class*="chat_badge"]',
    '[class*="message_badge"]'
  ];
}

// 닉네임 요소 찾기 함수
function getNicknameElement(message, isStudioPage, customSelectors) {
  console.log('닉네임 요소 찾기 시작');
  // 커스텀 선택자가 있으면 사용하고, 없으면 기본 선택자 사용
  const nicknameSelectors = customSelectors || getNicknameSelectors(isStudioPage);
  
  console.log('사용할 닉네임 선택자:', isStudioPage ? '스튜디오 페이지' : '일반 채팅 페이지');
  
  let nicknameElement = null;
  for (const selector of nicknameSelectors) {
    try {
      const elements = message.querySelectorAll(selector);
      if (elements.length > 0) {
        // 처음 발견된 요소 사용
        nicknameElement = elements[0];
        console.log(`닉네임 요소 발견: ${selector}, 내용: ${nicknameElement.textContent}`);
        break;
      } else {
        console.log(`선택자로 닉네임 요소 찾지 못함: ${selector}`);
      }
    } catch (error) {
      console.error(`닉네임 선택자 ${selector} 처리 중 오류:`, error);
    }
  }
  
  if (!nicknameElement) {
    console.log('닉네임 요소를 찾지 못했습니다.');
  }
  
  return nicknameElement;
}

// 배지 영역 찾기 함수
function getBadgeArea(message, isStudioPage) {
  console.log('배지 영역 찾기 시작');
  const badgeSelectors = getBadgeSelectors(isStudioPage);
  
  console.log('사용할 배지 선택자:', isStudioPage ? '스튜디오 페이지' : '일반 채팅 페이지');
  
  let badgeArea = null;
  for (const selector of badgeSelectors) {
    try {
      const elements = message.querySelectorAll(selector);
      if (elements.length > 0) {
        badgeArea = elements[0];
        console.log(`배지 영역 발견: ${selector}`);
        break;
      } else {
        console.log(`선택자로 배지 영역 찾지 못함: ${selector}`);
      }
    } catch (error) {
      console.error(`배지 선택자 ${selector} 처리 중 오류:`, error);
    }
  }
  
  if (!badgeArea) {
    console.log('배지 영역을 찾지 못했습니다.');
  }
  
  return badgeArea;
}

// 채팅 메시지 처리 함수
function processChatMessage(message, index, isStudioPage) {
  console.log(`메시지 ${index + 1} 처리 시작`);
  
  // 이미 처리된 메시지인지 확인
  if (message.dataset.tierProcessed === 'true') {
    console.log('이미 처리된 메시지입니다.');
    return;
  }
  
  // 이미 티어 배지가 있는지 확인
  if (message.querySelector('.lol-tier-badge')) {
    console.log('이미 티어 배지가 있는 메시지입니다.');
    message.dataset.tierProcessed = 'true';
    return;
  }
  
  // 시스템 메시지 필터링
  if (message.classList.contains('live_chatting_notice_item') ||
      message.textContent.includes('시스템') ||
      message.querySelector('.live_chatting_system_message')) {
    console.log('시스템 메시지 감지되어 처리 스킵');
    message.dataset.tierProcessed = 'true';
    return;
  }
  
  console.log('메시지 내용:', message.textContent.substring(0, 50));
  
  try {
    // 이미 티어 배지가 있는지 확인
    if (message.querySelector('.lol-tier-badge')) {
      console.log('이미 티어 배지가 있는 메시지입니다.');
      message.dataset.tierProcessed = 'true';
      return;
    }
    
    // 시스템 메시지 필터링
    if (message.classList.contains('live_chatting_notice_item') ||
        message.textContent.includes('시스템') ||
        message.querySelector('.live_chatting_system_message')) {
      console.log('시스템 메시지 감지되어 처리 스킵');
      message.dataset.tierProcessed = 'true';
      return;
    }
    
    console.log('메시지 내용:', message.textContent.substring(0, 50));
    
    // 닉네임 요소 찾기
    const nicknameElement = getNicknameElement(message, isStudioPage);
    
    if (!nicknameElement) {
      console.log('닉네임 요소를 찾지 못했습니다.');
      message.dataset.tierProcessed = 'true'; // 처리 실패한 메시지도 표시하여 중복 처리 방지
      return;
    }
    
    console.log(`닉네임 요소 발견: 내용: ${nicknameElement.textContent}`);
      
    // 티어 배지 생성 및 추가
    const tierAdded = addTierBadgeToMessage(message, nicknameElement);
    
    // 메시지 처리 완료 표시
    message.dataset.tierProcessed = 'true';
    console.log(`메시지 처리 ${tierAdded ? '성공' : '실패'} 표시`);
  } catch (error) {
    console.error('티어 표시 추가 중 오류:', error);
  }
}

// 티어 배지 요소 생성 함수
function createTierBadge() {
  const tierSpan = document.createElement('span');
  tierSpan.textContent = `[${EXTENSION_CONFIG.myTier}]`;
  tierSpan.style.color = EXTENSION_CONFIG.myTierColor;
  tierSpan.style.fontWeight = 'bold';
  tierSpan.style.marginRight = '4px'; // 닉네임 앞에 추가하민로 marginLeft에서 marginRight로 변경
  tierSpan.style.display = 'inline-flex'; // inline-flex로 변경하여 중앙 정렬 지원
  tierSpan.style.alignItems = 'center'; // 수직 중앙 정렬
  tierSpan.style.justifyContent = 'center'; // 수평 중앙 정렬
  tierSpan.style.verticalAlign = 'middle'; // 수직 정렬 유지
  tierSpan.style.lineHeight = '1'; // 줄 높이 조정
  tierSpan.style.paddingTop = '0'; // 위쪽 패딩 제거
  tierSpan.style.marginTop = '-2px'; // 위쪽 여백 조정
  tierSpan.className = 'lol-tier-badge';
  console.log('티어 표시 요소 생성됨:', tierSpan.textContent);
  return tierSpan;
}

// 대체 요소 찾기 함수
function findAlternativeElement(message) {
  console.log('대체 요소 찾기 시작');
  
  // 대체 요소 찾기 - 업데이트된 선택자
  const alternativeSelectors = [
    '.live_chatting_message_nickname_area',
    '.live_chatting_nickname_area', 
    '.live_chatting_message_text',
    '.live_chatting_text',
    '[class*="nickname"]', 
    '[class*="author"]', 
    '[class*="message_text"]',
    '[class*="chatting_text"]',
    'strong',
    'b',
    'span',
    'div'
  ];
  
  let alternativeElement = null;
  let alternativeSelector = '';
  
  for (const selector of alternativeSelectors) {
    try {
      const elements = message.querySelectorAll(selector);
      if (elements.length > 0) {
        // 처음 발견된 요소 사용
        alternativeElement = elements[0];
        alternativeSelector = selector;
        console.log(`대체 요소 발견: ${selector}, 내용: ${alternativeElement.textContent}`);
        break;
      }
    } catch (error) {
      console.error(`대체 선택자 ${selector} 처리 중 오류:`, error);
    }
  }
  
  return { alternativeElement, alternativeSelector };
}

// 티어 배지를 요소에 추가하는 함수
function addTierBadgeToElement(element, tierBadge) {
  if (!element) return false;
  
  try {
    element.appendChild(tierBadge);
    return true;
  } catch (error) {
    console.error('요소에 티어 배지 추가 실패:', error);
    return false;
  }
}

// 티어 배지를 메시지에 추가하는 함수
function addTierBadgeToMessage(message, nicknameElement) {
  // 이미 티어 배지가 있는지 한 번 더 확인
  if (message.querySelector('.lol-tier-badge')) {
    console.log('이미 티어 배지가 있는 메시지입니다.');
    message.dataset.tierProcessed = 'true';
    return false;
  }
  
  // 티어 배지 생성
  const tierBadge = createTierBadge();
  let tierAdded = false;
  
  if (!nicknameElement) {
    console.log('닉네임 요소가 없어 티어 추가 불가능');
    return false;
  }
  
  console.log('닉네임 요소가 있어 티어 추가 시작');
  
  // 닉네임 요소 앞에 추가 시도
  try {
    // 닉네임 요소의 클래스 확인
    const className = nicknameElement.className;
    console.log(`닉네임 요소 클래스: ${className}`);
    
    // 요소 앞에 추가
    nicknameElement.insertAdjacentElement('beforebegin', tierBadge);
    console.log('티어 표시 추가됨 (닉네임 앞)');
    tierAdded = true;
  } catch (error) {
    console.error('insertAdjacentElement beforebegin 실패:', error);
  }
  
  return tierAdded;
}

// 이미 있는 티어 배지의 스타일 조정 함수
function updateExistingBadges() {
  document.querySelectorAll('.lol-tier-badge').forEach(badge => {
    badge.style.color = EXTENSION_CONFIG.myTierColor;
    badge.style.fontWeight = 'bold';
    badge.style.marginRight = '4px'; // 닉네임 앞에 추가하민로 marginLeft에서 marginRight로 변경
    badge.style.display = 'inline-flex'; // inline-flex로 변경하여 중앙 정렬 지원
    badge.style.alignItems = 'center'; // 수직 중앙 정렬
    badge.style.justifyContent = 'center'; // 수평 중앙 정렬
    badge.style.verticalAlign = 'middle'; // 수직 정렬 유지
    badge.style.lineHeight = '1'; // 줄 높이 조정
    badge.style.paddingTop = '0'; // 위쪽 패딩 제거
    badge.style.marginTop = '-2px'; // 위쪽 여백 조정
  });
}

// 티어 표시 제거 함수
function removeTiers() {
  // 유저네임 컨테이너 외부에 있는 티어 배지만 제거
  const outsideBadges = Array.from(document.querySelectorAll('.lol-tier-badge')).filter(badge => {
    // 배지의 부모 요소 중에 유저네임 컨테이너가 없는 경우만 제거
    const isInsideUsernameContainer = badge.closest('.live_chatting_username_container__JYlS');
    return !isInsideUsernameContainer;
  });
  
  console.log(`유저네임 컨테이너 외부에 있는 ${outsideBadges.length}개의 티어 배지 제거 시작`);
  outsideBadges.forEach(badge => badge.remove());
  
  // 처리 표시 제거
  const processed = document.querySelectorAll('[data-tier-processed]');
  console.log(`${processed.length}개의 처리 표시 제거 시작`);
  processed.forEach(el => {
    el.removeAttribute('data-tier-processed');
  });
  
  console.log('티어 배지 제거 완료');
}

// 팝업에서 보낸 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleTier') {
    isEnabled = message.enabled;
    
    if (!isEnabled) {
      removeTiers();
    }
    
    sendResponse({ success: true });
  }
});

// 스토리지에서 활성화 상태 불러오기
chrome.storage.local.get('enableTier', (data) => {
  isEnabled = data.enableTier !== undefined ? data.enableTier : true;
  
  if (isEnabled) {
    // 채팅 입력 감지 시작
    monitorChatInput();
    
    // 이미 인터벌이 설정되어 있지 않은 경우에만 설정
    if (!chatObserverInterval) {
      // 주기적으로 채팅 입력창 감지 (동적으로 로드되는 입력창을 위해)
      chatObserverInterval = setInterval(() => {
        // 초기화되지 않은 경우에만 실행
        if (!isInitialized && isEnabled) {
          monitorChatInput();
        } else if (isInitialized) {
          // 초기화가 완료되면 인터벌 중지
          clearInterval(chatObserverInterval);
          chatObserverInterval = null;
          console.log('초기화 완료로 인터벌 중지');
        }
      }, 2000);
      
      console.log('채팅 감지 인터벌 설정 완료');
    }
    
    // DOM 변화 감지
    const observer = new MutationObserver(() => {
      if (isEnabled && !isInitialized) monitorChatInput();
    });
    
    // 문서 관찰 시작
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

// 페이지 로드 완료 시 처리
window.addEventListener('load', () => {
  if (isEnabled) monitorChatInput();
});

// 페이지가 이미 로드된 경우
if (document.readyState === 'complete' && isEnabled) {
  monitorChatInput();
}
