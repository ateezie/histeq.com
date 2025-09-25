<?php
/**
 * AJAX Project Filtering Handler for Historic Equity
 *
 * Handles state-based project filtering with comprehensive SHTC portfolio support
 *
 * @package HistoricEquity
 */

if (!defined('ABSPATH')) {
    exit;
}

class ProjectFilteringAjax {

    /**
     * Initialize AJAX handlers
     */
    public static function init() {
        add_action('wp_ajax_he_filter_projects', [__CLASS__, 'handle_filter_projects']);
        add_action('wp_ajax_nopriv_he_filter_projects', [__CLASS__, 'handle_filter_projects']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'localize_filter_scripts']);
    }

    /**
     * Localize scripts with AJAX data
     */
    public static function localize_filter_scripts() {
        if (is_page_template('templates/projects.twig') || is_singular('project')) {
            wp_localize_script('historic-equity-filters', 'HeProjectFilters', [
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('he_project_filter_nonce'),
                'per_page' => get_option('he_projects_per_page', 12),
                'analytics_enabled' => get_option('he_analytics_enabled', true),
                'analytics_endpoint' => home_url('/wp-json/he/v1/analytics'),
                'state_data' => self::get_cached_state_data()
            ]);
        }
    }

    /**
     * Handle AJAX project filtering requests
     */
    public static function handle_filter_projects() {
        // Verify nonce for security
        if (!wp_verify_nonce($_POST['nonce'], 'he_project_filter_nonce')) {
            wp_send_json_error(['message' => 'Security verification failed']);
            return;
        }

        try {
            $filters = self::sanitize_filters($_POST['filters'] ?? []);
            $page = intval($_POST['page'] ?? 1);
            $per_page = intval($_POST['per_page'] ?? 12);

            // Get filtered projects
            $query_args = self::build_query_args($filters, $page, $per_page);
            $projects_query = new WP_Query($query_args);

            if ($projects_query->have_posts()) {
                $projects_html = self::render_projects_html($projects_query);
                $total_found = $projects_query->found_posts;
                $max_pages = $projects_query->max_num_pages;
                $has_more = $page < $max_pages;

                wp_send_json_success([
                    'html' => $projects_html,
                    'total_found' => $total_found,
                    'current_page' => $page,
                    'max_pages' => $max_pages,
                    'has_more' => $has_more,
                    'loaded_count' => $projects_query->post_count,
                    'filters_applied' => self::get_active_filters($filters)
                ]);
            } else {
                wp_send_json_success([
                    'html' => self::render_no_results_html($filters),
                    'total_found' => 0,
                    'current_page' => $page,
                    'max_pages' => 0,
                    'has_more' => false,
                    'loaded_count' => 0,
                    'filters_applied' => self::get_active_filters($filters)
                ]);
            }

        } catch (Exception $e) {
            error_log('Project filtering error: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'An error occurred while filtering projects. Please try again.'
            ]);
        }
    }

    /**
     * Sanitize filter inputs
     */
    private static function sanitize_filters($filters) {
        return [
            'state' => sanitize_text_field($filters['state'] ?? 'all'),
            'property_type' => sanitize_text_field($filters['property_type'] ?? 'all'),
            'qre_range' => sanitize_text_field($filters['qre_range'] ?? 'all'),
            'year_range' => sanitize_text_field($filters['year_range'] ?? 'all'),
            'search' => sanitize_text_field($filters['search'] ?? '')
        ];
    }

    /**
     * Build WP_Query arguments based on filters
     */
    private static function build_query_args($filters, $page, $per_page) {
        $args = [
            'post_type' => 'project',
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'orderby' => 'date',
            'order' => 'DESC',
            'meta_query' => ['relation' => 'AND'],
            'tax_query' => ['relation' => 'AND']
        ];

        // State filter
        if ($filters['state'] !== 'all') {
            $args['tax_query'][] = [
                'taxonomy' => 'project_state',
                'field' => 'slug',
                'terms' => $filters['state']
            ];
        }

        // Property type filter
        if ($filters['property_type'] !== 'all') {
            $args['tax_query'][] = [
                'taxonomy' => 'property_type',
                'field' => 'slug',
                'terms' => $filters['property_type']
            ];
        }

        // QRE range filter
        if ($filters['qre_range'] !== 'all') {
            $range_meta_query = self::get_qre_range_meta_query($filters['qre_range']);
            if ($range_meta_query) {
                $args['meta_query'][] = $range_meta_query;
            }
        }

        // Year range filter
        if ($filters['year_range'] !== 'all') {
            $year_meta_query = self::get_year_range_meta_query($filters['year_range']);
            if ($year_meta_query) {
                $args['meta_query'][] = $year_meta_query;
            }
        }

        // Search filter
        if (!empty($filters['search'])) {
            $args['s'] = $filters['search'];
            // Also search in meta fields
            $args['meta_query'][] = [
                'relation' => 'OR',
                [
                    'key' => 'project_description',
                    'value' => $filters['search'],
                    'compare' => 'LIKE'
                ],
                [
                    'key' => 'project_location',
                    'value' => $filters['search'],
                    'compare' => 'LIKE'
                ]
            ];
        }

        return $args;
    }

    /**
     * Get QRE range meta query
     */
    private static function get_qre_range_meta_query($range) {
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
            $meta_query['compare'] => 'BETWEEN';
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
     * Get year range meta query
     */
    private static function get_year_range_meta_query($range) {
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
     * Render projects HTML
     */
    private static function render_projects_html($projects_query) {
        $projects_html = '';

        while ($projects_query->have_posts()) {
            $projects_query->the_post();

            $project_data = [
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'excerpt' => get_the_excerpt(),
                'permalink' => get_permalink(),
                'featured_image' => get_the_post_thumbnail_url(get_the_ID(), 'project-featured'),
                'state' => self::get_project_state_name(),
                'property_type' => self::get_project_property_type(),
                'qre' => get_post_meta(get_the_ID(), 'project_qre', true),
                'completion_year' => get_post_meta(get_the_ID(), 'project_completion_year', true),
                'location' => get_post_meta(get_the_ID(), 'project_location', true)
            ];

            $projects_html .= self::render_single_project_card($project_data);
        }

        wp_reset_postdata();
        return $projects_html;
    }

    /**
     * Render single project card
     */
    private static function render_single_project_card($project) {
        $formatted_qre = $project['qre'] ? '$' . number_format($project['qre']) : '';
        $image_url = $project['featured_image'] ?: get_template_directory_uri() . '/static/images/project-placeholder.jpg';

        return sprintf('
            <article class="project-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="project-card__image">
                    <a href="%s" class="block">
                        <img src="%s" alt="%s" class="w-full h-48 object-cover" loading="lazy">
                    </a>
                </div>
                <div class="project-card__content p-6">
                    <div class="project-card__meta text-sm text-gray-600 mb-2">
                        <span class="project-state">%s</span>
                        %s
                        %s
                    </div>
                    <h3 class="project-card__title">
                        <a href="%s" class="text-xl font-semibold text-primary-brown hover:text-primary-orange transition-colors">
                            %s
                        </a>
                    </h3>
                    <p class="project-card__excerpt text-gray-700 mt-2 line-clamp-3">
                        %s
                    </p>
                    <div class="project-card__footer mt-4 pt-4 border-t border-gray-200">
                        <a href="%s" class="btn btn--secondary btn--small">
                            View Project Details
                        </a>
                    </div>
                </div>
            </article>',
            esc_url($project['permalink']),
            esc_url($image_url),
            esc_attr($project['title']),
            esc_html($project['state']),
            $project['property_type'] ? ' • ' . esc_html($project['property_type']) : '',
            $formatted_qre ? ' • ' . esc_html($formatted_qre) . ' QRE' : '',
            esc_url($project['permalink']),
            esc_html($project['title']),
            esc_html($project['excerpt']),
            esc_url($project['permalink'])
        );
    }

    /**
     * Render no results HTML
     */
    private static function render_no_results_html($filters) {
        $active_filters = self::get_active_filters($filters);
        $filter_summary = self::get_filter_summary($active_filters);

        return sprintf('
            <div class="no-results-message text-center py-12">
                <div class="no-results-icon mb-6">
                    <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">No Projects Found</h3>
                <p class="text-gray-600 mb-6">
                    We couldn\'t find any historic rehabilitation projects %s.
                </p>
                <div class="suggestions bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                    <h4 class="font-semibold mb-3">Try adjusting your search:</h4>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>• Select a different state or region</li>
                        <li>• Choose a different property type</li>
                        <li>• Adjust the QRE or year range</li>
                        <li>• Use different search keywords</li>
                        <li>• Clear all filters to see our full portfolio</li>
                    </ul>
                </div>
                <button class="btn btn--primary clear-all-filters">
                    View All Projects
                </button>
            </div>',
            $filter_summary ? 'matching ' . esc_html($filter_summary) : 'matching your current filters'
        );
    }

    /**
     * Get project state name
     */
    private static function get_project_state_name() {
        $terms = get_the_terms(get_the_ID(), 'project_state');
        return ($terms && !is_wp_error($terms)) ? $terms[0]->name : '';
    }

    /**
     * Get project property type
     */
    private static function get_project_property_type() {
        $terms = get_the_terms(get_the_ID(), 'property_type');
        return ($terms && !is_wp_error($terms)) ? $terms[0]->name : '';
    }

    /**
     * Get active filters (non-default values)
     */
    private static function get_active_filters($filters) {
        $active = [];
        foreach ($filters as $key => $value) {
            if ($value && $value !== 'all' && $value !== '') {
                $active[$key] = $value;
            }
        }
        return $active;
    }

    /**
     * Get filter summary text
     */
    private static function get_filter_summary($active_filters) {
        $summary_parts = [];

        if (isset($active_filters['state'])) {
            $summary_parts[] = 'in ' . ucwords(str_replace('-', ' ', $active_filters['state']));
        }

        if (isset($active_filters['property_type'])) {
            $summary_parts[] = ucwords(str_replace('-', ' ', $active_filters['property_type'])) . ' properties';
        }

        if (isset($active_filters['search'])) {
            $summary_parts[] = 'matching "' . $active_filters['search'] . '"';
        }

        return implode(', ', $summary_parts);
    }

    /**
     * Get cached state data for performance
     */
    private static function get_cached_state_data() {
        $cache_key = 'he_project_states_data';
        $cached_data = wp_cache_get($cache_key);

        if ($cached_data === false) {
            $states = get_terms([
                'taxonomy' => 'project_state',
                'hide_empty' => true,
                'meta_query' => [
                    [
                        'key' => 'state_active',
                        'value' => '1',
                        'compare' => '='
                    ]
                ]
            ]);

            $state_data = [];
            foreach ($states as $state) {
                $state_data[$state->slug] = [
                    'name' => $state->name,
                    'count' => $state->count,
                    'abbreviation' => get_term_meta($state->term_id, 'state_abbreviation', true)
                ];
            }

            wp_cache_set($cache_key, $state_data, '', HOUR_IN_SECONDS);
            $cached_data = $state_data;
        }

        return $cached_data;
    }
}

// Initialize the AJAX handler
ProjectFilteringAjax::init();