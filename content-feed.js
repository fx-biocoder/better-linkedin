// Content script for Better LinkedIn extension

(function() {
    'use strict';
    
    let settings = {
        removePromoted: false,
        removeByKeywords: false,
        removeByCompanies: false,
        removeByInteractions: false,
        mutedWords: [],
        mutedCompanies: [],
        removeAIPosts: false,
        removeSuggested: false
    };

    const interactions = {
        // English
        "en": new Set(['likes', 'celebrates', 'insightful', 'finds', 'funny', 'loves', 'commented', 'supports', 'reacted']),
        
        // Spanish
        "es": new Set(['recomienda', 'celebra', 'interesante', 'gracia', 'encanta', 'comentado', 'apoya', 'reaccionado']),
        
        // Portuguese
        "pt": new Set(['gostou', 'parabenizou', 'interessante', 'engraçado', 'amou', 'comentou', 'apoiou']),

        // Italian
        "it": new Set(['geniale', 'Consigliato', 'Commentato', 'festeggia', 'sostegno'])
    };

    const promotedWords = new Set([
        'Promoted',
        'Promocionado',
        'Promovido',
        'Post sponsorizzato'
    ]);

    const suggestedWords = new Set([
        "Suggested",
        "Sugerencias"
    ]);

    const regexAItext = [
        // Em-dashes. Could lead to false positives but commonly found in AI-generated content
        /—/,

        // Common AI-generated call-to-actions
        /comment below/i,
        /share your thoughts/i,
        /in the comments/i,
        /drop a comment/i,
        /curious to know/i,
        /coment[aá] debajo/i,
        /\b[eé]n (los )?c[oó]m[eé]nt[aá]r[ií]o[s]\b/i,
        /te leo/i,
        /abro debate/i,


        // 'When X meets Y' pattern
        /when\s+(\w+)\s+meets\s+(\w+)/i,

        // Phrases indicating AI authorship
        /in summary/i
    ];

    const regexEmoji = /\p{Emoji}/u;

    // CSS selectors to target content to be filtered
    const LINKEDIN_MAIN_FEED_CSS_SELECTOR = 'div[data-testid="mainFeed"]';
    const LINKEDIN_POST_CONTAINERS_CSS_SELECTOR = '[role="listitem"][componentkey^="update-card-focus"]';
    const LINKEDIN_POST_BODY_CSS_SELECTOR = 'span[data-testid="expandable-text-box"]';

    /**
     * General purpose function to change the visibility of a post
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @param {boolean} status - A flag that indicates whether the post meets the filter criteria
     * @param {boolean} settingValue - A flag indicating whether the filter is enabled
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
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

        return hidden;
    }

    /**
     * Loads the extension settings from the browser's synchronized storage
     * @return {Promise<void>} A promise that resolves when settings are loaded
     */
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'removePromotedPosts',
                'removeByKeywords',
                'removeByCompanies',
                'removeByInteractions',
                'removeAIPosts',
                'removeSuggestedPosts',
                'removePostsWithEmojis',
                'mutedWords',
                'mutedCompanies',
            ]);
            
            settings.removePromoted = result.removePromotedPosts === true;
            settings.removeByKeywords = result.removeByKeywords === true; 
            settings.removeByCompanies = result.removeByCompanies === true;
            settings.removeByInteractions = result.removeByInteractions === true;
            settings.removeAIPosts = result.removeAIPosts === true;
            settings.removeSuggested = result.removeSuggestedPosts === true;
            settings.removePostsWithEmojis = result.removePostsWithEmojis === true;
            settings.mutedWords = result.mutedWords || [];
            settings.mutedCompanies = result.mutedCompanies || [];
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Trims leading/trailing whitespace and collapses internal whitespace
     * @param {string} text - A string
     * @returns {string} The normalized string
     */
    const normalizeText = (text) => {
        return text.replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Removes promoted posts from the LinkedIn feed
     * @callback CallbackA
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removePromotedPosts = function(post) {
        const spans = post.querySelectorAll('p > span');
        let isPromoted = false;

        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text.length > 150) continue; // safety check to skip huge text blocks

            for (const word of promotedWords) {
                if (text === word || text.startsWith(word + ' ')) {
                    isPromoted = true;
                    break;
                }
            }
            if (isPromoted) break;
        }

        const result = changeVisibility(post, isPromoted, settings.removePromoted);
        return result;
    }
    
    /**
     * Removes post by keyword
     * @callback CallbackB
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removePostsByKeyword = function(post) {
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
        if (!postWords) return false;

        const regex = /\b\p{L}+\b/gu;

        const words = postWords.textContent.toLowerCase().match(regex) || [];

        let containsMutedWord = false;
        for (const word of words) {
            if (settings.mutedWords.includes(word)) {
                containsMutedWord = true;
                break;
            }
        }
        const result = changeVisibility(post, containsMutedWord, settings.removeByKeywords);
        return result;
        
    }

    /**
     * Removes posts by company name
     * @callback CallbackC
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removePostsByCompanyName = function(post) {
        const spans = post.querySelectorAll('p > span');
        let isMutedCompany = false;

        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text && settings.mutedCompanies.includes(text)) {
                isMutedCompany = true;
                break;
            }
        }

        const result = changeVisibility(post, isMutedCompany, settings.removeByCompanies);
        return result;
    }

    /**
     * Removes interaction posts
     * @callback CallbackD
     * @param {HTMLElement} post - The LinkedIn post to filter 
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removeInteractionPosts = function(post) {
        const spans = post.querySelectorAll('p > span');
        const lang = document.documentElement.lang;

        // Fall back to English if the page language has no interaction word list
        const langInteractions = interactions[lang] || interactions['en'];

        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text.length > 150) continue; // safety check
            
            const words = text.split(' ');

            for (const word of words) {
                if (langInteractions.has(word)) {
                    const result = changeVisibility(post, true, settings.removeByInteractions);
                    return result;
                }
            }
        }

        return false;
    }

    /**
     * Filters AI-generated posts
     * @callback CallbackE
     * @param {HTMLElement} post - The LinkedIn post to filter 
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removeAIPosts = function(post) {
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);

        if (!postWords) return false;

        const text = postWords.textContent;
        const match = regexAItext.some(regex => regex.test(text));
        const result = changeVisibility(post, match, settings.removeAIPosts);
        return result;
    }

    /**
     * Removes suggested posts
     * @callback CallbackF
     * @param {HTMLElement} post - The LinkedIn post to filter 
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removeSuggestedPosts = function(post) {
        const spans = post.querySelectorAll('p > span');

        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text.length > 150) continue; // safety check

            if (suggestedWords.has(text)) {
                const result = changeVisibility(post, true, settings.removeSuggested);
                return result;
            }
        }

        return false;
    }

    /**
     * Removes posts containing emojis
     * @callback CallbackG
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removePostsWithEmojis = function(post) {
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
        if (!postWords) return false;

        const hasEmoji = regexEmoji.test(postWords.textContent);
        const result = changeVisibility(post, hasEmoji, settings.removePostsWithEmojis);
        return result;
    }

    /**
     * @typedef {CallbackA|CallbackB|CallbackC|CallbackD|CallbackE|CallbackF|CallbackG} FilterCallback
     */

    /**
     * Function for conditionally executing a filter
     * @param {boolean} flag - Current flag status for conditionally executing the callback
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @param {FilterCallback} callback - The callback (i.e., a filter function) to execute.
     *        It receives a post as parameter and returns a boolean indicating whether the post was hidden. 
     * @returns {boolean} The result of applying the filter: 'true' if the post was hidden, 'false' otherwise
     */
    const execute = (flag, post, callback) => {
        if (flag) {
            return true;
        } else {
            const result = callback(post);
            return result;
        }
    }
    
    /**
     * Main filtering function
     * @returns {undefined}
     */
    const runFilters = function() {
        const feed = document.querySelector(LINKEDIN_MAIN_FEED_CSS_SELECTOR);
        if (!feed) {
            console.log('[BetterLinkedIn] Feed element not found with selector:', LINKEDIN_MAIN_FEED_CSS_SELECTOR);
            return;
        }
        const posts = [...feed.querySelectorAll(LINKEDIN_POST_CONTAINERS_CSS_SELECTOR)];
        console.log(`[BetterLinkedIn] Found ${posts.length} posts with selector: ${LINKEDIN_POST_CONTAINERS_CSS_SELECTOR}`);

        if (posts.length === 0) {
            // Fallback: try all role=listitem descendants
            const allListItems = [...feed.querySelectorAll('[role="listitem"]')];
            console.log(`[BetterLinkedIn] Fallback: found ${allListItems.length} [role=listitem] elements`);
            if (allListItems.length > 0) {
                console.log('[BetterLinkedIn] First listitem attributes:', allListItems[0].attributes.length, 
                    [...allListItems[0].attributes].map(a => `${a.name}="${a.value.substring(0,30)}"`).join(', '));
            }
        }

        posts.forEach((post) => {
            let isFlagged = false;
                    
            // Run filters sequentially and conditionally
            isFlagged = execute(isFlagged, post, removePromotedPosts);
            isFlagged = execute(isFlagged, post, removePostsByKeyword);
            isFlagged = execute(isFlagged, post, removePostsByCompanyName);
            isFlagged = execute(isFlagged, post, removeInteractionPosts);
            isFlagged = execute(isFlagged, post, removeAIPosts);
            isFlagged = execute(isFlagged, post, removeSuggestedPosts);
            isFlagged = execute(isFlagged, post, removePostsWithEmojis);
        })    
    }
    
    /**
     * Async function for initializing the content script
     * @returns {Promise<void>} A promise that resolves when initialization is complete
     */
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
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'settingsUpdated' || request.action === 'advancedSettingsUpdated') {
            loadSettings().then(() => {
                runFilters();
            });
        }
    });
    
    // Start the extension
    initialize();
})();
