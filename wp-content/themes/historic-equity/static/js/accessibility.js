/**
 * Accessibility Enhancement for Historic Equity Inc.
 *
 * ARIA labels, keyboard navigation, and WCAG 2.1 AA compliance
 * for SHTC investment website accessibility.
 *
 * @package HistoricEquity
 */

(function($) {
    'use strict';

    /**
     * Accessibility Manager
     */
    class AccessibilityManager {
        constructor() {
            this.focusableElements = 'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
            this.trapFocusElements = [];
            this.lastFocusedElement = null;
            this.isHighContrast = false;
            this.announcements = [];

            this.init();
        }

        /**
         * Initialize accessibility features
         */
        init() {
            this.setupARIALabels();
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupScreenReaderSupport();
            this.setupSkipLinks();
            this.setupAccessibilityToolbar();
            this.setupFormAccessibility();
            this.setupImageAccessibility();
            this.setupTableAccessibility();
            this.setupModalAccessibility();

            console.log('Historic Equity Accessibility features initialized');
        }

        /**
         * Setup ARIA labels and landmarks
         */
        setupARIALabels() {
            // Main navigation
            $('nav').attr({
                'role': 'navigation',
                'aria-label': 'Main navigation'
            });

            $('.mobile-menu').attr({
                'role': 'navigation',
                'aria-label': 'Mobile navigation menu'
            });

            // Main content areas
            $('main, .main-content').attr('role', 'main');
            $('aside, .sidebar').attr('role', 'complementary');
            $('.site-footer, footer').attr('role', 'contentinfo');
            $('.site-header, header').attr('role', 'banner');

            // Search
            $('.search-form').attr({
                'role': 'search',
                'aria-label': 'Search Historic Equity projects and resources'
            });

            // Project filtering
            $('.project-filters').attr({
                'role': 'search',
                'aria-label': 'Filter SHTC projects by state, type, and criteria'
            });

            // Breadcrumbs
            $('.breadcrumbs').attr({
                'role': 'navigation',
                'aria-label': 'Breadcrumb navigation'
            });

            // Contact forms
            $('.contact-form, .consultation-form').attr({
                'role': 'form',
                'aria-label': 'Contact Historic Equity for SHTC consultation'
            });

            // Project galleries
            $('.project-gallery').attr({
                'role': 'img',
                'aria-label': 'Historic rehabilitation project gallery'
            });

            // Statistics/metrics
            $('.statistics, .metrics').attr({
                'role': 'region',
                'aria-label': 'Historic Equity performance statistics'
            });

            // Testimonials
            $('.testimonials').attr({
                'role': 'region',
                'aria-label': 'Client testimonials and reviews'
            });

            // Team section
            $('.team-section').attr({
                'role': 'region',
                'aria-label': 'Historic Equity team members'
            });
        }

        /**
         * Setup keyboard navigation
         */
        setupKeyboardNavigation() {
            // ESC key universal handler
            $(document).on('keydown', (e) => {
                if (e.keyCode === 27) { // ESC
                    this.handleEscapeKey(e);
                }
            });

            // Tab key navigation enhancement
            $(document).on('keydown', (e) => {
                if (e.keyCode === 9) { // TAB
                    this.handleTabNavigation(e);
                }
            });

            // Arrow key navigation for menus
            $('.menu, .nav-menu').on('keydown', 'a', (e) => {
                this.handleMenuNavigation(e);
            });

            // Arrow key navigation for project grid
            $('.projects-grid').on('keydown', '.project-card', (e) => {
                this.handleGridNavigation(e);
            });

            // Enter/Space activation for custom elements
            $(document).on('keydown', '[role="button"]:not(button)', (e) => {
                if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
                    e.preventDefault();
                    $(e.target).click();
                }
            });

            // Filter keyboard navigation
            $('.project-filters').on('keydown', 'select, input', (e) => {
                this.handleFilterNavigation(e);
            });
        }

        /**
         * Handle ESC key functionality
         */
        handleEscapeKey(e) {
            // Close modals
            if ($('.modal.is-open, .lightbox.is-open').length) {
                $('.modal.is-open, .lightbox.is-open').find('.close, .modal-close').click();
                return;
            }

            // Close mobile menu
            if ($('body').hasClass('mobile-menu-open')) {
                $('.mobile-menu-toggle').click();
                return;
            }

            // Close dropdowns
            if ($('.dropdown.is-open').length) {
                $('.dropdown.is-open').removeClass('is-open');
                return;
            }

            // Return focus to main content
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            } else {
                $('#main-content, main').focus();
            }
        }

        /**
         * Handle tab navigation
         */
        handleTabNavigation(e) {
            // Enhance tab navigation with visual indicators
            $('body').addClass('keyboard-navigation');

            // Remove mouse navigation class
            setTimeout(() => {
                $('body').removeClass('mouse-navigation');
            }, 100);

            // Skip link functionality
            if ($(e.target).hasClass('skip-link')) {
                e.preventDefault();
                const targetId = $(e.target).attr('href');
                $(targetId).focus();
                this.announceToScreenReader(`Skipped to ${$(targetId).attr('aria-label') || 'main content'}`);
            }
        }

        /**
         * Handle menu navigation with arrow keys
         */
        handleMenuNavigation(e) {
            const $menuItems = $(e.target).closest('.menu, .nav-menu').find('a');
            const currentIndex = $menuItems.index(e.target);
            let nextIndex;

            switch (e.keyCode) {
                case 38: // Up arrow
                    e.preventDefault();
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : $menuItems.length - 1;
                    $menuItems.eq(nextIndex).focus();
                    break;

                case 40: // Down arrow
                    e.preventDefault();
                    nextIndex = currentIndex < $menuItems.length - 1 ? currentIndex + 1 : 0;
                    $menuItems.eq(nextIndex).focus();
                    break;

                case 37: // Left arrow (for horizontal menus)
                    if ($(e.target).closest('.menu').hasClass('horizontal')) {
                        e.preventDefault();
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : $menuItems.length - 1;
                        $menuItems.eq(nextIndex).focus();
                    }
                    break;

                case 39: // Right arrow (for horizontal menus)
                    if ($(e.target).closest('.menu').hasClass('horizontal')) {
                        e.preventDefault();
                        nextIndex = currentIndex < $menuItems.length - 1 ? currentIndex + 1 : 0;
                        $menuItems.eq(nextIndex).focus();
                    }
                    break;

                case 36: // Home
                    e.preventDefault();
                    $menuItems.first().focus();
                    break;

                case 35: // End
                    e.preventDefault();
                    $menuItems.last().focus();
                    break;
            }
        }

        /**
         * Handle grid navigation (for project listings)
         */
        handleGridNavigation(e) {
            const $gridItems = $('.projects-grid .project-card');
            const currentIndex = $gridItems.index(e.target);
            const itemsPerRow = this.getItemsPerRow();

            let nextIndex;

            switch (e.keyCode) {
                case 37: // Left arrow
                    e.preventDefault();
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : $gridItems.length - 1;
                    $gridItems.eq(nextIndex).focus();
                    break;

                case 39: // Right arrow
                    e.preventDefault();
                    nextIndex = currentIndex < $gridItems.length - 1 ? currentIndex + 1 : 0;
                    $gridItems.eq(nextIndex).focus();
                    break;

                case 38: // Up arrow
                    e.preventDefault();
                    nextIndex = currentIndex - itemsPerRow;
                    if (nextIndex < 0) {
                        // Wrap to bottom row
                        nextIndex = $gridItems.length - 1 - ((currentIndex - (currentIndex % itemsPerRow)) - ($gridItems.length % itemsPerRow));
                    }
                    $gridItems.eq(nextIndex).focus();
                    break;

                case 40: // Down arrow
                    e.preventDefault();
                    nextIndex = currentIndex + itemsPerRow;
                    if (nextIndex >= $gridItems.length) {
                        // Wrap to top row
                        nextIndex = currentIndex % itemsPerRow;
                    }
                    $gridItems.eq(nextIndex).focus();
                    break;
            }
        }

        /**
         * Get items per row in grid layout
         */
        getItemsPerRow() {
            const $container = $('.projects-grid');
            const containerWidth = $container.width();
            const itemWidth = $('.project-card').first().outerWidth(true);
            return Math.floor(containerWidth / itemWidth) || 1;
        }

        /**
         * Handle filter navigation
         */
        handleFilterNavigation(e) {
            if (e.keyCode === 13) { // Enter
                // Auto-apply filter on Enter
                $(e.target).trigger('change');
                this.announceToScreenReader('Filter applied');
            }
        }

        /**
         * Setup focus management
         */
        setupFocusManagement() {
            // Track last focused element
            $(document).on('focusin', (e) => {
                this.lastFocusedElement = e.target;
            });

            // Enhance focus visibility
            $(document).on('focus', this.focusableElements, (e) => {
                $(e.target).addClass('focus-visible');
            });

            $(document).on('blur', this.focusableElements, (e) => {
                $(e.target).removeClass('focus-visible');
            });

            // Mouse users don't need focus outlines
            $(document).on('mousedown', () => {
                $('body').addClass('mouse-navigation').removeClass('keyboard-navigation');
            });

            // Keyboard users need focus outlines
            $(document).on('keydown', (e) => {
                if (e.keyCode === 9) { // Tab key
                    $('body').addClass('keyboard-navigation').removeClass('mouse-navigation');
                }
            });
        }

        /**
         * Setup screen reader support
         */
        setupScreenReaderSupport() {
            // Create screen reader announcement area
            if (!$('#sr-announcements').length) {
                $('body').append('<div id="sr-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>');
            }

            // Add descriptions for complex content
            this.addContentDescriptions();

            // Enhanced form labels
            this.enhanceFormLabels();

            // Add loading announcements
            this.setupLoadingAnnouncements();
        }

        /**
         * Add content descriptions for screen readers
         */
        addContentDescriptions() {
            // Project statistics
            $('.statistic').each(function() {
                const $stat = $(this);
                const value = $stat.find('.stat-value').text();
                const label = $stat.find('.stat-label').text();
                $stat.attr('aria-label', `${value} ${label}`);
            });

            // Progress bars
            $('.progress-bar').each(function() {
                const $bar = $(this);
                const percentage = $bar.data('percentage') || 0;
                $bar.attr({
                    'role': 'progressbar',
                    'aria-valuenow': percentage,
                    'aria-valuemin': '0',
                    'aria-valuemax': '100',
                    'aria-label': `Progress: ${percentage} percent`
                });
            });

            // Charts and graphs
            $('.chart, .graph').attr({
                'role': 'img',
                'aria-label': 'Data visualization - detailed description available in accompanying text'
            });
        }

        /**
         * Enhance form labels and descriptions
         */
        enhanceFormLabels() {
            // Add required field indicators
            $('input[required], textarea[required], select[required]').each(function() {
                const $field = $(this);
                const $label = $(`label[for="${$field.attr('id')}"]`);

                if ($label.length && !$label.find('.required-indicator').length) {
                    $label.append(' <span class="required-indicator" aria-label="required">*</span>');
                }

                $field.attr('aria-required', 'true');
            });

            // Add descriptions for complex fields
            $('.form-group').each(function() {
                const $group = $(this);
                const $field = $group.find('input, textarea, select').first();
                const $help = $group.find('.help-text, .field-description');

                if ($help.length && $field.length) {
                    const helpId = 'help-' + ($field.attr('id') || Math.random().toString(36).substr(2, 9));
                    $help.attr('id', helpId);
                    $field.attr('aria-describedby', helpId);
                }
            });

            // Error message association
            $('.field-error').each(function() {
                const $error = $(this);
                const $field = $error.siblings('input, textarea, select').first();

                if ($field.length) {
                    const errorId = 'error-' + ($field.attr('id') || Math.random().toString(36).substr(2, 9));
                    $error.attr('id', errorId);
                    $field.attr('aria-describedby', ($field.attr('aria-describedby') || '') + ' ' + errorId);
                    $field.attr('aria-invalid', 'true');
                }
            });
        }

        /**
         * Setup loading announcements
         */
        setupLoadingAnnouncements() {
            // AJAX loading states
            $(document).on('ajaxStart', () => {
                this.announceToScreenReader('Loading content');
            });

            $(document).on('ajaxComplete', () => {
                this.announceToScreenReader('Content loaded');
            });

            // Form submissions
            $('.contact-form, .consultation-form').on('submit', () => {
                this.announceToScreenReader('Submitting form');
            });

            // Project filtering
            $('.project-filters').on('change', 'select, input', () => {
                this.announceToScreenReader('Updating project results');
            });
        }

        /**
         * Setup skip links
         */
        setupSkipLinks() {
            if (!$('.skip-links').length) {
                const skipLinks = `
                    <div class="skip-links">
                        <a href="#main-content" class="skip-link">Skip to main content</a>
                        <a href="#main-navigation" class="skip-link">Skip to navigation</a>
                        <a href="#contact-form" class="skip-link">Skip to contact form</a>
                    </div>
                `;
                $('body').prepend(skipLinks);
            }

            // Handle skip link activation
            $('.skip-link').on('click', function(e) {
                e.preventDefault();
                const targetId = $(this).attr('href');
                const $target = $(targetId);

                if ($target.length) {
                    $target.focus();
                    // Scroll to target if needed
                    $('html, body').scrollTop($target.offset().top - 100);
                }
            });
        }

        /**
         * Setup accessibility toolbar
         */
        setupAccessibilityToolbar() {
            if (!$('.accessibility-toolbar').length) {
                const toolbar = `
                    <div class="accessibility-toolbar" role="toolbar" aria-label="Accessibility options">
                        <button class="accessibility-toggle" aria-label="Toggle accessibility options">
                            <span class="icon-accessibility" aria-hidden="true"></span>
                            Accessibility
                        </button>
                        <div class="accessibility-options" hidden>
                            <button class="high-contrast-toggle" aria-pressed="false">High Contrast</button>
                            <button class="font-size-increase" aria-label="Increase font size">A+</button>
                            <button class="font-size-decrease" aria-label="Decrease font size">A-</button>
                            <button class="focus-highlight-toggle" aria-pressed="false">Enhanced Focus</button>
                        </div>
                    </div>
                `;
                $('body').append(toolbar);
            }

            this.setupAccessibilityControls();
        }

        /**
         * Setup accessibility control functionality
         */
        setupAccessibilityControls() {
            // Toggle accessibility options
            $('.accessibility-toggle').on('click', function() {
                const $options = $('.accessibility-options');
                const isHidden = $options.attr('hidden') !== undefined;

                if (isHidden) {
                    $options.removeAttr('hidden').show();
                    $(this).attr('aria-expanded', 'true');
                } else {
                    $options.attr('hidden', '').hide();
                    $(this).attr('aria-expanded', 'false');
                }
            });

            // High contrast toggle
            $('.high-contrast-toggle').on('click', () => {
                this.toggleHighContrast();
            });

            // Font size controls
            $('.font-size-increase').on('click', () => {
                this.adjustFontSize(1);
            });

            $('.font-size-decrease').on('click', () => {
                this.adjustFontSize(-1);
            });

            // Enhanced focus toggle
            $('.focus-highlight-toggle').on('click', () => {
                this.toggleEnhancedFocus();
            });
        }

        /**
         * Toggle high contrast mode
         */
        toggleHighContrast() {
            this.isHighContrast = !this.isHighContrast;
            $('body').toggleClass('high-contrast', this.isHighContrast);
            $('.high-contrast-toggle').attr('aria-pressed', this.isHighContrast);

            this.announceToScreenReader(
                this.isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled'
            );

            // Save preference
            localStorage.setItem('he-high-contrast', this.isHighContrast);
        }

        /**
         * Adjust font size
         */
        adjustFontSize(direction) {
            const currentSize = parseInt($('html').css('font-size')) || 16;
            const newSize = Math.max(12, Math.min(24, currentSize + (direction * 2)));

            $('html').css('font-size', newSize + 'px');
            this.announceToScreenReader(`Font size ${direction > 0 ? 'increased' : 'decreased'} to ${newSize} pixels`);

            // Save preference
            localStorage.setItem('he-font-size', newSize);
        }

        /**
         * Toggle enhanced focus
         */
        toggleEnhancedFocus() {
            const isEnhanced = $('body').hasClass('enhanced-focus');
            $('body').toggleClass('enhanced-focus', !isEnhanced);
            $('.focus-highlight-toggle').attr('aria-pressed', !isEnhanced);

            this.announceToScreenReader(
                !isEnhanced ? 'Enhanced focus indicators enabled' : 'Enhanced focus indicators disabled'
            );

            // Save preference
            localStorage.setItem('he-enhanced-focus', !isEnhanced);
        }

        /**
         * Setup form accessibility
         */
        setupFormAccessibility() {
            // Live validation feedback
            $('input, textarea, select').on('blur', function() {
                const $field = $(this);
                const isValid = this.checkValidity ? this.checkValidity() : true;

                $field.attr('aria-invalid', !isValid);

                if (!isValid) {
                    const errorMessage = this.validationMessage || 'Invalid input';
                    let $errorElement = $field.siblings('.validation-error');

                    if (!$errorElement.length) {
                        $errorElement = $('<div class="validation-error" role="alert"></div>');
                        $field.after($errorElement);
                    }

                    $errorElement.text(errorMessage);
                    $field.attr('aria-describedby', $errorElement.attr('id') || 'validation-error');
                } else {
                    $field.siblings('.validation-error').remove();
                    $field.removeAttr('aria-describedby');
                }
            });
        }

        /**
         * Setup image accessibility
         */
        setupImageAccessibility() {
            // Ensure all images have alt text
            $('img:not([alt])').attr('alt', '');

            // Add longdesc for complex images
            $('.chart img, .diagram img, .complex-graphic img').each(function() {
                const $img = $(this);
                const $caption = $img.siblings('figcaption, .caption');

                if ($caption.length) {
                    const descId = 'desc-' + Math.random().toString(36).substr(2, 9);
                    $caption.attr('id', descId);
                    $img.attr('aria-describedby', descId);
                }
            });
        }

        /**
         * Setup table accessibility
         */
        setupTableAccessibility() {
            $('table').each(function() {
                const $table = $(this);

                // Add table headers if missing
                if (!$table.find('th').length && $table.find('tr').first().length) {
                    $table.find('tr').first().find('td').each(function() {
                        $(this).replaceWith(`<th scope="col">${$(this).html()}</th>`);
                    });
                }

                // Add scope attributes
                $table.find('th').each(function() {
                    const $th = $(this);
                    if (!$th.attr('scope')) {
                        const isRowHeader = $th.parent().children().first().is($th);
                        $th.attr('scope', isRowHeader ? 'row' : 'col');
                    }
                });

                // Add caption if missing
                if (!$table.find('caption').length) {
                    const tableTitle = $table.attr('aria-label') || 'Data table';
                    $table.prepend(`<caption class="sr-only">${tableTitle}</caption>`);
                }
            });
        }

        /**
         * Setup modal accessibility
         */
        setupModalAccessibility() {
            $('.modal, .lightbox').on('show', function() {
                const $modal = $(this);
                $modal.attr({
                    'role': 'dialog',
                    'aria-modal': 'true',
                    'aria-labelledby': $modal.find('.modal-title').attr('id') || 'modal-title'
                });

                // Trap focus within modal
                self.trapFocus($modal);
            });

            $('.modal, .lightbox').on('hide', function() {
                self.releaseFocusTrap();
            });
        }

        /**
         * Trap focus within element
         */
        trapFocus($element) {
            const focusableElements = $element.find(this.focusableElements);
            const firstElement = focusableElements.first();
            const lastElement = focusableElements.last();

            $element.on('keydown.focustrap', (e) => {
                if (e.keyCode === 9) { // Tab
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement[0]) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement[0]) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });

            // Focus first element
            firstElement.focus();
        }

        /**
         * Release focus trap
         */
        releaseFocusTrap() {
            $('.modal, .lightbox').off('keydown.focustrap');

            // Return focus to trigger element
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
        }

        /**
         * Announce message to screen readers
         */
        announceToScreenReader(message) {
            const $announcer = $('#sr-announcements');
            $announcer.text(message);

            // Clear after announcement
            setTimeout(() => {
                $announcer.empty();
            }, 1000);
        }

        /**
         * Load saved accessibility preferences
         */
        loadPreferences() {
            // High contrast
            if (localStorage.getItem('he-high-contrast') === 'true') {
                this.toggleHighContrast();
            }

            // Font size
            const savedFontSize = localStorage.getItem('he-font-size');
            if (savedFontSize) {
                $('html').css('font-size', savedFontSize + 'px');
            }

            // Enhanced focus
            if (localStorage.getItem('he-enhanced-focus') === 'true') {
                this.toggleEnhancedFocus();
            }
        }
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(() => {
        window.HeAccessibility = new AccessibilityManager();

        // Load saved preferences
        window.HeAccessibility.loadPreferences();
    });

})(jQuery);