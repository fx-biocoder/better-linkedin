chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'welcome.html' });
    } else if (details.reason === 'update') {
        const currentVersion = chrome.runtime.getManifest().version;
        const previousVersion = details.previousVersion;

        // Check if it's a major or minor update
        if (isMajorOrMinorUpdate(previousVersion, currentVersion)) {
            chrome.tabs.create({ url: 'whats-new.html' });
        }
    }
});

function isMajorOrMinorUpdate(prev, curr) {
    if (!prev || !curr) return false;
    const prevParts = prev.split('.').map(Number);
    const currParts = curr.split('.').map(Number);
    
    // Major version changed
    if (currParts[0] > prevParts[0]) return true;
    
    // Minor version changed
    if (currParts[0] === prevParts[0] && currParts[1] > prevParts[1]) return true;
    
    // It's a patch or older version (shouldn't happen on update, but just in case)
    return false;
}
