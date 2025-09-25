<?php
/**
 * SEO Optimization and Structured Data for Historic Equity Inc.
 *
 * Comprehensive SEO implementation specifically tailored for SHTC investment
 * industry with structured data markup for enhanced search visibility.
 *
 * @package HistoricEquity
 */

if (!defined('ABSPATH')) {
    exit;
}

class SeoOptimization {

    /**
     * Initialize SEO optimization
     */
    public static function init() {
        add_action('wp_head', [__CLASS__, 'add_meta_tags']);
        add_action('wp_head', [__CLASS__, 'add_structured_data'], 1);
        add_action('wp_head', [__CLASS__, 'add_open_graph_tags']);
        add_action('wp_head', [__CLASS__, 'add_twitter_cards']);
        add_action('wp_head', [__CLASS__, 'add_canonical_links']);
        add_filter('document_title_parts', [__CLASS__, 'customize_title_parts']);
        add_filter('wp_title', [__CLASS__, 'enhance_page_titles'], 10, 2);
        add_action('wp_head', [__CLASS__, 'add_schema_markup']);
    }

    /**
     * Add comprehensive meta tags
     */
    public static function add_meta_tags() {
        global $post;

        // Basic meta description
        $description = self::get_meta_description();
        if ($description) {
            echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        }

        // Keywords for SHTC industry
        $keywords = self::get_meta_keywords();
        if ($keywords) {
            echo '<meta name="keywords" content="' . esc_attr($keywords) . '">' . "\n";
        }

        // Robots meta
        echo '<meta name="robots" content="' . esc_attr(self::get_robots_content()) . '">' . "\n";

        // Viewport (if not already set)
        if (!has_action('wp_head', 'wp_head')) {
            echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">' . "\n";
        }

        // Author and publisher information
        echo '<meta name="author" content="Historic Equity Inc.">' . "\n";
        echo '<meta name="publisher" content="Historic Equity Inc.">' . "\n";

        // Geographic targeting for SHTC states
        $location = self::get_geographic_targeting();
        if ($location) {
            echo '<meta name="geo.region" content="' . esc_attr($location) . '">' . "\n";
        }

        // Industry-specific meta tags
        echo '<meta name="industry" content="Historic Preservation, Tax Credits, Real Estate Investment">' . "\n";
        echo '<meta name="category" content="Financial Services, Historic Preservation">' . "\n";
    }

    /**
     * Get optimized meta description
     */
    private static function get_meta_description() {
        global $post;

        if (is_home() || is_front_page()) {
            return 'Historic Equity Inc. - Leading State Historic Tax Credit (SHTC) investment specialists. Maximize your historic rehabilitation project returns across 17+ states since 2001.';
        }

        if (is_single() && $post) {
            // Try custom meta field first
            $custom_desc = get_post_meta($post->ID, 'meta_description', true);
            if ($custom_desc) {
                return $custom_desc;
            }

            // Generate from excerpt or content
            $excerpt = get_the_excerpt($post);
            if ($excerpt) {
                return wp_trim_words($excerpt, 25, '...');
            }

            // Fallback to content
            $content = strip_tags($post->post_content);
            return wp_trim_words($content, 25, '...');
        }

        if (is_page() && $post) {
            $page_descriptions = [
                'about' => 'Learn about Historic Equity Inc.\'s mission, team, and 20+ years of SHTC investment expertise in historic preservation projects.',
                'services' => 'Comprehensive State Historic Tax Credit investment services including project evaluation, acquisition, and management for maximum returns.',
                'projects' => 'Explore our portfolio of 200+ successful historic rehabilitation projects across 17+ states with over $1 billion in QRE.',
                'states' => 'Historic Equity operates in 17+ states providing expert SHTC investment services and historic preservation financing.',
                'contact' => 'Contact Historic Equity Inc. for professional SHTC consultation and project evaluation. Get started with your historic rehabilitation project.',
                'resources' => 'Access comprehensive guides, news, and resources about State Historic Tax Credits and historic preservation financing.'
            ];

            $slug = $post->post_name;
            if (isset($page_descriptions[$slug])) {
                return $page_descriptions[$slug];
            }
        }

        if (is_category() || is_tag() || is_tax()) {
            $term = get_queried_object();
            if ($term && !empty($term->description)) {
                return wp_trim_words($term->description, 25, '...');
            }
        }

        // Default description
        return 'Historic Equity Inc. - Expert State Historic Tax Credit investment and historic preservation project financing since 2001.';
    }

