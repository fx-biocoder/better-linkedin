// Content script for Better LinkedIn extension

(function() {
    'use strict';
    
    let settings = {
        removePromoted: false,
        removeByKeywords: false,
        removeByCompanies: false,
        mutedWords: [],
        mutedCompanies: []
    };

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
            
            settings.removePromoted = result.removePromoted === true;
            settings.removeByKeywords = result.removeByKeywords === true; 
            settings.removeByCompanies = result.removeByCompanies === true;
            settings.mutedWords = result.mutedWords || ['lorem', 'ipsum'];
            settings.mutedCompanies = result.mutedCompanies || [];
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Remove promoted posts
    const removePromotedPosts = function() {
        // List of LinkedIn posts currently visible on your feed
        const publications = document.querySelectorAll("div.fie-impression-container");
    
        // Handle promoted posts
        publications.forEach((item) => {
            const spans = item.querySelectorAll("span");
            let isPromoted = false;
            
            spans.forEach((span) => {
                if (span.textContent === "Promoted") {
                    isPromoted = true;
                }
            });
            
            if (isPromoted) {
                if (settings.removePromoted) {
                    item.style.display = "none";
                } else {
                    item.style.display = ""; // Restore if disabled
                }
            }
        })
    }
    
    // Remove posts by keyword
    const removePostsByKeyword = function() {
        // Get all posts
        const publications = document.querySelectorAll("div.fie-impression-container");

        // Handle posts containing muted words
        publications.forEach((pub) => {
            const publicationWords = pub.querySelector("div.update-components-text.relative.update-components-update-v2__commentary");
            if (publicationWords !== null && publicationWords !== undefined) {
                const words = publicationWords.textContent.split(" ");
                let containsMutedWord = false;

                words.forEach((word) => {
                    if (settings.mutedWords.includes(word.toLowerCase())) {
                        containsMutedWord = true;
                    }
                });
                
                if (containsMutedWord) {
                    if (settings.removeByKeywords) {
                        pub.style.display = "none";
                    } else {
                        pub.style.display = ""; // Restore if disabled
                    }
                }
            }
        })
    }

    // Remove posts by company name
    const removePostsByCompanyName = function() {
        // Get all posts
        const publications = document.querySelectorAll("div.fie-impression-container");
        
        // Handle posts by company name
        publications.forEach((pub) => {
            const spans = pub.querySelectorAll("div.JHLsROFkOIglnpiDaurFDndJjLiWtVOqWoo div.update-components-actor__container.display-flex.flex-grow-1 span");
            let isMutedCompany = false;

            spans.forEach((span) => {
                const result = span.querySelector("span");
                if (result !== null && result !== undefined) {
                    if (settings.mutedCompanies.includes(result.textContent)) {
                        isMutedCompany = true;
                    }
                }
            })

            if (isMutedCompany) {
                if (settings.removeByCompanies) { // The problem is HERE, is this condition met???
                    pub.style.display = "none";
                }
            }
        })
    }
    
    // Main filtering function
    const runFilters = function() {
        removePromotedPosts();
        removePostsByKeyword();
        removePostsByCompanyName();
    }
    
    // Initialize the extension
    async function initialize() {
        await loadSettings();
        
        // Run filters after page load
        window.addEventListener("load", () => {
            setTimeout(runFilters, 3000);
        });
        
        // Set up mutation observers
        const observerA = new MutationObserver(removePromotedPosts);
        const observerB = new MutationObserver(removePostsByKeyword);
        const observerC = new MutationObserver(removePostsByCompanyName);
        observerA.observe(document.body, { childList: true, subtree: true });
        observerB.observe(document.body, { childList: true, subtree: true });
        observerC.observe(document.body, { childList: true, subtree: true });
    }
    
    // Listen for settings updates from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'settingsUpdated') {
            loadSettings().then(() => {
                runFilters();
            });
        }
    });
    
    // Start the extension
    initialize();
})();
