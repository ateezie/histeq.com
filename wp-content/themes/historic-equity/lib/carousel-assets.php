<?php
/**
 * Carousel Assets Management
 *
 * Handles proper enqueuing of carousel JavaScript and CSS
 * following WordPress best practices
 *
 * @package HistoricEquity
 * @since 1.0.0
 */

namespace HistoricEquity\Carousel;

class CarouselAssets {

    /**
     * Initialize carousel asset management
     */
    public static function init() {
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_carousel_assets']);
        add_action('wp_footer', [self::class, 'add_carousel_inline_script'], 25);
    }

    /**
     * Enqueue carousel-specific assets
     */
    public static function enqueue_carousel_assets() {
        // Only enqueue on homepage where carousel is used
        if (!is_front_page()) {
            return;
        }

        // Check for built carousel module first (production)
        $carousel_files = glob(get_template_directory() . '/static/dist/carousel.*.js');
        if (!empty($carousel_files)) {
            $carousel_file = basename($carousel_files[0]);
            wp_enqueue_script(
                'historic-equity-carousel',
                get_template_directory_uri() . '/static/dist/' . $carousel_file,
                [], // No dependencies, self-contained module
                null, // No version needed as hash is in filename
                true // Load in footer
            );
        } else {
            // Fallback to source module (development)
            wp_enqueue_script(
                'historic-equity-carousel',
                get_template_directory_uri() . '/static/js/modules/carousel.js',
                [], // No dependencies, self-contained module
                filemtime(get_template_directory() . '/static/js/modules/carousel.js'),
                true // Load in footer
            );
        }

        // Module type not needed since we're using global class instead of ES6 exports
        // add_filter('script_loader_tag', [self::class, 'add_module_type'], 10, 3);
    }

    /**
     * Add type="module" to carousel script for ES6 imports
     */
    public static function add_module_type($tag, $handle, $src) {
        if ('historic-equity-carousel' === $handle) {
            $tag = str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }

    /**
     * Add inline script for carousel configuration
     */
    public static function add_carousel_inline_script() {
        if (!is_front_page()) {
            return;
        }

        // Get carousel configuration from Timber context or WordPress options
        $carousel_config = self::get_carousel_config();

        ?>
        <script type="application/json" id="carousel-config">
            <?php echo wp_json_encode($carousel_config); ?>
        </script>
        <script>
            // Initialize carousel with custom configuration
            document.addEventListener('DOMContentLoaded', function() {
                const configElement = document.getElementById('carousel-config');
                if (configElement && window.BuildingCarousel) {
                    const config = JSON.parse(configElement.textContent);

                    // Override default configuration
                    if (window.BuildingCarousel.prototype) {
                        Object.assign(window.BuildingCarousel.prototype.config, config);
                    }
                }
            });
        </script>
        <?php
    }

    /**
     * Get carousel configuration
     *
     * @return array Carousel configuration options
     */
    private static function get_carousel_config() {
        return apply_filters('historic_equity_carousel_config', [
            'autoPlayDelay' => 5000,
            'transitionDuration' => 500,
            'swipeThreshold' => 50,
            'pauseOnHover' => true,
            'keyboardNavigation' => true,
            'debugMode' => WP_DEBUG
        ]);
    }
}

// Initialize carousel assets
CarouselAssets::init();