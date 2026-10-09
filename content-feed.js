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
        removeSuggested: false,
        removeBroetryPosts: false
    };

    let sessionPostsHidden = 0;

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

            const syncResult = await chrome.storage.sync.get(['removeBroetryPosts']);
            settings.removeBroetryPosts = syncResult.removeBroetryPosts === true;
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


    const removePromotedPosts = function(post) {
        if (!settings.removePromoted) return false;
        const spans = post.querySelectorAll('p > span');
        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text.length > 150) continue;
            for (const word of promotedWords) {
                if (text === word || text.startsWith(word + ' ')) {
                    return true;
                }
            }
        }
        return false;
    }

    const removePostsByKeyword = function(post) {
        if (!settings.removeByKeywords) return false;
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
        if (!postWords) return false;
        const regex = /\b\p{L}+\b/gu;
        const words = postWords.textContent.toLowerCase().match(regex) || [];
        for (const word of words) {
            if (settings.mutedWords.includes(word)) {
                return true;
            }
        }
        return false;
    }

    const removePostsByCompanyName = function(post) {
        if (!settings.removeByCompanies) return false;
        const spans = post.querySelectorAll('p > span');
        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text && settings.mutedCompanies.includes(text)) {
                return true;
            }
        }
        return false;
    }

    const removeInteractionPosts = function(post) {
        if (!settings.removeByInteractions) return false;
        const spans = post.querySelectorAll('p > span');
        const lang = document.documentElement.lang;
        const langInteractions = interactions[lang] || interactions['en'];
        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text.length > 150) continue; 
            const words = text.split(' ');
            for (const word of words) {
                if (langInteractions.has(word)) {
                    return true;
                }
            }
        }
        return false;
    }

    const removeAIPosts = function(post) {
        if (!settings.removeAIPosts) return false;
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
        if (!postWords) return false;
        const text = postWords.textContent;
        return regexAItext.some(regex => regex.test(text));
    }

    const removeSuggestedPosts = function(post) {
        if (!settings.removeSuggested) return false;
        const spans = post.querySelectorAll('p > span');
        for (const span of spans) {
            const text = normalizeText(span.textContent);
            if (text.length > 150) continue;
            if (suggestedWords.has(text)) {
                return true;
            }
        }
        return false;
    }

    const removePostsWithEmojis = function(post) {
        if (!settings.removePostsWithEmojis) return false;
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
        if (!postWords) return false;
        return regexEmoji.test(postWords.textContent);
    }

    const regexBroetryWords = /agree\?|thoughts\?|¿estás de acuerdo\?|¿qué opinas\?/i;

    const removeBroetryPosts = function(post) {
        if (!settings.removeBroetryPosts) return false;
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);
        if (!postWords) return false;
        const text = postWords.textContent;
        const html = postWords.innerHTML;
        if (regexBroetryWords.test(text)) {
            return true;
        }
        const brCount = (html.match(/<br\s*\/?>/gi) || []).length;
        if (brCount > 6) {
            return true;
        }
        return false;
    }

    const execute = (flag, post, callback) => {
        if (flag) return true;
        return callback(post);
    }

    const runFilters = function() {
        const feed = document.querySelector(LINKEDIN_MAIN_FEED_CSS_SELECTOR);
        if (!feed) return;

        const posts = [...feed.querySelectorAll(LINKEDIN_POST_CONTAINERS_CSS_SELECTOR)];

        posts.forEach((post) => {
            let isFlagged = false;
            
            isFlagged = execute(isFlagged, post, removePromotedPosts);
            isFlagged = execute(isFlagged, post, removePostsByKeyword);
            isFlagged = execute(isFlagged, post, removePostsByCompanyName);
            isFlagged = execute(isFlagged, post, removeInteractionPosts);
            isFlagged = execute(isFlagged, post, removeAIPosts);
            isFlagged = execute(isFlagged, post, removeSuggestedPosts);
            isFlagged = execute(isFlagged, post, removePostsWithEmojis);
            isFlagged = execute(isFlagged, post, removeBroetryPosts);
            
            if (isFlagged) {
                if (post.style.display !== 'none') {
                    post.style.display = 'none';
                    sessionPostsHidden++;
                    chrome.storage.local.get(['totalPostsHidden'], function(res) {
                        const current = res.totalPostsHidden || 0;
                        chrome.storage.local.set({ totalPostsHidden: current + 1 });
                    });
                }
            } else {
                if (post.style.display === 'none') {
                    post.style.display = '';
                }
            }
        });
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
    
    // Listen for messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'settingsUpdated' || request.action === 'advancedSettingsUpdated') {
            loadSettings().then(() => {
                runFilters();
            });
        }
        if (request.action === 'getSessionStats') {
            sendResponse({ hiddenCount: sessionPostsHidden });
        }
    });
    
    // Start the extension
    initialize();
})();
