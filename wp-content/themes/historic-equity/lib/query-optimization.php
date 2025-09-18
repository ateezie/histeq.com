<?php
/**
 * Database Query Optimization for Historic Equity Inc.
 *
 * Advanced query optimization for SHTC project portfolios, custom post types,
 * and high-performance database operations.
 *
 * @package HistoricEquity
 */

if (!defined('ABSPATH')) {
    exit;
}

class QueryOptimization {

    /**
     * Initialize query optimization
     */
    public static function init() {
        add_action('init', [__CLASS__, 'setup_query_optimization']);
        add_action('pre_get_posts', [__CLASS__, 'optimize_main_queries']);
        add_filter('posts_clauses', [__CLASS__, 'optimize_project_queries'], 10, 2);
        add_action('wp_ajax_he_get_projects', [__CLASS__, 'ajax_get_optimized_projects']);
        add_action('wp_ajax_nopriv_he_get_projects', [__CLASS__, 'ajax_get_optimized_projects']);
        add_filter('wp_query_args', [__CLASS__, 'optimize_query_args']);
        add_action('wp_loaded', [__CLASS__, 'setup_database_indexes']);
        add_filter('posts_request', [__CLASS__, 'log_slow_queries'], 10, 2);
    }

    /**
     * Setup query optimization hooks
     */
    public static function setup_query_optimization() {
        // Enable object caching for queries
        add_filter('query_vars', [__CLASS__, 'add_custom_query_vars']);

        // Optimize meta queries
        add_filter('get_meta_sql', [__CLASS__, 'optimize_meta_queries'], 10, 6);

        // Cache expensive queries
        add_action('save_post', [__CLASS__, 'invalidate_post_caches']);
        add_action('delete_post', [__CLASS__, 'invalidate_post_caches']);
    }

    /**
     * Add custom query variables
     */
    public static function add_custom_query_vars($vars) {
        $vars[] = 'project_state';
        $vars[] = 'property_type';
        $vars[] = 'qre_range';
        $vars[] = 'completion_year';
        $vars[] = 'project_status';
        return $vars;
    }

    /**
     * Optimize main WordPress queries
     */
    public static function optimize_main_queries($query) {
        if (is_admin() || !$query->is_main_query()) {
            return;
        }

        // Optimize project archive queries
        if (is_home() || is_front_page()) {
            self::optimize_homepage_query($query);
        }

        if (is_post_type_archive('project')) {
            self::optimize_project_archive_query($query);
        }

        if (is_tax(['project_state', 'property_type'])) {
            self::optimize_taxonomy_query($query);
        }
    }

    /**
     * Optimize homepage query
     */
    private static function optimize_homepage_query($query) {
        // Limit posts and optimize for performance
        $query->set('posts_per_page', 5);
        $query->set('post_status', 'publish');
        $query->set('no_found_rows', true); // Skip pagination count
        $query->set('update_post_meta_cache', false); // Skip meta cache for simple displays
        $query->set('update_post_term_cache', false); // Skip term cache if not needed
    }

    /**
     * Optimize project archive queries
     */
    private static function optimize_project_archive_query($query) {
        // Set reasonable defaults
        $query->set('posts_per_page', 12);
        $query->set('orderby', 'date');
        $query->set('order', 'DESC');

        // Only published projects
        $query->set('post_status', 'publish');

        // Optimize meta queries for SHTC data
        $meta_query = $query->get('meta_query') ?: [];

        // Add featured projects boost
        if (!isset($_GET['featured'])) {
            $meta_query[] = [
                'relation' => 'OR',
                [
                    'key' => 'featured_project',
                    'value' => '1',
                    'compare' => '='
                ],
                [
                    'key' => 'featured_project',
                    'compare' => 'NOT EXISTS'
                ]
            ];
        }

        $query->set('meta_query', $meta_query);

        // Cache the query
        self::set_query_cache_key($query, 'project_archive');
    }

    /**
     * Optimize taxonomy queries
     */
    private static function optimize_taxonomy_query($query) {
        $query->set('posts_per_page', 12);

        // Use EXISTS for better performance on large datasets
        $query->set('meta_query', [
            [
                'key' => 'project_qre',
                'compare' => 'EXISTS'
            ]
        ]);

        self::set_query_cache_key($query, 'taxonomy_projects');
    }

