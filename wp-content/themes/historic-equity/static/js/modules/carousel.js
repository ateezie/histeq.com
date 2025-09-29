/**
 * Historic Equity Building Carousel Module
 *
 * Handles the homepage building images carousel functionality
 * Following WordPress coding standards and modern JS practices
 *
 * @package HistoricEquity
 * @since 1.0.0
 */

class BuildingCarousel {
    constructor(containerSelector = '.building-carousel-container') {
        this.container = document.querySelector(containerSelector);
        this.carousel = this.container?.querySelector('.building-carousel');
        this.track = this.carousel?.querySelector('.carousel-track');
        this.slides = this.carousel?.querySelectorAll('.carousel-slide');
        this.prevButton = this.container?.querySelector('.carousel-prev');
        this.nextButton = this.container?.querySelector('.carousel-next');
        this.indicators = Array.from(this.container?.querySelectorAll('.carousel-indicator') || []);

        // State management
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.isPlaying = true;
        this.slideCount = this.slides?.length || 0;

        // Configuration
        this.config = {
            autoPlayDelay: 5000,
            transitionDuration: 500,
            swipeThreshold: 50,
            pauseOnHover: true,
            keyboardNavigation: true
        };

        this.init();
    }

    /**
     * Initialize carousel if elements exist
     */
    init() {
        if (!this.isValidCarousel()) {
            console.warn('BuildingCarousel: Required elements not found');
            return false;
        }

        console.log(`BuildingCarousel: Initializing with ${this.slideCount} slides`);

        this.setupAccessibility();
        this.applyOverlayStyles();
        this.bindEvents();
        this.updateCarousel(0);
        this.startAutoPlay();

        console.log('BuildingCarousel: Initialization complete');
        return true;
    }

    /**
     * Validate required carousel elements exist
     */
    isValidCarousel() {
        return this.container &&
               this.carousel &&
               this.track &&
               this.slides &&
               this.slideCount > 0;
    }

