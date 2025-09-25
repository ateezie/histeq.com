/**
 * Image Lazy Loading and Optimization for Historic Equity Inc.
 *
 * Advanced image loading system with lazy loading, progressive enhancement,
 * and performance optimization for SHTC project portfolio images.
 *
 * @package HistoricEquity
 */

(function($) {
    'use strict';

    /**
     * Image Optimization Manager
     */
    class ImageOptimizationManager {
        constructor() {
            this.lazyImages = $('img[data-src], img[loading="lazy"], .lazy-image');
            this.galleryImages = $('.project-gallery img, .image-gallery img');
            this.heroImages = $('.hero-image, .featured-image');

            this.observer = null;
            this.loadedImages = new Set();
            this.imageQueue = [];
            this.isProcessing = false;

            // Configuration
            this.config = {
                rootMargin: '50px 0px',
                threshold: 0.1,
                fadeInDuration: 300,
                progressiveQuality: true,
                webpSupport: this.checkWebPSupport(),
                retryAttempts: 3,
                placeholderQuality: 20
            };

            this.init();
        }

        /**
         * Initialize image optimization
         */
        init() {
            this.setupIntersectionObserver();
            this.setupImagePlaceholders();
            this.setupProgressiveLoading();
            this.setupImageOptimization();
            this.setupGalleryEnhancements();
            this.setupErrorHandling();
            this.setupPerformanceMonitoring();

            // Start observing images
            this.observe();

            console.log('Historic Equity Image Optimization initialized');
        }

        /**
         * Setup Intersection Observer for lazy loading
         */
        setupIntersectionObserver() {
            if (!('IntersectionObserver' in window)) {
                // Fallback for older browsers
                this.loadAllImages();
                return;
            }

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage($(entry.target));
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: this.config.rootMargin,
                threshold: this.config.threshold
            });
        }

        /**
         * Start observing images
         */
        observe() {
            this.lazyImages.each((index, img) => {
                const $img = $(img);

                // Skip if already loaded
                if (this.loadedImages.has(img)) return;

                // Add to observer
                if (this.observer) {
                    this.observer.observe(img);
                } else {
                    // Fallback: load immediately
                    this.loadImage($img);
                }
            });
        }

        /**
         * Load individual image
         */
        async loadImage($img) {
            if (this.loadedImages.has($img[0])) return;

            const dataSrc = $img.attr('data-src');
            const dataSrcset = $img.attr('data-srcset');
            const src = $img.attr('src');

            // Determine the source to load
            let imageUrl = dataSrc || src;
            if (!imageUrl) return;

            try {
                // Show loading state
                this.showImageLoading($img);

                // Optimize URL for performance
                imageUrl = this.optimizeImageUrl(imageUrl, $img);

                // Preload the image
                const preloadResult = await this.preloadImage(imageUrl);

                // Set the image source
                if (dataSrc) {
                    $img.attr('src', imageUrl);
                    $img.removeAttr('data-src');
                }

                if (dataSrcset) {
                    $img.attr('srcset', dataSrcset);
                    $img.removeAttr('data-srcset');
                }

                // Handle successful load
                this.handleImageLoad($img, preloadResult);

            } catch (error) {
                this.handleImageError($img, error);
            }
        }

        /**
         * Preload image with promise
         */
        preloadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const startTime = performance.now();

                img.onload = () => {
                    const loadTime = performance.now() - startTime;
                    resolve({
                        src: src,
                        loadTime: loadTime,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight
                    });
                };

                img.onerror = () => {
                    reject(new Error(`Failed to load image: ${src}`));
                };

                img.src = src;
            });
        }

        /**
         * Handle successful image load
         */
        handleImageLoad($img, loadResult) {
            this.loadedImages.add($img[0]);

            // Remove loading state
            this.hideImageLoading($img);

            // Add loaded class for CSS animations
            $img.addClass('image-loaded');

            // Fade in animation
            if ($img.hasClass('lazy-image')) {
                $img.css('opacity', 0).animate({ opacity: 1 }, this.config.fadeInDuration);
            }

            // Track performance
            this.trackImagePerformance($img, loadResult);

            // Trigger custom event
            $img.trigger('imageLoaded', [loadResult]);
        }

        /**
         * Handle image load error
         */
        handleImageError($img, error) {
            console.warn('Image load error:', error.message);

            // Remove loading state
            this.hideImageLoading($img);

            // Add error class
            $img.addClass('image-error');

            // Show placeholder or fallback
            this.showImageFallback($img);

            // Track error
            this.trackImageError($img, error);

            // Trigger custom event
            $img.trigger('imageError', [error]);
        }

        /**
         * Setup image placeholders
         */
        setupImagePlaceholders() {
            this.lazyImages.each((index, img) => {
                const $img = $(img);

                // Skip if already has src
                if ($img.attr('src') && !$img.attr('data-src')) return;

                // Create low-quality placeholder
                const placeholder = this.generatePlaceholder($img);
                if (placeholder) {
                    $img.attr('src', placeholder);
                }

                // Add lazy loading class
                $img.addClass('lazy-loading');
            });
        }

        /**
         * Generate image placeholder
         */
        generatePlaceholder($img) {
            const width = $img.attr('width') || $img.data('width') || 400;
            const height = $img.attr('height') || $img.data('height') || 300;

            // Create a simple colored placeholder
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');

            // Historic Equity brand colors
            const colors = ['#BD572B', '#E6CD41', '#95816E', '#83ACD1'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            ctx.fillStyle = color + '20'; // 20% opacity
            ctx.fillRect(0, 0, width, height);

            // Add Historic Equity logo or pattern
            ctx.fillStyle = color + '40';
            ctx.font = '16px Montserrat';
            ctx.textAlign = 'center';
            ctx.fillText('Historic Equity', width / 2, height / 2);

            return canvas.toDataURL('image/png');
        }

        /**
         * Setup progressive loading
         */
        setupProgressiveLoading() {
            if (!this.config.progressiveQuality) return;

            this.lazyImages.filter('[data-src]').each((index, img) => {
                const $img = $(img);
                const dataSrc = $img.attr('data-src');

                // Create low-quality version first
                const lowQualityUrl = this.createLowQualityUrl(dataSrc);
                if (lowQualityUrl !== dataSrc) {
                    $img.attr('data-src-low', lowQualityUrl);
                }
            });
        }

        /**
         * Create low quality image URL
         */
        createLowQualityUrl(originalUrl) {
            // Add quality parameter for progressive loading
            const url = new URL(originalUrl, window.location.origin);

            // Different strategies based on URL structure
            if (url.searchParams.has('w') || url.searchParams.has('width')) {
                // WordPress/CDN with width parameter
                const originalWidth = url.searchParams.get('w') || url.searchParams.get('width');
                url.searchParams.set('w', Math.min(originalWidth / 4, 100));
                url.searchParams.set('q', this.config.placeholderQuality);
            } else if (originalUrl.includes('wp-content/uploads')) {
                // WordPress media - try to modify filename
                return originalUrl.replace(/(\.[^.]+)$/, '-150x150$1');
            }

            return url.toString();
        }

        /**
         * Optimize image URL based on device and connection
         */
        optimizeImageUrl(originalUrl, $img) {
            const url = new URL(originalUrl, window.location.origin);

            // Get optimal dimensions
            const dimensions = this.getOptimalDimensions($img);

            // Apply device pixel ratio
            const dpr = window.devicePixelRatio || 1;
            const optimalWidth = Math.ceil(dimensions.width * dpr);
            const optimalHeight = Math.ceil(dimensions.height * dpr);

            // Connection-based quality adjustment
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            let quality = 85; // Default quality

            if (connection) {
                switch (connection.effectiveType) {
                    case '2g':
                        quality = 60;
                        break;
                    case '3g':
                        quality = 75;
                        break;
                    case '4g':
                        quality = 85;
                        break;
                    default:
                        quality = 90;
                }
            }

            // WebP support
            if (this.config.webpSupport) {
                url.searchParams.set('format', 'webp');
            }

            // Set optimized parameters
            url.searchParams.set('w', optimalWidth);
            url.searchParams.set('h', optimalHeight);
            url.searchParams.set('q', quality);
            url.searchParams.set('fit', 'crop');

            return url.toString();
        }

        /**
         * Get optimal image dimensions
         */
        getOptimalDimensions($img) {
            const containerWidth = $img.parent().width() || $img.width() || 400;
            const containerHeight = $img.parent().height() || $img.height() || 300;

            return {
                width: Math.min(containerWidth, 1920),
                height: Math.min(containerHeight, 1080)
            };
        }

        /**
         * Check WebP support
         */
        checkWebPSupport() {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
        }

        /**
         * Setup gallery enhancements
         */
        setupGalleryEnhancements() {
            // Masonry layout support
            this.setupMasonryGallery();

            // Image zoom/lightbox preparation
            this.setupImageZoom();

            // Gallery navigation
            this.setupGalleryNavigation();
        }

        /**
         * Setup masonry gallery layout
         */
        setupMasonryGallery() {
            const $galleries = $('.project-gallery, .image-gallery');

            $galleries.each((index, gallery) => {
                const $gallery = $(gallery);
                const $images = $gallery.find('img');

                // Wait for all images to load before initializing masonry
                const imagePromises = $images.map((i, img) => {
                    return new Promise(resolve => {
                        if (img.complete) {
                            resolve();
                        } else {
                            $(img).on('load error', resolve);
                        }
                    });
                }).get();

                Promise.all(imagePromises).then(() => {
                    this.initializeMasonry($gallery);
                });
            });
        }

        /**
         * Initialize masonry layout
         */
        initializeMasonry($gallery) {
            // Simple CSS Grid fallback if no masonry library
            $gallery.addClass('gallery-masonry-ready');

            // If Masonry library is available
            if (typeof Masonry !== 'undefined') {
                new Masonry($gallery[0], {
                    itemSelector: '.gallery-item',
                    columnWidth: '.gallery-item',
                    percentPosition: true,
                    gutter: 20
                });
            }
        }

        /**
         * Setup image zoom functionality
         */
        setupImageZoom() {
            this.galleryImages.on('click', (e) => {
                const $img = $(e.target);

                // Don't zoom if image is small
                if ($img.width() < 200) return;

                this.createImageZoom($img);
            });
        }

        /**
         * Create image zoom modal
         */
        createImageZoom($img) {
            const src = $img.attr('src') || $img.attr('data-src');
            const alt = $img.attr('alt') || 'Project Image';

            const zoomModal = $(`
                <div class="image-zoom-modal" role="dialog" aria-label="Image zoom">
                    <div class="zoom-overlay"></div>
                    <div class="zoom-content">
                        <img src="${src}" alt="${alt}" class="zoom-image">
                        <button class="zoom-close" aria-label="Close zoom">&times;</button>
                    </div>
                </div>
            `);

            $('body').append(zoomModal);
            zoomModal.fadeIn(300);

            // Close handlers
            zoomModal.find('.zoom-close, .zoom-overlay').on('click', () => {
                zoomModal.fadeOut(300, () => zoomModal.remove());
            });

            // Keyboard close
            $(document).on('keydown.zoomModal', (e) => {
                if (e.keyCode === 27) { // Escape key
                    zoomModal.fadeOut(300, () => zoomModal.remove());
                    $(document).off('keydown.zoomModal');
                }
            });
        }

        /**
         * Setup gallery navigation
         */
        setupGalleryNavigation() {
            // Keyboard navigation for galleries
            this.galleryImages.attr('tabindex', '0');

            this.galleryImages.on('keydown', (e) => {
                if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
                    e.preventDefault();
                    $(e.target).click();
                }
            });
        }

        /**
         * Show image loading state
         */
        showImageLoading($img) {
            $img.addClass('image-loading');

            // Add loading indicator if not present
            if (!$img.siblings('.image-loader').length) {
                const loader = $('<div class="image-loader">Loading...</div>');
                $img.after(loader);
            }
        }

        /**
         * Hide image loading state
         */
        hideImageLoading($img) {
            $img.removeClass('image-loading lazy-loading');
            $img.siblings('.image-loader').remove();
        }

        /**
         * Show image fallback
         */
        showImageFallback($img) {
            const fallbackSrc = '/wp-content/themes/historic-equity/static/images/project-placeholder.jpg';

            // Set fallback image
            $img.attr('src', fallbackSrc);
            $img.addClass('image-fallback');

            // Add error message
            const errorMsg = $('<div class="image-error-msg">Image unavailable</div>');
            $img.after(errorMsg);
        }

        /**
         * Setup error handling
         */
        setupErrorHandling() {
            // Global image error handler
            $(document).on('error', 'img', (e) => {
                const $img = $(e.target);

                // Skip if already handled
                if ($img.hasClass('image-error')) return;

                this.handleImageError($img, new Error('Image load failed'));
            });
        }

        /**
         * Setup performance monitoring
         */
        setupPerformanceMonitoring() {
            this.performanceMetrics = {
                totalImages: this.lazyImages.length,
                loadedImages: 0,
                averageLoadTime: 0,
                errors: 0,
                startTime: performance.now()
            };

            // Track page performance
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.initiatorType === 'img') {
                            this.trackImageResourceTiming(entry);
                        }
                    }
                });
                observer.observe({ entryTypes: ['resource'] });
            }
        }

        /**
         * Track image performance
         */
        trackImagePerformance($img, loadResult) {
            this.performanceMetrics.loadedImages++;

            const totalLoadTime = this.performanceMetrics.averageLoadTime * (this.performanceMetrics.loadedImages - 1) + loadResult.loadTime;
            this.performanceMetrics.averageLoadTime = totalLoadTime / this.performanceMetrics.loadedImages;

            // Log slow images
            if (loadResult.loadTime > 3000) {
                console.warn('Slow image load:', loadResult.src, `${loadResult.loadTime}ms`);
            }
        }

        /**
         * Track image errors
         */
        trackImageError($img, error) {
            this.performanceMetrics.errors++;

            // Track with analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'image_load_error', {
                    'event_category': 'performance',
                    'event_label': error.message,
                    'value': 1
                });
            }
        }

        /**
         * Track resource timing
         */
        trackImageResourceTiming(entry) {
            const loadTime = entry.responseEnd - entry.startTime;

            // Track large images
            if (entry.transferSize > 500000) { // 500KB
                console.warn('Large image detected:', entry.name, `${Math.round(entry.transferSize / 1024)}KB`);
            }
        }

        /**
         * Load all images (fallback)
         */
        loadAllImages() {
            this.lazyImages.each((index, img) => {
                this.loadImage($(img));
            });
        }

        /**
         * Public method to refresh observer
         */
        refresh() {
            this.lazyImages = $('img[data-src], img[loading="lazy"], .lazy-image');
            this.observe();
        }

        /**
         * Public method to force load image
         */
        forceLoad($img) {
            if (this.observer) {
                this.observer.unobserve($img[0]);
            }
            this.loadImage($img);
        }

        /**
         * Get performance metrics
         */
        getPerformanceMetrics() {
            return {
                ...this.performanceMetrics,
                completionRate: (this.performanceMetrics.loadedImages / this.performanceMetrics.totalImages) * 100,
                errorRate: (this.performanceMetrics.errors / this.performanceMetrics.totalImages) * 100,
                totalTime: performance.now() - this.performanceMetrics.startTime
            };
        }
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(() => {
        // Initialize image optimization
        window.HeImageOptimization = new ImageOptimizationManager();

        // Re-initialize on dynamic content
        $(document).on('projectsUpdated', () => {
            if (window.HeImageOptimization) {
                window.HeImageOptimization.refresh();
            }
        });
    });

    /**
     * CSS for image optimization (can be moved to SCSS)
     */
    const imageStyles = `
        <style>
        .lazy-loading {
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }

        .image-loaded {
            opacity: 1;
        }

        .image-loading {
            position: relative;
        }

        .image-loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(189, 87, 43, 0.1);
            color: #BD572B;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10;
        }

        .image-error {
            opacity: 0.5;
            filter: grayscale(100%);
        }

        .image-error-msg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10;
        }

        .image-zoom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: none;
        }

        .zoom-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
        }

        .zoom-content {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 20px;
        }

        .zoom-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .zoom-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            transition: background 0.3s ease;
        }

        .zoom-close:hover {
            background: rgba(0, 0, 0, 0.8);
        }

        .gallery-masonry-ready {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        @media (max-width: 768px) {
            .gallery-masonry-ready {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
            }
        }
        </style>
    `;

    // Inject styles if not already present
    if (!$('#image-optimization-styles').length) {
        $(imageStyles).attr('id', 'image-optimization-styles').appendTo('head');
    }

})(jQuery);