// Popup script for Better LinkedIn extension
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const removePromotedCheckbox = document.getElementById('removePromoted');
    const removeByKeywordsCheckbox = document.getElementById('removeByKeywords');
    const removeByCompaniesCheckbox = document.getElementById('removeByCompanies');
    const newKeywordInput = document.getElementById('newKeyword');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const keywordsList = document.getElementById('keywordsList');
    const newCompanyInput = document.getElementById('newCompany');
    const addCompanyBtn = document.getElementById('addCompanyBtn');
    const companiesList = document.getElementById('companiesList');
    const donateBtn = document.getElementById('donateBtn');
    const reportBugBtn = document.getElementById('reportBugBtn');

    // Load saved settings
    loadSettings();

    // Event listeners
    removePromotedCheckbox.addEventListener('change', saveSettings);
    removeByKeywordsCheckbox.addEventListener('change', saveSettings);
    removeByCompaniesCheckbox.addEventListener('change', saveSettings);

    addKeywordBtn.addEventListener('click', () => {
        addWord(newKeywordInput, 'keyword', keywordsList);
    });

    addCompanyBtn.addEventListener('click', () => {
        addWord(newCompanyInput, 'company', companiesList);
    });

    donateBtn.addEventListener('click', openDonations);
    reportBugBtn.addEventListener('click', reportBug);

    newKeywordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWord(newKeywordInput, 'keyword', keywordsList);
    });

    newCompanyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWord(newCompanyInput, 'company', companiesList);
    });

    // Load settings from storage
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'removePromoted',
                'removeByKeywords',
                'removeByCompanies',
                'mutedWords',
                'mutedCompanies'
            ]);

            // Set checkbox states
            removePromotedCheckbox.checked = result.removePromoted || false;
            removeByKeywordsCheckbox.checked = result.removeByKeywords || false;
            removeByCompaniesCheckbox.checked = result.removeByCompanies || false;

            // Load muted words
            const mutedWords = result.mutedWords || [];
            displayWords(mutedWords, 'keyword', keywordsList);

            // Load muted companies
            const mutedCompanies = result.mutedCompanies || [];
            displayWords(mutedCompanies, 'company', companiesList);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Save settings to storage
    async function saveSettings() {
        try {
            const mutedWords = Array.from(keywordsList.querySelectorAll('.keyword-text'))
                .map(el => el.textContent);
            const mutedCompanies = Array.from(companiesList.querySelectorAll('.company-text'))
                .map(el => el.textContent);

            await chrome.storage.sync.set({
                removePromoted: removePromotedCheckbox.checked,
                removeByKeywords: removeByKeywordsCheckbox.checked,
                removeByCompanies: removeByCompaniesCheckbox.checked,
                mutedWords: mutedWords,
                mutedCompanies: mutedCompanies
            });

            // Notify content script of changes
            notifyContentScript();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    function addWord(newInput, type, list) {
        let word = newInput.value;
        switch (type) {
            case 'keyword':
                word = word.trim().toLowerCase();
                break;
            case 'company':
                word = word.trim();
                break;
        }
        
        if (!word) return;

        // Check if word already exists
        const existingWords = Array.from(list.querySelectorAll(`.${type}-text`))
            .map(el => el.textContent);

        if (existingWords.includes(word)) {
            newInput.value = '';
            return;
        }

        // Add word to display
        addToDisplay(word, type, list);

        // Clear input and save settings
        newInput.value = '';
        saveSettings();
    }

    // Add keyword or company to display
    function addToDisplay(element, type, list) {
        const span = document.createElement('span');
        span.className = `${type}-text`;
        span.textContent = element;
        
        const button = document.createElement('button');
        button.className = `remove-${type}`;
        switch (type) {
            case 'keyword':
                button.dataset.keyword = type;
                break;
            case 'company':
                button.dataset.company = type;
                break;
        }
        button.textContent = 'x';

        const item = document.createElement('div');
        item.className = `${type}-item`;
        item.appendChild(span);
        item.appendChild(button);

        // Event listener for removal
        const removeBtn = item.querySelector(`.remove-${type}`);
        removeBtn.addEventListener('click', () => {
            item.remove();
            saveSettings();
        });

        list.appendChild(item);
    }

    // Display words
    function displayWords(words, type, list) {
        list.innerHTML = '';
        words.forEach(word => addToDisplay(word, type, list));
    }

    // Notify content script of changes
    function notifyContentScript() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('linkedin.com/feed')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'settingsUpdated'
                });
            }
        });
    }

    // Open donations page function
    function openDonations() {
        chrome.tabs.create({
            url: chrome.runtime.getURL('donations.html'),
            active: true
        });
    }

    // Report bug function
    function reportBug() {
        const githubRepoUrl = 'https://github.com/fx-biocoder/better-linkedin/issues';
        
        chrome.tabs.create({
            url: githubRepoUrl,
            active: true
        });
    }
});
