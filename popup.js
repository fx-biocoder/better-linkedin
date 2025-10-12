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
    addKeywordBtn.addEventListener('click', addKeyword);
    addCompanyBtn.addEventListener('click', addCompany);
    donateBtn.addEventListener('click', openDonations);
    reportBugBtn.addEventListener('click', reportBug);
    newKeywordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addKeyword();
        }
    });
    newCompanyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addCompany();
        }
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
            const mutedWords = result.mutedWords || ['lorem', 'ipsum'];
            displayKeywords(mutedWords);

            // Load muted companies
            const mutedCompanies = result.mutedCompanies || [];
            displayCompanies(mutedCompanies);
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

    // Add new keyword
    function addKeyword() {
        const keyword = newKeywordInput.value.trim().toLowerCase();
        
        if (!keyword) {
            return;
        }

        // Check if keyword already exists
        const existingKeywords = Array.from(keywordsList.querySelectorAll('.keyword-text'))
            .map(el => el.textContent);
        
        if (existingKeywords.includes(keyword)) {
            newKeywordInput.value = '';
            return;
        }

        // Add keyword to display
        addKeywordToDisplay(keyword);
        
        // Clear input
        newKeywordInput.value = '';
        
        // Save settings
        saveSettings();
    }

    // Add keyword to display
    function addKeywordToDisplay(keyword) {
        const keywordItem = document.createElement('div');
        keywordItem.className = 'keyword-item';
        
        keywordItem.innerHTML = `
            <span class="keyword-text">${keyword}</span>
            <button class="remove-keyword" data-keyword="${keyword}">×</button>
        `;
        
        // Add remove event listener
        const removeBtn = keywordItem.querySelector('.remove-keyword');
        removeBtn.addEventListener('click', function() {
            keywordItem.remove();
            saveSettings();
        });
        
        keywordsList.appendChild(keywordItem);
    }

    // Add new company
    function addCompany() {
        const company = newCompanyInput.value.trim();
        
        if (!company) {
            return;
        }

        // Check if company already exists
        const existingCompanies = Array.from(companiesList.querySelectorAll('.company-text'))
            .map(el => el.textContent);
        
        if (existingCompanies.includes(company)) {
            newCompanyInput.value = '';
            return;
        }

        // Add company to display
        addCompanyToDisplay(company);
        
        // Clear input
        newCompanyInput.value = '';
        
        // Save settings
        saveSettings();
    }

    // Add company to display
    function addCompanyToDisplay(company) {
        const companyItem = document.createElement('div');
        companyItem.className = 'company-item';
        
        companyItem.innerHTML = `
            <span class="company-text">${company}</span>
            <button class="remove-company" data-company="${company}">×</button>
        `;
        
        // Add remove event listener
        const removeBtn = companyItem.querySelector('.remove-company');
        removeBtn.addEventListener('click', function() {
            companyItem.remove();
            saveSettings();
        });
        
        companiesList.appendChild(companyItem);
    }

    // Display all keywords
    function displayKeywords(keywords) {
        keywordsList.innerHTML = '';
        keywords.forEach(keyword => {
            addKeywordToDisplay(keyword);
        });
    }

    // Display all companies
    function displayCompanies(companies) {
        companiesList.innerHTML = '';
        companies.forEach(company => {
            addCompanyToDisplay(company);
        });
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
