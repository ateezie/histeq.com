<?php
/**
 * Template Performance Optimization for Historic Equity Theme
 * Addresses 404 resource errors and enhances template performance
 *
 * @package HistoricEquity
 */

namespace HistoricEquity;

/**
 * Template Performance Optimizer
 *
 * Handles resource loading, caching, and performance optimizations
 * specifically for Timber templates and WordPress integration.
 */
class TemplateOptimization {

    /**
     * Initialize template optimizations
     */
    public static function init() {
        add_action('wp_enqueue_scripts', [__CLASS__, 'optimize_assets']);
        add_action('wp_head', [__CLASS__, 'add_performance_headers'], 1);
        add_filter('timber/context', [__CLASS__, 'add_performance_context']);
        add_action('template_redirect', [__CLASS__, 'check_resource_availability']);

        // Handle 404 resource errors
        add_action('wp_ajax_check_resource', [__CLASS__, 'ajax_check_resource']);
        add_action('wp_ajax_nopriv_check_resource', [__CLASS__, 'ajax_check_resource']);
    }

    /**
     * Optimize asset loading for better performance
     */
    public static function optimize_assets() {
        // Remove unnecessary WordPress assets
        wp_deregister_script('wp-embed');
        wp_dequeue_style('wp-block-library');

        // Optimize jQuery loading
        if (!is_admin()) {
            wp_deregister_script('jquery');
            wp_register_script(
                'jquery',
                'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                [],
                '3.6.0',
                true
            );
            wp_enqueue_script('jquery');
        }

        // Critical resource preloading
        self::preload_critical_resources();

        // Check for missing resources
        self::validate_theme_resources();
    }

    /**
     * Add performance-related HTTP headers
     */
    public static function add_performance_headers() {
        if (!headers_sent()) {
            // DNS prefetch for external resources
            echo '<link rel="dns-prefetch" href="//fonts.googleapis.com">' . "\n";
            echo '<link rel="dns-prefetch" href="//images.unsplash.com">' . "\n";

            // Resource hints for better loading
            echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
        }
    }

    /**
     * Add performance-related context to Timber
     *
     * @param array $context Timber context
     * @return array Enhanced context
     */
    public static function add_performance_context($context) {
        $context['performance'] = [
            'lazy_loading' => true,
            'webp_support' => self::supports_webp(),
            'critical_css_inline' => true,
            'resource_validation' => true,
            'cache_version' => HISTORIC_EQUITY_VERSION,
            'assets_base_url' => get_template_directory_uri() . '/static/',
            'images_base_url' => get_template_directory_uri() . '/static/images/',
        ];

        // Add validated resource paths
        $context['validated_resources'] = self::get_validated_resources();

        return $context;
    }

    /**
     * Check if critical theme resources are available
     */
    public static function check_resource_availability() {
        $critical_resources = [
            'css' => get_template_directory() . '/static/css/style.css',
            'js' => get_template_directory() . '/static/js/main.js',
            'logo' => get_template_directory() . '/static/images/logo__black.png',
        ];

        $missing_resources = [];
        foreach ($critical_resources as $type => $path) {
            if (!file_exists($path)) {
                $missing_resources[] = [
                    'type' => $type,
                    'path' => $path,
                    'url' => str_replace(get_template_directory(), get_template_directory_uri(), $path)
                ];
            }
        }

        if (!empty($missing_resources) && WP_DEBUG) {
            error_log('Historic Equity Theme: Missing critical resources: ' . print_r($missing_resources, true));
        }

        // Store for template use
        update_option('he_missing_resources', $missing_resources);
    }

    /**
     * Preload critical resources for better performance
     */
    private static function preload_critical_resources() {
        $critical_resources = [
            'style' => get_template_directory_uri() . '/static/css/style.css',
            'script' => get_template_directory_uri() . '/static/js/main.js',
        ];

        foreach ($critical_resources as $type => $url) {
            if (file_exists(str_replace(get_template_directory_uri(), get_template_directory(), $url))) {
                if ($type === 'style') {
                    echo '<link rel="preload" href="' . esc_url($url) . '" as="style">' . "\n";
                } elseif ($type === 'script') {
                    echo '<link rel="preload" href="' . esc_url($url) . '" as="script">' . "\n";
                }
            }
        }
    }