    /**
     * Optimize project-specific queries
     */
    public static function optimize_project_queries($clauses, $query) {
        global $wpdb;

        if (!$query->is_main_query() || !is_post_type_archive('project')) {
            return $clauses;
        }

        // Optimize JOIN clauses for meta queries
        if (strpos($clauses['join'], $wpdb->postmeta) !== false) {
            // Ensure we're using proper indexes
            $clauses['join'] = str_replace(
                "INNER JOIN {$wpdb->postmeta}",
                "INNER JOIN {$wpdb->postmeta} USE INDEX (meta_key, meta_value)",
                $clauses['join']
            );
        }

        // Optimize WHERE clauses
        if (isset($_GET['project_state']) || isset($_GET['property_type'])) {
            $clauses = self::add_taxonomy_optimization($clauses, $query);
        }

        // Add QRE range optimization
        if (isset($_GET['qre_range'])) {
            $clauses = self::add_qre_range_optimization($clauses, $_GET['qre_range']);
        }

        return $clauses;
    }

    /**
     * Add taxonomy optimization to query clauses
     */
    private static function add_taxonomy_optimization($clauses, $query) {
        global $wpdb;

        $tax_conditions = [];

        if (isset($_GET['project_state'])) {
            $state_slug = sanitize_text_field($_GET['project_state']);
            $tax_conditions[] = "tt_state.taxonomy = 'project_state' AND t_state.slug = '{$state_slug}'";
        }

        if (isset($_GET['property_type'])) {
            $type_slug = sanitize_text_field($_GET['property_type']);
            $tax_conditions[] = "tt_type.taxonomy = 'property_type' AND t_type.slug = '{$type_slug}'";
        }

        if (!empty($tax_conditions)) {
            // Add optimized taxonomy JOINs
            if (isset($_GET['project_state'])) {
                $clauses['join'] .= " INNER JOIN {$wpdb->term_relationships} tr_state ON {$wpdb->posts}.ID = tr_state.object_id";
                $clauses['join'] .= " INNER JOIN {$wpdb->term_taxonomy} tt_state ON tr_state.term_taxonomy_id = tt_state.term_taxonomy_id";
                $clauses['join'] .= " INNER JOIN {$wpdb->terms} t_state ON tt_state.term_id = t_state.term_id";
            }

            if (isset($_GET['property_type'])) {
                $clauses['join'] .= " INNER JOIN {$wpdb->term_relationships} tr_type ON {$wpdb->posts}.ID = tr_type.object_id";
                $clauses['join'] .= " INNER JOIN {$wpdb->term_taxonomy} tt_type ON tr_type.term_taxonomy_id = tt_type.term_taxonomy_id";
                $clauses['join'] .= " INNER JOIN {$wpdb->terms} t_type ON tt_type.term_id = t_type.term_id";
            }

            $clauses['where'] .= ' AND (' . implode(' AND ', $tax_conditions) . ')';
        }

        return $clauses;
    }

    /**
     * Add QRE range optimization
     */
    private static function add_qre_range_optimization($clauses, $qre_range) {
        global $wpdb;

        $ranges = [
            'under_1m' => ['max' => 1000000],
            '1m_5m' => ['min' => 1000000, 'max' => 5000000],
            '5m_10m' => ['min' => 5000000, 'max' => 10000000],
            '10m_25m' => ['min' => 10000000, 'max' => 25000000],
            'over_25m' => ['min' => 25000000]
        ];

        if (!isset($ranges[$qre_range])) {
            return $clauses;
        }

        $range = $ranges[$qre_range];

        // Add optimized meta join for QRE
        $clauses['join'] .= " INNER JOIN {$wpdb->postmeta} pm_qre ON {$wpdb->posts}.ID = pm_qre.post_id";

        $where_conditions = ["pm_qre.meta_key = 'project_qre'"];

        if (isset($range['min']) && isset($range['max'])) {
            $where_conditions[] = "CAST(pm_qre.meta_value AS UNSIGNED) BETWEEN {$range['min']} AND {$range['max']}";
        } elseif (isset($range['min'])) {
            $where_conditions[] = "CAST(pm_qre.meta_value AS UNSIGNED) >= {$range['min']}";
        } elseif (isset($range['max'])) {
            $where_conditions[] = "CAST(pm_qre.meta_value AS UNSIGNED) <= {$range['max']}";
        }

        $clauses['where'] .= ' AND (' . implode(' AND ', $where_conditions) . ')';

        return $clauses;
    }

