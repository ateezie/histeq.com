<?php
/**
 * WordPress Menu Integration for Historic Equity Inc.
 *
 * Enhanced WordPress menu system with FlyntWP navigation integration
 *
 * @package HistoricEquity
 */

namespace HistoricEquity;

/**
 * Menu Integration Manager
 *
 * Provides comprehensive WordPress menu integration with mobile-responsive
 * navigation, SHTC-focused menu items, and FlyntWP component compatibility.
 */
class MenuIntegration {

    /**
     * Initialize menu integration
     */
    public static function init() {
        add_action('after_setup_theme', [__CLASS__, 'register_nav_menus']);
        add_action('init', [__CLASS__, 'create_default_menus'], 20);
        add_filter('timber/context', [__CLASS__, 'add_menu_context']);
        add_filter('wp_nav_menu_args', [__CLASS__, 'modify_menu_args']);
        add_filter('nav_menu_link_attributes', [__CLASS__, 'add_menu_link_attributes'], 10, 4);
        add_filter('nav_menu_css_class', [__CLASS__, 'add_menu_item_classes'], 10, 4);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_menu_scripts']);
    }

    /**
     * Register navigation menu locations
     */
    public static function register_nav_menus() {
        register_nav_menus([
            'primary' => __('Primary Navigation', 'historic-equity'),
            'footer' => __('Footer Navigation', 'historic-equity'),
            'mobile' => __('Mobile Navigation', 'historic-equity'),
            'footer-secondary' => __('Footer Secondary Links', 'historic-equity'),
            'legal' => __('Legal & Compliance Links', 'historic-equity'),
            'shtc-resources' => __('SHTC Resources Menu', 'historic-equity')
        ]);
    }

    /**
     * Create default menu structure for Historic Equity
     */
    public static function create_default_menus() {
        // Only create menus if they don't exist
        if (!self::menu_exists('Historic Equity Primary Navigation')) {
            self::create_primary_menu();
        }

        if (!self::menu_exists('Historic Equity Footer Navigation')) {
            self::create_footer_menu();
        }

        if (!self::menu_exists('Historic Equity SHTC Resources')) {
            self::create_shtc_resources_menu();
        }
    }

    /**
     * Add menu context to Timber
     *
     * @param array $context Timber context
     * @return array Enhanced context
     */
    public static function add_menu_context($context) {
        // Primary navigation with enhanced data
        $primary_menu = \Timber\Timber::get_menu_by('location', 'primary');
        $context['menu'] = self::enhance_menu_data($primary_menu, 'primary');

        // Footer navigation
        $footer_menu = \Timber\Timber::get_menu_by('location', 'footer');
        $context['footer_menu'] = self::enhance_menu_data($footer_menu, 'footer');

        // Mobile navigation (can be different from primary)
        $mobile_menu = \Timber\Timber::get_menu_by('location', 'mobile');
        $context['mobile_menu'] = self::enhance_menu_data($mobile_menu ?: $primary_menu, 'mobile');

        // SHTC Resources menu
        $shtc_menu = \Timber\Timber::get_menu_by('location', 'shtc-resources');
        $context['shtc_resources_menu'] = self::enhance_menu_data($shtc_menu, 'shtc-resources');

        // Legal links
        $legal_menu = \Timber\Timber::get_menu_by('location', 'legal');
        $context['legal_menu'] = self::enhance_menu_data($legal_menu, 'legal');

        // Menu configuration for components
        $context['menu_config'] = [
            'primary' => [
                'mobile_breakpoint' => 1024,
                'dropdown_enabled' => true,
                'search_enabled' => false,
                'cta_button' => [
                    'text' => 'Get Consultation',
                    'url' => '/contact',
                    'style' => 'btn--primary'
                ]
            ],
            'mobile' => [
                'hamburger_style' => 'modern',
                'overlay_color' => '#2D2E3D',
                'animation' => 'slide-right'
            ]
        ];

        // Fallback menu items if no WordPress menus are set
        if (!$context['menu'] || empty($context['menu']->items)) {
            $context['fallback_menu'] = self::get_fallback_menu_items();
        }

        return $context;
    }

    /**
     * Enhance menu data with additional context
     *
     * @param object|null $menu Menu object
     * @param string $location Menu location
     * @return object|null Enhanced menu object
     */
    private static function enhance_menu_data($menu, $location) {
        if (!$menu || !$menu->items) {
            return $menu;
        }

        foreach ($menu->items as $item) {
            // Add menu item metadata
            $item->location = $location;
            $item->has_children = !empty($item->children);
            $item->depth = $item->level;

            // Add SHTC-specific indicators
            $item->is_shtc_resource = self::is_shtc_resource_link($item);
            $item->is_lead_generation = self::is_lead_generation_link($item);

            // Add tracking attributes for analytics
            $item->tracking_category = self::get_tracking_category($item, $location);

            // Add responsive classes
            $item->responsive_classes = self::get_responsive_classes($item, $location);

            // Process child items
            if ($item->has_children) {
                foreach ($item->children as $child) {
                    $child->parent_id = $item->ID;
                    $child->is_child = true;
                    $child->depth = $child->level;
                }
            }
        }

        return $menu;
    }