    /**
     * Validate theme resources exist
     */
    private static function validate_theme_resources() {
        $theme_dir = get_template_directory();
        $theme_uri = get_template_directory_uri();

        $resources = [
            'styles' => [
                'main' => '/static/css/style.css',
                'editor' => '/static/css/editor-style.css',
            ],
            'scripts' => [
                'main' => '/static/js/main.js',
                'accessibility' => '/static/js/accessibility.js',
                'mobile-nav' => '/static/js/mobile-navigation.js',
            ],
            'images' => [
                'logo_black' => '/static/images/logo__black.png',
                'logo_white' => '/static/images/logo__white.png',
            ]
        ];

        $validation_results = [];
        foreach ($resources as $category => $files) {
            $validation_results[$category] = [];
            foreach ($files as $name => $path) {
                $full_path = $theme_dir . $path;
                $validation_results[$category][$name] = [
                    'exists' => file_exists($full_path),
                    'path' => $full_path,
                    'url' => $theme_uri . $path,
                    'size' => file_exists($full_path) ? filesize($full_path) : 0
                ];
            }
        }

        // Cache validation results
        update_option('he_resource_validation', $validation_results);

        return $validation_results;
    }

    /**
     * Get validated resources for template use
     *
     * @return array Validated resource paths
     */
    private static function get_validated_resources() {
        $validation = get_option('he_resource_validation', []);
        $validated = [];

        foreach ($validation as $category => $resources) {
            $validated[$category] = [];
            foreach ($resources as $name => $resource) {
                if ($resource['exists']) {
                    $validated[$category][$name] = $resource['url'];
                }
            }
        }

        return $validated;
    }

    /**
     * Check if browser supports WebP
     *
     * @return bool WebP support status
     */
    private static function supports_webp() {
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $accept = $_SERVER['HTTP_ACCEPT'] ?? '';

        // Check Accept header for WebP support
        if (strpos($accept, 'image/webp') !== false) {
            return true;
        }

        // Check User-Agent for known WebP-supporting browsers
        $webp_browsers = ['Chrome', 'Firefox', 'Opera', 'Edge'];
        foreach ($webp_browsers as $browser) {
            if (strpos($user_agent, $browser) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * AJAX handler for resource checking
     */
    public static function ajax_check_resource() {
        check_ajax_referer('historic_equity_nonce', 'nonce');

        $resource_url = sanitize_url($_POST['resource_url'] ?? '');
        if (empty($resource_url)) {
            wp_die('Invalid resource URL');
        }

        $response = wp_remote_head($resource_url);
        $status_code = wp_remote_retrieve_response_code($response);

        wp_send_json([
            'success' => $status_code === 200,
            'status_code' => $status_code,
            'resource_url' => $resource_url
        ]);
    }

    /**
     * Generate optimized image URLs
     *
     * @param string $image_path Image path
     * @param int $width Desired width
     * @param int $height Desired height
     * @return string Optimized image URL
     */
    public static function get_optimized_image($image_path, $width = null, $height = null) {
        // Check if image exists
        $full_path = get_template_directory() . $image_path;
        if (!file_exists($full_path)) {
            return '';
        }

        $image_url = get_template_directory_uri() . $image_path;

        // Add responsive parameters if needed
        if ($width && $height) {
            $image_url .= "?w={$width}&h={$height}&fit=crop";
        }

        return $image_url;
    }

    /**
     * Performance monitoring for development
     */
    public static function monitor_performance() {
        if (!WP_DEBUG) {
            return;
        }

        $start_time = $_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true);
        $memory_usage = memory_get_usage(true);
        $memory_peak = memory_get_peak_usage(true);

        add_action('wp_footer', function() use ($start_time, $memory_usage, $memory_peak) {
            $load_time = microtime(true) - $start_time;
            $final_memory = memory_get_usage(true);

            echo "\n<!-- Performance Debug -->\n";
            echo "<!-- Load Time: " . number_format($load_time, 4) . "s -->\n";
            echo "<!-- Memory Usage: " . size_format($final_memory) . " -->\n";
            echo "<!-- Memory Peak: " . size_format($memory_peak) . " -->\n";
            echo "<!-- Queries: " . get_num_queries() . " -->\n";
        });
    }
}

// Initialize template optimizations
TemplateOptimization::init();

// Enable performance monitoring in debug mode
if (WP_DEBUG) {
    TemplateOptimization::monitor_performance();
}