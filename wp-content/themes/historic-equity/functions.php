<?php
/**
 * Historic Equity WordPress Theme Functions
 * Optimized for Timber v2.x with design system integration
 */

// Theme constants
define('HISTORIC_EQUITY_VERSION', '1.0.0');
define('HISTORIC_EQUITY_THEME_PATH', get_template_directory());
define('HISTORIC_EQUITY_THEME_URI', get_template_directory_uri());

// Load Composer dependencies (including Timber)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once(__DIR__ . '/vendor/autoload.php');
}

// Enhanced theme setup
function historic_equity_theme_setup() {
    // Theme support
    add_theme_support('post-thumbnails');
    add_theme_support('menus');
    add_theme_support('title-tag');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    add_theme_support('responsive-embeds');
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');

    // Image sizes for design system
    add_image_size('project-card', 400, 300, true);
    add_image_size('hero-background', 1920, 1080, true);
    add_image_size('team-photo', 300, 300, true);

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Navigation', 'historic-equity'),
        'footer' => __('Footer Navigation', 'historic-equity'),
    ));

    // Add editor style
    add_editor_style('static/css/editor-style.css');
}
add_action('after_setup_theme', 'historic_equity_theme_setup');

// Enhanced asset loading with performance optimization
function historic_equity_scripts() {
    // Disable caching for development
    $version = time();

    // Load built CSS from webpack dist
    $css_files = glob(HISTORIC_EQUITY_THEME_PATH . '/static/dist/style.*.css');
    if (!empty($css_files)) {
        $css_file = basename($css_files[0]);
        wp_enqueue_style(
            'historic-equity-style',
            HISTORIC_EQUITY_THEME_URI . '/static/dist/' . $css_file,
            array(),
            null // No version needed as hash is in filename
        );
    } else {
        // Fallback to main CSS
        wp_enqueue_style(
            'historic-equity-style',
            HISTORIC_EQUITY_THEME_URI . '/static/css/style.css',
            array(),
            $version
        );
    }

    // Preload critical fonts
    wp_enqueue_style(
        'montserrat-font',
        'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
        array(),
        null
    );

    // Load built JavaScript from webpack dist
    $js_files = glob(HISTORIC_EQUITY_THEME_PATH . '/static/dist/main.*.js');
    if (!empty($js_files)) {
        $js_file = basename($js_files[0]);
        wp_enqueue_script(
            'historic-equity-main',
            HISTORIC_EQUITY_THEME_URI . '/static/dist/' . $js_file,
            array('jquery'),
            null, // No version needed as hash is in filename
            true
        );
    } else {
        // Fallback to source JS
        wp_enqueue_script(
            'historic-equity-main',
            HISTORIC_EQUITY_THEME_URI . '/static/js/main.js',
            array('jquery'),
            $version,
            true
        );
    }

    // Accessibility enhancements
    if (file_exists(HISTORIC_EQUITY_THEME_PATH . '/static/js/accessibility.js')) {
        wp_enqueue_script(
            'historic-equity-accessibility',
            HISTORIC_EQUITY_THEME_URI . '/static/js/accessibility.js',
            array('jquery'),
            $version,
            true
        );
    }

    // Localize scripts with enhanced data
    wp_localize_script('historic-equity-main', 'HistoricEquity', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'rest_url' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('historic_equity_nonce'),
        'theme_uri' => HISTORIC_EQUITY_THEME_URI,
        'is_mobile' => wp_is_mobile(),
        'design_system' => array(
            'breakpoints' => array(
                'sm' => '640px',
                'md' => '768px',
                'lg' => '1024px',
                'xl' => '1280px',
                '2xl' => '1536px'
            ),
            'colors' => array(
                'primary' => '#BD572B',
                'secondary' => '#E6CD41',
                'brown' => '#95816E',
                'light_blue' => '#83ACD1',
                'navy' => '#2D2E3D',
                'off_white' => '#FEFFF8'
            )
        )
    ));
}
add_action('wp_enqueue_scripts', 'historic_equity_scripts');

