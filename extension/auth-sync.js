// This content script runs on localhost:3000 to sync auth tokens to extension
console.log('🔄 Auth sync script loaded for JobTracker extension');

// Function to sync tokens from localStorage to chrome.storage
function syncTokensToExtension() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
        chrome.storage.local.set({
            accessToken: accessToken,
            refreshToken: refreshToken
        }, () => {
            console.log('✅ Tokens synced to extension storage');
        });
    } else {
        // If no tokens, clear extension storage
        chrome.storage.local.remove(['accessToken', 'refreshToken'], () => {
            console.log('🗑️ Tokens cleared from extension storage');
        });
    }
}

// Initial sync on page load
syncTokensToExtension();

// Watch for localStorage changes (when user logs in/out)
window.addEventListener('storage', (e) => {
    if (e.key === 'accessToken' || e.key === 'refreshToken') {
        console.log('🔄 Auth token changed, syncing to extension...');
        syncTokensToExtension();
    }
});

// Also periodically check (in case storage event doesn't fire)
setInterval(syncTokensToExtension, 2000);

// Listen for messages from the web page
window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data.type === 'AUTH_STATE_CHANGED') {
        console.log('🔄 Auth state changed message received');
        syncTokensToExtension();
    }
});