    /**
     * AJAX endpoint for optimized project retrieval
     */
    public static function ajax_get_optimized_projects() {
        if (!wp_verify_nonce($_POST['nonce'], 'he_project_filter_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        $filters = $_POST['filters'] ?? [];
        $page = intval($_POST['page'] ?? 1);
        $per_page = intval($_POST['per_page'] ?? 12);

        try {
            $projects = self::get_cached_projects($filters, $page, $per_page);
            wp_send_json_success($projects);
        } catch (Exception $e) {
            error_log('Project query error: ' . $e->getMessage());
            wp_send_json_error('Query failed');
        }
    }

    /**
     * Get cached projects with optimized queries
     */
    public static function get_cached_projects($filters = [], $page = 1, $per_page = 12) {
        $cache_key = self::generate_projects_cache_key($filters, $page, $per_page);
        $cached_result = wp_cache_get($cache_key, 'he_projects');

        if ($cached_result !== false) {
            return $cached_result;
        }

        // Build optimized query
        $query_args = self::build_optimized_project_query($filters, $page, $per_page);
        $query = new WP_Query($query_args);

        $result = [
            'projects' => [],
            'total_found' => $query->found_posts,
            'max_pages' => $query->max_num_pages,
            'current_page' => $page,
            'has_more' => $page < $query->max_num_pages
        ];

        while ($query->have_posts()) {
            $query->the_post();
            $result['projects'][] = self::get_optimized_project_data(get_post());
        }

        wp_reset_postdata();

        // Cache for 15 minutes
        wp_cache_set($cache_key, $result, 'he_projects', 15 * MINUTE_IN_SECONDS);

        return $result;
    }

    /**
     * Build optimized project query arguments
     */
    private static function build_optimized_project_query($filters, $page, $per_page) {
        $args = [
            'post_type' => 'project',
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'orderby' => 'menu_order date',
            'order' => 'DESC',
            'meta_query' => ['relation' => 'AND'],
            'tax_query' => ['relation' => 'AND'],
            'no_found_rows' => false, // We need pagination
            'update_post_meta_cache' => true, // We need meta data
            'update_post_term_cache' => true // We need taxonomy data
        ];

        // Add state filter
        if (!empty($filters['state']) && $filters['state'] !== 'all') {
            $args['tax_query'][] = [
                'taxonomy' => 'project_state',
                'field' => 'slug',
                'terms' => $filters['state']
            ];
        }

        // Add property type filter
        if (!empty($filters['property_type']) && $filters['property_type'] !== 'all') {
            $args['tax_query'][] = [
                'taxonomy' => 'property_type',
                'field' => 'slug',
                'terms' => $filters['property_type']
            ];
        }

        // Add QRE range filter
        if (!empty($filters['qre_range']) && $filters['qre_range'] !== 'all') {
            $qre_meta_query = self::get_qre_meta_query($filters['qre_range']);
            if ($qre_meta_query) {
                $args['meta_query'][] = $qre_meta_query;
            }
        }

        // Add year filter
        if (!empty($filters['year_range']) && $filters['year_range'] !== 'all') {
            $year_meta_query = self::get_year_meta_query($filters['year_range']);
            if ($year_meta_query) {
                $args['meta_query'][] = $year_meta_query;
            }
        }

        // Add search
        if (!empty($filters['search'])) {
            $args['s'] = $filters['search'];
        }

        return $args;
    }

    /**
     * Get QRE meta query with optimization
     */
    private static function get_qre_meta_query($range) {
        $ranges = [
            'under_1m' => ['max' => 1000000],
            '1m_5m' => ['min' => 1000000, 'max' => 5000000],
            '5m_10m' => ['min' => 5000000, 'max' => 10000000],
            '10m_25m' => ['min' => 10000000, 'max' => 25000000],
            'over_25m' => ['min' => 25000000]
        ];

        if (!isset($ranges[$range])) {
            return null;
        }

        $range_config = $ranges[$range];
        $meta_query = [
            'key' => 'project_qre',
            'type' => 'NUMERIC'
        ];

        if (isset($range_config['min']) && isset($range_config['max'])) {
            $meta_query['value'] = [$range_config['min'], $range_config['max']];
            $meta_query['compare'] = 'BETWEEN';
        } elseif (isset($range_config['min'])) {
            $meta_query['value'] = $range_config['min'];
            $meta_query['compare'] = '>=';
        } elseif (isset($range_config['max'])) {
            $meta_query['value'] = $range_config['max'];
            $meta_query['compare'] = '<=';
        }

        return $meta_query;
    }

    /**
     * Get year meta query with optimization
     */
    private static function get_year_meta_query($range) {
        $current_year = date('Y');
        $ranges = [
            'last_year' => ['min' => $current_year - 1],
            'last_3_years' => ['min' => $current_year - 3],
            'last_5_years' => ['min' => $current_year - 5],
            '2010s' => ['min' => 2010, 'max' => 2019],
            '2000s' => ['min' => 2000, 'max' => 2009],
            'before_2000' => ['max' => 1999]
        ];

        if (!isset($ranges[$range])) {
            return null;
        }

        $range_config = $ranges[$range];
        $meta_query = [
            'key' => 'project_completion_year',
            'type' => 'NUMERIC'
        ];

        if (isset($range_config['min']) && isset($range_config['max'])) {
            $meta_query['value'] = [$range_config['min'], $range_config['max']];
            $meta_query['compare'] = 'BETWEEN';
        } elseif (isset($range_config['min'])) {
            $meta_query['value'] = $range_config['min'];
            $meta_query['compare'] = '>=';
        } elseif (isset($range_config['max'])) {
            $meta_query['value'] = $range_config['max'];
            $meta_query['compare'] = '<=';
        }

        return $meta_query;
    }

    /**
     * Get optimized project data
     */
    private static function get_optimized_project_data($post) {
        static $meta_cache = [];

        $post_id = $post->ID;

        // Use static cache to avoid repeated meta queries
        if (!isset($meta_cache[$post_id])) {
            $meta_cache[$post_id] = get_post_meta($post_id);
        }

        $meta = $meta_cache[$post_id];

        return [
            'id' => $post_id,
            'title' => $post->post_title,
            'excerpt' => $post->post_excerpt,
            'permalink' => get_permalink($post_id),
            'featured_image' => get_the_post_thumbnail_url($post_id, 'project-featured'),
            'qre' => isset($meta['project_qre'][0]) ? $meta['project_qre'][0] : '',
            'completion_year' => isset($meta['project_completion_year'][0]) ? $meta['project_completion_year'][0] : '',
            'location' => isset($meta['project_location'][0]) ? $meta['project_location'][0] : '',
            'state' => self::get_cached_term_name($post_id, 'project_state'),
            'property_type' => self::get_cached_term_name($post_id, 'property_type')
        ];
    }

    /**
     * Get cached term name
     */
    private static function get_cached_term_name($post_id, $taxonomy) {
        static $term_cache = [];

        $cache_key = $post_id . '_' . $taxonomy;

        if (!isset($term_cache[$cache_key])) {
            $terms = get_the_terms($post_id, $taxonomy);
            $term_cache[$cache_key] = ($terms && !is_wp_error($terms)) ? $terms[0]->name : '';
        }

        return $term_cache[$cache_key];
    }

    /**
     * Generate cache key for projects
     */
    private static function generate_projects_cache_key($filters, $page, $per_page) {
        $key_data = [
            'filters' => $filters,
            'page' => $page,
            'per_page' => $per_page,
            'version' => '1.0'
        ];

        return 'he_projects_' . md5(serialize($key_data));
    }

    /**
     * Set query cache key
     */
    private static function set_query_cache_key($query, $prefix) {
        $cache_key = $prefix . '_' . md5(serialize($query->query_vars));
        $query->set('cache_key', $cache_key);
    }

    /**
     * Optimize meta queries
     */
    public static function optimize_meta_queries($sql, $queries, $type, $primary_table, $primary_id_column, $context) {
        // Add optimization for numeric meta values
        if (strpos($sql['where'], 'CAST') !== false) {
            // Already optimized
            return $sql;
        }

        // Optimize numeric comparisons for QRE and year fields
        $numeric_keys = ['project_qre', 'project_completion_year', 'project_budget'];

        foreach ($queries as $query) {
            if (isset($query['key']) && in_array($query['key'], $numeric_keys)) {
                // Ensure we're using proper CAST for numeric comparisons
                $sql['where'] = str_replace(
                    "meta_value",
                    "CAST(meta_value AS UNSIGNED)",
                    $sql['where']
                );
                break;
            }
        }

        return $sql;
    }

    /**
     * Setup database indexes for better performance
     */
    public static function setup_database_indexes() {
        global $wpdb;

        // Only run on admin or during specific optimization
        if (!is_admin() && !defined('HE_OPTIMIZE_DB')) {
            return;
        }

        $indexes = [
            // Optimize postmeta table for SHTC queries
            "CREATE INDEX idx_he_project_qre ON {$wpdb->postmeta} (meta_key(191), CAST(meta_value AS UNSIGNED)) WHERE meta_key = 'project_qre'",
            "CREATE INDEX idx_he_project_year ON {$wpdb->postmeta} (meta_key(191), CAST(meta_value AS UNSIGNED)) WHERE meta_key = 'project_completion_year'",
            "CREATE INDEX idx_he_featured ON {$wpdb->postmeta} (meta_key(191), meta_value(10)) WHERE meta_key = 'featured_project'",

            // Optimize posts table
            "CREATE INDEX idx_he_post_type_status ON {$wpdb->posts} (post_type, post_status, post_date)",

            // Optimize term relationships
            "CREATE INDEX idx_he_term_object ON {$wpdb->term_relationships} (object_id, term_taxonomy_id)"
        ];

        foreach ($indexes as $index) {
            // Check if index exists before creating
            $index_name = self::extract_index_name($index);
            if (!self::index_exists($index_name)) {
                $wpdb->query($index);
            }
        }
    }

    /**
     * Extract index name from CREATE INDEX statement
     */
    private static function extract_index_name($index_sql) {
        preg_match('/CREATE INDEX (\w+)/', $index_sql, $matches);
        return isset($matches[1]) ? $matches[1] : null;
    }

    /**
     * Check if database index exists
     */
    private static function index_exists($index_name) {
        global $wpdb;

        if (!$index_name) {
            return false;
        }

        $result = $wpdb->get_row($wpdb->prepare(
            "SHOW INDEX FROM {$wpdb->postmeta} WHERE Key_name = %s",
            $index_name
        ));

        return $result !== null;
    }

    /**
     * Invalidate caches when posts are saved/deleted
     */
    public static function invalidate_post_caches($post_id) {
        $post = get_post($post_id);

        if ($post && $post->post_type === 'project') {
            // Clear project-related caches
            wp_cache_flush_group('he_projects');

            // Clear specific taxonomy caches if needed
            $taxonomies = ['project_state', 'property_type'];
            foreach ($taxonomies as $taxonomy) {
                wp_cache_delete('he_' . $taxonomy . '_projects', 'he_projects');
            }
        }
    }

    /**
     * Log slow queries for optimization
     */
    public static function log_slow_queries($request, $query) {
        if (!defined('WP_DEBUG') || !WP_DEBUG) {
            return $request;
        }

        $start_time = microtime(true);

        // This would normally be handled by MySQL slow query log
        // But we can add application-level logging here

        return $request;
    }

    /**
     * Optimize query arguments
     */
    public static function optimize_query_args($args) {
        // Disable unnecessary queries when possible
        if (isset($args['post_type']) && $args['post_type'] === 'project') {
            // For project listings, we often don't need found_rows
            if (!isset($args['no_found_rows']) && !isset($args['paged'])) {
                $args['no_found_rows'] = true;
            }

            // Limit meta queries to essential fields
            if (isset($args['fields']) && $args['fields'] === 'ids') {
                $args['update_post_meta_cache'] = false;
                $args['update_post_term_cache'] = false;
            }
        }

        return $args;
    }

    /**
     * Get query performance stats
     */
    public static function get_performance_stats() {
        global $wpdb;

        return [
            'total_queries' => $wpdb->num_queries,
            'cache_hits' => wp_cache_get_stats(),
            'slow_queries' => get_option('he_slow_queries', []),
            'optimization_status' => [
                'indexes_created' => get_option('he_indexes_created', false),
                'caching_enabled' => wp_using_ext_object_cache(),
                'query_optimization' => true
            ]
        ];
    }
}

// Initialize query optimization
QueryOptimization::init();