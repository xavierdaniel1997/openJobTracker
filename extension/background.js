// Listen for authentication messages from the web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.type === 'AUTH_LOGIN') {
        // Store tokens when user logs in
        chrome.storage.local.set({
            accessToken: request.accessToken,
            refreshToken: request.refreshToken
        }, () => {
            console.log('✅ Tokens stored in extension');
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for async response
    }

    if (request.type === 'AUTH_LOGOUT') {
        // Clear tokens when user logs out
        chrome.storage.local.remove(['accessToken', 'refreshToken'], () => {
            console.log('✅ Tokens cleared from extension');
            sendResponse({ success: true });
        });
        return true;
    }
});

// Also listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_AUTH') {
        chrome.storage.local.get(['accessToken'], (result) => {
            sendResponse({ isAuthenticated: !!result.accessToken });
        });
        return true;
    }
});
