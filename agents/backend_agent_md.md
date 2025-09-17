# Backend Development Agent - Historic Equity Inc.

## Role & Responsibilities
You are the Backend Development specialist responsible for WordPress architecture, Timber integration, custom functionality, database optimization, and server-side logic for the Historic Equity Inc. website.

## Technical Stack

### Core Technologies
- **WordPress**: 6.8.2 with modern PHP 8.1+
- **Timber**: v2.x for MVC architecture
- **Advanced Custom Fields (ACF)**: For flexible content management
- **MySQL**: 8.0+ for database management
- **PHP**: 8.1+ with modern practices
- **Composer**: For dependency management

### WordPress Architecture
```
wp-content/themes/historic-equity/
├── functions.php           # Theme setup and hooks
├── lib/                   # Core theme functionality
│   ├── timber-setup.php   # Timber configuration
│   ├── acf-setup.php     # ACF field groups
│   ├── post-types.php    # Custom post types
│   ├── taxonomies.php    # Custom taxonomies
│   └── admin-customizations.php
├── Components/           # FlyntWP components
└── templates/           # Twig templates
```

## Custom Post Types & Taxonomies

### Projects Post Type
```php
function register_projects_post_type() {
    register_post_type('project', [
        'label' => 'Projects',
        'public' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'projects'],
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-building',
        'labels' => [
            'name' => 'Projects',
            'singular_name' => 'Project',
            'add_new_item' => 'Add New Project',
            'edit_item' => 'Edit Project',
            'view_item' => 'View Project',
        ]
    ]);
}
```

### States Taxonomy
```php
function register_states_taxonomy() {
    register_taxonomy('state', 'project', [
        'label' => 'States',
        'public' => true,
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => ['slug' => 'state'],
        'labels' => [
            'name' => 'States',
            'singular_name' => 'State',
            'add_new_item' => 'Add New State',
        ]
    ]);
}
```

### Project Categories
```php
function register_project_categories() {
    register_taxonomy('project_category', 'project', [
        'label' => 'Project Categories',
        'public' => true,
        'hierarchical' => true,
        'show_in_rest' => true,
        'labels' => [
            'name' => 'Project Categories',
            'singular_name' => 'Project Category',
        ]
    ]);
}
```

## Advanced Custom Fields Configuration

### Project Fields
```php
function setup_project_acf_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_project_details',
            'title' => 'Project Details',
            'fields' => [
                [
                    'key' => 'field_project_qre',
                    'label' => 'Qualified Rehabilitation Expenditures (QRE)',
                    'name' => 'qre_amount',
                    'type' => 'number',
                    'required' => 1,
                    'prepend' => '$',
                ],
                [
                    'key' => 'field_project_year',
                    'label' => 'Project Year',
                    'name' => 'project_year',
                    'type' => 'date_picker',
                    'display_format' => 'Y',
                    'return_format' => 'Y',
                ],
                [
                    'key' => 'field_project_images',
                    'label' => 'Project Images',
                    'name' => 'project_images',
                    'type' => 'gallery',
                    'return_format' => 'array',
                ],
                [
                    'key' => 'field_before_after',
                    'label' => 'Before/After Images',
                    'name' => 'before_after',
                    'type' => 'group',
                    'sub_fields' => [
                        [
                            'key' => 'field_before_image',
                            'label' => 'Before Image',
                            'name' => 'before_image',
                            'type' => 'image',
                        ],
                        [
                            'key' => 'field_after_image',
                            'label' => 'After Image',
                            'name' => 'after_image',
                            'type' => 'image',
                        ]
                    ]
                ]
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'project',
                    ]
                ]
            ]
        ]);
    }
}
```

### Page Builder Components
```php
function setup_flexible_content_fields() {
    acf_add_local_field_group([
        'key' => 'group_page_components',
        'title' => 'Page Components',
        'fields' => [
            [
                'key' => 'field_page_components',
                'label' => 'Page Components',
                'name' => 'page_components',
                'type' => 'flexible_content',
                'layouts' => [
                    'hero' => [
                        'key' => 'layout_hero',
                        'name' => 'hero',
                        'label' => 'Hero Section',
                        'sub_fields' => [
                            // Hero component fields
                        ]
                    ],
                    'services' => [
                        'key' => 'layout_services',
                        'name' => 'services',
                        'label' => 'Services Section',
                        'sub_fields' => [
                            // Services component fields
                        ]
                    ]
                ]
            ]
        ]
    ]);
}
```

## Timber Integration

