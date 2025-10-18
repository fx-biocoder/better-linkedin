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

    const interactions = {
        // English
        "en": new Set(['likes', 'celebrates', 'insightful', 'funny', 'loves', 'commented', 'supports']),
        
        // Spanish
        "es": new Set(['recomienda', 'celebra', 'interesante', 'gracia', 'encanta', 'comentado', 'apoya']),
        
        // Portuguese
        "pt": new Set(['gostou', 'parabenizou', 'interessante', 'engraçado', 'amou', 'comentou', 'apoiou']),
    }

    const promotedWords = new Set([
        'Promoted',
        'Promocionado',
        'Promovido'
    ]);

    // CSS selectors to target content to be filtered
    const LINKEDIN_POST_CSS_SELECTOR = 'div.scaffold-finite-scroll__content div';
    const LINKEDIN_POST_BODY_CSS_SELECTOR = 'div.update-components-text.relative.update-components-update-v2__commentary span.break-words.tvm-parent-container span'
    const LINKEDIN_COMPANY_NAME_CSS_SELECTOR = 'div.update-components-actor__container.pr4.display-flex.flex-grow-1 span.update-components-actor__title span.sxqHNNveCqgQTedDLNJVuWLhrkgLEZxECwqfwM span.visually-hidden';
    const LINKEDIN_INTERACTION_POST_CSS_SELECTOR = 'span.update-components-header__text-view';

    // General purpose function to change the visibility of a post
    // Returns 'true' if the post is hidden, and 'false' if not
    const changeVisibility = function(post, status, settingValue) {
        let hidden = false;

        if (status) {
            if (settingValue) {
                post.style.display = 'none';
                hidden = true;
            } else {
                post.style.display = '';
            }
        }

        return hidden
    }

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
    const removePromotedPosts = function(post) {
        const spans = post.querySelectorAll("span");
        let isPromoted = false;
            
        spans.forEach((span) => {
            if (promotedWords.has(span.textContent)) {
                isPromoted = true;
            }
        });
            
        const result = changeVisibility(post, isPromoted, settings.removePromoted);
        return result;
    }
    
    // Remove posts by keyword
    const removePostsByKeyword = function(post) {
        const INVALID_CHARS = /[.,:;¿?!¡'"-_]/g;
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);

        if (postWords) {
            const words = postWords.textContent.split(" ").map(w => w.replace(INVALID_CHARS, ''));
            let containsMutedWord = false;

            words.forEach((word) => {
                if (settings.mutedWords.includes(word.toLowerCase())) {
                    containsMutedWord = true;
                }
            });
                
            const result = changeVisibility(post, containsMutedWord, settings.removeByKeywords);
            return result;
        }
    }

    // Remove posts by company name
    const removePostsByCompanyName = function(post) {
        const companies = post.querySelectorAll(LINKEDIN_COMPANY_NAME_CSS_SELECTOR);
        let isMutedCompany = false;

        companies.forEach((company) => {
            if (company && settings.mutedCompanies.includes(company.textContent)) {
                isMutedCompany = true;
            }
        })

        const result = changeVisibility(post, isMutedCompany, settings.removeByCompanies);
        return result;
    }

    // Remove interaction posts
    const removeInteractionPosts = function(post) {
        const header = post.querySelector(LINKEDIN_INTERACTION_POST_CSS_SELECTOR);
        const lang = document.documentElement.lang;

        if (header) {
            const headerContents = header.textContent.split(' ');
            let isInteraction = false;

            headerContents.forEach((word) => {
                if (interactions[lang].has(word)) {
                    isInteraction = true;
                }
            })

            const result = changeVisibility(post, isInteraction, settings.removeByInteractions);
            return result;
        }
    }

    // Function for conditionally executing a filter
    const execute = (flag, post, filter) => {
        if (flag) {
            return true;
        } else {
            const result = filter(post);
            return result;
        }
    }
    
    // Main filtering function
    const runFilters = function() {
        const posts = document.querySelectorAll(LINKEDIN_POST_CSS_SELECTOR);

        posts.forEach((post) => {
            let isFlagged = false;
            
            // Run filters sequentially and conditionally
            isFlagged = execute(isFlagged, post, removePromotedPosts);
            isFlagged = execute(isFlagged, post, removePostsByKeyword);
            isFlagged = execute(isFlagged, post, removePostsByCompanyName);
            isFlagged = execute(isFlagged, post, removeInteractionPosts);
        })
    }
    
    // Initialize the extension
    async function initialize() {
        await loadSettings();
        
        // Run filters after page load
        window.addEventListener("load", () => {
            setTimeout(runFilters, 3000);
        });
        
        // Set up mutation observers
        const observer = new MutationObserver(runFilters);
        observer.observe(document.body, { childList: true, subtree: true });
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
