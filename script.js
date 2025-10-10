// ==UserScript==
// @name         Better Linkedin
// @namespace    http://tampermonkey.net/
// @version      2025-10-10
// @description  Improve your LinkedIn feed by automatically removing unwanted posts
// @author       Facundo Martínez (fx-biocoder on GitHub)
// @match        https://www.linkedin.com/feed/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkedin.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    const mutedWords = new Set([
        "lorem",
        "ipsum"
        // Add more words here depending on what words you want to mute
        // NOTE: the words must be written in lowercase
    ])
    
    // Add muted word to set
    // This function is not currently used but I am leaving it here
    // As I plan to use it in the future
    const addMutedWord = (word) => {
        mutedWords.add(word.toLowerCase());
    }
    
    
    // Remove promoted posts
    const removePromotedPosts = function() {
        // List of LinkedIn posts currently visible on your feed
        const publications = document.querySelectorAll("div.fie-impression-container");
    
        // Mute promoted publications
        publications.forEach((item) => {
            const spans = item.querySelectorAll("span");
            spans.forEach((span) => {
                if (span.textContent === "Promoted") {
                    item.style.display = "none";
                }
            })
        })
    }
    
    // Remove posts by keyword
    const removePostsByKeyword = function() {
        // Get all posts
        const publications = document.querySelectorAll("div.fie-impression-container");
    
        // Mute publications containing a specific word
        publications.forEach((pub) => {
            const publicationWords = pub.querySelector("div.update-components-text.relative.update-components-update-v2__commentary").textContent.split(" ");
            let stopSearch = false;
    
            publicationWords.forEach((word) => {
                if (stopSearch) {
                    return;
                }
                if (mutedWords.has(word.toLowerCase())) {
                    pub.style.display = "none";
                    stopSearch = true;
                }
            })
        })
    }
    
    // Run once every page load and again whenever DOM updates
    // Acknowledgement: u/audioeptesicus from Reddit.
    window.addEventListener("load", () => {
        setTimeout(removePromotedPosts, 3000);
        removePostsByKeyword();
    })
    
    const observerA = new MutationObserver(removePromotedPosts);
    const observerB = new MutationObserver(removePostsByKeyword);
    observerA.observe(document.body, { childList: true, subtree: true });
    observerB.observe(document.body, { childList: true, subtree: true });
})();
