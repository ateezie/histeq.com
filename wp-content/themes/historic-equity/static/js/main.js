/**
 * Historic Equity WordPress Theme JavaScript
 * Enhanced for design system compliance and accessibility
 *
 * @package HistoricEquity
 */

(function() {
    'use strict';

    // Historic Equity Theme Manager
    class HistoricEquityTheme {
        constructor() {
            this.init();
        }

        init() {
            console.log('Historic Equity theme loaded successfully');
            this.setupSmoothScrolling();
            this.setupFormEnhancements();
            this.setupLoadingAnimations();
            this.setupIntersectionObserver();
            this.setupPerformanceOptimizations();
            this.setupCarousel();
        }

        // Enhanced smooth scrolling with offset for sticky header
        setupSmoothScrolling() {
            const anchorLinks = document.querySelectorAll('a[href^="#"]');
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;

            anchorLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const targetId = link.getAttribute('href');
                    const target = document.querySelector(targetId);

                    if (target && targetId !== '#') {
                        e.preventDefault();

                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = targetPosition - headerHeight - 20;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Update URL without triggering scroll
                        history.pushState(null, null, targetId);
                    }
                });
            });
        }

        // Form enhancements for contact forms
        setupFormEnhancements() {
            const forms = document.querySelectorAll('form');

            forms.forEach(form => {
                const inputs = form.querySelectorAll('input, textarea, select');

                inputs.forEach(input => {
                    // Add focus/blur animations
                    input.addEventListener('focus', () => {
                        input.closest('.form-group')?.classList.add('focused');
                    });

                    input.addEventListener('blur', () => {
                        if (!input.value.trim()) {
                            input.closest('.form-group')?.classList.remove('focused');
                        }
                    });

                    // Real-time validation feedback
                    if (input.type === 'email') {
                        input.addEventListener('input', this.validateEmail.bind(this, input));
                    }
                });
            });
        }

        // Email validation
        validateEmail(input) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailRegex.test(input.value);
            const formGroup = input.closest('.form-group');

            if (formGroup) {
                formGroup.classList.toggle('error', !isValid && input.value.length > 0);
                formGroup.classList.toggle('success', isValid);
            }
        }

        // Intersection Observer for loading animations
        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');

                        // Stagger animations for lists
                        const items = entry.target.querySelectorAll('.animate-item');
                        items.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('animated');
                            }, index * 100);
                        });
                    }
                });
            }, observerOptions);

            // Observe elements for animations
            const animatedElements = document.querySelectorAll(
                '.project-card, .service-item, .stat-item, .team-member, .hero-content'
            );

            animatedElements.forEach(el => {
                el.classList.add('animate-on-scroll');
                observer.observe(el);
            });
        }

        // Loading state animations
        setupLoadingAnimations() {
            // Add loading state to buttons
            const buttons = document.querySelectorAll('button[type="submit"], .btn-submit');

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    button.classList.add('loading');

                    // Remove loading state after 3 seconds (fallback)
                    setTimeout(() => {
                        button.classList.remove('loading');
                    }, 3000);
                });
            });

            // Image lazy loading with smooth fade-in
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Performance optimizations
        setupPerformanceOptimizations() {
            // Debounced scroll handler
            let scrollTimeout;
            let lastScrollY = window.scrollY;

            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const currentScrollY = window.scrollY;
                    const header = document.querySelector('.site-header');

                    if (header) {
                        // Show/hide header based on scroll direction
                        if (currentScrollY > lastScrollY && currentScrollY > 100) {
                            header.classList.add('header-hidden');
                        } else {
                            header.classList.remove('header-hidden');
                        }
                    }

                    lastScrollY = currentScrollY;
                }, 16); // ~60fps
            }, { passive: true });

            // Preload critical resources
            this.preloadCriticalResources();
        }

        // Building Images Carousel
        setupCarousel() {
            const carousel = document.querySelector('.building-carousel');
            if (!carousel) return;

            const track = carousel.querySelector('.carousel-track');
            const slides = carousel.querySelectorAll('.carousel-slide');
            const prevButton = carousel.querySelector('.carousel-prev');
            const nextButton = carousel.querySelector('.carousel-next');
            const indicators = carousel.querySelectorAll('.carousel-indicator');

            if (!track || slides.length === 0) return;

            let currentSlide = 0;
            const totalSlides = slides.length;
            let autoPlayInterval;
            let isPlaying = true;

            // Initialize carousel
            this.updateCarousel(track, slides, indicators, currentSlide);

            // Previous button
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    this.updateCarousel(track, slides, indicators, currentSlide);
                    this.resetAutoPlay();
                });
            }

            // Next button
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    this.updateCarousel(track, slides, indicators, currentSlide);
                    this.resetAutoPlay();
                });
            }

            // Indicator clicks
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentSlide = index;
                    this.updateCarousel(track, slides, indicators, currentSlide);
                    this.resetAutoPlay();
                });
            });

            // Touch/swipe support
            let startX = 0;
            let endX = 0;

            track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });

            track.addEventListener('touchmove', (e) => {
                endX = e.touches[0].clientX;
            }, { passive: true });

            track.addEventListener('touchend', () => {
                const diffX = startX - endX;
                const threshold = 50;

                if (Math.abs(diffX) > threshold) {
                    if (diffX > 0) {
                        // Swipe left - next slide
                        currentSlide = (currentSlide + 1) % totalSlides;
                    } else {
                        // Swipe right - previous slide
                        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    }
                    this.updateCarousel(track, slides, indicators, currentSlide);
                    this.resetAutoPlay();
                }
            });

            // Keyboard navigation
            carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    this.updateCarousel(track, slides, indicators, currentSlide);
                    this.resetAutoPlay();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    currentSlide = (currentSlide + 1) % totalSlides;
                    this.updateCarousel(track, slides, indicators, currentSlide);
                    this.resetAutoPlay();
                }
            });

            // Auto-play functionality
            const startAutoPlay = () => {
                if (totalSlides > 1) {
                    autoPlayInterval = setInterval(() => {
                        currentSlide = (currentSlide + 1) % totalSlides;
                        this.updateCarousel(track, slides, indicators, currentSlide);
                    }, 5000); // Change slide every 5 seconds
                }
            };

            const stopAutoPlay = () => {
                clearInterval(autoPlayInterval);
            };

            this.resetAutoPlay = () => {
                stopAutoPlay();
                if (isPlaying) {
                    startAutoPlay();
                }
            };

            // Pause auto-play on hover
            carousel.addEventListener('mouseenter', stopAutoPlay);
            carousel.addEventListener('mouseleave', () => {
                if (isPlaying) startAutoPlay();
            });

            // Pause auto-play when page is not visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoPlay();
                } else if (isPlaying) {
                    startAutoPlay();
                }
            });

            // Start auto-play
            startAutoPlay();
        }

        // Update carousel position and active states
        updateCarousel(track, slides, indicators, currentSlide) {
            // Move track
            const slideWidth = slides[0].offsetWidth;
            const offset = -currentSlide * slideWidth;
            track.style.transform = `translateX(${offset}px)`;

            // Update slide states
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
                slide.setAttribute('aria-hidden', index !== currentSlide);
            });

            // Update indicators
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
                indicator.setAttribute('aria-selected', index === currentSlide);
            });

            // Update button states
            const carousel = track.closest('.building-carousel');
            const prevButton = carousel.querySelector('.carousel-prev');
            const nextButton = carousel.querySelector('.carousel-next');

            if (prevButton) {
                prevButton.setAttribute('aria-label', `Previous slide (${currentSlide + 1} of ${slides.length})`);
            }
            if (nextButton) {
                nextButton.setAttribute('aria-label', `Next slide (${currentSlide + 1} of ${slides.length})`);
            }
        }

        // Preload critical resources
        preloadCriticalResources() {
            const criticalImages = [
                '/wp-content/themes/historic-equity/static/images/logo__black.png'
            ];

            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        }

        // Public methods for external access
        scrollToElement(selector, offset = 100) {
            const element = document.querySelector(selector);
            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.textContent = message;

            document.body.appendChild(notification);

            // Remove after 5 seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        window.HistoricEquityTheme = new HistoricEquityTheme();
    });

    // Expose utility functions globally
    window.HE = {
        scrollTo: (selector, offset) => {
            if (window.HistoricEquityTheme) {
                window.HistoricEquityTheme.scrollToElement(selector, offset);
            }
        },
        notify: (message, type) => {
            if (window.HistoricEquityTheme) {
                window.HistoricEquityTheme.showNotification(message, type);
            }
        }
    };

})();