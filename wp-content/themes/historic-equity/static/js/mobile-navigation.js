/**
 * Mobile Navigation Hamburger Menu for Historic Equity Inc.
 *
 * Responsive mobile navigation with smooth animations, accessibility features,
 * and SHTC-focused user experience optimizations.
 *
 * @package HistoricEquity
 */

(function($) {
    'use strict';

    /**
     * Mobile Navigation Manager
     */
    class MobileNavigationManager {
        constructor() {
            this.mobileMenuToggle = $('.mobile-menu-toggle, .hamburger-menu');
            this.mobileMenu = $('.mobile-menu, .mobile-navigation');
            this.mobileMenuOverlay = $('.mobile-menu-overlay');
            this.header = $('.site-header, header');
            this.body = $('body');
            this.navLinks = $('.mobile-menu a, .mobile-navigation a');

            this.isOpen = false;
            this.isAnimating = false;
            this.breakpoint = 768; // Mobile breakpoint

            this.init();
        }

        /**
         * Initialize mobile navigation
         */
        init() {
            this.setupEventHandlers();
            this.setupAccessibility();
            this.setupKeyboardNavigation();
            this.setupResizeHandler();
            this.setupScrollBehavior();
            this.setupMenuAnimations();

            console.log('Historic Equity Mobile Navigation initialized');
        }

        /**
         * Setup event handlers
         */
        setupEventHandlers() {
            // Toggle menu on button click
            this.mobileMenuToggle.on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu on overlay click
            this.mobileMenuOverlay.on('click', () => {
                this.closeMenu();
            });

            // Close menu on link click
            this.navLinks.on('click', (e) => {
                const link = $(e.target);

                // Don't close for dropdown toggles
                if (link.hasClass('dropdown-toggle') || link.closest('.has-dropdown').length) {
                    return;
                }

                // Close menu after small delay for smooth transition
                setTimeout(() => {
                    this.closeMenu();
                }, 150);
            });

            // Handle dropdown menus
            $('.mobile-menu .has-dropdown > a, .mobile-navigation .has-dropdown > a').on('click', (e) => {
                e.preventDefault();
                this.toggleDropdown($(e.target).closest('.has-dropdown'));
            });

            // Close menu on outside click
            $(document).on('click', (e) => {
                if (this.isOpen && !this.mobileMenu.is(e.target) && !this.mobileMenu.has(e.target).length &&
                    !this.mobileMenuToggle.is(e.target) && !this.mobileMenuToggle.has(e.target).length) {
                    this.closeMenu();
                }
            });
        }

        /**
         * Setup accessibility features
         */
        setupAccessibility() {
            // ARIA attributes
            this.mobileMenuToggle.attr({
                'aria-expanded': 'false',
                'aria-controls': this.mobileMenu.attr('id') || 'mobile-menu',
                'aria-label': 'Toggle mobile menu'
            });

            this.mobileMenu.attr({
                'role': 'navigation',
                'aria-label': 'Mobile navigation menu'
            });

            // Focus management
            this.mobileMenu.attr('tabindex', '-1');

            // Screen reader announcements
            $('<div>', {
                'class': 'sr-only',
                'id': 'mobile-menu-status',
                'aria-live': 'polite',
                'aria-atomic': 'true'
            }).appendTo('body');
        }

        /**
         * Setup keyboard navigation
         */
        setupKeyboardNavigation() {
            // Escape key closes menu
            $(document).on('keydown', (e) => {
                if (e.keyCode === 27 && this.isOpen) { // Escape key
                    this.closeMenu();
                    this.mobileMenuToggle.focus();
                }
            });

            // Tab trapping within menu
            this.mobileMenu.on('keydown', (e) => {
                if (e.keyCode === 9 && this.isOpen) { // Tab key
                    this.trapFocus(e);
                }
            });

            // Enter and Space activate menu toggle
            this.mobileMenuToggle.on('keydown', (e) => {
                if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
                    e.preventDefault();
                    this.toggleMenu();
                }
            });

            // Arrow key navigation
            this.navLinks.on('keydown', (e) => {
                this.handleArrowKeyNavigation(e);
            });
        }

        /**
         * Trap focus within mobile menu
         */
        trapFocus(e) {
            const focusableElements = this.mobileMenu.find('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements.first();
            const lastElement = focusableElements.last();

            if (e.shiftKey) {
                if ($(e.target).is(firstElement)) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if ($(e.target).is(lastElement)) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        /**
         * Handle arrow key navigation
         */
        handleArrowKeyNavigation(e) {
            if (e.keyCode === 38 || e.keyCode === 40) { // Up or Down arrow
                e.preventDefault();

                const currentIndex = this.navLinks.index(e.target);
                let nextIndex;

                if (e.keyCode === 38) { // Up arrow
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : this.navLinks.length - 1;
                } else { // Down arrow
                    nextIndex = currentIndex < this.navLinks.length - 1 ? currentIndex + 1 : 0;
                }

                this.navLinks.eq(nextIndex).focus();
            }
        }

        /**
         * Toggle mobile menu
         */
        toggleMenu() {
            if (this.isAnimating) return;

            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }

        /**
         * Open mobile menu
         */
        openMenu() {
            if (this.isOpen || this.isAnimating) return;

            this.isAnimating = true;
            this.isOpen = true;

            // Update classes and attributes
            this.body.addClass('mobile-menu-open');
            this.mobileMenuToggle.addClass('is-active').attr('aria-expanded', 'true');
            this.mobileMenu.addClass('is-open');

            // Show overlay
            if (this.mobileMenuOverlay.length) {
                this.mobileMenuOverlay.addClass('is-visible');
            }

            // Prevent body scroll
            this.disableBodyScroll();

            // Animate menu in
            this.mobileMenu.slideDown(300, () => {
                this.isAnimating = false;

                // Focus management
                this.mobileMenu.focus();

                // Screen reader announcement
                this.announceMenuState('Menu opened');

                // Track menu open
                this.trackMenuInteraction('opened');
            });

            // Animate hamburger icon
            this.animateHamburgerIcon(true);
        }

        /**
         * Close mobile menu
         */
        closeMenu() {
            if (!this.isOpen || this.isAnimating) return;

            this.isAnimating = true;
            this.isOpen = false;

            // Update classes and attributes
            this.body.removeClass('mobile-menu-open');
            this.mobileMenuToggle.removeClass('is-active').attr('aria-expanded', 'false');

            // Hide overlay
            if (this.mobileMenuOverlay.length) {
                this.mobileMenuOverlay.removeClass('is-visible');
            }

            // Animate menu out
            this.mobileMenu.slideUp(300, () => {
                this.mobileMenu.removeClass('is-open');
                this.isAnimating = false;

                // Re-enable body scroll
                this.enableBodyScroll();

                // Close any open dropdowns
                this.closeAllDropdowns();

                // Screen reader announcement
                this.announceMenuState('Menu closed');

                // Track menu close
                this.trackMenuInteraction('closed');
            });

            // Animate hamburger icon
            this.animateHamburgerIcon(false);
        }

        /**
         * Toggle dropdown menu
         */
        toggleDropdown(dropdownItem) {
            const dropdownMenu = dropdownItem.find('.dropdown-menu, .sub-menu');
            const isOpen = dropdownItem.hasClass('dropdown-open');

            if (isOpen) {
                this.closeDropdown(dropdownItem);
            } else {
                // Close other dropdowns first
                this.closeAllDropdowns();
                this.openDropdown(dropdownItem);
            }
        }

        /**
         * Open dropdown
         */
        openDropdown(dropdownItem) {
            const dropdownMenu = dropdownItem.find('.dropdown-menu, .sub-menu');
            const dropdownToggle = dropdownItem.find('> a');

            dropdownItem.addClass('dropdown-open');
            dropdownToggle.attr('aria-expanded', 'true');
            dropdownMenu.slideDown(200);

            this.trackMenuInteraction('dropdown_opened', dropdownToggle.text().trim());
        }

        /**
         * Close dropdown
         */
        closeDropdown(dropdownItem) {
            const dropdownMenu = dropdownItem.find('.dropdown-menu, .sub-menu');
            const dropdownToggle = dropdownItem.find('> a');

            dropdownItem.removeClass('dropdown-open');
            dropdownToggle.attr('aria-expanded', 'false');
            dropdownMenu.slideUp(200);
        }

        /**
         * Close all dropdowns
         */
        closeAllDropdowns() {
            $('.mobile-menu .has-dropdown.dropdown-open, .mobile-navigation .has-dropdown.dropdown-open').each((index, item) => {
                this.closeDropdown($(item));
            });
        }

        /**
         * Animate hamburger icon
         */
        animateHamburgerIcon(isOpen) {
            const hamburgerLines = this.mobileMenuToggle.find('.hamburger-line, .menu-line');

            if (hamburgerLines.length) {
                if (isOpen) {
                    hamburgerLines.addClass('is-active');
                } else {
                    hamburgerLines.removeClass('is-active');
                }
            }

            // CSS-based animation (transform hamburger to X)
            if (isOpen) {
                this.mobileMenuToggle.addClass('menu-open');
            } else {
                this.mobileMenuToggle.removeClass('menu-open');
            }
        }

        /**
         * Setup responsive behavior
         */
        setupResizeHandler() {
            let resizeTimeout;

            $(window).on('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const windowWidth = $(window).width();

                    // Close mobile menu on desktop resize
                    if (windowWidth >= this.breakpoint && this.isOpen) {
                        this.closeMenu();
                    }

                    // Update menu visibility
                    this.updateMenuVisibility(windowWidth);
                }, 150);
            });

            // Initial check
            this.updateMenuVisibility($(window).width());
        }

        /**
         * Update menu visibility based on screen size
         */
        updateMenuVisibility(windowWidth) {
            if (windowWidth >= this.breakpoint) {
                // Desktop: hide mobile elements
                this.mobileMenuToggle.hide();
                this.body.removeClass('mobile-menu-open');
            } else {
                // Mobile: show mobile elements
                this.mobileMenuToggle.show();
            }
        }

        /**
         * Setup scroll behavior
         */
        setupScrollBehavior() {
            let lastScrollTop = 0;
            let scrollTimeout;

            $(window).on('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const currentScrollTop = $(window).scrollTop();

                    // Hide/show header on scroll (optional)
                    if (Math.abs(lastScrollTop - currentScrollTop) > 5) {
                        if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
                            // Scrolling down
                            this.header.addClass('header-hidden');
                        } else {
                            // Scrolling up
                            this.header.removeClass('header-hidden');
                        }
                    }

                    lastScrollTop = currentScrollTop;
                }, 10);
            });
        }

        /**
         * Setup menu animations
         */
        setupMenuAnimations() {
            // Stagger animation for menu items
            this.mobileMenu.on('transitionend', () => {
                if (this.isOpen) {
                    const menuItems = this.mobileMenu.find('.menu-item, .nav-item');
                    menuItems.each((index, item) => {
                        setTimeout(() => {
                            $(item).addClass('animate-in');
                        }, index * 50);
                    });
                }
            });
        }

        /**
         * Disable body scroll
         */
        disableBodyScroll() {
            const scrollTop = $(window).scrollTop();
            this.body.addClass('scroll-locked')
                     .css({
                         'top': -scrollTop + 'px',
                         'position': 'fixed',
                         'width': '100%'
                     });
        }

        /**
         * Enable body scroll
         */
        enableBodyScroll() {
            const scrollTop = parseInt(this.body.css('top')) || 0;
            this.body.removeClass('scroll-locked')
                     .css({
                         'top': '',
                         'position': '',
                         'width': ''
                     });

            if (scrollTop < 0) {
                $(window).scrollTop(-scrollTop);
            }
        }

        /**
         * Announce menu state for screen readers
         */
        announceMenuState(message) {
            $('#mobile-menu-status').text(message);
        }

        /**
         * Track menu interactions
         */
        trackMenuInteraction(action, label = null) {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'mobile_menu_interaction', {
                    'event_category': 'navigation',
                    'event_label': label || action,
                    'value': 1
                });
            }

            // Historic Equity analytics
            if (typeof historic_equity_ajax !== 'undefined' && historic_equity_ajax.analytics_endpoint) {
                $.post(historic_equity_ajax.analytics_endpoint, {
                    event: 'mobile_navigation',
                    action: action,
                    label: label,
                    timestamp: Date.now(),
                    nonce: historic_equity_ajax.nonce
                });
            }
        }

        /**
         * Public methods for external access
         */
        open() {
            this.openMenu();
        }

        close() {
            this.closeMenu();
        }

        toggle() {
            this.toggleMenu();
        }

        isMenuOpen() {
            return this.isOpen;
        }
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(() => {
        // Only initialize if we have mobile menu elements
        if ($('.mobile-menu-toggle, .hamburger-menu').length && $('.mobile-menu, .mobile-navigation').length) {
            window.HeMobileNavigation = new MobileNavigationManager();
        }
    });

    /**
     * CSS for hamburger animation (can be moved to SCSS)
     */
    const hamburgerStyles = `
        <style>
        .hamburger-line, .menu-line {
            display: block;
            width: 100%;
            height: 2px;
            background-color: currentColor;
            transition: all 0.3s ease;
            transform-origin: center;
        }

        .mobile-menu-toggle.menu-open .hamburger-line:nth-child(1),
        .mobile-menu-toggle.is-active .hamburger-line:nth-child(1) {
            transform: translateY(6px) rotate(45deg);
        }

        .mobile-menu-toggle.menu-open .hamburger-line:nth-child(2),
        .mobile-menu-toggle.is-active .hamburger-line:nth-child(2) {
            opacity: 0;
        }

        .mobile-menu-toggle.menu-open .hamburger-line:nth-child(3),
        .mobile-menu-toggle.is-active .hamburger-line:nth-child(3) {
            transform: translateY(-6px) rotate(-45deg);
        }

        .mobile-menu {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }

        .mobile-menu.is-open {
            transform: translateX(0);
        }

        .mobile-menu-overlay {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .mobile-menu-overlay.is-visible {
            opacity: 1;
            visibility: visible;
        }

        .mobile-menu .menu-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .mobile-menu .menu-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }

        .scroll-locked {
            overflow: hidden !important;
        }

        @media (max-width: 767px) {
            .header-hidden {
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            }
        }
        </style>
    `;

    // Inject styles if not already present
    if (!$('#mobile-nav-styles').length) {
        $('head').append(hamburgerStyles);
    }

})(jQuery);