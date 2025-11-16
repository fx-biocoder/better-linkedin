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
        filterAIPosts: false,
        filterSuggested: false,
        filterPromotedJobs: false
    };

    const interactions = {
        // English
        "en": new Set(['likes', 'celebrates', 'insightful', 'funny', 'loves', 'commented', 'supports', 'reacted']),
        
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
        'Suggested'
    ]);

    const promotedJobWords = new Set([
        'Promoted'
    ]);

    const regexAItext = [
        // Em-dashes. Could lead to false positives but commonly found in AI-generated content
        /—/,

        // Common AI-generated call-to-actions
        /comment below/i,
        /share your thoughts/i,
        /in the comments/i,
        /drop a comment/i,
        /comenta debajo/i,
        /\b[eé]n (los )?c[oó]m[eé]nt[aá]r[ií]o[s]\b/i,
        /te leo/i,

        // 'When X meets Y' pattern
        /when\s+(\w+)\s+meets\s+(\w+)/i,

        // Phrases indicating AI authorship
        /in summary/i
    ];

    // CSS selectors to target content to be filtered
    const LINKEDIN_POST_CSS_SELECTOR = 'div.scaffold-finite-scroll__content div';
    const LINKEDIN_POST_BODY_CSS_SELECTOR = 'div.update-components-text.relative.update-components-update-v2__commentary span.break-words.tvm-parent-container span';
    const LINKEDIN_COMPANY_NAME_CSS_SELECTOR = 'div.update-components-actor__container.pr4.display-flex.flex-grow-1 span.update-components-actor__title span.update-components-actor__single-line-truncate span.visually-hidden';
    const LINKEDIN_INTERACTION_POST_CSS_SELECTOR = 'span.update-components-header__text-view';

    // CSS selectors for promoted jobs (linkedin.com/jobs/collections/recommended)
    const LINKEDIN_JOB_CSS_SELECTOR = 'li.ember-view.occludable-update';
    const LINKEDIN_JOB_PROMOTED_LABEL_CSS_SELECTOR = 'li.job-card-container__foter-item span';

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
                'removePromoted',
                'removeByKeywords',
                'removeByCompanies',
                'removeByInteractions',
                'mutedWords',
                'mutedCompanies',
                'filterAIPosts',
                'filterSuggested',
                'filterPromotedJobs'
            ]);
            
            settings.removePromoted = result.removePromoted === true;
            settings.removeByKeywords = result.removeByKeywords === true; 
            settings.removeByCompanies = result.removeByCompanies === true;
            settings.removeByInteractions = result.removeByInteractions === true;
            settings.mutedWords = result.mutedWords || [];
            settings.mutedCompanies = result.mutedCompanies || [];
            settings.filterAIPosts = result.filterAIPosts === true;
            settings.filterSuggested = result.filterSuggested === true;
            settings.filterPromotedJobs = result.filterPromotedJobs === true;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Removes promoted posts from the LinkedIn feed
     * @callback CallbackA
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removePromotedPosts = function(post) {
        const spans = post.querySelectorAll("span");
        let isPromoted = false;

        for (const span of spans) {
            if (promotedWords.has(span.textContent)) {
                isPromoted = true;
                break;
            }
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

        if (postWords) {
            const regex = /\b\p{L}+\b/gu;
            const words = postWords.textContent.toLowerCase().match(regex);
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
    }

    /**
     * Removes posts by company name
     * @callback CallbackC
     * @param {HTMLElement} post - The LinkedIn post to filter
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const removePostsByCompanyName = function(post) {
        const companies = post.querySelectorAll(LINKEDIN_COMPANY_NAME_CSS_SELECTOR);
        let isMutedCompany = false;

        for (const company of companies) {
            if (company && settings.mutedCompanies.includes(company.textContent)) {
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
        const header = post.querySelector(LINKEDIN_INTERACTION_POST_CSS_SELECTOR);
        const lang = document.documentElement.lang;

        if (header) {
            const headerContents = header.textContent.split(' ');
            let isInteraction = false;

            for (const word of headerContents) {
                if (interactions[lang].has(word)) {
                    isInteraction = true;
                    break;
                }
            }

            const result = changeVisibility(post, isInteraction, settings.removeByInteractions);
            return result;
        }
    }

    /**
     * Filters AI-generated posts
     * @callback CallbackE
     * @param {HTMLElement} post - The LinkedIn post to filter 
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const filterAIPosts = function(post) {
        const postWords = post.querySelector(LINKEDIN_POST_BODY_CSS_SELECTOR);

        if (!postWords) return false;

        const text = postWords.textContent;
        const match = regexAItext.some((regex) => regex.test(text));
        const result = match ? changeVisibility(post, true, settings.filterAIPosts) : false;
        return result;
    }

    /**
     * Removes suggested posts
     * @callback CallbackF
     * @param {HTMLElement} post - The LinkedIn post to filter 
     * @returns {boolean} A flag indicating whether the post was hidden or not
     */
    const filterSuggestedPosts = function(post) {
        const isSuggested = [...post.querySelectorAll("span")]
            .some(span => suggestedWords.has(span.textContent));

        const result = changeVisibility(post, isSuggested, settings.filterSuggested);
        return result;
    }

    /**
     * Removes promoted jobs
     * @returns {undefined}
     */
    const filterPromotedJobs = function() {
        const jobs = document.querySelectorAll(LINKEDIN_JOB_CSS_SELECTOR);
        let isPromotedJob = false;

        jobs.forEach((job) => {
            const target = job.querySelector(LINKEDIN_JOB_PROMOTED_LABEL_CSS_SELECTOR);

            if (target) {
                const label = target.textContent;
                if (promotedJobWords.has(label)) {
                    isPromotedJob = true;
                }
            }

            changeVisibility(job, isPromotedJob, settings.filterPromotedJobs);
        });
    }

    /**
     * @typedef {CallbackA|CallbackB|CallbackC|CallbackD|CallbackE|CallbackF} FilterCallback
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
        const currentUrl = window.location.href;

        if (currentUrl.includes('linkedin.com/jobs/collections/recommended')) {
            filterPromotedJobs();
            return;
        }

        const posts = document.querySelectorAll(LINKEDIN_POST_CSS_SELECTOR);

        posts.forEach((post) => {
            let isFlagged = false;
                    
            // Run filters sequentially and conditionally
            isFlagged = execute(isFlagged, post, removePromotedPosts);
            isFlagged = execute(isFlagged, post, removePostsByKeyword);
            isFlagged = execute(isFlagged, post, removePostsByCompanyName);
            isFlagged = execute(isFlagged, post, removeInteractionPosts);
            isFlagged = execute(isFlagged, post, filterAIPosts);
            isFlagged = execute(isFlagged, post, filterSuggestedPosts);
        })    
    }
    
    /**
     * Initializes the content script
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

    // async function initialize() {
    //     // Load extension settings first
    //     await loadSettings();

    //     // Helper to ensure body exists before running filters
    //     function onBodyReady(callback) {
    //         if (document.body) {
    //             callback();
    //         } else {
    //             const observer = new MutationObserver((mutations, obs) => {
    //                 if (document.body) {
    //                     obs.disconnect();
    //                     callback();
    //                 }
    //             });
    //             observer.observe(document.documentElement, { childList: true });
    //         }
    //     }

    //     // Set up filters and mutation observer once body exists
    //     onBodyReady(() => {
    //         // Initial run of filters
    //         runFilters();

    //         // Observe DOM changes to run filters dynamically
    //         const observer = new MutationObserver(runFilters);
    //         observer.observe(document.body, { childList: true, subtree: true });
    //     });
    // }
    
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
