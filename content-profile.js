(function() {
    'use strict';

    let settings = {
        detectFakeProfiles: false,
        enableProfileNotes: false
    };

    const injectWarningBanner = (container, message) => {
        const existing = container.querySelector('.bl-warning-banner');
        if (existing) return;
        
        const banner = document.createElement('div');
        banner.className = 'bl-warning-banner';
        banner.style.padding = '12px 16px';
        banner.style.margin = '16px';
        banner.style.width = 'calc(100% - 32px)';
        banner.style.borderRadius = '8px';
        banner.style.backgroundColor = '#172DE2';
        banner.style.color = '#ffffff';
        banner.style.border = 'none';
        banner.style.fontWeight = '500';
        banner.style.fontSize = '14px';
        banner.innerHTML = `<strong>${t('alertPrefix')}</strong> ${message}`;
        
        container.prepend(banner);
    };

    const processProfile = () => {
        // Look for buttons that say Message, Connect, or More
        const buttons = Array.from(document.querySelectorAll('button'));
        const actionBtn = buttons.find(b => {
            const label = b.getAttribute('aria-label');
            return label && (label.toLowerCase().includes('message') || label.toLowerCase().includes('connect') || label.toLowerCase().includes('more') || label.toLowerCase().includes('mensaje') || label.toLowerCase().includes('conectar'));
        });

        if (!actionBtn) return;
        const topCard = actionBtn.closest('section') || actionBtn.parentElement.parentElement;

        // Fake Profile Detector
        if (settings.detectFakeProfiles) {
            const text = document.body.textContent.toLowerCase();
            // Count connections from text
            const connMatch = text.match(/(\d+)\+?\s*(connections|contactos)/);
            let isLowConnections = false;
            if (connMatch) {
                isLowConnections = parseInt(connMatch[1]) < 50;
            } else if (!text.includes('followers') && !text.includes('seguidores')) {
                // if we can't find followers or connections, maybe it's very low
                isLowConnections = true;
            }

            // Photo: check if the user uploaded a custom profile picture
            const userName = document.title.split(' | ')[0].split(' ')[0];
            const hasPhoto = !!document.querySelector(`img[alt*="${userName}"]`) || !!document.querySelector('img[src*="profile-displayphoto"], img[srcset*="profile-displayphoto"]');

            if (!hasPhoto || isLowConnections) {
                injectWarningBanner(topCard, t('suspiciousProfile'));
            }
        }

        // Notes & Tags
        if (settings.enableProfileNotes) {
            injectNotesPanel(topCard, actionBtn.parentElement);
        }
    };

    const injectNotesPanel = async (container, actionContainer) => {
        if (document.querySelector('.bl-notes-panel')) return;

        // Synchronously create and inject to prevent race conditions during async fetch
        const panel = document.createElement('div');
        panel.className = 'bl-notes-panel';
        panel.style.margin = '16px';
        panel.style.width = 'calc(100% - 32px)';
        panel.style.padding = '12px';
        panel.style.backgroundColor = '#172DE2';
        panel.style.color = '#ffffff';
        panel.style.border = 'none';
        panel.style.borderRadius = '8px';
        panel.innerHTML = `<div style="font-size: 12px; color: #666;">${t('loadingNotes')}</div>`;

        container.appendChild(panel);

        const profileId = window.location.pathname.split('/in/')[1]?.split('/')[0];
        if (!profileId) {
            panel.remove();
            return;
        }

        const res = await chrome.storage.local.get(['profileNotes']);
        const allNotes = res.profileNotes || {};
        const userNote = allNotes[profileId] || { tag: '', note: '' };

        panel.innerHTML = `
            <style>
                .bl-tag-input::placeholder, .bl-note-input::placeholder { color: rgba(255, 255, 255, 0.7) !important; }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center;" class="bl-notes-header-container">
                <div style="display: flex; align-items: center; cursor: pointer; flex-grow: 1;" class="bl-notes-header">
                    <h3 style="font-size: 14px; margin: 0; color: #ffffff;">${t('privateNotesTitle')}</h3>
                    <span class="bl-notes-toggle" style="color: #ffffff; margin-left: 8px;">▼</span>
                </div>
                <a href="https://truthscan.com/ai-image-detector" target="_blank" style="background-color: #ffffff; color: #172DE2; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; text-decoration: none; display: flex; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-left: 12px; white-space: nowrap;">${t('scanPhoto')}</a>
            </div>
            <div class="bl-notes-content" style="display: none; margin-top: 12px;">
                <input type="text" class="bl-tag-input" placeholder="${t('tagPlaceholder')}" value="${escapeHTML(userNote.tag)}" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: #fff;">
                <textarea class="bl-note-input" placeholder="${t('notePlaceholder')}" style="width: 100%; padding: 8px; border: none; border-radius: 4px; min-height: 80px; resize: vertical; background: rgba(255,255,255,0.1); color: #fff;">${escapeHTML(userNote.note)}</textarea>
                <button class="bl-save-note" style="margin-top: 8px; padding: 6px 16px; background-color: #ffffff; color: #172DE2; border: none; border-radius: 24px; cursor: pointer; font-weight: 600;">${t('saveNote')}</button>
                <span class="bl-save-status" style="margin-left: 8px; font-size: 12px; color: #a5d6a7;"></span>
            </div>
        `;

        const header = panel.querySelector('.bl-notes-header');
        const content = panel.querySelector('.bl-notes-content');
        const toggle = panel.querySelector('.bl-notes-toggle');

        header.onclick = () => {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            toggle.textContent = isHidden ? '▲' : '▼';
        };

        const saveBtn = panel.querySelector('.bl-save-note');
        const tagInput = panel.querySelector('.bl-tag-input');
        const noteInput = panel.querySelector('.bl-note-input');
        const statusSpan = panel.querySelector('.bl-save-status');

        saveBtn.onclick = async () => {
            const currentRes = await chrome.storage.local.get(['profileNotes']);
            const currentNotes = currentRes.profileNotes || {};
            currentNotes[profileId] = {
                tag: tagInput.value.trim(),
                note: noteInput.value.trim(),
                updatedAt: new Date().toISOString()
            };
            await chrome.storage.local.set({ profileNotes: currentNotes });
            
            statusSpan.textContent = t('saved');
            setTimeout(() => statusSpan.textContent = '', 2000);
        };

    };

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    async function initialize() {
        const result = await chrome.storage.sync.get([
            'detectFakeProfiles',
            'enableProfileNotes'
        ]);

        settings.detectFakeProfiles = result.detectFakeProfiles === true;
        settings.enableProfileNotes = result.enableProfileNotes === true;

        setTimeout(processProfile, 2000);

        let timeout = null;
        const observer = new MutationObserver(() => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(processProfile, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'settingsUpdated' || request.action === 'advancedSettingsUpdated') {
            initialize();
        }
    });

    initialize();
})();
