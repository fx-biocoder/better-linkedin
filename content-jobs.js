// Content script for Better LinkedIn extension

(function() {
    'use strict';

    let settings = {
        removePromotedJobs: false,
        jobAgeAlerts: false,
        jobRedFlags: false
    };

    const promotedWords = new Set([
        'Promoted',
        'Promocionado',
        'Promovida',
        'Promosso'
    ]);

    // CSS selectors
    const LINKEDIN_JOB_CSS_SELECTOR = 'div[data-display-contents="true"] a[tabindex="0"], div[componentkey^="job-card-component-ref-"]';
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

        const target = job.closest('li.ember-view') || job.closest('div[data-display-contents="true"]') || job;

        if (status) {
            if (settingValue) {
                target.style.display = 'none';
                hidden = true;
            } else {
                target.style.display = '';
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
                'removePromotedJobs',
                'jobAgeAlerts',
                'jobRedFlags'
            ]);

            settings.removePromotedJobs = result.removePromotedJobs === true;
            settings.jobAgeAlerts = result.jobAgeAlerts === true;
            settings.jobRedFlags = result.jobRedFlags === true;
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

    const removeOldJobs = function(job) {
        const elements = job.querySelectorAll('time, span, div, p');
        if (!elements) return false;

        let isOld = false;

        for (const el of elements) {
            const text = el.textContent.trim().toLowerCase();
            if (text.length > 40) continue;

            if ((text.includes(' ago') || text.includes('hace ')) && 
                (text.includes('month') || text.includes('mes') || (text.includes('day') && parseInt(text.replace(/\D/g,'')) > 30) || (text.includes('día') && parseInt(text.replace(/\D/g,'')) > 30))) {
                isOld = true;
                break;
            }
        }

        const result = changeVisibility(job, isOld, settings.jobAgeAlerts);
        return result;
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
            isFlagged = execute(isFlagged, job, removeOldJobs);
        });

        const jobsFromJobCollections = document.querySelectorAll(LINKEDIN_JOB_COLLECTIONS_CSS_SELECTOR);

        jobsFromJobCollections.forEach((job) => {
            let isFlagged = false;

            isFlagged = execute(isFlagged, job, removePromotedJobFromCollections);
            isFlagged = execute(isFlagged, job, removeOldJobs);
        });

        processJobPanel();
    }

    const injectWarningBanner = (container, message, isRedFlag) => {
        if (!container) return;
        const existing = container.querySelector(`.bl-warning-banner[data-msg="${message}"]`);
        if (existing) return;
        
        const banner = document.createElement('div');
        banner.className = 'bl-warning-banner';
        banner.dataset.msg = message;
        banner.style.padding = '12px 16px';
        banner.style.margin = '16px 0';
        banner.style.borderRadius = '8px';
        banner.style.backgroundColor = '#0077b5';
        banner.style.color = '#ffffff';
        banner.style.border = '1px solid #00a0dc';
        banner.style.fontWeight = '500';
        banner.style.fontSize = '14px';
        banner.innerHTML = `<strong>${t('alertPrefix')}</strong> ${message}`;
        
        container.prepend(banner);
    };

    const processJobPanel = () => {
        // Find action buttons (Save or Apply) to locate the top card
        const buttons = Array.from(document.querySelectorAll('button'));
        const actionBtns = buttons.filter(b => {
            const label = b.getAttribute('aria-label');
            return label && (label.toLowerCase().includes('save') || label.toLowerCase().includes('guardar') || label.toLowerCase().includes('apply') || label.toLowerCase().includes('solicitar') || label.toLowerCase().includes('postular')) && !b.classList.contains('bl-save-btn');
        });

        if (actionBtns.length === 0) return;
        
        const mainActionBtn = actionBtns[0];
        const actionContainer = mainActionBtn.parentElement;
        
        let topCard = actionContainer;
        for (let i = 0; i < 10; i++) {
            if (topCard.parentElement && topCard.parentElement.tagName !== 'MAIN' && topCard.parentElement.tagName !== 'BODY') {
                topCard = topCard.parentElement;
            }
        }



        // Red Flags
        if (settings.jobRedFlags) {
            const text = document.body.textContent.toLowerCase();
            const flags = ['ninja', 'rockstar', 'guru', 'work under pressure', 'trabajar bajo presión', 'fast-paced environment', 'multitasking', 'multi-tasking', 'multitasker', 'no remunerado', 'no remunerada'];
            const found = flags.filter(f => text.includes(f));
            if (found.length > 0) {
                injectWarningBanner(topCard, `${t('redFlagsDetected')}${found.join(', ')}`, true);
            }
        }
        
    };



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

        // Set up mutation observer with debounce
        let timeout = null;
        const observer = new MutationObserver(() => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(runFilters, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Listen for settings updates from popup/options
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'settingsUpdated' || request.action === 'advancedSettingsUpdated') loadSettings().then(() => {
            runFilters();
        })
    });

    // Start the extension
    initialize();
})();