// Timber v2.x initialization with comprehensive context
if (class_exists('Timber\Timber')) {
    // Set Timber directories
    Timber\Timber::$dirname = array('templates', 'views');

    // Enhanced Timber context
    function historic_equity_add_to_context($context) {
        // Basic site context
        $context['site'] = new \Timber\Site();
        $context['menu'] = \Timber\Timber::get_menu('primary');

        // Load ACF fields for current post/page
        if (function_exists('get_fields')) {
            global $post;
            if ($post) {
                $context['fields'] = get_fields($post->ID);
            }

            // Load global ACF fields (stored in options)
            $context['global_fields'] = get_fields('option');
        }

        // Design system variables from Figma
        $context['design_system'] = array(
            'typography' => array(
                'heading_font' => 'Montserrat',
                'body_font' => 'Montserrat',
                'font_weights' => array(
                    'light' => 300,
                    'regular' => 400,
                    'medium' => 500,
                    'semibold' => 600,
                    'bold' => 700
                )
            ),
            'colors' => array(
                'primary_orange' => '#BD572B',
                'primary_gold' => '#E6CD41',
                'primary_brown' => '#95816E',
                'light_blue' => '#83ACD1',
                'off_white' => '#FEFFF8',
                'dark_navy' => '#2D2E3D'
            ),
            'spacing' => array(
                'container_max_width' => '1280px',
                'section_padding' => 'py-16 lg:py-24',
                'element_spacing' => 'space-y-6'
            )
        );

        // Company information aligned with community focus
        $context['company_info'] = array(
            'name' => 'Historic Equity Inc.',
            'founded' => '2001',
            'years_experience' => '24',
            'states_served' => '17',
            'total_projects' => '200+',
            'total_investment' => '1B+',
            'mission' => 'Preserving History, Empowering Communities Through Strategic Investment',
            'focus' => 'community', // Changed from 'business' to align with Figma
            'phone' => get_theme_mod('company_phone', '(314) 555-SHTC'),
            'email' => get_theme_mod('company_email', 'info@histeq.com')
        );

        // Trust indicators for community focus
        $context['trust_indicators'] = array(
            'years_experience' => '24',
            'communities_served' => '17+',
            'families_housed' => '1000+',
            'buildings_preserved' => '200+'
        );

        // Performance optimization flags
        $context['performance'] = array(
            'lazy_load_images' => true,
            'optimize_fonts' => true,
            'preload_critical' => true
        );

        return $context;
    }
    add_filter('timber/context', 'historic_equity_add_to_context');

    // Load comprehensive Timber context if available
    if (file_exists(HISTORIC_EQUITY_THEME_PATH . '/lib/timber-context.php')) {
        require_once HISTORIC_EQUITY_THEME_PATH . '/lib/timber-context.php';
    }

} else {
    // Enhanced fallback notice
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>Historic Equity Theme:</strong> Timber plugin is required. Please install and activate Timber.</p></div>';
    });
}

// Load Phase 3.5 optimization libraries
require_once get_template_directory() . '/lib/seo-optimization.php';
require_once get_template_directory() . '/lib/image-optimization.php';
require_once get_template_directory() . '/lib/query-optimization.php';
require_once get_template_directory() . '/lib/template-optimization.php';

// Custom post types removed - using ACF Pro for content management

// Load ACF field groups for content management
if (file_exists(HISTORIC_EQUITY_THEME_PATH . '/lib/acf-field-groups.php')) {
    require_once HISTORIC_EQUITY_THEME_PATH . '/lib/acf-field-groups.php';
}

// Load carousel assets management
if (file_exists(HISTORIC_EQUITY_THEME_PATH . '/lib/carousel-assets.php')) {
    require_once HISTORIC_EQUITY_THEME_PATH . '/lib/carousel-assets.php';
}

// Load carousel context for Timber
if (file_exists(HISTORIC_EQUITY_THEME_PATH . '/lib/carousel-context.php')) {
    require_once HISTORIC_EQUITY_THEME_PATH . '/lib/carousel-context.php';
}

// Theme loaded
?>