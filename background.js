// Background script - minimal functionality only
console.log('Chzzk LoL Tier Extension background script loaded');

// Message listener setup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  
  // OAuth related messages
  if (message.action === 'open_auth_tab') {
    chrome.tabs.create({ url: message.authUrl });
    sendResponse({ success: true });
    return true;
  }
  
  return false;
});

// Initialization message
console.log('Background script initialization complete');
