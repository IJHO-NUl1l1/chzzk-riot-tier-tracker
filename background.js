// Background script
console.log('Chzzk LoL Tier Extension background script loaded');

const SERVER_URL = 'https://chzzk-riot-tier-tracker-fastify-production.up.railway.app';
const AUTH_SUCCESS_PATH = '/auth/success';

// Persist authTabId in session storage (survives service worker restart)
async function getAuthTabId() {
  const result = await chrome.storage.session.get('authTabId');
  return result.authTabId || null;
}

async function setAuthTabId(tabId) {
  await chrome.storage.session.set({ authTabId: tabId });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'chzzk_login') {
    sendResponse({ status: 'opening' });
    openAuthTab();
    return false;
  }
});

// Open auth tab (or focus existing one)
async function openAuthTab() {
  const existingTabId = await getAuthTabId();

  if (existingTabId !== null) {
    try {
      const tab = await chrome.tabs.get(existingTabId);
      if (tab) {
        chrome.tabs.update(existingTabId, { active: true });
        return;
      }
    } catch {
      // Tab no longer exists
    }
  }

  const authUrl = `${SERVER_URL}/api/chzzk/auth`;
  const tab = await chrome.tabs.create({ url: authUrl });
  await setAuthTabId(tab.id);
}

// Detect auth success by checking tab URL on every update
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Check on both URL change and page load complete
  if (!changeInfo.url && changeInfo.status !== 'complete') return;

  // Use tab.url (always has full URL) instead of changeInfo.url (only on URL change)
  const url = tab.url;
  if (!url || !url.includes(AUTH_SUCCESS_PATH) || !url.includes('channelId=')) return;

  // Only process our auth tab (or any tab if session lost)
  const savedTabId = await getAuthTabId();
  if (savedTabId !== null && savedTabId !== tabId) return;

  try {
    const params = new URL(url).searchParams;
    const channelId = params.get('channelId');
    const channelName = params.get('channelName');
    const userId = params.get('userId');
    const jwtToken = params.get('jwt_token');

    if (!channelId) return;

    console.log('Auth success detected:', { channelId, channelName, userId });

    const storageData = {
      chzzkAuth: {
        channelId,
        channelName: channelName || '',
        userId: userId || '',
        connectedAt: Date.now()
      }
    };
    if (jwtToken) storageData.jwt_token = jwtToken;
    await chrome.storage.local.set(storageData);

    await setAuthTabId(null);
    chrome.tabs.remove(tabId);
  } catch (e) {
    console.error('Failed to process auth success:', e);
  }
});

// Clean up if user closes the auth tab manually
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const savedTabId = await getAuthTabId();
  if (tabId === savedTabId) {
    await setAuthTabId(null);
  }
});
