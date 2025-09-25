<?php
/**
 * Timber Context Integration for Historic Equity Inc.
 *
 * Enhanced Timber context with all custom post types and SHTC-specific data
 *
 * @package HistoricEquity
 */

namespace HistoricEquity;

/**
 * Enhanced Timber Context Manager
 *
 * Provides comprehensive context data for all custom post types,
 * SHTC industry information, and lead generation optimization.
 */
class TimberContext {

    /**
     * Initialize context filters and actions
     */
    public static function init() {
        add_filter('timber/context', [__CLASS__, 'add_to_context']);
        add_filter('timber/post/classmap', [__CLASS__, 'add_post_classmap']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'localize_context_data']);
    }

    /**
     * Add comprehensive context data to Timber
     *
     * @param array $context Timber context
     * @return array Enhanced context
     */
    public static function add_to_context($context) {
        // Base context from functions.php
        $context = historic_equity_add_to_context($context);

        // Custom post type collections (now using ACF Pro instead)
        // $context = array_merge($context, self::get_custom_post_collections());

        // SHTC industry data
        $context = array_merge($context, self::get_shtc_industry_data());

        // Lead generation optimization data
        $context = array_merge($context, self::get_lead_generation_data());

        // Form configuration
        $context = array_merge($context, self::get_form_configurations());

        // SEO and meta data
        $context = array_merge($context, self::get_seo_data());

        // Performance and caching helpers
        $context = array_merge($context, self::get_performance_helpers());

        return $context;
    }

    /**
     * Get all custom post type collections
     *
     * @return array Custom post type data
     */
    private static function get_custom_post_collections() {
        return [
            // Contact Leads (for admin/analytics)
            'recent_leads' => self::get_recent_contact_leads(),

            // Project Showcase
            'all_projects' => self::get_project_showcase_collection(),
            'featured_projects' => self::get_featured_projects(),
            'projects_by_state' => self::get_projects_by_state(),

            // Service Information
            'shtc_services' => self::get_service_information(),
            'service_categories' => self::get_service_categories(),

            // State Coverage
            'covered_states' => self::get_state_coverage(),
            'state_statistics' => self::get_state_statistics(),

            // Company Profile
            'company_profile' => self::get_company_profile(),
            'team_members' => self::get_team_members(),
            'company_history' => self::get_company_history(),
        ];
    }

    /**
     * Get SHTC industry-specific data
     *
     * @return array SHTC industry data
     */
    private static function get_shtc_industry_data() {
        return [
            'shtc_programs' => [
                'federal_htc' => [
                    'name' => 'Federal Historic Tax Credit',
                    'rate' => '20%',
                    'description' => 'Federal 20% Historic Tax Credit for qualified rehabilitation expenditures',
                    'minimum_investment' => 5000000,
                ],
                'state_programs' => self::get_state_shtc_programs(),
            ],

            'investment_criteria' => [
                'minimum_qre' => 100000,
                'maximum_investment' => 50000000,
                'preferred_property_types' => [
                    'Commercial',
                    'Industrial',
                    'Residential (5+ units)',
                    'Institutional',
                    'Mixed-Use'
                ],
                'required_certifications' => [
                    'Listed on National Register',
                    'Contributing to Historic District',
                    'Certified Rehabilitation Plan'
                ]
            ],

            'financial_benefits' => [
                'tax_credit_monetization' => 'Convert credits to immediate cash flow',
                'project_financing' => 'Bridge financing for rehabilitation costs',
                'expertise_value' => 'Navigate complex SHTC regulations and compliance',
                'risk_mitigation' => 'Reduce regulatory and financial risks'
            ],

            'process_timeline' => [
                'evaluation' => '2-4 weeks',
                'due_diligence' => '4-6 weeks',
                'documentation' => '6-8 weeks',
                'closing' => '2-4 weeks',
                'rehabilitation' => '12-24 months',
                'certification' => '3-6 months'
            ]
        ];
    }

    /**
     * Get lead generation optimization data
     *
     * @return array Lead generation data
     */
    private static function get_lead_generation_data() {
        return [
            'conversion_points' => [
                'hero_form' => 'Primary lead capture with project evaluation CTA',
                'services_cta' => 'Secondary conversion after SHTC education',
                'projects_showcase' => 'Social proof conversion with portfolio credibility',
                'consultation_cta' => 'Final conversion with expert consultation offer'
            ],

            'lead_qualification' => [
                'property_ownership' => 'Verified property ownership or development rights',
                'project_timeline' => 'Realistic rehabilitation timeline (6-36 months)',
                'financial_capacity' => 'Adequate capital for QRE requirements',
                'historic_eligibility' => 'Property meets historic designation criteria'
            ],

            'nurture_sequences' => [
                'evaluation_requested' => 'Send SHTC process guide and case studies',
                'consultation_scheduled' => 'Provide preliminary project assessment',
                'proposal_presented' => 'Follow up with investment structure options',
                'decision_pending' => 'Address concerns and provide additional expertise'
            ],

            'success_metrics' => [
                'form_completion_rate' => 'Target: >15% homepage form completion',
                'consultation_conversion' => 'Target: >60% form to consultation',
                'proposal_acceptance' => 'Target: >40% consultation to proposal',
                'investment_close' => 'Target: >25% proposal to investment'
            ]
        ];
    }

    /**
     * Get form configurations for all contact forms
     *
     * @return array Form configuration data
     */
    private static function get_form_configurations() {
        return [
            'contact_form' => [
                'fields' => [
                    'first_name' => ['required' => true, 'type' => 'text'],
                    'last_name' => ['required' => true, 'type' => 'text'],
                    'email' => ['required' => true, 'type' => 'email', 'validation' => 'email'],
                    'phone' => ['required' => false, 'type' => 'tel'],
                    'project_location' => ['required' => true, 'type' => 'text'],
                    'property_type' => ['required' => true, 'type' => 'select'],
                    'message' => ['required' => true, 'type' => 'textarea', 'min_length' => 20],
                    'consent_marketing' => ['required' => false, 'type' => 'checkbox']
                ],
                'validation_rules' => [
                    'email_format' => 'Must be valid email address',
                    'phone_format' => 'US phone number format preferred',
                    'message_length' => 'Minimum 20 characters for project description',
                    'honeypot' => 'Bot protection via hidden field'
                ],
                'success_actions' => [
                    'email_notification' => 'Send immediate notification to Historic Equity team',
                    'auto_response' => 'Send project evaluation guide to lead',
                    'crm_integration' => 'Create lead record in CRM system',
                    'calendar_booking' => 'Provide consultation scheduling link'
                ]
            ],

            'newsletter_signup' => [
                'fields' => [
                    'email' => ['required' => true, 'type' => 'email'],
                    'interest_areas' => ['required' => false, 'type' => 'checkbox_group']
                ],
                'interest_options' => [
                    'shtc_updates' => 'State Historic Tax Credit Program Updates',
                    'case_studies' => 'Project Case Studies and Success Stories',
                    'market_insights' => 'Historic Preservation Market Insights',
                    'regulatory_changes' => 'Regulatory and Compliance Updates'
                ]
            ]
        ];
    }

    /**
     * Get SEO and meta data
     *
     * @return array SEO data
     */
    private static function get_seo_data() {
        global $wp_query;

        $seo_data = [
            'schema_org' => [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => 'Historic Equity Inc.',
                'description' => 'Premier State Historic Tax Credit investment firm specializing in historic rehabilitation projects',
                'url' => home_url(),
                'logo' => get_template_directory_uri() . '/static/images/logo.png',
                'contactPoint' => [
                    '@type' => 'ContactPoint',
                    'telephone' => get_theme_mod('company_phone', '(314) 555-SHTC'),
                    'contactType' => 'Customer Service',
                    'areaServed' => 'US'
                ],
                'sameAs' => self::get_social_media_urls()
            ],

            'breadcrumbs' => self::generate_breadcrumbs(),
            'canonical_url' => self::get_canonical_url(),
            'meta_title' => self::get_optimized_title(),
            'meta_description' => self::get_optimized_description()
        ];

        // Add project-specific schema if on project page
        if (is_singular('project_showcase')) {
            $seo_data['schema_org']['@type'] = 'Project';
            $seo_data['schema_org'] = array_merge($seo_data['schema_org'], self::get_project_schema());
        }

        return ['seo' => $seo_data];
    }

    /**
     * Get performance and caching helpers
     *
     * @return array Performance data
     */
    private static function get_performance_helpers() {
        return [
            'cache_keys' => [
                'projects_featured' => 'he_featured_projects_' . get_current_blog_id(),
                'services_homepage' => 'he_homepage_services_' . get_current_blog_id(),
                'states_coverage' => 'he_states_coverage_' . get_current_blog_id(),
                'company_stats' => 'he_company_stats_' . get_current_blog_id()
            ],

            'cache_durations' => [
                'featured_projects' => HOUR_IN_SECONDS * 6,
                'company_data' => DAY_IN_SECONDS,
                'services_info' => HOUR_IN_SECONDS * 12,
                'state_data' => DAY_IN_SECONDS * 7
            ],

            'lazy_load_config' => [
                'project_images' => true,
                'team_photos' => true,
                'hero_background' => false,
                'logos' => false
            ]
        ];
    }

    /**
     * Get recent contact leads (admin only)
     *
     * @return array|null Recent leads or null if not admin
     */
    private static function get_recent_contact_leads() {
        if (!current_user_can('manage_options')) {
            return null;
        }

        $cache_key = 'he_recent_leads_' . get_current_blog_id();
        $leads = wp_cache_get($cache_key);

        if (false === $leads) {
            $leads = \Timber\Timber::get_posts([
                'post_type' => 'contact_lead',
                'posts_per_page' => 10,
                'orderby' => 'date',
                'order' => 'DESC',
                'meta_query' => [
                    [
                        'key' => 'lead_status',
                        'value' => 'new',
                        'compare' => '='
                    ]
                ]
            ]);

            wp_cache_set($cache_key, $leads, '', HOUR_IN_SECONDS);
        }

        return $leads;
    }

    /**
     * Get project showcase collection
     *
     * @return array Project posts
     */
    private static function get_project_showcase_collection() {
        $cache_key = 'he_all_projects_' . get_current_blog_id();
        $projects = wp_cache_get($cache_key);

        if (false === $projects) {
            $projects = \Timber\Timber::get_posts([
                'post_type' => 'project_showcase',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC',
                'post_status' => 'publish'
            ]);

            wp_cache_set($cache_key, $projects, '', HOUR_IN_SECONDS * 6);
        }

        return $projects;
    }

    /**
     * Get featured projects
     *
     * @return array Featured project posts
     */
    private static function get_featured_projects() {
        $cache_key = 'he_featured_projects_' . get_current_blog_id();
        $featured = wp_cache_get($cache_key);

        if (false === $featured) {
            $featured = \Timber\Timber::get_posts([
                'post_type' => 'project_showcase',
                'posts_per_page' => 6,
                'meta_query' => [
                    [
                        'key' => 'featured',
                        'value' => true,
                        'compare' => '='
                    ]
                ],
                'orderby' => 'menu_order',
                'order' => 'ASC'
            ]);

            wp_cache_set($cache_key, $featured, '', HOUR_IN_SECONDS * 6);
        }

        return $featured;
    }

    /**
     * Get projects organized by state
     *
     * @return array Projects grouped by state
     */
    private static function get_projects_by_state() {
        $cache_key = 'he_projects_by_state_' . get_current_blog_id();
        $by_state = wp_cache_get($cache_key);

        if (false === $by_state) {
            $all_projects = self::get_project_showcase_collection();
            $by_state = [];

            foreach ($all_projects as $project) {
                $state = $project->meta('project_state') ?: 'Missouri';
                if (!isset($by_state[$state])) {
                    $by_state[$state] = [];
                }
                $by_state[$state][] = $project;
            }

            // Sort states alphabetically
            ksort($by_state);

            wp_cache_set($cache_key, $by_state, '', HOUR_IN_SECONDS * 6);
        }

        return $by_state;
    }

    /**
     * Get service information posts
     *
     * @return array Service posts
     */
    private static function get_service_information() {
        $cache_key = 'he_services_' . get_current_blog_id();
        $services = wp_cache_get($cache_key);

        if (false === $services) {
            $services = \Timber\Timber::get_posts([
                'post_type' => 'service_info',
                'posts_per_page' => -1,
                'orderby' => 'meta_value_num',
                'meta_key' => 'display_order',
                'order' => 'ASC',
                'post_status' => 'publish'
            ]);

            wp_cache_set($cache_key, $services, '', HOUR_IN_SECONDS * 12);
        }

        return $services;
    }

    /**
     * Get state coverage information
     *
     * @return array State coverage posts
     */
    private static function get_state_coverage() {
        $cache_key = 'he_state_coverage_' . get_current_blog_id();
        $states = wp_cache_get($cache_key);

        if (false === $states) {
            $states = \Timber\Timber::get_posts([
                'post_type' => 'state_coverage',
                'posts_per_page' => -1,
                'orderby' => 'title',
                'order' => 'ASC',
                'post_status' => 'publish'
            ]);

            wp_cache_set($cache_key, $states, '', DAY_IN_SECONDS);
        }

        return $states;
    }

    /**
     * Get company profile information
     *
     * @return array Company profile data
     */
    private static function get_company_profile() {
        $cache_key = 'he_company_profile_' . get_current_blog_id();
        $profile = wp_cache_get($cache_key);

        if (false === $profile) {
            $profile_posts = \Timber\Timber::get_posts([
                'post_type' => 'company_profile',
                'posts_per_page' => 1,
                'post_status' => 'publish'
            ]);

            $profile = !empty($profile_posts) ? $profile_posts[0] : null;

            wp_cache_set($cache_key, $profile, '', DAY_IN_SECONDS);
        }

        return $profile;
    }

    /**
     * Get state SHTC programs data
     *
     * @return array State program information
     */
    private static function get_state_shtc_programs() {
        return [
            'Missouri' => ['rate' => '25%', 'cap' => 140000000, 'status' => 'active'],
            'Iowa' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'Kansas' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'Oklahoma' => ['rate' => '20%', 'cap' => 40000000, 'status' => 'active'],
            'Minnesota' => ['rate' => '20%', 'cap' => 50000000, 'status' => 'active'],
            'Wisconsin' => ['rate' => '20%', 'cap' => 50000000, 'status' => 'active'],
            'Indiana' => ['rate' => '20%', 'cap' => 50000000, 'status' => 'active'],
            'South Carolina' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'Texas' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'Louisiana' => ['rate' => '25%', 'cap' => 85000000, 'status' => 'active'],
            'Georgia' => ['rate' => '25%', 'cap' => 100000000, 'status' => 'active'],
            'Maryland' => ['rate' => '20%', 'cap' => 50000000, 'status' => 'active'],
            'Rhode Island' => ['rate' => '20%', 'cap' => 50000000, 'status' => 'active'],
            'Virginia' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'West Virginia' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'Arkansas' => ['rate' => '25%', 'cap' => 50000000, 'status' => 'active'],
            'Colorado' => ['rate' => '20%', 'cap' => 50000000, 'status' => 'active']
        ];
    }

    /**
     * Add custom post class mappings for Timber
     *
     * @param array $classmap Existing class mappings
     * @return array Enhanced class mappings
     */
    public static function add_post_classmap($classmap) {
        $classmap['contact_lead'] = 'HistoricEquity\\ContactLead';
        $classmap['project_showcase'] = 'HistoricEquity\\ProjectShowcase';
        $classmap['service_info'] = 'HistoricEquity\\ServiceInfo';
        $classmap['state_coverage'] = 'HistoricEquity\\StateCoverage';
        $classmap['company_profile'] = 'HistoricEquity\\CompanyProfile';

        return $classmap;
    }

    /**
     * Localize context data for JavaScript
     */
    public static function localize_context_data() {
        $js_data = [
            'ajax_url' => admin_url('admin-ajax.php'),
            'rest_url' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('historic_equity_nonce'),
            'company_info' => [
                'name' => 'Historic Equity Inc.',
                'phone' => get_theme_mod('company_phone', '(314) 555-SHTC'),
                'email' => get_theme_mod('company_email', 'info@histeq.com')
            ],
            'form_config' => [
                'validation_messages' => [
                    'email_invalid' => 'Please enter a valid email address',
                    'phone_invalid' => 'Please enter a valid phone number',
                    'required_field' => 'This field is required',
                    'message_too_short' => 'Please provide more details about your project'
                ]
            ]
        ];

        wp_localize_script('historic-equity-script', 'HistoricEquity', $js_data);
    }

    /**
     * Helper methods for SEO data
     */
    private static function generate_breadcrumbs() {
        // Implementation for breadcrumb generation
        return [];
    }

    private static function get_canonical_url() {
        return get_permalink();
    }

    private static function get_optimized_title() {
        return wp_get_document_title();
    }

    private static function get_optimized_description() {
        return get_bloginfo('description');
    }

    private static function get_social_media_urls() {
        return [
            get_theme_mod('linkedin_url', ''),
            get_theme_mod('twitter_url', ''),
            get_theme_mod('facebook_url', '')
        ];
    }

    private static function get_project_schema() {
        global $post;
        return [
            'name' => get_the_title($post),
            'description' => get_the_excerpt($post),
            'location' => get_post_meta($post->ID, 'project_location', true)
        ];
    }

    // Additional helper methods...
    private static function get_service_categories() { return []; }
    private static function get_state_statistics() { return []; }
    private static function get_team_members() { return []; }
    private static function get_company_history() { return []; }
}

// Initialize the enhanced Timber context
TimberContext::init();