    /**
     * Get SHTC industry keywords
     */
    private static function get_meta_keywords() {
        global $post;

        $base_keywords = [
            'State Historic Tax Credits',
            'SHTC Investment',
            'Historic Preservation',
            'Tax Credit Monetization',
            'Historic Rehabilitation',
            'QRE Investment',
            'Historic Equity'
        ];

        if (is_single() && $post) {
            // Add project-specific keywords
            $state = get_post_meta($post->ID, 'project_state', true);
            $property_type = get_post_meta($post->ID, 'property_type', true);

            if ($state) {
                $base_keywords[] = $state . ' Historic Tax Credits';
                $base_keywords[] = $state . ' SHTC';
            }

            if ($property_type) {
                $base_keywords[] = $property_type . ' Rehabilitation';
            }
        }

        if (is_page() && $post) {
            $page_keywords = [
                'about' => ['Historic Equity Team', 'SHTC Experts', 'Historic Preservation Leadership'],
                'services' => ['Tax Credit Acquisition', 'Project Evaluation', 'SHTC Management'],
                'projects' => ['Historic Projects Portfolio', 'Successful Rehabilitations', 'SHTC Case Studies'],
                'states' => ['Multi-State SHTC', 'Regional Historic Tax Credits', 'State Coverage'],
                'contact' => ['SHTC Consultation', 'Project Evaluation', 'Historic Tax Credit Advice']
            ];

            $slug = $post->post_name;
            if (isset($page_keywords[$slug])) {
                $base_keywords = array_merge($base_keywords, $page_keywords[$slug]);
            }
        }

        return implode(', ', array_unique($base_keywords));
    }

    /**
     * Get robots content
     */
    private static function get_robots_content() {
        if (is_search() || is_404()) {
            return 'noindex, nofollow';
        }

        if (is_admin() || is_feed()) {
            return 'noindex, nofollow';
        }

        return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    }

    /**
     * Get geographic targeting
     */
    private static function get_geographic_targeting() {
        global $post;

        // SHTC states where Historic Equity operates
        $shtc_states = [
            'missouri' => 'US-MO',
            'iowa' => 'US-IA',
            'kansas' => 'US-KS',
            'oklahoma' => 'US-OK',
            'minnesota' => 'US-MN',
            'wisconsin' => 'US-WI',
            'indiana' => 'US-IN',
            'south-carolina' => 'US-SC',
            'texas' => 'US-TX',
            'louisiana' => 'US-LA',
            'georgia' => 'US-GA',
            'maryland' => 'US-MD',
            'rhode-island' => 'US-RI',
            'virginia' => 'US-VA',
            'west-virginia' => 'US-WV',
            'arkansas' => 'US-AR',
            'colorado' => 'US-CO'
        ];

        if (is_single() && $post) {
            $state = strtolower(get_post_meta($post->ID, 'project_state', true));
            if (isset($shtc_states[$state])) {
                return $shtc_states[$state];
            }
        }

        // Default to Missouri (headquarters)
        return 'US-MO';
    }

    /**
     * Add structured data markup
     */
    public static function add_structured_data() {
        $schema = [];

        // Organization schema
        $schema[] = self::get_organization_schema();

        // Page-specific schema
        if (is_front_page() || is_home()) {
            $schema[] = self::get_website_schema();
            $schema[] = self::get_local_business_schema();
        }

        if (is_single()) {
            $schema[] = self::get_article_schema();
        }

        if (is_page()) {
            $schema[] = self::get_webpage_schema();
        }

        // Project-specific schema
        if (is_singular('project')) {
            $schema[] = self::get_project_schema();
        }

        // Output schema
        if (!empty($schema)) {
            echo '<script type="application/ld+json">' . "\n";
            echo json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            echo "\n" . '</script>' . "\n";
        }
    }

