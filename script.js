// ==UserScript==
// @name         Better Linkedin
// @namespace    http://tampermonkey.net/
// @version      2025-10-10
// @description  Improve your LinkedIn feed by automatically removing unwanted posts
// @author       Facundo Martínez
// @match        https://www.linkedin.com/feed/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkedin.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add muted word to set
    /*
    const addMutedWord = (word) => {
        mutedWords.add(word);
    }
    */
    
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
                    return;
                }
            })
        })
    }
    
    // Remove posts by keyword
    /*
    const removePostsByKeyword = function() {
        // Get all posts
        const publications = document.querySelectorAll("div.fie-impression-container");
    
        // Mute publications containing a specific word
        publications.forEach((pub) => {
            const publicationWords = pub.querySelector(".update-components-text").textContent.split(" ");
    
            publicationWords.forEach((word) => {
                if (mutedWords.has(word)) {
                    pub.style.display = "none";
                }
            })
        })
    }
    */
    
    // Run once every page load and again whenever DOM updates
    // Acknowledgment: u/audioeptesicus from Reddit.
    window.addEventListener("load", () => {
        setTimeout(removePromotedPosts, 3000);
        //removePostsByKeyword();
    })
    
    
    const observerA = new MutationObserver(removePromotedPosts);
    //const observerB = new MutationObserver(removePostsByKeyword);
    observerA.observe(document.body, { childList: true, subtree: true });
    //observerB.observe(document.body, { childList: true, subtree: true });
})();
