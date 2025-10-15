// Content script for Better LinkedIn extension

(function() {
    'use strict';
    
    let settings = {
        removePromoted: false,
        removeByKeywords: false,
        removeByCompanies: false,
        removeByInteractions: false,
        mutedWords: [],
        mutedCompanies: []
    };

    const interactions = new Set([
        'likes',
        'celebrates',
        'finds',
        'loves',
        'commented',
        'supports'
    ])

    const LINKEDIN_POST_CSS_SELECTOR = 'div.scaffold-finite-scroll__content div';
    const LINKEDIN_POST_BODY_CSS_SELECTOR = 'div.update-components-text.relative.update-components-update-v2__commentary span.break-words.tvm-parent-container span'
    const LINKEDIN_COMPANY_NAME_CSS_SELECTOR = 'div.update-components-actor__container.display-flex.flex-grow-1 div.update-components-actor__meta a.ZBukWCSCbFNBzQTrJtSWRMSoGooCqIrpoavA.update-components-actor__meta-link span.update-components-actor__title span.NnKEocxakfFQhLyHZAnPZJzAVbzTxnUPzI.hoverable-link-text.t-14.t-bold.text-body-medium-bold.white-space-nowrap.t-black.update-components-actor__single-line-truncate span span';
    const LINKEDIN_INTERACTION_POST_CSS_SELECTOR = 'span.update-components-header__text-view';

    // Load settings from storage
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'removePromoted',
                'removeByKeywords',
                'removeByCompanies',
                'removeByInteractions',
                'mutedWords',
                'mutedCompanies'
            ]);
            
            settings.removePromoted = result.removePromoted === true;
            settings.removeByKeywords = result.removeByKeywords === true; 
            settings.removeByCompanies = result.removeByCompanies === true;
            settings.removeByInteractions = result.removeByInteractions === true;
            settings.mutedWords = result.mutedWords || [];
            settings.mutedCompanies = result.mutedCompanies || [];
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Remove promoted posts
    const removePromotedPosts = function() {
        // List of LinkedIn posts currently visible on your feed
        const publications = document.querySelectorAll(LINKEDIN_POST_CSS_SELECTOR);
    
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
        const publications = document.querySelectorAll(LINKEDIN_POST_CSS_SELECTOR);
        const INVALID_CHARS = /[.,:;¿?!¡'"-_]/g;

        // Handle posts containing muted words
        publications.forEach((pub) => {
            const publicationWords = pub.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
            if (publicationWords !== null && publicationWords !== undefined) {
                const words = publicationWords.textContent.split(" ").map(w => w.replace(INVALID_CHARS, ''));
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
        const posts = document.querySelectorAll(LINKEDIN_POST_CSS_SELECTOR);
        
        // Handle posts by company name
        posts.forEach((post) => {
            const companies = post.querySelectorAll(LINKEDIN_COMPANY_NAME_CSS_SELECTOR);
            let isMutedCompany = false;

            companies.forEach((company) => {
                if (company && settings.mutedCompanies.includes(company.textContent)) {
                    isMutedCompany = true;
                }
            })

            if (isMutedCompany && settings.removeByCompanies) {
                post.style.display = 'none';
            }
        })
    }

    // Remove interaction posts
    const removeInteractionPosts = function() {
        const posts = document.querySelectorAll(LINKEDIN_POST_CSS_SELECTOR);
        
        posts.forEach((post) => {
            const header = post.querySelector(LINKEDIN_INTERACTION_POST_CSS_SELECTOR);

            if (header) {
                const headerContents = header.textContent.split(' ');
                let isInteraction = false;

                headerContents.forEach((word) => {
                    if (interactions.has(word)) {
                        isInteraction = true;
                    }
                })

                if (isInteraction && settings.removeByInteractions) {
                    post.style.display = 'none';
                }
                else {
                    post.style.display = '';
                }
            }
        })
    }
    
    // Main filtering function
    const runFilters = function() {
        removePromotedPosts();
        removePostsByKeyword();
        removePostsByCompanyName();
        removeInteractionPosts();
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
        const observerD = new MutationObserver(removeInteractionPosts);
        observerA.observe(document.body, { childList: true, subtree: true });
        observerB.observe(document.body, { childList: true, subtree: true });
        observerC.observe(document.body, { childList: true, subtree: true });
        observerD.observe(document.body, { childList: true, subtree: true });
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