    /**
     * Get organization schema
     */
    private static function get_organization_schema() {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'Historic Equity Inc.',
            'alternateName' => 'Historic Equity',
            'url' => home_url(),
            'logo' => get_template_directory_uri() . '/static/images/logo/logo__black.png',
            'description' => 'Leading State Historic Tax Credit (SHTC) investment specialists maximizing returns on historic rehabilitation projects since 2001.',
            'foundingDate' => '2001',
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => 'St. Louis',
                'addressRegion' => 'MO',
                'addressCountry' => 'US'
            ],
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'contactType' => 'customer service',
                'email' => 'info@historicequity.com',
                'availableLanguage' => 'English'
            ],
            'sameAs' => [
                'https://www.linkedin.com/company/historic-equity-inc',
                'https://twitter.com/historicequity'
            ],
            'industry' => 'Financial Services',
            'knowsAbout' => [
                'State Historic Tax Credits',
                'Historic Preservation',
                'Tax Credit Investment',
                'Historic Rehabilitation',
                'Real Estate Investment'
            ]
        ];
    }

    /**
     * Get website schema
     */
    private static function get_website_schema() {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => 'Historic Equity Inc.',
            'url' => home_url(),
            'description' => 'State Historic Tax Credit investment specialists',
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'Historic Equity Inc.'
            ],
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => home_url('/?s={search_term_string}'),
                'query-input' => 'required name=search_term_string'
            ]
        ];
    }

    /**
     * Get local business schema
     */
    private static function get_local_business_schema() {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FinancialService',
            'name' => 'Historic Equity Inc.',
            'image' => get_template_directory_uri() . '/static/images/logo/logo__black.png',
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => 'St. Louis',
                'addressRegion' => 'MO',
                'addressCountry' => 'US'
            ],
            'geo' => [
                '@type' => 'GeoCoordinates',
                'latitude' => '38.6270',
                'longitude' => '-90.1994'
            ],
            'url' => home_url(),
            'telephone' => '+1-314-555-0123',
            'priceRange' => '$$$',
            'openingHoursSpecification' => [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'opens' => '09:00',
                'closes' => '17:00'
            ],
            'serviceArea' => [
                '@type' => 'State',
                'name' => ['Missouri', 'Iowa', 'Kansas', 'Oklahoma', 'Minnesota', 'Wisconsin', 'Indiana', 'South Carolina', 'Texas', 'Louisiana', 'Georgia', 'Maryland', 'Rhode Island', 'Virginia', 'West Virginia', 'Arkansas', 'Colorado']
            ]
        ];
    }

    /**
     * Get article schema for posts
     */
    private static function get_article_schema() {
        global $post;

        if (!$post) return null;

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => get_the_title($post),
            'description' => self::get_meta_description(),
            'image' => get_the_post_thumbnail_url($post, 'large'),
            'author' => [
                '@type' => 'Organization',
                'name' => 'Historic Equity Inc.'
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'Historic Equity Inc.',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => get_template_directory_uri() . '/static/images/logo/logo__black.png'
                ]
            ],
            'datePublished' => get_the_date('c', $post),
            'dateModified' => get_the_modified_date('c', $post),
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => get_permalink($post)
            ],
            'about' => [
                '@type' => 'Thing',
                'name' => 'State Historic Tax Credits'
            ]
        ];
    }

    /**
     * Get webpage schema
     */
    private static function get_webpage_schema() {
        global $post;

        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => get_the_title($post),
            'description' => self::get_meta_description(),
            'url' => get_permalink($post),
            'isPartOf' => [
                '@type' => 'WebSite',
                'name' => 'Historic Equity Inc.',
                'url' => home_url()
            ],
            'about' => [
                '@type' => 'Thing',
                'name' => 'State Historic Tax Credits'
            ],
            'breadcrumb' => self::get_breadcrumb_schema()
        ];
    }

    /**
     * Get project schema for project post type
     */
    private static function get_project_schema() {
        global $post;

        if (!$post || $post->post_type !== 'project') return null;

        $qre = get_post_meta($post->ID, 'project_qre', true);
        $state = get_post_meta($post->ID, 'project_state', true);
        $property_type = get_post_meta($post->ID, 'property_type', true);

        return [
            '@context' => 'https://schema.org',
            '@type' => 'CreativeWork',
            'name' => get_the_title($post),
            'description' => get_the_excerpt($post),
            'image' => get_the_post_thumbnail_url($post, 'large'),
            'creator' => [
                '@type' => 'Organization',
                'name' => 'Historic Equity Inc.'
            ],
            'about' => [
                '@type' => 'Thing',
                'name' => 'Historic Preservation Project'
            ],
            'locationCreated' => [
                '@type' => 'State',
                'name' => $state
            ],
            'genre' => $property_type,
            'dateCreated' => get_the_date('c', $post),
            'url' => get_permalink($post)
        ];
    }

    /**
     * Get breadcrumb schema
     */
    private static function get_breadcrumb_schema() {
        $breadcrumbs = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Home',
                'item' => home_url()
            ]
        ];

        if (is_single() || is_page()) {
            global $post;
            $breadcrumbs[] = [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => get_the_title($post),
                'item' => get_permalink($post)
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $breadcrumbs
        ];
    }

    /**
     * Add Open Graph tags
     */
    public static function add_open_graph_tags() {
        global $post;

        echo '<meta property="og:site_name" content="Historic Equity Inc.">' . "\n";
        echo '<meta property="og:type" content="' . esc_attr(self::get_og_type()) . '">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr(self::get_og_title()) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr(self::get_meta_description()) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_attr(self::get_canonical_url()) . '">' . "\n";

        // Image
        $image = self::get_og_image();
        if ($image) {
            echo '<meta property="og:image" content="' . esc_attr($image) . '">' . "\n";
            echo '<meta property="og:image:width" content="1200">' . "\n";
            echo '<meta property="og:image:height" content="630">' . "\n";
            echo '<meta property="og:image:alt" content="Historic Equity Inc. - SHTC Investment Specialists">' . "\n";
        }

        // Locale
        echo '<meta property="og:locale" content="en_US">' . "\n";
    }

    /**
     * Add Twitter Card tags
     */
    public static function add_twitter_cards() {
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:site" content="@historicequity">' . "\n";
        echo '<meta name="twitter:creator" content="@historicequity">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr(self::get_og_title()) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr(self::get_meta_description()) . '">' . "\n";

        $image = self::get_og_image();
        if ($image) {
            echo '<meta name="twitter:image" content="' . esc_attr($image) . '">' . "\n";
            echo '<meta name="twitter:image:alt" content="Historic Equity Inc. - SHTC Investment Specialists">' . "\n";
        }
    }

    /**
     * Add canonical links
     */
    public static function add_canonical_links() {
        $canonical = self::get_canonical_url();
        echo '<link rel="canonical" href="' . esc_attr($canonical) . '">' . "\n";

        // Add hreflang for English
        echo '<link rel="alternate" hreflang="en" href="' . esc_attr($canonical) . '">' . "\n";
        echo '<link rel="alternate" hreflang="x-default" href="' . esc_attr($canonical) . '">' . "\n";
    }

    /**
     * Get Open Graph type
     */
    private static function get_og_type() {
        if (is_front_page() || is_home()) {
            return 'website';
        }

        if (is_single()) {
            return 'article';
        }

        return 'website';
    }

    /**
     * Get Open Graph title
     */
    private static function get_og_title() {
        if (is_front_page() || is_home()) {
            return 'Historic Equity Inc. - State Historic Tax Credit Investment Specialists';
        }

        global $post;
        if ($post) {
            return get_the_title($post) . ' | Historic Equity Inc.';
        }

        return get_bloginfo('name');
    }

    /**
     * Get Open Graph image
     */
    private static function get_og_image() {
        global $post;

        // Try featured image first
        if ($post && has_post_thumbnail($post)) {
            return get_the_post_thumbnail_url($post, 'large');
        }

        // Default OG image
        return get_template_directory_uri() . '/static/images/og-image.jpg';
    }

    /**
     * Get canonical URL
     */
    private static function get_canonical_url() {
        global $wp;
        return home_url(add_query_arg(array(), $wp->request));
    }

    /**
     * Customize title parts
     */
    public static function customize_title_parts($title_parts) {
        if (is_front_page() || is_home()) {
            return ['Historic Equity Inc.', 'State Historic Tax Credit Investment Specialists'];
        }

        // Add site name if not present
        if (!in_array('Historic Equity Inc.', $title_parts)) {
            $title_parts[] = 'Historic Equity Inc.';
        }

        return $title_parts;
    }

    /**
     * Enhance page titles
     */
    public static function enhance_page_titles($title, $sep = '|') {
        global $post;

        if (is_front_page() || is_home()) {
            return 'Historic Equity Inc. ' . $sep . ' State Historic Tax Credit Investment Specialists';
        }

        if (is_single() && $post) {
            $state = get_post_meta($post->ID, 'project_state', true);
            if ($state) {
                return get_the_title($post) . ' ' . $sep . ' ' . $state . ' SHTC Project ' . $sep . ' Historic Equity Inc.';
            }
        }

        return $title;
    }

    /**
     * Add schema markup for contact info
     */
    public static function add_schema_markup() {
        // Only on contact page
        if (is_page('contact')) {
            echo '<script type="application/ld+json">' . "\n";
            echo json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'ContactPage',
                'name' => 'Contact Historic Equity Inc.',
                'description' => 'Get in touch with our SHTC investment specialists for project consultation and evaluation.',
                'url' => get_permalink(),
                'mainEntity' => [
                    '@type' => 'Organization',
                    'name' => 'Historic Equity Inc.',
                    'contactPoint' => [
                        '@type' => 'ContactPoint',
                        'contactType' => 'customer service',
                        'availableLanguage' => 'English'
                    ]
                ]
            ], JSON_UNESCAPED_SLASHES);
            echo "\n" . '</script>' . "\n";
        }
    }
}

// Initialize SEO optimization
SeoOptimization::init();