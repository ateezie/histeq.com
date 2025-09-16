<?php
/**
 * Historic Equity WordPress Theme
 *
 * @package HistoricEquity
 */

// Autoload dependencies - check if file exists first
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Initialize Timber - check if Timber is available
if (class_exists('Timber\Timber')) {
    // Set Timber directory locations (no need to instantiate Timber in v2.x)
    Timber\Timber::$dirname = array('templates', 'views');
} else {
    // Fallback if Timber is not available
    add_action('admin_notices', function() {
        echo '<div class="error"><p>Timber not found. Please install Timber plugin or check theme dependencies.</p></div>';
    });
}

// Define theme support
function historic_equity_theme_setup() {
    // Add theme support
    add_theme_support('post-thumbnails');
    add_theme_support('menus');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'historic-equity'),
        'footer' => __('Footer Menu', 'historic-equity'),
    ));
}
add_action('after_setup_theme', 'historic_equity_theme_setup');

// Add to context - only if Timber is available
if (class_exists('Timber\Timber')) {
    function add_to_context($context) {
        try {
            // Timber v2.x: Use proper methods for menu and site
            $context['menu'] = \Timber\Timber::get_menu_by('location', 'primary');
            $context['site'] = new \Timber\Site();

            // Add fallback menu if no WordPress menu is available
            if (!$context['menu'] || !$context['menu']->items) {
                $fallback_items = historic_equity_fallback_menu();
                $context['fallback_menu'] = $fallback_items;
            }

            // Add ACF options only if ACF is available
            if (function_exists('get_fields')) {
                $context['options'] = get_fields('option') ?: array();
            }
        } catch (Exception $e) {
            error_log('Timber context error: ' . $e->getMessage());
            // Fallback for menu if build method fails
            $context['menu'] = null;
            $context['site'] = null;
            $context['fallback_menu'] = historic_equity_fallback_menu();
        }
        return $context;
    }
    add_filter('timber/context', 'add_to_context');
}

// Enqueue scripts and styles
function historic_equity_scripts() {
    // Enqueue TailwindCSS compiled styles
    wp_enqueue_style(
        'historic-equity-tailwind',
        get_template_directory_uri() . '/static/css/style.css',
        array(),
        filemtime(get_template_directory() . '/static/css/style.css')
    );

    // Enqueue Google Fonts (Montserrat)
    wp_enqueue_style(
        'montserrat-font',
        'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
        array(),
        null
    );

    // Enqueue main JavaScript file
    wp_enqueue_script(
        'historic-equity-main',
        get_template_directory_uri() . '/static/js/main.js',
        array(),
        filemtime(get_template_directory() . '/static/js/main.js'),
        true
    );

    // Add inline styles for immediate font loading
    wp_add_inline_style('historic-equity-tailwind', '
        html { font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    ');
}
add_action('wp_enqueue_scripts', 'historic_equity_scripts');

// Add editor styles for Gutenberg
function historic_equity_editor_styles() {
    add_theme_support('editor-styles');
    add_editor_style('static/css/style.css');
}
add_action('after_setup_theme', 'historic_equity_editor_styles');

// Create default navigation menu programmatically
function historic_equity_create_default_menu() {
    // Check if menu already exists
    $menu_name = 'Historic Equity Primary Navigation';
    $menu_exists = wp_get_nav_menu_object($menu_name);

    if (!$menu_exists) {
        // Create the menu
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id)) {
            // Create pages if they don't exist and add menu items
            $menu_items = array(
                array(
                    'title' => 'About',
                    'url' => home_url('/about/'),
                    'page_title' => 'About Historic Equity',
                    'page_content' => 'Learn about Historic Equity Inc., our mission, team, and commitment to historic preservation through State Historic Tax Credits.'
                ),
                array(
                    'title' => 'Services',
                    'url' => home_url('/services/'),
                    'page_title' => 'SHTC Investment Services',
                    'page_content' => 'Comprehensive State Historic Tax Credit investment services including evaluation, acquisition, and management.'
                ),
                array(
                    'title' => 'Projects',
                    'url' => home_url('/projects/'),
                    'page_title' => 'Historic Rehabilitation Projects',
                    'page_content' => 'Explore our portfolio of 200+ historic rehabilitation projects across 17+ states with over $1 billion in QRE.'
                ),
                array(
                    'title' => 'States',
                    'url' => home_url('/states/'),
                    'page_title' => 'State Coverage',
                    'page_content' => 'Historic Equity operates in 17+ states providing State Historic Tax Credit investment services.'
                ),
                array(
                    'title' => 'Resources',
                    'url' => home_url('/resources/'),
                    'page_title' => 'SHTC Resources & Guides',
                    'page_content' => 'Access comprehensive guides, news, and resources about State Historic Tax Credits and historic preservation.'
                ),
                array(
                    'title' => 'Contact',
                    'url' => home_url('/contact/'),
                    'page_title' => 'Contact Historic Equity',
                    'page_content' => 'Get started with your historic rehabilitation project. Contact our team for consultation and project evaluation.'
                )
            );

            foreach ($menu_items as $index => $item) {
                // Create page if it doesn't exist
                $page_exists = get_page_by_path($item['title']);
                if (!$page_exists) {
                    $page_id = wp_insert_post(array(
                        'post_title' => $item['page_title'],
                        'post_content' => $item['page_content'],
                        'post_status' => 'publish',
                        'post_type' => 'page',
                        'post_name' => strtolower($item['title'])
                    ));
                }

                // Add menu item
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => $item['title'],
                    'menu-item-url' => $item['url'],
                    'menu-item-status' => 'publish',
                    'menu-item-position' => $index + 1
                ));
            }

            // Assign menu to primary location
            $locations = get_theme_mod('nav_menu_locations');
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }
}
add_action('after_setup_theme', 'historic_equity_create_default_menu', 20);

// Fallback navigation function for when no menu is assigned
function historic_equity_fallback_menu() {
    $fallback_items = array(
        'About' => home_url('/about/'),
        'Services' => home_url('/services/'),
        'Projects' => home_url('/projects/'),
        'States' => home_url('/states/'),
        'Resources' => home_url('/resources/'),
        'Contact' => home_url('/contact/')
    );

    return $fallback_items;
}