    /**
     * Create primary navigation menu
     */
    private static function create_primary_menu() {
        $menu_name = 'Historic Equity Primary Navigation';
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id)) {
            $menu_items = [
                [
                    'title' => 'About',
                    'url' => home_url('/about/'),
                    'description' => 'Learn about Historic Equity Inc.',
                    'classes' => ['menu-item-about']
                ],
                [
                    'title' => 'Services',
                    'url' => home_url('/services/'),
                    'description' => 'State Historic Tax Credit services',
                    'classes' => ['menu-item-services', 'has-dropdown'],
                    'children' => [
                        ['title' => 'SHTC Investment', 'url' => home_url('/services/shtc-investment/')],
                        ['title' => 'Project Evaluation', 'url' => home_url('/services/project-evaluation/')],
                        ['title' => 'Rehabilitation Consulting', 'url' => home_url('/services/consulting/')],
                        ['title' => 'Compliance Support', 'url' => home_url('/services/compliance/')]
                    ]
                ],
                [
                    'title' => 'Projects',
                    'url' => home_url('/projects/'),
                    'description' => 'Historic rehabilitation portfolio',
                    'classes' => ['menu-item-projects']
                ],
                [
                    'title' => 'States',
                    'url' => home_url('/states/'),
                    'description' => 'Coverage across 17+ states',
                    'classes' => ['menu-item-states', 'has-mega-menu'],
                    'children' => self::get_states_submenu_items()
                ],
                [
                    'title' => 'Resources',
                    'url' => home_url('/resources/'),
                    'description' => 'SHTC guides and insights',
                    'classes' => ['menu-item-resources', 'has-dropdown'],
                    'children' => [
                        ['title' => 'SHTC Guide', 'url' => home_url('/resources/shtc-guide/')],
                        ['title' => 'Case Studies', 'url' => home_url('/resources/case-studies/')],
                        ['title' => 'Market Reports', 'url' => home_url('/resources/market-reports/')],
                        ['title' => 'Compliance Updates', 'url' => home_url('/resources/compliance/')],
                        ['title' => 'Blog', 'url' => home_url('/blog/')]
                    ]
                ],
                [
                    'title' => 'Contact',
                    'url' => home_url('/contact/'),
                    'description' => 'Get your project evaluated',
                    'classes' => ['menu-item-contact', 'menu-item-cta']
                ]
            ];

            self::create_menu_items($menu_id, $menu_items);

            // Assign to primary location
            $locations = get_theme_mod('nav_menu_locations', []);
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }

    /**
     * Create footer navigation menu
     */
    private static function create_footer_menu() {
        $menu_name = 'Historic Equity Footer Navigation';
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id)) {
            $menu_items = [
                [
                    'title' => 'Company',
                    'url' => '#',
                    'classes' => ['footer-section-title'],
                    'children' => [
                        ['title' => 'About Us', 'url' => home_url('/about/')],
                        ['title' => 'Our Team', 'url' => home_url('/about/team/')],
                        ['title' => 'Company History', 'url' => home_url('/about/history/')],
                        ['title' => 'Careers', 'url' => home_url('/careers/')]
                    ]
                ],
                [
                    'title' => 'Services',
                    'url' => '#',
                    'classes' => ['footer-section-title'],
                    'children' => [
                        ['title' => 'SHTC Investment', 'url' => home_url('/services/investment/')],
                        ['title' => 'Project Evaluation', 'url' => home_url('/services/evaluation/')],
                        ['title' => 'Consultation', 'url' => home_url('/services/consultation/')],
                        ['title' => 'Case Studies', 'url' => home_url('/projects/case-studies/')]
                    ]
                ],
                [
                    'title' => 'States',
                    'url' => '#',
                    'classes' => ['footer-section-title'],
                    'children' => array_slice(self::get_states_submenu_items(), 0, 6) // Top 6 states
                ],
                [
                    'title' => 'Resources',
                    'url' => '#',
                    'classes' => ['footer-section-title'],
                    'children' => [
                        ['title' => 'SHTC Guide', 'url' => home_url('/resources/guide/')],
                        ['title' => 'Market Insights', 'url' => home_url('/resources/insights/')],
                        ['title' => 'Blog', 'url' => home_url('/blog/')],
                        ['title' => 'Contact', 'url' => home_url('/contact/')]
                    ]
                ]
            ];

            self::create_menu_items($menu_id, $menu_items);

            // Assign to footer location
            $locations = get_theme_mod('nav_menu_locations', []);
            $locations['footer'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }

    /**
     * Create SHTC resources menu
     */
    private static function create_shtc_resources_menu() {
        $menu_name = 'Historic Equity SHTC Resources';
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id)) {
            $menu_items = [
                ['title' => 'Federal Historic Tax Credits', 'url' => home_url('/resources/federal-htc/')],
                ['title' => 'State Historic Tax Credits', 'url' => home_url('/resources/state-htc/')],
                ['title' => 'Qualified Rehabilitation Expenditures', 'url' => home_url('/resources/qre/')],
                ['title' => 'Project Eligibility Requirements', 'url' => home_url('/resources/eligibility/')],
                ['title' => 'Application Process Guide', 'url' => home_url('/resources/application-process/')],
                ['title' => 'Compliance Requirements', 'url' => home_url('/resources/compliance/')],
                ['title' => 'Investment Structures', 'url' => home_url('/resources/investment-structures/')],
                ['title' => 'Tax Credit Monetization', 'url' => home_url('/resources/monetization/')]
            ];

            self::create_menu_items($menu_id, $menu_items);

            // Assign to SHTC resources location
            $locations = get_theme_mod('nav_menu_locations', []);
            $locations['shtc-resources'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }

    /**
     * Get states submenu items
     *
     * @return array States submenu items
     */
    private static function get_states_submenu_items() {
        $states = [
            'Missouri', 'Iowa', 'Kansas', 'Oklahoma', 'Minnesota', 'Wisconsin',
            'Indiana', 'South Carolina', 'Texas', 'Louisiana', 'Georgia',
            'Maryland', 'Rhode Island', 'Virginia', 'West Virginia', 'Arkansas', 'Colorado'
        ];

        $submenu_items = [];
        foreach ($states as $state) {
            $submenu_items[] = [
                'title' => $state,
                'url' => home_url('/states/' . strtolower(str_replace(' ', '-', $state)) . '/'),
                'classes' => ['state-menu-item']
            ];
        }

        return $submenu_items;
    }

    /**
     * Create menu items recursively
     *
     * @param int $menu_id Menu ID
     * @param array $items Menu items
     * @param int $parent_id Parent menu item ID
     */
    private static function create_menu_items($menu_id, $items, $parent_id = 0) {
        foreach ($items as $index => $item) {
            $menu_item_id = wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title' => $item['title'],
                'menu-item-url' => $item['url'],
                'menu-item-status' => 'publish',
                'menu-item-position' => $index + 1,
                'menu-item-parent-id' => $parent_id,
                'menu-item-description' => $item['description'] ?? '',
                'menu-item-classes' => implode(' ', $item['classes'] ?? [])
            ]);

            // Create child items if they exist
            if (!empty($item['children']) && !is_wp_error($menu_item_id)) {
                self::create_menu_items($menu_id, $item['children'], $menu_item_id);
            }
        }
    }

    /**
     * Get fallback menu items when no WordPress menu is set
     *
     * @return array Fallback menu items
     */
    private static function get_fallback_menu_items() {
        return [
            'About' => [
                'url' => home_url('/about/'),
                'title' => 'About Historic Equity',
                'description' => 'Learn about our 20+ years of SHTC expertise'
            ],
            'Services' => [
                'url' => home_url('/services/'),
                'title' => 'SHTC Investment Services',
                'description' => 'Comprehensive historic tax credit solutions'
            ],
            'Projects' => [
                'url' => home_url('/projects/'),
                'title' => 'Historic Preservation Portfolio',
                'description' => 'Browse our 200+ successful projects'
            ],
            'States' => [
                'url' => home_url('/states/'),
                'title' => 'State Coverage',
                'description' => 'SHTC services across 17+ states'
            ],
            'Resources' => [
                'url' => home_url('/resources/'),
                'title' => 'SHTC Resources & Guides',
                'description' => 'Expert insights and compliance guides'
            ],
            'Contact' => [
                'url' => home_url('/contact/'),
                'title' => 'Get Project Evaluation',
                'description' => 'Start your SHTC investment journey'
            ]
        ];
    }

    /**
     * Modify menu arguments
     *
     * @param array $args Menu arguments
     * @return array Modified arguments
     */
    public static function modify_menu_args($args) {
        // Add Historic Equity specific classes and attributes
        if (!isset($args['menu_class'])) {
            $args['menu_class'] = '';
        }

        $args['menu_class'] .= ' historic-equity-menu';

        // Add container classes based on location
        if (isset($args['theme_location'])) {
            $args['menu_class'] .= ' menu-' . $args['theme_location'];

            // Mobile-specific modifications
            if ($args['theme_location'] === 'mobile') {
                $args['menu_class'] .= ' mobile-navigation';
                $args['container_class'] = 'mobile-menu-container';
            }

            // Primary navigation modifications
            if ($args['theme_location'] === 'primary') {
                $args['menu_class'] .= ' primary-navigation';
                $args['container_class'] = 'primary-menu-container';
            }
        }

        return $args;
    }

    /**
     * Add custom attributes to menu links
     *
     * @param array $atts Link attributes
     * @param object $item Menu item
     * @param object $args Menu args
     * @param int $depth Menu depth
     * @return array Modified attributes
     */
    public static function add_menu_link_attributes($atts, $item, $args, $depth) {
        // Add tracking attributes for analytics
        if (self::is_lead_generation_link($item)) {
            $atts['data-track-event'] = 'lead-generation';
            $atts['data-track-category'] = 'navigation';
            $atts['data-track-label'] = $item->title;
        }

        // Add ARIA attributes for accessibility
        if (!empty($item->children)) {
            $atts['aria-haspopup'] = 'true';
            $atts['aria-expanded'] = 'false';
        }

        // Add rel attributes for external links
        if (self::is_external_link($item->url)) {
            $atts['rel'] = 'external noopener noreferrer';
            $atts['target'] = '_blank';
        }

        // Add microdata for SHTC resources
        if (self::is_shtc_resource_link($item)) {
            $atts['itemscope'] = '';
            $atts['itemtype'] = 'https://schema.org/WebPage';
        }

        return $atts;
    }

    /**
     * Add custom CSS classes to menu items
     *
     * @param array $classes CSS classes
     * @param object $item Menu item
     * @param object $args Menu args
     * @param int $depth Menu depth
     * @return array Modified classes
     */
    public static function add_menu_item_classes($classes, $item, $args, $depth) {
        // Add depth-specific classes
        $classes[] = 'menu-depth-' . $depth;

        // Add SHTC-specific classes
        if (self::is_shtc_resource_link($item)) {
            $classes[] = 'shtc-resource-link';
        }

        if (self::is_lead_generation_link($item)) {
            $classes[] = 'lead-generation-link';
        }

        // Add state-specific classes
        if (self::is_state_page_link($item)) {
            $classes[] = 'state-page-link';
        }

        // Add responsive classes
        $responsive_classes = self::get_responsive_classes($item, $args->theme_location ?? '');
        $classes = array_merge($classes, $responsive_classes);

        return $classes;
    }

    /**
     * Enqueue menu-specific scripts and styles
     */
    public static function enqueue_menu_scripts() {
        wp_enqueue_script(
            'historic-equity-navigation',
            get_template_directory_uri() . '/static/js/navigation.js',
            ['jquery'],
            filemtime(get_template_directory() . '/static/js/navigation.js'),
            true
        );

        wp_localize_script('historic-equity-navigation', 'HeNavigation', [
            'mobile_breakpoint' => 1024,
            'dropdown_delay' => 200,
            'animation_speed' => 300,
            'accessibility_enabled' => true,
            'tracking_enabled' => true
        ]);
    }

    /**
     * Helper methods
     */
    private static function menu_exists($menu_name) {
        return wp_get_nav_menu_object($menu_name) !== false;
    }

    private static function is_shtc_resource_link($item) {
        return strpos($item->url, '/resources/') !== false ||
               strpos($item->url, '/shtc') !== false ||
               strpos($item->url, '/services/') !== false;
    }

    private static function is_lead_generation_link($item) {
        return strpos($item->url, '/contact') !== false ||
               strpos($item->url, '/consultation') !== false ||
               strpos($item->url, '/evaluation') !== false;
    }

    private static function is_state_page_link($item) {
        return strpos($item->url, '/states/') !== false;
    }

    private static function is_external_link($url) {
        return strpos($url, home_url()) === false && strpos($url, 'http') === 0;
    }

    private static function get_tracking_category($item, $location) {
        if (self::is_lead_generation_link($item)) {
            return 'lead-generation';
        }
        if (self::is_shtc_resource_link($item)) {
            return 'shtc-resources';
        }
        return 'navigation-' . $location;
    }

    private static function get_responsive_classes($item, $location) {
        $classes = [];

        if ($location === 'mobile') {
            $classes[] = 'mobile-only';
        }

        if ($location === 'primary') {
            $classes[] = 'desktop-nav-item';
        }

        return $classes;
    }
}

// Initialize menu integration
MenuIntegration::init();