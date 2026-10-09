document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items and tab contents
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked nav item
            item.classList.add('active');

            // Show corresponding tab content
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Elements
    const removeBroetryPostsCheckbox = document.getElementById('removeBroetryPosts');
    const jobAgeAlertsCheckbox = document.getElementById('jobAgeAlerts');
    const jobRedFlagsCheckbox = document.getElementById('jobRedFlags');
    const detectFakeProfilesCheckbox = document.getElementById('detectFakeProfiles');
    const enableProfileNotesCheckbox = document.getElementById('enableProfileNotes');
    const totalPostsHiddenElement = document.getElementById('totalPostsHidden');

    // Load Settings
    loadSettings();

    // Event Listeners for settings
    removeBroetryPostsCheckbox.addEventListener('change', saveSettings);
    jobAgeAlertsCheckbox.addEventListener('change', saveSettings);
    jobRedFlagsCheckbox.addEventListener('change', saveSettings);
    detectFakeProfilesCheckbox.addEventListener('change', saveSettings);
    enableProfileNotesCheckbox.addEventListener('change', saveSettings);

    async function loadSettings() {
        try {
            // Sync storage for toggles
            const syncResult = await chrome.storage.sync.get([
                'removeBroetryPosts',
                'jobAgeAlerts',
                'jobRedFlags',
                'detectFakeProfiles',
                'enableProfileNotes'
            ]);

            removeBroetryPostsCheckbox.checked = syncResult.removeBroetryPosts || false;
            jobAgeAlertsCheckbox.checked = syncResult.jobAgeAlerts || false;
            jobRedFlagsCheckbox.checked = syncResult.jobRedFlags || false;
            detectFakeProfilesCheckbox.checked = syncResult.detectFakeProfiles || false;
            enableProfileNotesCheckbox.checked = syncResult.enableProfileNotes || false;

            // Local storage for stats
            const localResult = await chrome.storage.local.get(['totalPostsHidden']);
            totalPostsHiddenElement.textContent = localResult.totalPostsHidden || 0;

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async function saveSettings() {
        try {
            await chrome.storage.sync.set({
                removeBroetryPosts: removeBroetryPostsCheckbox.checked,
                jobAgeAlerts: jobAgeAlertsCheckbox.checked,
                jobRedFlags: jobRedFlagsCheckbox.checked,
                detectFakeProfiles: detectFakeProfilesCheckbox.checked,
                enableProfileNotes: enableProfileNotesCheckbox.checked
            });

            // Notify content scripts of changes
            chrome.tabs.query({url: '*://*.linkedin.com/*'}, function(tabs) {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: 'advancedSettingsUpdated' }).catch(() => {});
                });
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }



    // Listen for storage changes to update UI in real-time
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            if (changes.totalPostsHidden) {
                totalPostsHiddenElement.textContent = changes.totalPostsHidden.newValue || 0;
            }
        }
    });
});
