/**
 * Historic Equity WordPress Theme JavaScript
 *
 * @package HistoricEquity
 */

(function() {
    'use strict';

    // DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Historic Equity theme loaded successfully');

        // Add any interactive functionality here
        // For example: smooth scrolling, mobile menu toggle, etc.

        // Mobile menu toggle (when menu exists)
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-navigation');

        if (navToggle && mainNav) {
            navToggle.addEventListener('click', function() {
                mainNav.classList.toggle('is-open');
            });
        }

        // Smooth scroll for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    });

})();