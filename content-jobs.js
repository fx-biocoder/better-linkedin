// Content script for Better LinkedIn extension

(function() {
    'use strict';

    let settings = {
        removePromotedJobs: false
    };

    const promotedWords = new Set([
        'Promoted',
        'Promocionado',
        'Promovida',
        'Promosso'
    ]);

    // CSS selectors
    const LINKEDIN_JOB_CSS_SELECTOR = 'div[data-display-contents="true"] a[tabindex="0"]';
    const LINKEDIN_JOB_COLLECTIONS_CSS_SELECTOR = 'li.ember-view';

    /**
     * General purpose function to change the visibility of a job
     * @param {HTMLElement} job - The LinkedIn job to filter
     * @param {boolean} status - A flag that indicates whether the job meets the filter criteria
     * @param {boolean} settingValue - A flag indicating whether the filter is enabled
     * @returns {boolean} A flag indicating whether the job was hidden or not
     */
    const changeVisibility = function(job, status, settingValue) {
        let hidden = false;

        if (status) {
            if (settingValue) {
                job.style.display = 'none';
                hidden = true;
            } else {
                job.style.display = '';
            }
        }

        return hidden;
    }

    /**
     * Loads the extension settings from the browser's synchronized storage
     * @returns {Promise<void>} A promise that resolves when settings are loaded
     */
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'removePromotedJobs'
            ]);

            settings.removePromotedJobs = result.removePromotedJobs === true;
        } catch (error) {
            console.error('Error loading settings: ', error);
        }
    }

    /**
     * Removes promoted job postings
     * @callback CallbackA
     * @param {HTMLElement} job - The LinkedIn job to filter
     * @returns {boolean} A flag indicating whether the job was hidden or not
     */
    const removePromotedJobs = function(job) {
        const elements = job.querySelectorAll('p, span');
        if (!elements) return false;

        let isPromoted = false;

        for (const el of elements) {
            const content = el.textContent
                .replace(/\n/g, '')
                .trim();
            
            if (content.length > 150) continue; // safety check
                
            for (const word of promotedWords) {
                if (content === word || content.startsWith(word + ' ')) {
                    isPromoted = true;
                    break;
                }
            }
            if (isPromoted) break;
        }

        const result = changeVisibility(job, isPromoted, settings.removePromotedJobs);
        return result;
    }

    const removePromotedJobFromCollections = function(job) {
        const elements = job.querySelectorAll('p, span');
        if (!elements) return false;

        let isPromoted = false;

        for (const el of elements) {
            const content = el.textContent
                .replace(/\n/g, '')
                .trim();
            
            if (content.length > 150) continue; // safety check
                
            for (const word of promotedWords) {
                if (content === word || content.startsWith(word + ' ')) {
                    isPromoted = true;
                    break;
                }
            }
            if (isPromoted) break;
        }

        const result = changeVisibility(job, isPromoted, settings.removePromotedJobs);
        return result;
    }

    /**
     * @typedef {CallbackA|CallbackB} FilterCallback
     */

    /**
     * Function for conditionally executing a filter
     * @param {boolean} flag - Current flag status for conditionally executing the callback
     * @param {HTMLElement} job - The LinkedIn job to filter
     * @param {FilterCallback} callback - The callback (i.e., a filter function) to execute
     *        it receives a post as parameter and returns a boolean indicating whether the job was hidden or not
     * @returns {boolean} The result of applying the filter: 'true' if the job was hidden, 'false' otherwise
     */
    const execute = (flag, job, callback) => {
        if (flag) {
            return true;
        } else {
            const result = callback(job);
            return result;
        }
    }

    /**
     * Main filtering function
     * @returns {undefined}
     */
    const runFilters = function() {
        const jobs = document.querySelectorAll(LINKEDIN_JOB_CSS_SELECTOR);

        jobs.forEach((job) => {
            let isFlagged = false;
            // Run filters sequentially and conditionally
            isFlagged = execute(isFlagged, job, removePromotedJobs);
        });

        const jobsFromJobCollections = document.querySelectorAll(LINKEDIN_JOB_COLLECTIONS_CSS_SELECTOR);

        jobsFromJobCollections.forEach((job) => {
            let isFlagged = false;

            isFlagged = execute(isFlagged, job, removePromotedJobFromCollections);
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

        // Set up mutation observer
        const observer = new MutationObserver(runFilters);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Listen for settings updates from popup
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'settingsUpdated') loadSettings().then(() => {
            runFilters();
        })
    });

    // Start the extension
    initialize();
})();