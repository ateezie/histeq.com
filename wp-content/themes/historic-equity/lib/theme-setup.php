<?php
/**
 * Theme Setup and Timber Context
 *
 * @package HistoricEquity
 */

namespace HistoricEquity;

// Initialize custom post types (keeping contact-lead for form submissions)
require_once __DIR__ . '/post-types/contact-lead.php';
// Removed project-showcase and state-coverage - using ACF Pro for content management
// require_once __DIR__ . '/post-types/service-info.php';
// require_once __DIR__ . '/post-types/company-profile.php';

// Initialize API endpoints (removed contact-form-endpoint.php - using Gravity Forms now)
// require_once __DIR__ . '/api/contact-form-endpoint.php';
require_once __DIR__ . '/api/projects-endpoint.php';
require_once __DIR__ . '/api/project-single-endpoint.php';

/**
 * Historic Equity Site Context
 * Extends Timber context with theme-specific data
 */
class ThemeContext {

    /**
     * Add Historic Equity specific context to Timber
     *
     * @param array $context Timber context
     * @return array Enhanced context
     */
    public static function add_to_context($context) {
        // Site info
        $context['site'] = new \Timber\Site();

        // Menus
        $context['menu'] = \Timber\Timber::get_menu_by('location', 'primary');
        $context['footer_menu'] = \Timber\Timber::get_menu_by('location', 'footer');
        $context['mobile_menu'] = \Timber\Timber::get_menu_by('location', 'mobile');

        // Brand colors and theme options
        $context['brand_colors'] = array(
            'primary_orange' => '#BD572B',
            'primary_gold' => '#E6CD41',
            'light_blue' => '#83ACD1',
            'dark_navy' => '#2D2E3D',
            'off_white' => '#FEFFF8'
        );

        // Company information
        $context['company_info'] = array(
            'name' => 'Historic Equity Inc.',
            'founded' => 2001,
            'headquarters' => 'St. Louis, MO',
            'phone' => get_theme_mod('company_phone', '(314) 555-SHTC'),
            'email' => get_theme_mod('company_email', 'info@histeq.com'),
            'states_served' => 17,
            'total_projects' => '200+',
            'total_investment' => '$1+ Billion'
        );

        // Featured projects for homepage
        $context['featured_projects'] = self::get_featured_projects();

        // Contact form data
        $context['contact_form_config'] = array(
            'property_types' => array(
                'Commercial',
                'Residential',
                'Industrial',
                'Institutional',
                'Mixed-Use'
            ),
            'project_timelines' => array(
                '0-6 months',
                '6-12 months',
                '1-2 years',
                '2+ years',
                'Planning phase'
            ),
            'budget_ranges' => array(
                '$100K-$500K',
                '$500K-$1M',
                '$1M-$5M',
                '$5M+',
                'Not sure'
            ),
            'referral_sources' => array(
                'Google Search',
                'Referral',
                'Event',
                'Social Media',
                'Other'
            )
        );

        // SHTC Service information
        $context['shtc_services'] = self::get_shtc_services();

        // Trust indicators
        $context['trust_indicators'] = array(
            'years_experience' => date('Y') - 2001,
            'portfolio_value' => '$1+ Billion QRE',
            'states_covered' => '17+ States',
            'successful_projects' => '200+ Projects'
        );

        // Add test attributes for Playwright tests
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $context['test_mode'] = true;
        }

        return $context;
    }

    /**
     * Get featured projects for homepage display
     *
     * @return array Featured projects
     */
    private static function get_featured_projects() {
        $args = array(
            'post_type' => 'project_showcase',
            'posts_per_page' => 6,
            'meta_query' => array(
                array(
                    'key' => 'featured',
                    'value' => true,
                    'compare' => '='
                )
            ),
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );

        return \Timber\Timber::get_posts($args);
    }

    /**
     * Get SHTC service information
     *
     * @return array Service information
     */
    private static function get_shtc_services() {
        $args = array(
            'post_type' => 'service_info',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => 'featured_on_homepage',
                    'value' => true,
                    'compare' => '='
                )
            ),
            'orderby' => 'meta_value_num',
            'meta_key' => 'display_order',
            'order' => 'ASC'
        );

        return \Timber\Timber::get_posts($args);
    }
}

// Hook into Timber context
add_filter('timber/context', array('\HistoricEquity\ThemeContext', 'add_to_context'));