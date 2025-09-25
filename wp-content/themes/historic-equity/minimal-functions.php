<?php
/**
 * Minimal Historic Equity WordPress Theme Functions
 * Debug version to identify issues
 */

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Basic theme setup
function historic_equity_theme_setup() {
    add_theme_support('post-thumbnails');
    add_theme_support('menus');
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'historic_equity_theme_setup');

// Basic scripts and styles
function historic_equity_scripts() {
    wp_enqueue_style('historic-equity-style', get_template_directory_uri() . '/static/css/style.css', array(), '1.0.0');
    wp_enqueue_script('historic-equity-script', get_template_directory_uri() . '/static/js/main.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'historic_equity_scripts');

// Check if Timber is available
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Initialize Timber if available
if (class_exists('Timber\Timber')) {
    Timber\Timber::$dirname = array('templates', 'views');

    function add_to_context($context) {
        $context['site'] = new \Timber\Site();
        return $context;
    }
    add_filter('timber/context', 'add_to_context');
} else {
    // Show admin notice if Timber is missing
    add_action('admin_notices', function() {
        echo '<div class="error"><p>Timber not found. Using fallback template.</p></div>';
    });
}

echo '<!-- Historic Equity Theme Loaded -->';
?>