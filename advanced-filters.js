document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const filterAIPosts = document.getElementById('filterAIPosts');
    const filterSuggested = document.getElementById('filterSuggested');
    const filterPromotedJobs = document.getElementById('filterPromotedJobs');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');

    // Load saved settings
    loadSettings();

    // Event listeners
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);

    // Load settings from storage
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'filterAIPosts',
                'filterSuggested',
                'filterPromotedJobs'
            ]);

            // Set form values
            filterAIPosts.checked = result.filterAIPosts || false;
            filterSuggested.checked = result.filterSuggested || false;
            filterPromotedJobs.checked = result.filterPromotedJobs || false;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Save settings to storage
    async function saveSettings() {
        try {
            await chrome.storage.sync.set({
                filterAIPosts: filterAIPosts.checked,
                filterSuggested: filterSuggested.checked,
                filterPromotedJobs: filterPromotedJobs.checked
            });

            // Notify content script of changes
            notifyContentScript();
            
            // Show success message
            showNotification('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification('Error saving settings', true);
        }
    }

    // Reset all settings
    function resetSettings() {
        if (confirm('Are you sure you want to reset all advanced filters to their default values?')) {
            filterAIPosts.checked = false;
            filterSuggested.checked = false;
            filterPromotedJobs.checked = false;

            saveSettings();
        }
    }

    // Notify content script of changes
    function notifyContentScript() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('linkedin.com/feed')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'advancedSettingsUpdated'
                });
            }
        });
    }

    // Show notification
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.backgroundColor = isError ? '#dc3545' : '#28a745';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});