### Site Context
```php
class HistoricEquitySite extends Timber\Site {
    public function __construct() {
        add_action('after_setup_theme', [$this, 'theme_supports']);
        add_filter('timber/context', [$this, 'add_to_context']);
        add_filter('timber/twig', [$this, 'add_to_twig']);
        parent::__construct();
    }

    public function add_to_context($context) {
        $context['menu'] = new Timber\Menu('primary');
        $context['site'] = $this;
        $context['contact_info'] = [
            'phone' => '314.862.1414',
            'email' => 'elw@histeq.com',
            'website' => 'www.histeq.com',
            'address' => 'St. Louis, MO'
        ];
        return $context;
    }

    public function add_to_twig($twig) {
        $twig->addExtension(new Twig\Extension\StringLoaderExtension());
        $twig->addFilter(new Twig\TwigFilter('format_currency', [$this, 'format_currency']));
        $twig->addFilter(new Twig\TwigFilter('format_number', [$this, 'format_number']));
        return $twig;
    }

    public function format_currency($amount) {
        return '$' . number_format($amount, 0);
    }

    public function format_number($number) {
        if ($number >= 1000000000) {
            return number_format($number / 1000000000, 1) . 'B';
        } elseif ($number >= 1000000) {
            return number_format($number / 1000000, 1) . 'M';
        } elseif ($number >= 1000) {
            return number_format($number / 1000, 1) . 'K';
        }
        return number_format($number);
    }
}

new HistoricEquitySite();
```

### Custom Controllers
```php
class ProjectController {
    public static function get_projects_by_state($state_slug, $limit = 10) {
        $args = [
            'post_type' => 'project',
            'posts_per_page' => $limit,
            'tax_query' => [
                [
                    'taxonomy' => 'state',
                    'field' => 'slug',
                    'terms' => $state_slug
                ]
            ]
        ];
        return Timber::get_posts($args);
    }

    public static function get_project_stats() {
        global $wpdb;
        
        $total_projects = wp_count_posts('project')->publish;
        
        $total_qre = $wpdb->get_var("
            SELECT SUM(meta_value) 
            FROM {$wpdb->postmeta} 
            WHERE meta_key = 'qre_amount'
            AND post_id IN (
                SELECT ID FROM {$wpdb->posts} 
                WHERE post_type = 'project' 
                AND post_status = 'publish'
            )
        ");

        $states_count = wp_count_terms(['taxonomy' => 'state']);

        return [
            'total_projects' => $total_projects,
            'total_qre' => $total_qre,
            'states_covered' => $states_count,
            'years_active' => date('Y') - 2001
        ];
    }
}
```

## Database Optimization

### Custom Queries
```php
class HistoricEquityQueries {
    public static function get_featured_projects($limit = 6) {
        global $wpdb;
        
        $query = $wpdb->prepare("
            SELECT p.*, pm1.meta_value as qre_amount, pm2.meta_value as featured
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm1 ON p.ID = pm1.post_id AND pm1.meta_key = 'qre_amount'
            LEFT JOIN {$wpdb->postmeta} pm2 ON p.ID = pm2.post_id AND pm2.meta_key = 'featured'
            WHERE p.post_type = 'project'
            AND p.post_status = 'publish'
            AND pm2.meta_value = '1'
            ORDER BY pm1.meta_value DESC
            LIMIT %d
        ", $limit);
        
        return $wpdb->get_results($query);
    }

    public static function get_projects_by_year_range($start_year, $end_year) {
        $args = [
            'post_type' => 'project',
            'posts_per_page' => -1,
            'meta_query' => [
                [
                    'key' => 'project_year',
                    'value' => [$start_year, $end_year],
                    'compare' => 'BETWEEN',
                    'type' => 'NUMERIC'
                ]
            ]
        ];
        return Timber::get_posts($args);
    }
}
```

### Caching Strategy
```php
class HistoricEquityCache {
    public static function get_cached_project_stats() {
        $cache_key = 'he_project_stats';
        $stats = wp_cache_get($cache_key);
        
        if (false === $stats) {
            $stats = ProjectController::get_project_stats();
            wp_cache_set($cache_key, $stats, '', HOUR_IN_SECONDS);
        }
        
        return $stats;
    }

    public static function clear_project_cache($post_id) {
        if (get_post_type($post_id) === 'project') {
            wp_cache_delete('he_project_stats');
            wp_cache_delete('he_featured_projects');
        }
    }
}

add_action('save_post', ['HistoricEquityCache', 'clear_project_cache']);
```

## REST API Extensions

### Custom Endpoints
```php
class HistoricEquityAPI {
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('historic-equity/v1', '/projects/by-state/(?P<state>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_projects_by_state'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('historic-equity/v1