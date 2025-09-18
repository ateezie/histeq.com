/**
 * State-based Project Filtering with AJAX for Historic Equity Inc.
 *
 * Enhanced project filtering functionality for the SHTC portfolio showcase
 * with state-based filtering, property type filtering, and dynamic loading.
 *
 * @package HistoricEquity
 */

(function($) {
    'use strict';

    /**
     * Project Filtering Manager
     */
    class ProjectFiltering {
        constructor() {
            this.container = $('.projects-showcase');
            this.filtersContainer = $('.project-filters');
            this.projectsGrid = $('.projects-grid');
            this.loadMoreBtn = $('.load-more-projects');
            this.resultsCount = $('.results-count');

            this.currentFilters = {
                state: 'all',
                property_type: 'all',
                qre_range: 'all',
                year_range: 'all',
                search: ''
            };

            this.currentPage = 1;
            this.loading = false;
            this.hasMore = true;

            this.init();
        }

        /**
         * Initialize the filtering system
         */
        init() {
            this.setupFilters();
            this.setupSearch();
            this.setupInfiniteScroll();
            this.setupAnalytics();
            this.setupMobileFilters();
            this.preloadStateData();

            // Initialize with URL parameters if present
            this.initializeFromURL();

            console.log('Historic Equity Project Filtering initialized');
        }

        /**
         * Setup filter controls
         */
        setupFilters() {
            // State filter
            this.filtersContainer.on('change', '.state-filter', (e) => {
                const selectedState = $(e.target).val();
                this.updateFilter('state', selectedState);
                this.filterProjects();
                this.trackFilterUsage('state', selectedState);
            });

            // Property type filter
            this.filtersContainer.on('change', '.property-type-filter', (e) => {
                const selectedType = $(e.target).val();
                this.updateFilter('property_type', selectedType);
                this.filterProjects();
                this.trackFilterUsage('property_type', selectedType);
            });

            // QRE range filter
            this.filtersContainer.on('change', '.qre-range-filter', (e) => {
                const selectedRange = $(e.target).val();
                this.updateFilter('qre_range', selectedRange);
                this.filterProjects();
                this.trackFilterUsage('qre_range', selectedRange);
            });

            // Year range filter
            this.filtersContainer.on('change', '.year-range-filter', (e) => {
                const selectedYear = $(e.target).val();
                this.updateFilter('year_range', selectedYear);
                this.filterProjects();
                this.trackFilterUsage('year_range', selectedYear);
            });

            // Clear filters button
            this.filtersContainer.on('click', '.clear-filters', (e) => {
                e.preventDefault();
                this.clearAllFilters();
                this.trackFilterUsage('clear', 'all');
            });

            // Filter toggle for mobile
            this.filtersContainer.on('click', '.filter-toggle', (e) => {
                e.preventDefault();
                this.toggleMobileFilters();
            });
        }

        /**
         * Setup search functionality
         */
        setupSearch() {
            let searchTimeout;

            this.filtersContainer.on('input', '.project-search', (e) => {
                clearTimeout(searchTimeout);
                const searchTerm = $(e.target).val().trim();

                searchTimeout = setTimeout(() => {
                    this.updateFilter('search', searchTerm);
                    this.filterProjects();
                    this.trackFilterUsage('search', searchTerm ? 'has_term' : 'cleared');
                }, 300);
            });

            // Search form submission
            this.filtersContainer.on('submit', '.search-form', (e) => {
                e.preventDefault();
                const searchTerm = $('.project-search').val().trim();
                this.updateFilter('search', searchTerm);
                this.filterProjects();
            });
        }

        /**
         * Setup infinite scroll and load more
         */
        setupInfiniteScroll() {
            // Load more button
            this.loadMoreBtn.on('click', (e) => {
                e.preventDefault();
                this.loadMoreProjects();
            });

            // Infinite scroll (optional)
            if (this.container.data('infinite-scroll') === true) {
                $(window).on('scroll', this.throttle(() => {
                    if (this.shouldLoadMore()) {
                        this.loadMoreProjects();
                    }
                }, 250));
            }
        }

        /**
         * Update filter value
         */
        updateFilter(filterType, value) {
            this.currentFilters[filterType] = value;
            this.currentPage = 1;
            this.hasMore = true;
        }

        /**
         * Filter projects via AJAX
         */
        filterProjects() {
            if (this.loading) return;

            this.loading = true;
            this.showLoadingState();

            const requestData = {
                action: 'he_filter_projects',
                nonce: HeProjectFilters.nonce,
                filters: this.currentFilters,
                page: this.currentPage,
                per_page: HeProjectFilters.per_page || 12
            };

            $.ajax({
                url: HeProjectFilters.ajax_url,
                type: 'POST',
                data: requestData,
                success: (response) => {
                    this.handleFilterSuccess(response);
                },
                error: (xhr, status, error) => {
                    this.handleFilterError(xhr, status, error);
                },
                complete: () => {
                    this.loading = false;
                    this.hideLoadingState();
                }
            });
        }

        /**
         * Load more projects
         */
        loadMoreProjects() {
            if (this.loading || !this.hasMore) return;

            this.currentPage++;
            this.loading = true;
            this.showLoadingState(true);

            const requestData = {
                action: 'he_filter_projects',
                nonce: HeProjectFilters.nonce,
                filters: this.currentFilters,
                page: this.currentPage,
                per_page: HeProjectFilters.per_page || 12
            };

            $.ajax({
                url: HeProjectFilters.ajax_url,
                type: 'POST',
                data: requestData,
                success: (response) => {
                    this.handleLoadMoreSuccess(response);
                },
                error: (xhr, status, error) => {
                    this.handleLoadMoreError(xhr, status, error);
                    this.currentPage--; // Revert page increment
                },
                complete: () => {
                    this.loading = false;
                    this.hideLoadingState();
                }
            });
        }

        /**
         * Handle successful filter response
         */
        handleFilterSuccess(response) {
            if (response.success) {
                // Replace project grid content
                this.projectsGrid.html(response.data.html);

                // Update results count
                this.updateResultsCount(response.data.total_found);

                // Update pagination info
                this.hasMore = response.data.has_more;
                this.updateLoadMoreButton();

                // Update URL without page reload
                this.updateURL();

                // Reinitialize any components (lightbox, lazy loading, etc.)
                this.reinitializeComponents();

                // Show no results message if needed
                if (response.data.total_found === 0) {
                    this.showNoResultsMessage();
                } else {
                    this.hideNoResultsMessage();
                }

                // Track successful filter
                this.trackFilterSuccess(response.data.total_found);

            } else {
                this.showErrorMessage(response.data?.message || 'Error filtering projects');
            }
        }

        /**
         * Handle successful load more response
         */
        handleLoadMoreSuccess(response) {
            if (response.success) {
                // Append new projects to grid
                this.projectsGrid.append(response.data.html);

                // Update pagination info
                this.hasMore = response.data.has_more;
                this.updateLoadMoreButton();

                // Reinitialize components for new content
                this.reinitializeComponents();

                // Track load more usage
                this.trackLoadMore(response.data.loaded_count);

            } else {
                this.showErrorMessage('Error loading more projects');
            }
        }

        /**
         * Handle filter/load more errors
         */
        handleFilterError(xhr, status, error) {
            console.error('Project filtering error:', error);
            this.showErrorMessage('Unable to filter projects. Please try again.');
        }

        handleLoadMoreError(xhr, status, error) {
            console.error('Load more error:', error);
            this.showErrorMessage('Unable to load more projects. Please try again.');
        }

        /**
         * Clear all filters
         */
        clearAllFilters() {
            this.currentFilters = {
                state: 'all',
                property_type: 'all',
                qre_range: 'all',
                year_range: 'all',
                search: ''
            };
            this.currentPage = 1;
            this.hasMore = true;

            // Reset filter controls
            this.filtersContainer.find('select').val('all');
            this.filtersContainer.find('.project-search').val('');

            // Filter projects with cleared filters
            this.filterProjects();
        }

        /**
         * Update results count display
         */
        updateResultsCount(count) {
            const countText = count === 1 ? '1 project' : `${count} projects`;
            this.resultsCount.text(countText);

            // Show filter summary
            const filterSummary = this.getFilterSummary();
            if (filterSummary) {
                this.resultsCount.append(` <span class="filter-summary">${filterSummary}</span>`);
            }
        }

        /**
         * Get filter summary text
         */
        getFilterSummary() {
            const summaryParts = [];

            if (this.currentFilters.state !== 'all') {
                summaryParts.push(`in ${this.currentFilters.state}`);
            }

            if (this.currentFilters.property_type !== 'all') {
                summaryParts.push(`${this.currentFilters.property_type.toLowerCase()} properties`);
            }

            if (this.currentFilters.search) {
                summaryParts.push(`matching "${this.currentFilters.search}"`);
            }

            return summaryParts.length > 0 ? summaryParts.join(', ') : '';
        }

        /**
         * Update load more button state
         */
        updateLoadMoreButton() {
            if (this.hasMore) {
                this.loadMoreBtn.show().prop('disabled', false);
            } else {
                this.loadMoreBtn.hide();
            }
        }

        /**
         * Show/hide loading states
         */
        showLoadingState(isLoadMore = false) {
            if (isLoadMore) {
                this.loadMoreBtn.addClass('loading').prop('disabled', true);
                this.loadMoreBtn.find('.btn-text').text('Loading...');
            } else {
                this.projectsGrid.addClass('loading');
                this.showLoadingSpinner();
            }
        }

        hideLoadingState() {
            this.projectsGrid.removeClass('loading');
            this.loadMoreBtn.removeClass('loading').prop('disabled', false);
            this.loadMoreBtn.find('.btn-text').text('Load More Projects');
            this.hideLoadingSpinner();
        }

        showLoadingSpinner() {
            if (!$('.loading-spinner').length) {
                this.projectsGrid.before('<div class="loading-spinner">Loading projects...</div>');
            }
        }

        hideLoadingSpinner() {
            $('.loading-spinner').remove();
        }

        /**
         * Show error/no results messages
         */
        showErrorMessage(message) {
            this.projectsGrid.html(`
                <div class="error-message">
                    <p>${message}</p>
                    <button class="btn btn--secondary retry-filter">Try Again</button>
                </div>
            `);

            $('.retry-filter').on('click', () => {
                this.filterProjects();
            });
        }

        showNoResultsMessage() {
            const message = `
                <div class="no-results-message">
                    <h3>No Projects Found</h3>
                    <p>We couldn't find any projects matching your current filters.</p>
                    <div class="suggestions">
                        <p>Try:</p>
                        <ul>
                            <li>Selecting a different state</li>
                            <li>Choosing a different property type</li>
                            <li>Adjusting your search terms</li>
                            <li>Clearing all filters to see all projects</li>
                        </ul>
                    </div>
                    <button class="btn btn--primary clear-filters">Show All Projects</button>
                </div>
            `;
            this.projectsGrid.html(message);
        }

        hideNoResultsMessage() {
            // No specific action needed - content replacement handles this
        }

        /**
         * Check if should load more (for infinite scroll)
         */
        shouldLoadMore() {
            if (!this.hasMore || this.loading) return false;

            const scrollPosition = $(window).scrollTop() + $(window).height();
            const documentHeight = $(document).height();
            const threshold = 200; // pixels from bottom

            return scrollPosition >= documentHeight - threshold;
        }

        /**
         * Update URL with current filters
         */
        updateURL() {
            const params = new URLSearchParams();

            Object.keys(this.currentFilters).forEach(key => {
                if (this.currentFilters[key] && this.currentFilters[key] !== 'all') {
                    params.set(key, this.currentFilters[key]);
                }
            });

            const newURL = params.toString() ?
                `${window.location.pathname}?${params.toString()}` :
                window.location.pathname;

            window.history.replaceState({}, '', newURL);
        }

        /**
         * Initialize from URL parameters
         */
        initializeFromURL() {
            const params = new URLSearchParams(window.location.search);

            params.forEach((value, key) => {
                if (this.currentFilters.hasOwnProperty(key)) {
                    this.currentFilters[key] = value;

                    // Update corresponding filter control
                    const filterControl = this.filtersContainer.find(`[data-filter="${key}"]`);
                    if (filterControl.length) {
                        filterControl.val(value);
                    }
                }
            });

            // Apply filters if any were found in URL
            if (params.toString()) {
                this.filterProjects();
            }
        }

        /**
         * Reinitialize components after content change
         */
        reinitializeComponents() {
            // Reinitialize lazy loading
            if (window.HeLazyLoad) {
                window.HeLazyLoad.observe();
            }

            // Reinitialize lightbox
            if (window.HeLightbox) {
                window.HeLightbox.init();
            }

            // Trigger custom event for other components
            $(document).trigger('projectsUpdated');
        }

        /**
         * Mobile filter management
         */
        setupMobileFilters() {
            // Mobile filter toggle
            $('.filter-toggle-btn').on('click', () => {
                this.toggleMobileFilters();
            });

            // Mobile filter close
            $('.close-mobile-filters').on('click', () => {
                this.closeMobileFilters();
            });

            // Mobile filter overlay
            $('.mobile-filter-overlay').on('click', () => {
                this.closeMobileFilters();
            });
        }

        toggleMobileFilters() {
            $('body').toggleClass('mobile-filters-open');
        }

        closeMobileFilters() {
            $('body').removeClass('mobile-filters-open');
        }

        /**
         * Preload state data for performance
         */
        preloadStateData() {
            // Cache state data for quick filtering
            if (HeProjectFilters.state_data) {
                this.stateData = HeProjectFilters.state_data;
            }
        }

        /**
         * Analytics and tracking
         */
        setupAnalytics() {
            // Set up analytics tracking if enabled
            this.analyticsEnabled = HeProjectFilters.analytics_enabled || false;
        }

        trackFilterUsage(filterType, value) {
            if (!this.analyticsEnabled) return;

            // Track with Google Analytics or other analytics service
            if (typeof gtag !== 'undefined') {
                gtag('event', 'filter_used', {
                    'event_category': 'project_filtering',
                    'event_label': `${filterType}:${value}`,
                    'value': 1
                });
            }

            // Track with Historic Equity analytics
            this.trackEvent('project_filter', {
                filter_type: filterType,
                filter_value: value,
                total_active_filters: this.getActiveFilterCount()
            });
        }

        trackFilterSuccess(resultCount) {
            if (!this.analyticsEnabled) return;

            this.trackEvent('project_filter_success', {
                result_count: resultCount,
                filters_applied: this.getActiveFilters()
            });
        }

        trackLoadMore(loadedCount) {
            if (!this.analyticsEnabled) return;

            this.trackEvent('project_load_more', {
                loaded_count: loadedCount,
                current_page: this.currentPage
            });
        }

        trackEvent(eventName, properties) {
            // Send to Historic Equity analytics endpoint
            if (HeProjectFilters.analytics_endpoint) {
                $.post(HeProjectFilters.analytics_endpoint, {
                    event: eventName,
                    properties: properties,
                    timestamp: Date.now(),
                    nonce: HeProjectFilters.nonce
                });
            }
        }

        /**
         * Utility methods
         */
        getActiveFilterCount() {
            return Object.values(this.currentFilters).filter(value =>
                value && value !== 'all' && value !== ''
            ).length;
        }

        getActiveFilters() {
            const activeFilters = {};
            Object.keys(this.currentFilters).forEach(key => {
                if (this.currentFilters[key] && this.currentFilters[key] !== 'all') {
                    activeFilters[key] = this.currentFilters[key];
                }
            });
            return activeFilters;
        }

        throttle(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(() => {
        // Only initialize if we're on a page with project filtering
        if ($('.projects-showcase').length && typeof HeProjectFilters !== 'undefined') {
            window.HeProjectFiltering = new ProjectFiltering();
        }
    });

})(jQuery);