    /**
     * Setup ARIA labels and accessibility attributes
     */
    setupAccessibility() {
        // Carousel container
        this.carousel.setAttribute('role', 'region');
        this.carousel.setAttribute('aria-label', 'Historic Equity building images carousel');
        this.carousel.setAttribute('tabindex', '0');

        // Slides
        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} of ${this.slideCount}`);
        });

        // Navigation buttons
        if (this.prevButton) {
            this.prevButton.setAttribute('aria-label', 'Previous slide');
            this.prevButton.setAttribute('aria-controls', this.carousel.id || 'building-carousel');
        }

        if (this.nextButton) {
            this.nextButton.setAttribute('aria-label', 'Next slide');
            this.nextButton.setAttribute('aria-controls', this.carousel.id || 'building-carousel');
        }

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.setAttribute('aria-controls', this.carousel.id || 'building-carousel');
        });
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Navigation buttons
        this.prevButton?.addEventListener('click', this.handlePrevClick.bind(this));
        this.nextButton?.addEventListener('click', this.handleNextClick.bind(this));

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch/swipe support
        this.bindTouchEvents();

        // Keyboard navigation
        if (this.config.keyboardNavigation) {
            this.carousel.addEventListener('keydown', this.handleKeydown.bind(this));
        }

        // Hover pause/resume
        if (this.config.pauseOnHover) {
            this.carousel.addEventListener('mouseenter', this.pauseAutoPlay.bind(this));
            this.carousel.addEventListener('mouseleave', this.resumeAutoPlay.bind(this));
        }

        // Visibility change handling
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Resize handling
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    /**
     * Handle previous button click
     */
    handlePrevClick(e) {
        e.preventDefault();
        this.goToSlide(this.currentSlide - 1);
        this.resetAutoPlay();
    }

    /**
     * Handle next button click
     */
    handleNextClick(e) {
        e.preventDefault();
        this.goToSlide(this.currentSlide + 1);
        this.resetAutoPlay();
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.goToSlide(this.currentSlide - 1);
                this.resetAutoPlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.goToSlide(this.currentSlide + 1);
                this.resetAutoPlay();
                break;
            case ' ': // Spacebar
                e.preventDefault();
                this.toggleAutoPlay();
                break;
        }
    }

    /**
     * Bind touch/swipe events
     */
    bindTouchEvents() {
        let startX = 0;
        let endX = 0;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            const diffX = startX - endX;

            if (Math.abs(diffX) > this.config.swipeThreshold) {
                if (diffX > 0) {
                    this.goToSlide(this.currentSlide + 1);
                } else {
                    this.goToSlide(this.currentSlide - 1);
                }
                this.resetAutoPlay();
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate slide positions
        this.updateCarousel(this.currentSlide, false);
    }

    /**
     * Handle visibility change (tab switching)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAutoPlay();
        } else if (this.isPlaying) {
            this.resumeAutoPlay();
        }
    }

    /**
     * Navigate to specific slide
     */
    goToSlide(slideIndex, animate = true) {
        // Handle wrap-around
        if (slideIndex < 0) slideIndex = this.slideCount - 1;
        if (slideIndex >= this.slideCount) slideIndex = 0;

        this.updateCarousel(slideIndex, animate);
    }

    /**
     * Update carousel position and states
     */
    updateCarousel(slideIndex, animate = true) {
        this.currentSlide = slideIndex;

        // Move track
        const slideWidth = this.slides[0].offsetWidth;
        const offset = -this.currentSlide * slideWidth;

        this.track.style.transition = animate ? `transform ${this.config.transitionDuration}ms ease-in-out` : 'none';
        this.track.style.transform = `translateX(${offset}px)`;

        // Update slide states
        this.slides.forEach((slide, index) => {
            const isActive = index === this.currentSlide;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', !isActive);
        });

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            const isActive = index === this.currentSlide;
            indicator.classList.toggle('active', isActive);
            indicator.classList.toggle('bg-primary-600', isActive);
            indicator.classList.toggle('bg-gray-300', !isActive);
            indicator.setAttribute('aria-selected', isActive);
        });

        // Update button labels
        if (this.prevButton) {
            this.prevButton.setAttribute('aria-label',
                `Previous slide (currently ${this.currentSlide + 1} of ${this.slideCount})`);
        }
        if (this.nextButton) {
            this.nextButton.setAttribute('aria-label',
                `Next slide (currently ${this.currentSlide + 1} of ${this.slideCount})`);
        }
    }

    /**
     * Apply enhanced overlay styles for text visibility
     */
    applyOverlayStyles() {
        const overlays = this.container.querySelectorAll('.carousel-slide .absolute');
        let fixedCount = 0;

        overlays.forEach((overlay) => {
            // Only apply to text overlays, not navigation elements
            if (overlay.querySelector('h3, p') && !overlay.querySelector('svg')) {
                overlay.style.cssText = `
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%) !important;
                    padding: 24px !important;
                    border-radius: 0 0 8px 8px !important;
                    z-index: 10 !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;

                // Style text elements
                const textElements = overlay.querySelectorAll('h3, p');
                textElements.forEach(el => {
                    el.style.color = 'white !important';
                    el.style.textShadow = '0 1px 3px rgba(0,0,0,0.8)';
                    el.style.margin = '0';

                    if (el.tagName === 'H3') {
                        el.style.fontSize = '18px';
                        el.style.fontWeight = '600';
                        el.style.marginBottom = '8px';
                        el.style.lineHeight = '1.3';
                    } else {
                        el.style.fontSize = '14px';
                        el.style.marginBottom = '4px';
                        el.style.lineHeight = '1.4';

                        // Style amount text (last paragraph) with gold color
                        if (el === overlay.querySelector('p:last-child')) {
                            el.style.fontWeight = '700';
                            el.style.marginBottom = '0';
                            el.style.color = '#E6CD41'; // Historic Equity gold
                        }
                    }
                });
                fixedCount++;
            }
        });

        console.log(`BuildingCarousel: Applied overlay styles to ${fixedCount} slides`);
    }

    /**
     * Auto-play management
     */
    startAutoPlay() {
        if (this.slideCount <= 1) return;

        this.autoPlayInterval = setInterval(() => {
            this.goToSlide(this.currentSlide + 1);
        }, this.config.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resumeAutoPlay() {
        if (this.isPlaying && !this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }

    resetAutoPlay() {
        this.pauseAutoPlay();
        if (this.isPlaying) {
            this.startAutoPlay();
        }
    }

    toggleAutoPlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.startAutoPlay();
        } else {
            this.pauseAutoPlay();
        }
    }

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
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

    /**
     * Public API for external control
     */
    next() {
        this.goToSlide(this.currentSlide + 1);
        this.resetAutoPlay();
    }

    prev() {
        this.goToSlide(this.currentSlide - 1);
        this.resetAutoPlay();
    }

    play() {
        this.isPlaying = true;
        this.startAutoPlay();
    }

    pause() {
        this.isPlaying = false;
        this.pauseAutoPlay();
    }

    getCurrentSlide() {
        return this.currentSlide;
    }

    getSlideCount() {
        return this.slideCount;
    }

    /**
     * Cleanup method
     */
    destroy() {
        this.pauseAutoPlay();

        // Remove event listeners
        this.prevButton?.removeEventListener('click', this.handlePrevClick);
        this.nextButton?.removeEventListener('click', this.handleNextClick);
        this.carousel?.removeEventListener('keydown', this.handleKeydown);
        this.carousel?.removeEventListener('mouseenter', this.pauseAutoPlay);
        this.carousel?.removeEventListener('mouseleave', this.resumeAutoPlay);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        console.log('BuildingCarousel: Destroyed');
    }
}

// Make BuildingCarousel globally available
window.BuildingCarousel = BuildingCarousel;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.building-carousel-container');
    if (carouselContainer) {
        window.carouselInstance = new BuildingCarousel();
        console.log('🎠 BuildingCarousel: Initialized successfully');
    }
});